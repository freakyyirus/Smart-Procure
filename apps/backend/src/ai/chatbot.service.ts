import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from './ai.service';
import { RFQStatus, QuoteStatus, POStatus } from '@prisma/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private sessions: Map<string, ChatSession> = new Map();

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async chat(
    userId: string,
    message: string,
    sessionId?: string,
  ): Promise<{ sessionId: string; response: string; suggestions?: string[] }> {
    // Get or create session
    let session = sessionId ? this.sessions.get(sessionId) : null;
    
    if (!session) {
      session = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.sessions.set(session.id, session);
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Build context from user's data
    const userContext = await this.buildUserContext(userId);

    // Build conversation history
    const conversationHistory = session.messages
      .slice(-10) // Last 10 messages for context
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are Smart Procure AI Assistant, a helpful chatbot for a procurement management system.
You help users with:
- Understanding their procurement data (RFQs, quotes, purchase orders, vendors)
- Answering questions about the system features
- Providing procurement best practices and advice
- Helping with vendor selection and price negotiations
- Explaining AI features like OCR, price anomaly detection, and forecasting

USER CONTEXT:
${userContext}

CONVERSATION HISTORY:
${conversationHistory}

Be concise, helpful, and professional. If you don't know something specific about the user's data, say so.
Respond in a friendly but professional tone. Use bullet points for lists.
If the user asks about specific data you don't have access to, guide them to the relevant section of the app.`;

    try {
      const response = await this.aiService.generateText(
        `${systemPrompt}\n\nUser's current question: ${message}`,
      );

      // Add assistant response
      session.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      session.updatedAt = new Date();

      // Generate follow-up suggestions
      const suggestions = this.generateSuggestions(message, response);

      return {
        sessionId: session.id,
        response,
        suggestions,
      };
    } catch (error) {
      this.logger.error('Chatbot error:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getSessionHistory(
    userId: string,
    sessionId: string,
  ): Promise<ChatMessage[]> {
    const session = this.sessions.get(sessionId);
    if (!session || session.userId !== userId) {
      return [];
    }
    return session.messages;
  }

  async clearSession(userId: string, sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (session && session.userId === userId) {
      this.sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  private async buildUserContext(userId: string): Promise<string> {
    try {
      // Fetch user's summary data
      const [rfqCount, quoteCount, poCount, vendorCount, itemCount] = await Promise.all([
        this.prisma.rFQ.count({ where: { createdById: userId } }),
        this.prisma.quote.count({ where: { rfq: { createdById: userId } } }),
        this.prisma.purchaseOrder.count({ where: { createdById: userId } }),
        this.prisma.vendor.count(),
        this.prisma.item.count(),
      ]);

      // Get recent activities
      const recentRFQs = await this.prisma.rFQ.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { title: true, status: true, createdAt: true },
      });

      const recentPOs = await this.prisma.purchaseOrder.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { poNumber: true, status: true, totalAmount: true },
      });

      return `
User's Procurement Summary:
- Total RFQs: ${rfqCount}
- Total Quotes: ${quoteCount}
- Total Purchase Orders: ${poCount}
- Available Vendors: ${vendorCount}
- Catalog Items: ${itemCount}

Recent RFQs: ${recentRFQs.map(r => `${r.title} (${r.status})`).join(', ') || 'None'}
Recent POs: ${recentPOs.map(p => `${p.poNumber} - $${p.totalAmount} (${p.status})`).join(', ') || 'None'}
`;
    } catch (error) {
      this.logger.warn('Could not build user context:', error);
      return 'User context not available.';
    }
  }

  private generateSuggestions(userMessage: string, response: string): string[] {
    const suggestions: string[] = [];
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('rfq') || lowerMessage.includes('quote')) {
      suggestions.push('How do I create a new RFQ?');
      suggestions.push('Show me best practices for RFQ management');
    }
    
    if (lowerMessage.includes('vendor')) {
      suggestions.push('How does vendor scoring work?');
      suggestions.push('How can I compare vendors?');
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      suggestions.push('How does price anomaly detection work?');
      suggestions.push('Can you explain price forecasting?');
    }
    
    if (lowerMessage.includes('po') || lowerMessage.includes('purchase order')) {
      suggestions.push('How do I track deliveries?');
      suggestions.push('What are the PO approval workflows?');
    }

    // Default suggestions if none matched
    if (suggestions.length === 0) {
      suggestions.push('What AI features are available?');
      suggestions.push('How do I get started with procurement?');
      suggestions.push('Show me my recent activity');
    }

    return suggestions.slice(0, 3);
  }

  async getQuickStats(userId: string): Promise<any> {
    try {
      const [
        pendingRFQs,
        pendingQuotes,
        activePOs,
        recentAnomalies,
      ] = await Promise.all([
        this.prisma.rFQ.count({ 
          where: { createdById: userId, status: RFQStatus.DRAFT } 
        }),
        this.prisma.quote.count({ 
          where: { rfq: { createdById: userId }, status: QuoteStatus.SUBMITTED } 
        }),
        this.prisma.purchaseOrder.count({ 
          where: { createdById: userId, status: { in: [POStatus.SENT, POStatus.ACKNOWLEDGED, POStatus.IN_PROGRESS] } } 
        }),
        this.prisma.priceAnomaly.count({
          where: { 
            isAcknowledged: false,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        }),
      ]);

      return {
        pendingRFQs,
        pendingQuotes,
        activePOs,
        recentAnomalies,
        message: this.generateQuickSummary(pendingRFQs, pendingQuotes, activePOs, recentAnomalies),
      };
    } catch (error) {
      this.logger.error('Error getting quick stats:', error);
      return { message: 'Unable to fetch stats at this time.' };
    }
  }

  private generateQuickSummary(
    pendingRFQs: number,
    pendingQuotes: number,
    activePOs: number,
    anomalies: number,
  ): string {
    const parts: string[] = [];
    
    if (pendingRFQs > 0) {
      parts.push(`${pendingRFQs} pending RFQ${pendingRFQs > 1 ? 's' : ''}`);
    }
    if (pendingQuotes > 0) {
      parts.push(`${pendingQuotes} quote${pendingQuotes > 1 ? 's' : ''} awaiting review`);
    }
    if (activePOs > 0) {
      parts.push(`${activePOs} active PO${activePOs > 1 ? 's' : ''}`);
    }
    if (anomalies > 0) {
      parts.push(`${anomalies} price anomal${anomalies > 1 ? 'ies' : 'y'} to review`);
    }

    if (parts.length === 0) {
      return "You're all caught up! No pending items.";
    }

    return `You have ${parts.join(', ')}.`;
  }
}
