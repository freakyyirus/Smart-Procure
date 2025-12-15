import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto, UpdateDeliveryStatusDto } from './dto/purchase-order.dto';
import { PdfService } from '../integrations/pdf.service';
import { EmailService } from '../integrations/email.service';
import { WhatsappService } from '../integrations/whatsapp.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private emailService: EmailService,
    private whatsappService: WhatsappService,
    private auditLogService: AuditLogService
  ) {}

  async create(companyId: string, userId: string, createPoDto: CreatePurchaseOrderDto) {
    // Generate PO number
    const count = await this.prisma.purchaseOrder.count({ where: { companyId } });
    const poNumber = `PO-${Date.now()}-${count + 1}`;

    // Calculate totals
    const totalAmount = createPoDto.lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const gstAmount = createPoDto.lineItems.reduce((sum, item) => sum + item.gstAmount, 0);
    const grandTotal = totalAmount + gstAmount;

    const po = await this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        companyId,
        createdById: userId,
        vendorId: createPoDto.vendorId,
        quoteId: createPoDto.quoteId || null,
        totalAmount,
        gstAmount,
        grandTotal,
        status: 'DRAFT',
        terms: createPoDto.terms,
        notes: createPoDto.notes,
        paymentTerms: createPoDto.paymentTerms,
        deliveryAddress: createPoDto.deliveryAddress,
        expectedDeliveryDate: createPoDto.expectedDeliveryDate
          ? new Date(createPoDto.expectedDeliveryDate)
          : null,
        lineItems: {
          create: createPoDto.lineItems.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            gst: item.gst,
            gstAmount: item.gstAmount,
            totalAmount: item.totalAmount,
          })),
        },
      },
      include: {
        vendor: true,
        company: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lineItems: {
          include: {
            item: true,
          },
        },
      },
    });

    // Audit log
    await this.auditLogService.log(companyId, userId, 'PO_CREATED', 'PurchaseOrder', po.id, {
      poNumber,
      vendorId: createPoDto.vendorId,
      grandTotal,
    });

    return po;
  }

  async findAll(companyId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { companyId },
      include: {
        vendor: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            lineItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, companyId },
      include: {
        vendor: true,
        company: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lineItems: {
          include: {
            item: true,
          },
        },
        deliveries: {
          orderBy: { createdAt: 'desc' },
        },
        invoices: true,
        mandate: true,
      },
    });

    if (!po) {
      throw new NotFoundException('Purchase Order not found');
    }

    return po;
  }

  async updateStatus(id: string, companyId: string, userId: string, status: string) {
    const po = await this.findOne(id, companyId);
    const previousStatus = po.status;

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['SENT', 'CANCELLED'],
      SENT: ['ACKNOWLEDGED', 'CANCELLED'],
      ACKNOWLEDGED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[previousStatus]?.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${previousStatus} to ${status}`);
    }

    const updatedPo = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: status as any },
      include: {
        vendor: true,
        company: true,
      },
    });

    // Audit log
    await this.auditLogService.log(companyId, userId, 'PO_STATUS_UPDATED', 'PurchaseOrder', id, {
      previousStatus,
      newStatus: status,
    });

    return updatedPo;
  }

  async generatePdf(id: string, companyId: string) {
    const po = await this.findOne(id, companyId);
    const pdfBuffer = await this.pdfService.generatePoPdf(po);

    // In production, upload to S3
    const pdfUrl = `https://storage.smartprocure.com/pos/${po.poNumber}.pdf`;

    await this.prisma.purchaseOrder.update({
      where: { id },
      data: { pdfUrl },
    });

    return { pdfUrl, buffer: pdfBuffer };
  }

  async sendPo(id: string, companyId: string, userId: string) {
    const po = await this.findOne(id, companyId);

    if (po.status !== 'DRAFT') {
      throw new BadRequestException('PO has already been sent');
    }

    // Update status
    await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'SENT' },
    });

    // Audit log
    await this.auditLogService.log(companyId, userId, 'PO_SENT', 'PurchaseOrder', id, {
      vendorId: po.vendorId,
      vendorEmail: po.vendor.email,
    });

    // Send email
    await this.emailService.sendPoToVendor(po);

    // Send WhatsApp
    await this.whatsappService.sendPoNotification(po);

    return { message: 'PO sent successfully', po };
  }

  // ==================== DELIVERY TRACKING ====================

  async createDelivery(poId: string, companyId: string, userId: string, expectedDate?: Date) {
    const po = await this.findOne(poId, companyId);

    if (!['SENT', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(po.status)) {
      throw new BadRequestException('PO is not in a valid state for delivery creation');
    }

    // Generate delivery number
    const count = await this.prisma.delivery.count({ where: { poId } });
    const deliveryNumber = `DLV-${po.poNumber}-${count + 1}`;

    const delivery = await this.prisma.delivery.create({
      data: {
        deliveryNumber,
        poId,
        vendorId: po.vendorId,
        status: 'PENDING',
        deliveryDate: expectedDate || po.expectedDeliveryDate,
      },
      include: {
        po: true,
        vendor: true,
      },
    });

    // Update PO status to IN_PROGRESS if not already
    if (po.status === 'SENT' || po.status === 'ACKNOWLEDGED') {
      await this.prisma.purchaseOrder.update({
        where: { id: poId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Audit log
    await this.auditLogService.log(companyId, userId, 'DELIVERY_CREATED', 'Delivery', delivery.id, {
      deliveryNumber,
      poId,
      status: 'PENDING',
    });

    return delivery;
  }

  async updateDeliveryStatus(
    deliveryId: string,
    companyId: string,
    userId: string,
    updateDto: UpdateDeliveryStatusDto
  ) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        po: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.po.companyId !== companyId) {
      throw new NotFoundException('Delivery not found');
    }

    const previousStatus = delivery.status;
    const newStatus = updateDto.status;

    // Valid delivery state transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['IN_TRANSIT', 'REJECTED'],
      IN_TRANSIT: ['DELIVERED', 'PARTIALLY_DELIVERED', 'REJECTED'],
      DELIVERED: [],
      PARTIALLY_DELIVERED: ['IN_TRANSIT', 'DELIVERED'],
      REJECTED: [],
    };

    if (!validTransitions[previousStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition delivery from ${previousStatus} to ${newStatus}`
      );
    }

    const updatedDelivery = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: newStatus as any,
        notes: updateDto.notes,
        receivedBy: updateDto.receivedBy,
        receivedDate:
          newStatus === 'DELIVERED' || newStatus === 'PARTIALLY_DELIVERED' ? new Date() : undefined,
      },
      include: {
        po: true,
        vendor: true,
      },
    });

    // Update PO status if fully delivered
    if (newStatus === 'DELIVERED') {
      await this.prisma.purchaseOrder.update({
        where: { id: delivery.poId },
        data: { status: 'DELIVERED' },
      });
    }

    // Audit log
    await this.auditLogService.log(
      companyId,
      userId,
      'DELIVERY_STATUS_UPDATED',
      'Delivery',
      deliveryId,
      { previousStatus, newStatus, notes: updateDto.notes }
    );

    return updatedDelivery;
  }

  async getDeliveries(poId: string, companyId: string) {
    const po = await this.findOne(poId, companyId);

    return this.prisma.delivery.findMany({
      where: { poId: po.id },
      include: {
        vendor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDeliveryTimeline(poId: string, companyId: string) {
    const po = await this.findOne(poId, companyId);

    // Get all audit logs related to this PO and its deliveries
    const deliveries = await this.prisma.delivery.findMany({
      where: { poId: po.id },
    });

    const deliveryIds = deliveries.map((d) => d.id);

    const logs = await this.prisma.auditLog.findMany({
      where: {
        companyId,
        OR: [
          { entity: 'PurchaseOrder', entityId: poId },
          { entity: 'Delivery', entityId: { in: deliveryIds } },
        ],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs;
  }

  async getPoAuditLogs(id: string, companyId: string) {
    const po = await this.findOne(id, companyId);
    return this.auditLogService.getLogsForEntity(companyId, 'PurchaseOrder', po.id);
  }
}
