import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from './ai.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PriceTrend, PriceSource, AIFeature } from '@prisma/client';

export interface ForecastResult {
  itemId: string;
  itemName: string;
  currentPrice: number;
  forecastedPrice: number;
  trend: PriceTrend;
  confidence: number;
  factors: string[];
  horizon: string;
}

@Injectable()
export class PriceForecastService {
  private readonly logger = new Logger(PriceForecastService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private auditLogService: AuditLogService
  ) {}

  async recordPrice(
    itemId: string,
    companyId: string,
    price: number,
    source: PriceSource,
    vendorId?: string,
    quoteId?: string,
    poId?: string
  ) {
    return this.prisma.priceHistory.create({
      data: {
        itemId,
        companyId,
        price,
        source,
        vendorId,
        quoteId,
        poId,
      },
    });
  }

  async forecast(
    itemId: string,
    companyId: string,
    userId: string,
    horizonDays: number = 30
  ): Promise<ForecastResult> {
    const item = await this.prisma.item.findFirst({
      where: { id: itemId, companyId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    // Get price history for this item
    const priceHistory = await this.prisma.priceHistory.findMany({
      where: { itemId },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });

    if (priceHistory.length < 3) {
      // Not enough data for forecasting
      const currentPrice = priceHistory[0]?.price || 0;
      return {
        itemId,
        itemName: item.name,
        currentPrice,
        forecastedPrice: currentPrice,
        trend: PriceTrend.STABLE,
        confidence: 0.3,
        factors: ['Insufficient historical data for accurate forecasting'],
        horizon: `${horizonDays} days`,
      };
    }

    const currentPrice = priceHistory[0].price;
    const forecast = await this.calculateForecast(priceHistory, horizonDays);

    // Calculate forecast date
    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + horizonDays);

    // Store forecast
    await this.prisma.priceForecast.create({
      data: {
        itemId,
        companyId,
        forecastDate,
        predictedPrice: forecast.forecastedPrice,
        confidenceLow: forecast.forecastedPrice * (1 - (1 - forecast.confidence) / 2),
        confidenceHigh: forecast.forecastedPrice * (1 + (1 - forecast.confidence) / 2),
        confidence: forecast.confidence * 100,
        trend: forecast.trend,
        dataPointsUsed: priceHistory.length,
        explanation: forecast.factors.join('; '),
        validUntil: forecastDate,
      },
    });

    // Log usage if AI was used
    if (this.aiService.isAvailable() && priceHistory.length >= 10) {
      await this.aiService.logUsage(
        companyId,
        userId,
        AIFeature.PRICE_FORECAST,
        'gpt-4-turbo',
        500,
        200,
        500,
        true,
        undefined,
        { itemId }
      );
    }

    await this.auditLogService.log(
      companyId,
      userId,
      'PRICE_FORECAST_GENERATED',
      'PriceForecast',
      itemId,
      { currentPrice, forecastedPrice: forecast.forecastedPrice, trend: forecast.trend }
    );

    return {
      itemId,
      itemName: item.name,
      currentPrice,
      ...forecast,
      horizon: `${horizonDays} days`,
    };
  }

  private async calculateForecast(
    priceHistory: { price: number; recordedAt: Date }[],
    horizonDays: number
  ): Promise<{
    forecastedPrice: number;
    trend: PriceTrend;
    confidence: number;
    factors: string[];
  }> {
    const prices = priceHistory.map((p) => p.price);

    // Statistical analysis
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const latestPrice = prices[0];

    // Calculate trend using linear regression
    const n = prices.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = prices.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * prices[i], 0);
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Forecast future price
    const forecastIndex = n + Math.ceil(horizonDays / 7); // Approximate weekly data points
    const forecastedPrice = Math.max(0, intercept + slope * forecastIndex);

    // Calculate price volatility
    const priceVariance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / n;
    const volatility = Math.sqrt(priceVariance) / avgPrice;

    // Determine trend
    const priceChange = (forecastedPrice - latestPrice) / latestPrice;
    let trend: PriceTrend;
    if (priceChange > 0.05) {
      trend = PriceTrend.UP;
    } else if (priceChange < -0.05) {
      trend = PriceTrend.DOWN;
    } else {
      trend = PriceTrend.STABLE;
    }

    // Calculate confidence based on data quality and volatility
    let confidence = 0.7;
    if (n < 10) confidence -= 0.2;
    if (volatility > 0.2) confidence -= 0.1;
    if (volatility > 0.3) confidence -= 0.1;
    if (n > 50) confidence += 0.1;
    confidence = Math.max(0.3, Math.min(0.95, confidence));

    // Identify factors
    const factors: string[] = [];

    if (trend === PriceTrend.UP) {
      factors.push('Upward price trend detected in historical data');
    } else if (trend === PriceTrend.DOWN) {
      factors.push('Downward price trend detected in historical data');
    } else {
      factors.push('Price has remained relatively stable');
    }

    if (volatility > 0.2) {
      factors.push('High price volatility observed');
    }

    // Check for seasonality (simplified)
    const recentPrices = prices.slice(0, Math.min(5, n));
    const olderPrices = prices.slice(Math.max(0, n - 5));
    const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;

    if (Math.abs(recentAvg - olderAvg) / avgPrice > 0.1) {
      factors.push('Recent price movement differs from historical average');
    }

    factors.push(`Based on ${n} historical data points`);

    return {
      forecastedPrice: Math.round(forecastedPrice * 100) / 100,
      trend,
      confidence,
      factors,
    };
  }

  async bulkForecast(
    companyId: string,
    userId: string,
    horizonDays: number = 30
  ): Promise<ForecastResult[]> {
    // Get all items with price history
    const items = await this.prisma.item.findMany({
      where: { companyId },
      include: {
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    const itemsWithHistory = items.filter((i) => i.priceHistory.length > 0);

    const forecasts: ForecastResult[] = [];
    for (const item of itemsWithHistory) {
      try {
        const forecast = await this.forecast(item.id, companyId, userId, horizonDays);
        forecasts.push(forecast);
      } catch (error) {
        this.logger.warn(`Failed to forecast for item ${item.id}`, error);
      }
    }

    return forecasts;
  }

  async getPriceHistory(itemId: string, companyId: string) {
    const item = await this.prisma.item.findFirst({
      where: { id: itemId, companyId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    return this.prisma.priceHistory.findMany({
      where: { itemId },
      orderBy: { recordedAt: 'desc' },
      take: 100,
      include: {
        vendor: { select: { id: true, name: true } },
      },
    });
  }

  async getForecasts(itemId: string, companyId: string) {
    const item = await this.prisma.item.findFirst({
      where: { id: itemId, companyId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    return this.prisma.priceForecast.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async getPriceTrends(companyId: string): Promise<{
    upTrend: number;
    downTrend: number;
    stable: number;
    avgConfidence: number;
  }> {
    const items = await this.prisma.item.findMany({
      where: { companyId },
      select: { id: true },
    });

    const itemIds = items.map((i) => i.id);

    const forecasts = await this.prisma.priceForecast.findMany({
      where: {
        itemId: { in: itemIds },
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['itemId'],
    });

    const upTrend = forecasts.filter((f) => f.trend === PriceTrend.UP).length;
    const downTrend = forecasts.filter((f) => f.trend === PriceTrend.DOWN).length;
    const stable = forecasts.filter((f) => f.trend === PriceTrend.STABLE).length;
    const avgConfidence =
      forecasts.length > 0
        ? forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
        : 0;

    return { upTrend, downTrend, stable, avgConfidence };
  }
}
