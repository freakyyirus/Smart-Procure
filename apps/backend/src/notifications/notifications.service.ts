import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateNotificationDto) {
    this.logger.log(`📬 Creating notification: ${dto.title}`);

    return this.prisma.notification.create({
      data: {
        companyId,
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        link: dto.link,
      },
    });
  }

  async findAll(companyId: string, userId?: string, limit = 50) {
    return this.prisma.notification.findMany({
      where: {
        companyId,
        ...(userId ? { OR: [{ userId }, { userId: null }] } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnread(companyId: string, userId?: string) {
    return this.prisma.notification.findMany({
      where: {
        companyId,
        isRead: false,
        ...(userId ? { OR: [{ userId }, { userId: null }] } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(companyId: string, userId?: string) {
    return this.prisma.notification.count({
      where: {
        companyId,
        isRead: false,
        ...(userId ? { OR: [{ userId }, { userId: null }] } : {}),
      },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markMultipleAsRead(ids: string[]) {
    return this.prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true },
    });
  }

  async markAllAsRead(companyId: string, userId?: string) {
    return this.prisma.notification.updateMany({
      where: {
        companyId,
        isRead: false,
        ...(userId ? { OR: [{ userId }, { userId: null }] } : {}),
      },
      data: { isRead: true },
    });
  }

  async delete(notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  // Helper methods for creating specific notifications
  async notifyQuoteSubmitted(
    companyId: string,
    quoteNumber: string,
    vendorName: string,
    rfqTitle: string
  ) {
    return this.create(companyId, {
      type: 'QUOTE_SUBMITTED' as any,
      title: 'New Quote Received',
      message: `${vendorName} submitted a quote for "${rfqTitle}"`,
      link: `/quotes`,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async notifyQuoteApproved(companyId: string, quoteNumber: string, _vendorId: string) {
    return this.create(companyId, {
      type: 'QUOTE_APPROVED' as any,
      title: 'Quote Approved',
      message: `Quote ${quoteNumber} has been approved`,
      link: `/quotes`,
    });
  }

  async notifyPOSent(companyId: string, poNumber: string, vendorName: string) {
    return this.create(companyId, {
      type: 'PO_SENT' as any,
      title: 'Purchase Order Sent',
      message: `PO ${poNumber} has been sent to ${vendorName}`,
      link: `/purchase-orders`,
    });
  }

  async notifyPaymentDue(companyId: string, mandateNumber: string, amount: number, dueDate: Date) {
    return this.create(companyId, {
      type: 'PAYMENT_DUE' as any,
      title: 'Payment Due Soon',
      message: `Mandate ${mandateNumber} for ₹${amount.toLocaleString('en-IN')} is due on ${dueDate.toLocaleDateString('en-IN')}`,
      link: `/mandates`,
    });
  }

  async notifyMandateSigned(
    companyId: string,
    mandateNumber: string,
    signedBy: 'vendor' | 'company'
  ) {
    return this.create(companyId, {
      type: 'MANDATE_SIGNED' as any,
      title: 'Mandate Signed',
      message: `Mandate ${mandateNumber} has been signed by ${signedBy}`,
      link: `/mandates`,
    });
  }

  async notifyPriceAlert(companyId: string, itemName: string, priceChange: string) {
    return this.create(companyId, {
      type: 'PRICE_ALERT' as any,
      title: 'Price Alert',
      message: `${itemName} price has ${priceChange}`,
      link: `/items`,
    });
  }
}
