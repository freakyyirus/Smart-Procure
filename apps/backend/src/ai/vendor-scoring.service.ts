import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from './ai.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { VendorTier, AIFeature } from '@prisma/client';

export interface VendorScoreResult {
  vendorId: string;
  overallScore: number;
  tier: VendorTier;
  deliveryScore: number;
  priceScore: number;
  qualityScore: number;
  responseScore: number;
  consistencyScore: number;
  explanation: string;
  dataPoints: number;
}

@Injectable()
export class VendorScoringService {
  private readonly logger = new Logger(VendorScoringService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private auditLogService: AuditLogService
  ) {}

  async calculateScore(
    vendorId: string,
    companyId: string,
    userId?: string
  ): Promise<VendorScoreResult> {
    const startTime = Date.now();

    // Get vendor with all related data
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, companyId },
      include: {
        quotes: {
          where: { rfq: { companyId } },
          include: { rfq: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        pos: {
          where: { companyId },
          include: { deliveries: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Calculate delivery score (on-time delivery rate)
    const completedPOs = vendor.pos.filter(
      (po) => po.status === 'COMPLETED' || po.status === 'DELIVERED'
    );
    const deliveries = completedPOs.flatMap((po) => po.deliveries);
    const onTimeDeliveries = deliveries.filter(
      (d) =>
        d.status === 'DELIVERED' &&
        d.receivedDate &&
        d.deliveryDate &&
        d.receivedDate <= new Date(d.deliveryDate.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 day grace
    );
    const deliveryScore =
      deliveries.length > 0 ? (onTimeDeliveries.length / deliveries.length) * 100 : 50; // Default if no data

    // Calculate price score (how competitive their quotes are)
    const approvedQuotes = vendor.quotes.filter((q) => q.status === 'APPROVED');
    const totalQuotes = vendor.quotes.length;
    const priceScore = totalQuotes > 0 ? (approvedQuotes.length / totalQuotes) * 100 : 50;

    // Calculate quality score (rejection rate)
    const rejectedDeliveries = deliveries.filter((d) => d.status === 'REJECTED');
    const qualityScore =
      deliveries.length > 0
        ? ((deliveries.length - rejectedDeliveries.length) / deliveries.length) * 100
        : 50;

    // Calculate response score (how quickly they respond to RFQs)
    const rfqResponses = vendor.quotes.filter((q) => q.rfq);
    const avgResponseDays =
      rfqResponses.length > 0
        ? rfqResponses.reduce((sum, q) => {
            const rfqDate = q.rfq.createdAt;
            const quoteDate = q.createdAt;
            const days = (quoteDate.getTime() - rfqDate.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / rfqResponses.length
        : 3; // Default 3 days
    const responseScore = Math.max(0, 100 - avgResponseDays * 15); // Lose 15 points per day

    // Calculate consistency score (price consistency across quotes)
    const prices = vendor.quotes.map((q) => q.landedCost);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const priceVariance =
      prices.length > 1
        ? prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
        : 0;
    const priceStdDev = Math.sqrt(priceVariance);
    const coefficientOfVariation = avgPrice > 0 ? (priceStdDev / avgPrice) * 100 : 0;
    const consistencyScore = Math.max(0, 100 - coefficientOfVariation);

    // Calculate overall score (weighted average)
    const weights = {
      delivery: 0.3,
      price: 0.25,
      quality: 0.25,
      response: 0.1,
      consistency: 0.1,
    };
    const overallScore =
      deliveryScore * weights.delivery +
      priceScore * weights.price +
      qualityScore * weights.quality +
      responseScore * weights.response +
      consistencyScore * weights.consistency;

    // Determine tier
    let tier: VendorTier;
    if (overallScore >= 80) {
      tier = VendorTier.A;
    } else if (overallScore >= 60) {
      tier = VendorTier.B;
    } else {
      tier = VendorTier.C;
    }

    // Generate explanation
    const dataPoints = vendor.quotes.length + completedPOs.length;
    let explanation = `Score based on ${dataPoints} data points. `;

    if (dataPoints < 3) {
      explanation += 'Limited data available - score may not be fully representative. ';
    }

    if (deliveryScore >= 90) {
      explanation += 'Excellent delivery track record. ';
    } else if (deliveryScore < 70) {
      explanation += 'Delivery reliability needs improvement. ';
    }

    if (priceScore >= 80) {
      explanation += 'Highly competitive pricing. ';
    } else if (priceScore < 50) {
      explanation += 'Quotes often not selected - may need price review. ';
    }

    if (qualityScore >= 95) {
      explanation += 'Outstanding quality record. ';
    } else if (qualityScore < 85) {
      explanation += 'Some quality issues reported. ';
    }

    // Store the score
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // Score valid for 30 days

    await this.prisma.vendorScore.upsert({
      where: {
        vendorId_companyId: { vendorId, companyId },
      },
      create: {
        vendorId,
        companyId,
        overallScore,
        tier,
        deliveryScore,
        priceScore,
        qualityScore,
        responseScore,
        consistencyScore,
        explanation,
        dataPoints,
        validUntil,
      },
      update: {
        overallScore,
        tier,
        deliveryScore,
        priceScore,
        qualityScore,
        responseScore,
        consistencyScore,
        explanation,
        dataPoints,
        calculatedAt: new Date(),
        validUntil,
      },
    });

    // Update vendor performance
    await this.prisma.vendorPerformance.upsert({
      where: {
        vendorId_companyId: { vendorId, companyId },
      },
      create: {
        vendorId,
        companyId,
        totalOrders: completedPOs.length,
        completedOrders: completedPOs.length,
        onTimeDeliveries: onTimeDeliveries.length,
        lateDeliveries: deliveries.length - onTimeDeliveries.length - rejectedDeliveries.length,
        rejectedDeliveries: rejectedDeliveries.length,
        totalQuotes: totalQuotes,
        acceptedQuotes: approvedQuotes.length,
        avgResponseHours: avgResponseDays * 24,
      },
      update: {
        totalOrders: completedPOs.length,
        completedOrders: completedPOs.length,
        onTimeDeliveries: onTimeDeliveries.length,
        lateDeliveries: deliveries.length - onTimeDeliveries.length - rejectedDeliveries.length,
        rejectedDeliveries: rejectedDeliveries.length,
        totalQuotes: totalQuotes,
        acceptedQuotes: approvedQuotes.length,
        avgResponseHours: avgResponseDays * 24,
        lastCalculatedAt: new Date(),
      },
    });

    // Audit log
    if (userId) {
      await this.auditLogService.log(
        companyId,
        userId,
        'VENDOR_SCORE_CALCULATED',
        'VendorScore',
        vendorId,
        { overallScore, tier, dataPoints }
      );
    }

    const latencyMs = Date.now() - startTime;
    if (userId) {
      await this.aiService.logUsage(
        companyId,
        userId,
        AIFeature.VENDOR_SCORING,
        'rule-based',
        0,
        0,
        latencyMs,
        true,
        undefined,
        { vendorId, overallScore }
      );
    }

    return {
      vendorId,
      overallScore,
      tier,
      deliveryScore,
      priceScore,
      qualityScore,
      responseScore,
      consistencyScore,
      explanation,
      dataPoints,
    };
  }

  async getVendorScore(vendorId: string, companyId: string) {
    return this.prisma.vendorScore.findUnique({
      where: {
        vendorId_companyId: { vendorId, companyId },
      },
      include: {
        vendor: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getVendorScores(companyId: string) {
    return this.prisma.vendorScore.findMany({
      where: { companyId },
      orderBy: { overallScore: 'desc' },
      include: {
        vendor: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async recalculateAllScores(companyId: string, userId: string) {
    const vendors = await this.prisma.vendor.findMany({
      where: { companyId, isActive: true },
    });

    const results: VendorScoreResult[] = [];
    for (const vendor of vendors) {
      try {
        const score = await this.calculateScore(vendor.id, companyId, userId);
        results.push(score);
      } catch (error) {
        this.logger.error(`Failed to calculate score for vendor ${vendor.id}`, error);
      }
    }

    return results;
  }
}
