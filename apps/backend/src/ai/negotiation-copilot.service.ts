import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from './ai.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NegotiationStatus, MessageRole, AIFeature } from '@prisma/client';

export interface NegotiationSuggestion {
  suggestedMessage: string;
  suggestedPrice: number | null;
  strategy: string;
  confidence: number;
}

@Injectable()
export class NegotiationCopilotService {
  private readonly logger = new Logger(NegotiationCopilotService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private auditLogService: AuditLogService
  ) {}

  async startSession(
    companyId: string,
    userId: string,
    vendorId: string,
    currentPrice: number,
    targetPrice?: number,
    quoteId?: string,
    rfqId?: string
  ) {
    const session = await this.prisma.negotiationSession.create({
      data: {
        companyId,
        vendorId,
        quoteId,
        rfqId,
        currentPrice,
        targetPrice,
        status: NegotiationStatus.ACTIVE,
      },
    });

    await this.auditLogService.log(
      companyId,
      userId,
      'NEGOTIATION_SESSION_STARTED',
      'NegotiationSession',
      session.id,
      { vendorId, currentPrice, targetPrice }
    );

    return session;
  }

  async getSuggestion(
    sessionId: string,
    companyId: string,
    userId: string,
    context?: string
  ): Promise<NegotiationSuggestion> {
    if (!this.aiService.isAvailable()) {
      return this.getRuleBasedSuggestion(sessionId, companyId);
    }

    const startTime = Date.now();

    const session = await this.prisma.negotiationSession.findFirst({
      where: { id: sessionId, companyId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Get vendor details
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: session.vendorId },
    });

    // Get historical negotiations with this vendor
    const previousSessions = await this.prisma.negotiationSession.findMany({
      where: {
        companyId,
        vendorId: session.vendorId,
        id: { not: sessionId },
        status: NegotiationStatus.ACCEPTED,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const conversationHistory = session.messages.map((m) => ({
      role:
        m.role === MessageRole.USER ? 'buyer' : m.role === MessageRole.VENDOR ? 'vendor' : 'system',
      content: m.content,
    }));

    const prompt = `You are a procurement negotiation assistant helping a buyer negotiate with a vendor.

Current Negotiation:
- Vendor: ${vendor?.name || 'Unknown'}
- Current Quote: ₹${session.currentPrice.toLocaleString()}
- Target Price: ${session.targetPrice ? `₹${session.targetPrice.toLocaleString()}` : 'Not specified'}
- Price Gap: ${session.targetPrice ? `₹${(session.currentPrice - session.targetPrice).toLocaleString()} (${(((session.currentPrice - session.targetPrice) / session.currentPrice) * 100).toFixed(1)}%)` : 'N/A'}

Previous Successful Negotiations with this Vendor:
${previousSessions.map((s) => `- Started at ₹${s.currentPrice.toLocaleString()}, agreed at ₹${s.aiSuggestedPrice?.toLocaleString() || 'unknown'}`).join('\n') || 'No previous negotiations'}

Conversation So Far:
${conversationHistory.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n') || 'No messages yet'}

${context ? `Additional Context: ${context}` : ''}

Generate a negotiation response that:
1. Is professional and maintains good vendor relationships
2. Aims to move toward the target price if specified
3. Offers legitimate business reasons for price reduction
4. Suggests possible concessions (volume, payment terms, etc.)

Respond in JSON format:
{
  "suggestedMessage": "The actual message to send to the vendor",
  "suggestedPrice": 85000,
  "strategy": "Brief description of the negotiation strategy being used",
  "confidence": 0.8
}

The suggestedPrice should be a reasonable counter-offer. Set to null if making an initial inquiry.`;

    try {
      const content = await this.aiService.generateText(prompt);
      const latencyMs = Date.now() - startTime;

      // Estimate tokens
      const estimatedInputTokens = Math.ceil(prompt.length / 4);
      const estimatedOutputTokens = Math.ceil(content.length / 4);

      await this.aiService.logUsage(
        companyId,
        userId,
        AIFeature.NEGOTIATION_COPILOT,
        'gemini-1.5-flash',
        estimatedInputTokens,
        estimatedOutputTokens,
        latencyMs,
        true,
        undefined,
        { sessionId }
      );

      const suggestion = this.aiService.parseJsonResponse<NegotiationSuggestion>(content);

      // Store the AI suggestion as a message
      await this.prisma.negotiationMessage.create({
        data: {
          sessionId,
          role: MessageRole.AI_SUGGESTION,
          content: suggestion.suggestedMessage,
          isAiGenerated: true,
        },
      });

      // Update session with suggested price
      if (suggestion.suggestedPrice) {
        await this.prisma.negotiationSession.update({
          where: { id: sessionId },
          data: { aiSuggestedPrice: suggestion.suggestedPrice },
        });
      }

      return suggestion;
    } catch (error) {
      this.logger.error('AI suggestion failed, using rule-based', error);
      return this.getRuleBasedSuggestion(sessionId, companyId);
    }
  }

  private async getRuleBasedSuggestion(
    sessionId: string,
    companyId: string
  ): Promise<NegotiationSuggestion> {
    const session = await this.prisma.negotiationSession.findFirst({
      where: { id: sessionId, companyId },
      include: { messages: true },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const hasMessages = session.messages.length > 0;
    const suggestedPrice = session.targetPrice || session.currentPrice * 0.9;

    if (!hasMessages) {
      return {
        suggestedMessage: `Thank you for your quote of ₹${session.currentPrice.toLocaleString()}. We appreciate your competitive pricing. However, based on our budget constraints and market research, we would like to request if you could consider a revised price of ₹${suggestedPrice.toLocaleString()}. We are committed to building a long-term partnership and would value your flexibility.`,
        suggestedPrice,
        strategy: 'Initial counter-offer with relationship emphasis',
        confidence: 0.6,
      };
    }

    return {
      suggestedMessage: `We understand your position and value our business relationship. To move forward, we propose meeting in the middle at ₹${suggestedPrice.toLocaleString()}. We can also discuss favorable payment terms such as advance payment or increased order volume to make this work for both parties.`,
      suggestedPrice,
      strategy: 'Compromise with concession offer',
      confidence: 0.5,
    };
  }

  async addMessage(
    sessionId: string,
    companyId: string,
    userId: string,
    role: 'USER' | 'VENDOR',
    content: string,
    isEdited?: boolean,
    originalContent?: string
  ) {
    const session = await this.prisma.negotiationSession.findFirst({
      where: { id: sessionId, companyId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const message = await this.prisma.negotiationMessage.create({
      data: {
        sessionId,
        role: role === 'USER' ? MessageRole.USER : MessageRole.VENDOR,
        content,
        isAiGenerated: false,
        isEdited: isEdited || false,
        originalContent,
        sentAt: new Date(),
      },
    });

    await this.auditLogService.log(
      companyId,
      userId,
      'NEGOTIATION_MESSAGE_SENT',
      'NegotiationMessage',
      message.id,
      { sessionId, role, isEdited }
    );

    return message;
  }

  async updateSessionStatus(
    sessionId: string,
    companyId: string,
    userId: string,
    status: NegotiationStatus,
    finalPrice?: number
  ) {
    const session = await this.prisma.negotiationSession.findFirst({
      where: { id: sessionId, companyId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    await this.prisma.negotiationSession.update({
      where: { id: sessionId },
      data: {
        status,
        ...(status === NegotiationStatus.ACCEPTED && finalPrice
          ? { aiSuggestedPrice: finalPrice }
          : {}),
      },
    });

    await this.auditLogService.log(
      companyId,
      userId,
      'NEGOTIATION_STATUS_UPDATED',
      'NegotiationSession',
      sessionId,
      { previousStatus: session.status, newStatus: status, finalPrice }
    );

    return { success: true };
  }

  async getSession(sessionId: string, companyId: string) {
    return this.prisma.negotiationSession.findFirst({
      where: { id: sessionId, companyId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getSessions(companyId: string, vendorId?: string) {
    return this.prisma.negotiationSession.findMany({
      where: {
        companyId,
        ...(vendorId ? { vendorId } : {}),
      },
      include: {
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
