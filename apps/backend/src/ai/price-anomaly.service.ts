import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from './ai.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AnomalySeverity, AIFeature } from '@prisma/client';

export interface AnomalyResult {
  quoteId: string;
  itemId: string | null;
  detectedPrice: number;
  expectedPrice: number;
  deviation: number;
  severity: AnomalySeverity;
  explanation: string;
}

@Injectable()
export class PriceAnomalyService {
  private readonly logger = new Logger(PriceAnomalyService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private auditLogService: AuditLogService
  ) {}

  async detectAnomalies(
    companyId: string,
    userId: string,
    quoteId: string
  ): Promise<AnomalyResult[]> {
    const startTime = Date.now();

    // Get the quote with its details
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId },
      include: {
        rfq: {
          include: {
            items: {
              include: {
                item: true,
              },
            },
            quotes: {
              where: { id: { not: quoteId } },
              include: { vendor: true },
            },
          },
        },
        vendor: true,
      },
    });

    if (!quote) {
      throw new Error('Quote not found');
    }

    const anomalies: AnomalyResult[] = [];

    // Get historical prices for items in this RFQ
    const itemIds = quote.rfq.items.map((i) => i.itemId);
    const historicalPrices = await this.prisma.priceHistory.findMany({
      where: {
        itemId: { in: itemIds },
        recordedAt: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // Last 6 months
        },
      },
      orderBy: { recordedAt: 'desc' },
    });

    // Group historical prices by item
    const pricesByItem = historicalPrices.reduce(
      (acc, ph) => {
        if (!acc[ph.itemId]) acc[ph.itemId] = [];
        acc[ph.itemId].push(ph.price);
        return acc;
      },
      {} as Record<string, number[]>
    );

    // Compare quote price with other quotes in the same RFQ
    const otherQuotePrices = quote.rfq.quotes.map((q) => q.landedCost);
    const avgOtherQuotes =
      otherQuotePrices.length > 0
        ? otherQuotePrices.reduce((a, b) => a + b, 0) / otherQuotePrices.length
        : null;

    // Calculate expected price based on historical data
    let expectedPrice = quote.landedCost;
    let dataSource = 'current';

    if (avgOtherQuotes) {
      expectedPrice = avgOtherQuotes;
      dataSource = 'other_quotes';
    } else if (itemIds.length === 1 && pricesByItem[itemIds[0]]?.length > 0) {
      const prices = pricesByItem[itemIds[0]];
      expectedPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      dataSource = 'historical';
    }

    // Calculate deviation
    const deviation = ((quote.landedCost - expectedPrice) / expectedPrice) * 100;

    // Determine severity
    let severity: AnomalySeverity;
    let explanation: string;

    if (deviation <= 10) {
      severity = AnomalySeverity.NORMAL;
      explanation = `Price is within normal range (${deviation.toFixed(1)}% deviation from expected).`;
    } else if (deviation <= 25) {
      severity = AnomalySeverity.HIGH;
      explanation = `Price is ${deviation.toFixed(1)}% higher than expected based on ${dataSource === 'other_quotes' ? 'other vendor quotes' : 'historical data'}. Consider negotiating or verifying with vendor.`;
    } else {
      severity = AnomalySeverity.EXTREMELY_HIGH;
      explanation = `Price is ${deviation.toFixed(1)}% higher than expected - this is a significant deviation. Strongly recommend verification before approval.`;
    }

    // Use AI for enhanced analysis if available and price is anomalous
    if (this.aiService.isAvailable() && severity !== AnomalySeverity.NORMAL) {
      try {
        const aiExplanation = await this.getAIAnalysis(
          quote,
          expectedPrice,
          deviation,
          historicalPrices.slice(0, 10),
          quote.rfq.quotes
        );
        explanation = aiExplanation;

        const latencyMs = Date.now() - startTime;
        await this.aiService.logUsage(
          companyId,
          userId,
          AIFeature.PRICE_ANOMALY,
          'gpt-4-turbo',
          500,
          200,
          latencyMs,
          true,
          undefined,
          { quoteId, deviation }
        );
      } catch (error) {
        this.logger.warn('AI analysis failed, using rule-based explanation', error);
      }
    }

    // Store anomaly if not normal
    if (severity !== AnomalySeverity.NORMAL) {
      const anomaly = await this.prisma.priceAnomaly.create({
        data: {
          companyId,
          quoteId,
          detectedPrice: quote.landedCost,
          expectedPrice,
          deviation,
          severity,
          explanation,
          historicalData: JSON.stringify({
            dataSource,
            otherQuotes: otherQuotePrices,
            historicalCount: historicalPrices.length,
          }),
        },
      });

      await this.auditLogService.log(
        companyId,
        userId,
        'PRICE_ANOMALY_DETECTED',
        'PriceAnomaly',
        anomaly.id,
        { quoteId, severity, deviation }
      );

      anomalies.push({
        quoteId,
        itemId: null,
        detectedPrice: quote.landedCost,
        expectedPrice,
        deviation,
        severity,
        explanation,
      });
    }

    return anomalies;
  }

  async acknowledgeAnomaly(anomalyId: string, companyId: string, userId: string) {
    const anomaly = await this.prisma.priceAnomaly.findFirst({
      where: { id: anomalyId, companyId },
    });

    if (!anomaly) {
      throw new Error('Anomaly not found');
    }

    await this.prisma.priceAnomaly.update({
      where: { id: anomalyId },
      data: {
        isAcknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      },
    });

    await this.auditLogService.log(
      companyId,
      userId,
      'PRICE_ANOMALY_ACKNOWLEDGED',
      'PriceAnomaly',
      anomalyId,
      { quoteId: anomaly.quoteId }
    );

    return { success: true };
  }

  async getAnomaliesForQuote(quoteId: string, companyId: string) {
    return this.prisma.priceAnomaly.findMany({
      where: { quoteId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecentAnomalies(companyId: string, limit: number = 20) {
    const anomalies = await this.prisma.priceAnomaly.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Enrich with item and quote/vendor data
    const enriched = await Promise.all(
      anomalies.map(async (a) => {
        const item = a.itemId
          ? await this.prisma.item.findUnique({
              where: { id: a.itemId },
              select: { id: true, name: true },
            })
          : null;

        const quote = await this.prisma.quote.findUnique({
          where: { id: a.quoteId },
          select: {
            id: true,
            vendor: { select: { id: true, name: true } },
          },
        });

        return {
          ...a,
          item,
          quote,
        };
      })
    );

    return enriched;
  }

  private async getAIAnalysis(
    quote: any,
    expectedPrice: number,
    deviation: number,
    historicalPrices: any[],
    otherQuotes: any[]
  ): Promise<string> {
    const prompt = `Analyze this price anomaly for a procurement quote:

Quote Details:
- Vendor: ${quote.vendor.name}
- Landed Cost: ₹${quote.landedCost.toLocaleString()}
- Expected Price: ₹${expectedPrice.toLocaleString()}
- Deviation: ${deviation.toFixed(1)}%

Other Quotes in RFQ:
${otherQuotes.map((q) => `- ${q.vendor.name}: ₹${q.landedCost.toLocaleString()}`).join('\n') || 'None'}

Historical Prices (recent):
${historicalPrices.map((p) => `- ₹${p.price.toLocaleString()} on ${p.recordedAt.toISOString().split('T')[0]}`).join('\n') || 'No historical data'}

Provide a concise (2-3 sentences) explanation of:
1. Why this price might be considered anomalous
2. Possible legitimate reasons for the higher price
3. Recommended action

Be specific and actionable. Do not use markdown.`;

    try {
      return await this.aiService.generateText(prompt);
    } catch (error) {
      return 'Unable to generate analysis.';
    }
  }
}
