import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { OCRService } from './ocr.service';
import { PriceAnomalyService } from './price-anomaly.service';
import { VendorScoringService } from './vendor-scoring.service';
import { VendorRecommendationService } from './vendor-recommendation.service';
import { NegotiationCopilotService } from './negotiation-copilot.service';
import { PriceForecastService } from './price-forecast.service';
import { ChatbotService } from './chatbot.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [AIController],
  providers: [
    AIService,
    OCRService,
    PriceAnomalyService,
    VendorScoringService,
    VendorRecommendationService,
    NegotiationCopilotService,
    PriceForecastService,
    ChatbotService,
  ],
  exports: [
    AIService,
    OCRService,
    PriceAnomalyService,
    VendorScoringService,
    VendorRecommendationService,
    NegotiationCopilotService,
    PriceForecastService,
    ChatbotService,
  ],
})
export class AIModule {}
