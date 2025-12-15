import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from './ai.service';
import { VendorScoringService } from './vendor-scoring.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AIFeature } from '@prisma/client';

export interface RecommendedVendor {
  vendorId: string;
  vendorName: string;
  rank: number;
  score: number;
  reason: string;
  factors: {
    priceCompetitiveness: number;
    deliveryReliability: number;
    qualityRecord: number;
    responseTime: number;
    relevance: number;
  };
}

@Injectable()
export class VendorRecommendationService {
  private readonly logger = new Logger(VendorRecommendationService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private vendorScoringService: VendorScoringService,
    private auditLogService: AuditLogService
  ) {}

  async getRecommendations(
    companyId: string,
    userId: string,
    itemIds: string[],
    quantity?: number,
    urgency?: 'low' | 'medium' | 'high'
  ): Promise<RecommendedVendor[]> {
    const startTime = Date.now();

    // Get items to understand what we're sourcing
    const items = await this.prisma.item.findMany({
      where: { id: { in: itemIds }, companyId },
    });

    if (items.length === 0) {
      throw new Error('No valid items found');
    }

    const categories = [...new Set(items.map((i) => i.category))];

    // Get all active vendors for this company
    const vendors = await this.prisma.vendor.findMany({
      where: { companyId, isActive: true },
      include: {
        quotes: {
          where: {
            rfq: {
              items: {
                some: {
                  item: {
                    category: { in: categories },
                  },
                },
              },
            },
          },
          include: { rfq: { include: { items: { include: { item: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        pos: {
          where: { companyId },
          include: { deliveries: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    // Get vendor scores
    const vendorScores = await this.prisma.vendorScore.findMany({
      where: { companyId, vendorId: { in: vendors.map((v) => v.id) } },
    });
    const scoreMap = new Map(vendorScores.map((s) => [s.vendorId, s]));

    // Calculate relevance and recommendation score for each vendor
    const recommendations: RecommendedVendor[] = [];

    for (const vendor of vendors) {
      // Check if vendor has supplied similar items
      const relevantQuotes = vendor.quotes.filter((q) =>
        q.rfq.items.some((ri) => itemIds.includes(ri.itemId))
      );
      const relevance =
        relevantQuotes.length > 0
          ? 100
          : vendor.quotes.some((q) =>
                q.rfq.items.some((ri) => categories.includes(ri.item.category))
              )
            ? 70
            : 30;

      // Get stored score or calculate basic score
      let score = scoreMap.get(vendor.id);
      if (!score) {
        // Calculate on-the-fly if no stored score
        try {
          const calculated = await this.vendorScoringService.calculateScore(vendor.id, companyId);
          score = {
            overallScore: calculated.overallScore,
            deliveryScore: calculated.deliveryScore,
            priceScore: calculated.priceScore,
            qualityScore: calculated.qualityScore,
            responseScore: calculated.responseScore,
          } as any;
        } catch {
          score = {
            overallScore: 50,
            deliveryScore: 50,
            priceScore: 50,
            qualityScore: 50,
            responseScore: 50,
          } as any;
        }
      }

      // Adjust weights based on urgency
      let urgencyMultiplier = 1;
      if (urgency === 'high') {
        // For urgent orders, prioritize response time and delivery
        urgencyMultiplier = (score.responseScore + score.deliveryScore) / 100;
      } else if (urgency === 'low') {
        // For non-urgent, prioritize price
        urgencyMultiplier = score.priceScore / 100;
      }

      const finalScore = (score.overallScore * 0.5 + relevance * 0.5) * urgencyMultiplier;

      // Generate reason
      const reasons: string[] = [];
      if (relevantQuotes.length > 0) {
        reasons.push(`Previously quoted for ${relevantQuotes.length} similar items`);
      }
      if (score.deliveryScore >= 90) {
        reasons.push('Excellent delivery record');
      }
      if (score.priceScore >= 80) {
        reasons.push('Competitive pricing');
      }
      if (score.qualityScore >= 95) {
        reasons.push('High quality standards');
      }
      if (urgency === 'high' && score.responseScore >= 80) {
        reasons.push('Fast response time');
      }
      if (
        vendor.materialsSupplied?.some((m) =>
          items.some((i) => i.name.toLowerCase().includes(m.toLowerCase()))
        )
      ) {
        reasons.push('Specializes in required materials');
      }

      recommendations.push({
        vendorId: vendor.id,
        vendorName: vendor.name,
        rank: 0, // Will be set after sorting
        score: finalScore,
        reason: reasons.length > 0 ? reasons.join('. ') : 'Available vendor',
        factors: {
          priceCompetitiveness: score.priceScore,
          deliveryReliability: score.deliveryScore,
          qualityRecord: score.qualityScore,
          responseTime: score.responseScore,
          relevance,
        },
      });
    }

    // Sort by score and assign ranks
    recommendations.sort((a, b) => b.score - a.score);
    recommendations.forEach((r, i) => (r.rank = i + 1));

    // Store recommendations
    const topRecommendations = recommendations.slice(0, 10);
    for (const rec of topRecommendations) {
      await this.prisma.vendorRecommendation.create({
        data: {
          companyId,
          itemId: itemIds[0], // Primary item
          vendorId: rec.vendorId,
          rank: rec.rank,
          score: rec.score,
          reason: rec.reason,
          factors: JSON.stringify(rec.factors),
        },
      });
    }

    const latencyMs = Date.now() - startTime;
    await this.aiService.logUsage(
      companyId,
      userId,
      AIFeature.VENDOR_RECOMMENDATION,
      'rule-based',
      0,
      0,
      latencyMs,
      true,
      undefined,
      { itemCount: itemIds.length, vendorCount: recommendations.length }
    );

    await this.auditLogService.log(
      companyId,
      userId,
      'VENDOR_RECOMMENDATIONS_GENERATED',
      'VendorRecommendation',
      itemIds[0],
      {
        itemCount: itemIds.length,
        recommendationCount: topRecommendations.length,
        topVendor: topRecommendations[0]?.vendorName,
      }
    );

    return topRecommendations;
  }

  async markVendorSelected(recommendationId: string, companyId: string, userId: string) {
    const rec = await this.prisma.vendorRecommendation.findFirst({
      where: { id: recommendationId, companyId },
    });

    if (!rec) {
      throw new Error('Recommendation not found');
    }

    await this.prisma.vendorRecommendation.update({
      where: { id: recommendationId },
      data: { isSelected: true },
    });

    await this.auditLogService.log(
      companyId,
      userId,
      'VENDOR_RECOMMENDATION_SELECTED',
      'VendorRecommendation',
      recommendationId,
      { vendorId: rec.vendorId }
    );

    return { success: true };
  }

  async getRecentRecommendations(companyId: string) {
    return this.prisma.vendorRecommendation.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        vendor: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
