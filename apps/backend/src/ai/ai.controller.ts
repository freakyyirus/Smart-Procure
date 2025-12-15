import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NegotiationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OCRService } from './ocr.service';
import { PriceAnomalyService } from './price-anomaly.service';
import { VendorScoringService } from './vendor-scoring.service';
import { VendorRecommendationService } from './vendor-recommendation.service';
import { NegotiationCopilotService } from './negotiation-copilot.service';
import { PriceForecastService } from './price-forecast.service';
import { AIService } from './ai.service';
import { ChatbotService } from './chatbot.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private ocrService: OCRService,
    private priceAnomalyService: PriceAnomalyService,
    private vendorScoringService: VendorScoringService,
    private vendorRecommendationService: VendorRecommendationService,
    private negotiationCopilotService: NegotiationCopilotService,
    private priceForecastService: PriceForecastService,
    private aiService: AIService,
    private chatbotService: ChatbotService
  ) {}

  // ==================== OCR Endpoints ====================

  @Post('ocr/extract')
  @UseInterceptors(FileInterceptor('file'))
  async extractFromFile(
    @UploadedFile() file: any,
    @Request() req: any,
    @Query('rfqId') rfqId?: string
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const base64 = file.buffer.toString('base64');

    return this.ocrService.extractFromImage(
      req.user.companyId,
      req.user.id,
      base64,
      file.originalname,
      rfqId
    );
  }

  @Put('ocr/:extractionId/approve')
  async approveExtraction(
    @Param('extractionId') extractionId: string,
    @Body() body: { correctedData?: any },
    @Request() req: any
  ) {
    // Get existing extraction data if no correctedData provided
    if (!body.correctedData) {
      const extraction = await this.ocrService.getExtraction(extractionId, req.user.companyId);
      if (extraction?.extractedData) {
        body.correctedData = JSON.parse(extraction.extractedData as string);
      } else {
        body.correctedData = {};
      }
    }
    return this.ocrService.approveExtraction(extractionId, req.user.companyId, req.user.id, body.correctedData);
  }

  @Get('ocr/extractions')
  async getExtractions(@Request() req: any, @Query('quoteId') quoteId?: string) {
    return this.ocrService.getExtractions(req.user.companyId, quoteId);
  }

  // ==================== Price Anomaly Endpoints ====================

  @Post('anomaly/detect/:quoteId')
  async detectAnomalies(@Param('quoteId') quoteId: string, @Request() req: any) {
    return this.priceAnomalyService.detectAnomalies(quoteId, req.user.companyId, req.user.id);
  }

  @Put('anomaly/:anomalyId/acknowledge')
  async acknowledgeAnomaly(@Param('anomalyId') anomalyId: string, @Request() req: any) {
    return this.priceAnomalyService.acknowledgeAnomaly(anomalyId, req.user.companyId, req.user.id);
  }

  @Get('anomaly/quote/:quoteId')
  async getQuoteAnomalies(@Param('quoteId') quoteId: string, @Request() req: any) {
    return this.priceAnomalyService.getAnomaliesForQuote(quoteId, req.user.companyId);
  }

  @Get('anomaly/recent')
  async getRecentAnomalies(@Request() req: any, @Query('limit') limit?: string) {
    return this.priceAnomalyService.getRecentAnomalies(
      req.user.companyId,
      limit ? parseInt(limit, 10) : 20
    );
  }

  // ==================== Vendor Scoring Endpoints ====================

  @Post('vendor-score/:vendorId/calculate')
  async calculateVendorScore(@Param('vendorId') vendorId: string, @Request() req: any) {
    return this.vendorScoringService.calculateScore(vendorId, req.user.companyId, req.user.id);
  }

  @Get('vendor-score/:vendorId')
  async getVendorScore(@Param('vendorId') vendorId: string, @Request() req: any) {
    return this.vendorScoringService.getVendorScore(vendorId, req.user.companyId);
  }

  @Post('vendor-score/recalculate-all')
  async recalculateAllScores(@Request() req: any) {
    return this.vendorScoringService.recalculateAllScores(req.user.companyId, req.user.id);
  }

  @Get('vendor-scores')
  async getAllVendorScores(@Request() req: any) {
    return this.vendorScoringService.getVendorScores(req.user.companyId);
  }

  // ==================== Vendor Recommendation Endpoints ====================

  @Post('vendor-recommendation')
  async getVendorRecommendations(
    @Body()
    body: {
      itemIds: string[];
      quantity?: number;
      urgency?: 'low' | 'medium' | 'high';
    },
    @Request() req: any
  ) {
    return this.vendorRecommendationService.getRecommendations(
      req.user.companyId,
      req.user.id,
      body.itemIds || [],
      body.quantity,
      body.urgency
    );
  }

  @Put('vendor-recommendation/:recommendationId/select')
  async markVendorSelected(
    @Param('recommendationId') recommendationId: string,
    @Request() req: any
  ) {
    return this.vendorRecommendationService.markVendorSelected(
      recommendationId,
      req.user.companyId,
      req.user.id
    );
  }

  @Get('vendor-recommendations')
  async getRecentRecommendations(@Request() req: any) {
    return this.vendorRecommendationService.getRecentRecommendations(req.user.companyId);
  }

  // ==================== Negotiation Copilot Endpoints ====================

  @Post('negotiation/start')
  async startNegotiationSession(
    @Body()
    body: {
      vendorId: string;
      currentPrice: number;
      targetPrice?: number;
      quoteId?: string;
      rfqId?: string;
    },
    @Request() req: any
  ) {
    return this.negotiationCopilotService.startSession(
      req.user.companyId,
      req.user.id,
      body.vendorId,
      body.currentPrice,
      body.targetPrice,
      body.quoteId,
      body.rfqId
    );
  }

  @Post('negotiation/:sessionId/suggest')
  async getNegotiationSuggestion(
    @Param('sessionId') sessionId: string,
    @Body() body: { context?: string },
    @Request() req: any
  ) {
    return this.negotiationCopilotService.getSuggestion(
      sessionId,
      req.user.companyId,
      req.user.id,
      body.context
    );
  }

  @Post('negotiation/:sessionId/message')
  async addNegotiationMessage(
    @Param('sessionId') sessionId: string,
    @Body()
    body: {
      role: 'USER' | 'VENDOR';
      content: string;
      isEdited?: boolean;
      originalContent?: string;
    },
    @Request() req: any
  ) {
    return this.negotiationCopilotService.addMessage(
      sessionId,
      req.user.companyId,
      req.user.id,
      body.role,
      body.content,
      body.isEdited,
      body.originalContent
    );
  }

  @Put('negotiation/:sessionId/status')
  async updateNegotiationStatus(
    @Param('sessionId') sessionId: string,
    @Body() body: { status: 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'; finalPrice?: number },
    @Request() req: any
  ) {
    const statusMap: Record<string, NegotiationStatus> = {
      ACTIVE: NegotiationStatus.ACTIVE,
      ACCEPTED: NegotiationStatus.ACCEPTED,
      REJECTED: NegotiationStatus.REJECTED,
      EXPIRED: NegotiationStatus.EXPIRED,
    };
    return this.negotiationCopilotService.updateSessionStatus(
      sessionId,
      req.user.companyId,
      req.user.id,
      statusMap[body.status],
      body.finalPrice
    );
  }

  @Get('negotiation/:sessionId')
  async getNegotiationSession(@Param('sessionId') sessionId: string, @Request() req: any) {
    return this.negotiationCopilotService.getSession(sessionId, req.user.companyId);
  }

  @Get('negotiations')
  async getNegotiationSessions(@Request() req: any, @Query('vendorId') vendorId?: string) {
    return this.negotiationCopilotService.getSessions(req.user.companyId, vendorId);
  }

  // ==================== Price Forecast Endpoints ====================

  @Post('forecast/:itemId')
  async forecastItemPrice(
    @Param('itemId') itemId: string,
    @Query('horizon') horizon: string,
    @Request() req: any
  ) {
    return this.priceForecastService.forecast(
      itemId,
      req.user.companyId,
      req.user.id,
      horizon ? parseInt(horizon, 10) : 30
    );
  }

  @Post('forecast/bulk')
  async bulkForecast(@Query('horizon') horizon: string, @Request() req: any) {
    return this.priceForecastService.bulkForecast(
      req.user.companyId,
      req.user.id,
      horizon ? parseInt(horizon, 10) : 30
    );
  }

  @Get('forecast/:itemId/history')
  async getPriceHistory(@Param('itemId') itemId: string, @Request() req: any) {
    return this.priceForecastService.getPriceHistory(itemId, req.user.companyId);
  }

  @Get('forecast/:itemId/forecasts')
  async getForecasts(@Param('itemId') itemId: string, @Request() req: any) {
    return this.priceForecastService.getForecasts(itemId, req.user.companyId);
  }

  @Get('forecast/trends')
  async getPriceTrends(@Request() req: any) {
    return this.priceForecastService.getPriceTrends(req.user.companyId);
  }

  // ==================== Chatbot Endpoints ====================

  @Post('chat')
  async chat(
    @Request() req: any,
    @Body() body: { message: string; sessionId?: string }
  ) {
    if (!body.message) {
      throw new BadRequestException('Message is required');
    }
    return this.chatbotService.chat(req.user.id, body.message, body.sessionId);
  }

  @Get('chat/session/:sessionId')
  async getChatHistory(
    @Request() req: any,
    @Param('sessionId') sessionId: string
  ) {
    return this.chatbotService.getSessionHistory(req.user.id, sessionId);
  }

  @Post('chat/session/:sessionId/clear')
  async clearChatSession(
    @Request() req: any,
    @Param('sessionId') sessionId: string
  ) {
    const cleared = await this.chatbotService.clearSession(req.user.id, sessionId);
    return { success: cleared };
  }

  @Get('chat/stats')
  async getQuickStats(@Request() req: any) {
    return this.chatbotService.getQuickStats(req.user.id);
  }

  // ==================== Usage & Status Endpoints ====================

  @Get('status')
  async getAIStatus() {
    return {
      available: this.aiService.isAvailable(),
      message: this.aiService.isAvailable()
        ? 'AI features are fully operational'
        : 'AI features running in fallback mode (rule-based). Add OPENAI_API_KEY to enable full AI capabilities.',
    };
  }

  @Get('usage')
  async getUsageStats(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.aiService.getUsageStats(
      req.user.companyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }
}
