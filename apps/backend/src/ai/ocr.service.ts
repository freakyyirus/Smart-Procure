import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from './ai.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { OCRStatus, AIFeature } from '@prisma/client';
import Tesseract from 'tesseract.js';

// Confidence threshold - if Tesseract confidence is below this, use Gemini Vision fallback
const CONFIDENCE_THRESHOLD = 0.70;

export interface ExtractedQuoteItem {
  itemName: string;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  gst: number | null;
  gstAmount: number | null;
  freight: number | null;
  total: number | null;
  confidence: number;
}

export interface ExtractedQuoteData {
  vendorName: string | null;
  vendorGstin: string | null;
  quoteDate: string | null;
  quoteNumber: string | null;
  validUntil: string | null;
  items: ExtractedQuoteItem[];
  subtotal: number | null;
  totalGst: number | null;
  totalFreight: number | null;
  grandTotal: number | null;
  paymentTerms: string | null;
  deliveryTerms: string | null;
  overallConfidence: number;
  ocrMethod: 'tesseract' | 'gemini-vision';
}

@Injectable()
export class OCRService {
  private readonly logger = new Logger(OCRService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private auditLogService: AuditLogService
  ) {}

  /**
   * Primary OCR using Tesseract (FREE, offline)
   * Falls back to Gemini Vision if confidence is low
   */
  async extractFromImage(
    companyId: string,
    userId: string,
    imageBase64: string,
    fileName: string,
    rfqId?: string
  ): Promise<{ extractionId: string; data: ExtractedQuoteData }> {
    const startTime = Date.now();

    // Create extraction record
    const extraction = await this.prisma.oCRExtraction.create({
      data: {
        companyId,
        rfqId,
        fileName,
        fileType: this.getFileType(fileName),
        status: OCRStatus.PROCESSING,
      },
    });

    try {
      // Step 1: Try Tesseract OCR first (FREE, offline)
      this.logger.log(`📄 Starting Tesseract OCR for ${fileName}`);
      const tesseractResult = await this.extractWithTesseract(imageBase64);
      
      let extractedData: ExtractedQuoteData;
      let modelUsed = 'tesseract';
      let rawText = tesseractResult.text;
      
      // Step 2: If Tesseract confidence is low, fall back to Gemini Vision
      if (tesseractResult.confidence < CONFIDENCE_THRESHOLD && this.aiService.isAvailable()) {
        this.logger.log(`⚠️ Tesseract confidence (${(tesseractResult.confidence * 100).toFixed(1)}%) below threshold, using Gemini Vision fallback`);
        
        const geminiResult = await this.extractWithGeminiVision(imageBase64, fileName);
        extractedData = geminiResult;
        modelUsed = 'gemini-1.5-flash';
        extractedData.ocrMethod = 'gemini-vision';
      } else {
        // Step 3: Parse Tesseract text into structured data using Gemini (if available) or rules
        extractedData = await this.parseExtractedText(rawText, tesseractResult.confidence);
        extractedData.ocrMethod = 'tesseract';
      }

      const latencyMs = Date.now() - startTime;

      // Log AI usage
      await this.aiService.logUsage(
        companyId,
        userId,
        AIFeature.OCR_EXTRACTION,
        modelUsed,
        modelUsed === 'tesseract' ? 0 : Math.ceil(rawText.length / 4) + 1000,
        modelUsed === 'tesseract' ? 0 : 500,
        latencyMs,
        true,
        undefined,
        { fileName, rfqId, ocrMethod: extractedData.ocrMethod }
      );

      // Update extraction record
      await this.prisma.oCRExtraction.update({
        where: { id: extraction.id },
        data: {
          status: OCRStatus.EXTRACTED,
          rawExtraction: rawText,
          extractedData: JSON.stringify(extractedData),
          confidence: extractedData.overallConfidence,
          modelUsed,
          tokensUsed: modelUsed === 'tesseract' ? 0 : 1500,
          processingTime: latencyMs,
          processedAt: new Date(),
        },
      });

      // Audit log
      await this.auditLogService.log(
        companyId,
        userId,
        'OCR_EXTRACTION_COMPLETED',
        'OCRExtraction',
        extraction.id,
        {
          fileName,
          itemsExtracted: extractedData.items.length,
          confidence: extractedData.overallConfidence,
          ocrMethod: extractedData.ocrMethod,
        }
      );

      return {
        extractionId: extraction.id,
        data: extractedData,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;

      // Log failed attempt
      await this.aiService.logUsage(
        companyId,
        userId,
        AIFeature.OCR_EXTRACTION,
        'tesseract',
        0,
        0,
        latencyMs,
        false,
        error instanceof Error ? error.message : 'Unknown error',
        { fileName, rfqId }
      );

      // Update extraction status
      await this.prisma.oCRExtraction.update({
        where: { id: extraction.id },
        data: {
          status: OCRStatus.FAILED,
          processingTime: latencyMs,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      this.logger.error(`OCR extraction failed for ${fileName}`, error);
      throw new BadRequestException('Failed to extract data from document');
    }
  }

  /**
   * Extract text using Tesseract.js (FREE, offline)
   */
  private async extractWithTesseract(imageBase64: string): Promise<{ text: string; confidence: number }> {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    const result = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          this.logger.debug(`Tesseract progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence / 100, // Convert to 0-1 scale
    };
  }

  /**
   * Extract structured data using Gemini Vision (fallback for low-confidence Tesseract results)
   */
  private async extractWithGeminiVision(imageBase64: string, fileName: string): Promise<ExtractedQuoteData> {
    const prompt = `Analyze this vendor quote document and extract structured data.

Return a JSON object with the following structure:
{
  "vendorName": "Vendor company name",
  "vendorGstin": "GSTIN if visible",
  "quoteDate": "Date in YYYY-MM-DD format",
  "quoteNumber": "Quote/Reference number",
  "validUntil": "Validity date in YYYY-MM-DD format",
  "items": [
    {
      "itemName": "Item description",
      "quantity": 100,
      "unit": "kg/pcs/ltrs etc",
      "unitPrice": 150.00,
      "gst": 18,
      "gstAmount": 2700.00,
      "freight": 500.00,
      "total": 18200.00,
      "confidence": 0.95
    }
  ],
  "subtotal": 15000.00,
  "totalGst": 2700.00,
  "totalFreight": 500.00,
  "grandTotal": 18200.00,
  "paymentTerms": "Payment terms if mentioned",
  "deliveryTerms": "Delivery terms if mentioned",
  "overallConfidence": 0.90
}

Rules:
1. Extract all line items with their quantities, prices, and GST
2. Use null for any field that cannot be determined
3. Set confidence (0-1) based on how clearly the data was visible
4. All monetary values should be numbers, not strings
5. Ensure GST calculations are consistent
6. Return ONLY valid JSON, no markdown formatting`;

    const mimeType = this.getMimeType(fileName);
    const content = await this.aiService.analyzeImage(imageBase64, prompt, mimeType);
    
    return this.aiService.parseJsonResponse<ExtractedQuoteData>(content);
  }

  /**
   * Parse Tesseract raw text into structured quote data
   * Uses Gemini if available, otherwise falls back to rule-based parsing
   */
  private async parseExtractedText(rawText: string, tesseractConfidence: number): Promise<ExtractedQuoteData> {
    // If Gemini is available, use it to structure the raw text
    if (this.aiService.isAvailable()) {
      const prompt = `Parse this OCR-extracted text from a vendor quote and structure it into JSON.

RAW OCR TEXT:
${rawText}

Return a JSON object with this structure:
{
  "vendorName": "Vendor company name or null",
  "vendorGstin": "GSTIN if found or null",
  "quoteDate": "Date in YYYY-MM-DD format or null",
  "quoteNumber": "Quote/Reference number or null",
  "validUntil": "Validity date in YYYY-MM-DD format or null",
  "items": [
    {
      "itemName": "Item description",
      "quantity": 100,
      "unit": "kg/pcs/ltrs",
      "unitPrice": 150.00,
      "gst": 18,
      "gstAmount": 2700.00,
      "freight": 500.00,
      "total": 18200.00,
      "confidence": 0.85
    }
  ],
  "subtotal": 15000.00,
  "totalGst": 2700.00,
  "totalFreight": 500.00,
  "grandTotal": 18200.00,
  "paymentTerms": "Payment terms or null",
  "deliveryTerms": "Delivery terms or null",
  "overallConfidence": ${tesseractConfidence.toFixed(2)}
}

Rules:
1. Extract all identifiable line items
2. Use null for fields that cannot be determined from the text
3. Numbers should be numbers, not strings
4. Return ONLY valid JSON`;

      try {
        const content = await this.aiService.generateText(prompt);
        return this.aiService.parseJsonResponse<ExtractedQuoteData>(content);
      } catch (error) {
        this.logger.warn('Gemini parsing failed, using rule-based parsing');
      }
    }

    // Rule-based fallback parsing
    return this.ruleBasedParsing(rawText, tesseractConfidence);
  }

  /**
   * Rule-based parsing when AI is not available
   */
  private ruleBasedParsing(rawText: string, confidence: number): ExtractedQuoteData {
    const lines = rawText.split('\n').filter(l => l.trim());
    
    // Try to extract common patterns
    const gstinMatch = rawText.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]\b/);
    const dateMatch = rawText.match(/\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/);
    const quoteNumberMatch = rawText.match(/(?:quote|quotation|ref|reference|no\.?)[\s:#]*([A-Z0-9-]+)/i);
    const amountMatches = rawText.match(/₹?\s*[\d,]+\.?\d*/g) || [];
    
    // Parse amounts
    const amounts = amountMatches
      .map(a => parseFloat(a.replace(/[₹,\s]/g, '')))
      .filter(a => !isNaN(a) && a > 0)
      .sort((a, b) => b - a);

    return {
      vendorName: null, // Hard to extract reliably
      vendorGstin: gstinMatch ? gstinMatch[0] : null,
      quoteDate: dateMatch ? dateMatch[1] : null,
      quoteNumber: quoteNumberMatch ? quoteNumberMatch[1] : null,
      validUntil: null,
      items: [], // Rule-based item extraction is unreliable
      subtotal: amounts.length > 2 ? amounts[2] : null,
      totalGst: amounts.length > 1 ? amounts[1] : null,
      totalFreight: null,
      grandTotal: amounts.length > 0 ? amounts[0] : null,
      paymentTerms: null,
      deliveryTerms: null,
      overallConfidence: confidence * 0.5, // Lower confidence for rule-based
      ocrMethod: 'tesseract',
    };
  }

  async approveExtraction(
    extractionId: string,
    companyId: string,
    userId: string,
    correctedData: ExtractedQuoteData
  ) {
    const extraction = await this.prisma.oCRExtraction.findFirst({
      where: { id: extractionId, companyId },
    });

    if (!extraction) {
      throw new BadRequestException('Extraction not found');
    }

    const updated = await this.prisma.oCRExtraction.update({
      where: { id: extractionId },
      data: {
        status: OCRStatus.APPROVED,
        extractedData: JSON.stringify(correctedData), // Store corrected data in extractedData
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    await this.auditLogService.log(
      companyId,
      userId,
      'OCR_EXTRACTION_APPROVED',
      'OCRExtraction',
      extractionId,
      {
        itemsCount: correctedData.items.length,
        grandTotal: correctedData.grandTotal,
      }
    );

    return updated;
  }

  async getExtractions(companyId: string, rfqId?: string, status?: OCRStatus) {
    const where: any = { companyId };
    if (rfqId) where.rfqId = rfqId;
    if (status) where.status = status;

    return this.prisma.oCRExtraction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExtraction(extractionId: string, companyId: string) {
    return this.prisma.oCRExtraction.findFirst({
      where: { id: extractionId, companyId },
    });
  }

  private getFileType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    const typeMap: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };
    return typeMap[ext] || 'application/octet-stream';
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/gif',
      pdf: 'application/pdf',
    };
    return mimeMap[ext] || 'image/png';
  }
}
