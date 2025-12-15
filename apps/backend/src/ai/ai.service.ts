import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { AIFeature } from '@prisma/client';

@Injectable()
export class AIService implements OnModuleInit {
  private readonly logger = new Logger(AIService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private textModel: GenerativeModel | null = null;
  private visionModel: GenerativeModel | null = null;
  private isConfigured = false;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey.startsWith('AIza')) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Using gemini-2.0-flash - the latest free model (gemini-1.5-flash was deprecated)
      this.textModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      this.isConfigured = true;
      this.logger.log('✅ Google Gemini AI initialized successfully (gemini-2.0-flash - FREE tier)');
    } else {
      this.logger.warn('⚠️ Gemini API key not configured - AI features will run in fallback mode');
    }
  }

  isAvailable(): boolean {
    return this.isConfigured && this.genAI !== null;
  }

  getTextModel(): GenerativeModel {
    if (!this.textModel) {
      throw new Error(
        'Gemini is not configured. Please set GEMINI_API_KEY in environment variables.'
      );
    }
    return this.textModel;
  }

  getVisionModel(): GenerativeModel {
    if (!this.visionModel) {
      throw new Error(
        'Gemini is not configured. Please set GEMINI_API_KEY in environment variables.'
      );
    }
    return this.visionModel;
  }

  /**
   * Generate text completion using Gemini
   */
  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.textModel) {
      throw new Error('Gemini not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\nUser: ${prompt}`
      : prompt;

    try {
      const result = await this.textModel.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      this.logger.error('Gemini API Error:', error.message);
      
      // Handle specific error types
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error('AI service rate limit exceeded. Please wait a moment and try again, or upgrade your API quota.');
      }
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        throw new Error('AI model not available. Please check your API configuration.');
      }
      if (error.message?.includes('401') || error.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your GEMINI_API_KEY configuration.');
      }
      
      throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Analyze image with Gemini Vision
   */
  async analyzeImage(imageBase64: string, prompt: string, mimeType: string = 'image/png'): Promise<string> {
    if (!this.visionModel) {
      throw new Error('Gemini not configured');
    }

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    };

    const result = await this.visionModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  }

  /**
   * Parse JSON from Gemini response (handles markdown code blocks)
   */
  parseJsonResponse<T>(text: string): T {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    return JSON.parse(cleaned.trim());
  }

  async logUsage(
    companyId: string,
    userId: string | null,
    feature: AIFeature,
    model: string,
    inputTokens: number,
    outputTokens: number,
    latencyMs: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ) {
    const totalTokens = inputTokens + outputTokens;

    // Gemini 1.5 Flash is FREE! Cost estimation is $0
    const estimatedCost = 0;

    await this.prisma.aIUsageLog.create({
      data: {
        companyId,
        userId,
        feature,
        model,
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
        latencyMs,
        success,
        error,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  async getUsageStats(companyId: string, startDate?: Date, endDate?: Date) {
    const where: any = { companyId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const logs = await this.prisma.aIUsageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const byFeature = logs.reduce(
      (acc, log) => {
        if (!acc[log.feature]) {
          acc[log.feature] = { count: 0, cost: 0, tokens: 0 };
        }
        acc[log.feature].count++;
        acc[log.feature].cost += log.estimatedCost;
        acc[log.feature].tokens += log.totalTokens;
        return acc;
      },
      {} as Record<string, { count: number; cost: number; tokens: number }>
    );

    return {
      totalRequests: logs.length,
      totalCost,
      totalTokens,
      byFeature,
      successRate: logs.length > 0 ? (logs.filter((l) => l.success).length / logs.length) * 100 : 0,
      provider: 'Google Gemini (FREE)',
    };
  }
}
