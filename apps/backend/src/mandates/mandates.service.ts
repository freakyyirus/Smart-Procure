import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMandateDto, SignMandateDto, ExecuteMandateDto } from './dto/mandate.dto';
import { EmailService } from '../integrations/email.service';
import { WhatsappService } from '../integrations/whatsapp.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class MandatesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private whatsappService: WhatsappService,
    private auditLogService: AuditLogService
  ) {}

  async create(companyId: string, createMandateDto: CreateMandateDto, userId?: string) {
    // Check if PO exists and belongs to company
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: createMandateDto.poId, companyId },
      include: {
        vendor: true,
        company: true,
      },
    });

    if (!po) {
      throw new NotFoundException('Purchase Order not found');
    }

    // Check if mandate already exists for this PO
    const existingMandate = await this.prisma.mandate.findUnique({
      where: { poId: createMandateDto.poId },
    });

    if (existingMandate) {
      throw new BadRequestException('Mandate already exists for this PO');
    }

    // Generate mandate number
    const count = await this.prisma.mandate.count({ where: { companyId } });
    const mandateNumber = `MND-${Date.now()}-${count + 1}`;

    // Calculate installment amount if installments > 1
    const installmentAmount =
      createMandateDto.installments > 1
        ? createMandateDto.totalAmount / createMandateDto.installments
        : null;

    const mandate = await this.prisma.mandate.create({
      data: {
        mandateNumber,
        companyId,
        vendorId: po.vendorId,
        poId: createMandateDto.poId,
        totalAmount: createMandateDto.totalAmount,
        dueDate: new Date(createMandateDto.dueDate),
        installments: createMandateDto.installments || 1,
        installmentAmount,
        autoDeductEnabled: createMandateDto.autoDeductEnabled || false,
        terms: createMandateDto.terms,
        bankDetails: createMandateDto.bankDetails,
        mandateStatus: 'PENDING',
      },
      include: {
        po: {
          include: {
            lineItems: {
              include: {
                item: true,
              },
            },
          },
        },
        vendor: true,
        company: true,
      },
    });

    // Audit log
    await this.auditLogService.log(
      companyId,
      userId || null,
      'MANDATE_CREATED',
      'Mandate',
      mandate.id,
      { mandateNumber, poId: createMandateDto.poId, totalAmount: createMandateDto.totalAmount }
    );

    // Send mandate to vendor for signature
    await this.emailService.sendMandateToVendor(mandate);
    await this.whatsappService.sendMandateNotification(mandate);

    return mandate;
  }

  async findAll(companyId: string) {
    return this.prisma.mandate.findMany({
      where: { companyId },
      include: {
        vendor: true,
        po: {
          select: {
            poNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const mandate = await this.prisma.mandate.findFirst({
      where: { id, companyId },
      include: {
        vendor: true,
        company: true,
        po: {
          include: {
            lineItems: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    if (!mandate) {
      throw new NotFoundException('Mandate not found');
    }

    return mandate;
  }

  async signByVendor(id: string, signMandateDto: SignMandateDto) {
    const mandate = await this.prisma.mandate.findUnique({
      where: { id },
      include: {
        vendor: true,
        company: true,
      },
    });

    if (!mandate) {
      throw new NotFoundException('Mandate not found');
    }

    if (mandate.mandateStatus !== 'PENDING') {
      throw new BadRequestException('Mandate is not in pending state');
    }

    const updatedMandate = await this.prisma.mandate.update({
      where: { id },
      data: {
        vendorSignature: signMandateDto.signature,
        signedByVendorAt: new Date(),
        mandateStatus: 'VENDOR_SIGNED',
      },
      include: {
        vendor: true,
        company: true,
        po: true,
      },
    });

    // Audit log
    await this.auditLogService.log(
      mandate.companyId,
      null,
      'MANDATE_VENDOR_SIGNED',
      'Mandate',
      mandate.id,
      { vendorId: mandate.vendorId, previousStatus: 'PENDING', newStatus: 'VENDOR_SIGNED' }
    );

    // Notify company
    await this.emailService.notifyCompanyMandateSigned(updatedMandate);

    return updatedMandate;
  }

  async signByCompany(
    id: string,
    companyId: string,
    signMandateDto: SignMandateDto,
    userId?: string
  ) {
    const mandate = await this.prisma.mandate.findFirst({
      where: { id, companyId },
      include: {
        vendor: true,
        company: true,
      },
    });

    if (!mandate) {
      throw new NotFoundException('Mandate not found');
    }

    if (mandate.mandateStatus !== 'VENDOR_SIGNED') {
      throw new BadRequestException('Vendor must sign first');
    }

    const updatedMandate = await this.prisma.mandate.update({
      where: { id },
      data: {
        companySignature: signMandateDto.signature,
        signedByCompanyAt: new Date(),
        mandateStatus: 'ACTIVE',
      },
      include: {
        vendor: true,
        company: true,
        po: true,
      },
    });

    // Audit log
    await this.auditLogService.log(
      companyId,
      userId || null,
      'MANDATE_COMPANY_SIGNED',
      'Mandate',
      mandate.id,
      { previousStatus: 'VENDOR_SIGNED', newStatus: 'ACTIVE' }
    );

    // Notify vendor that mandate is active
    await this.emailService.notifyVendorMandateActive(updatedMandate);
    await this.whatsappService.notifyMandateActive(updatedMandate);

    return updatedMandate;
  }

  async executeMandate(
    id: string,
    companyId: string,
    userId?: string,
    executeMandateDto?: ExecuteMandateDto
  ) {
    const mandate = await this.prisma.mandate.findFirst({
      where: { id, companyId },
      include: {
        vendor: true,
        company: true,
        po: true,
      },
    });

    if (!mandate) {
      throw new NotFoundException('Mandate not found');
    }

    if (mandate.mandateStatus !== 'ACTIVE') {
      throw new BadRequestException('Mandate is not active');
    }

    // In production, integrate with payment gateway (Razorpay, etc.)
    // For now, we'll process the payment based on bank details
    const bankDetails = mandate.bankDetails ? JSON.parse(mandate.bankDetails) : null;

    if (!bankDetails) {
      throw new BadRequestException('Bank details not configured');
    }

    try {
      const updatedMandate = await this.prisma.mandate.update({
        where: { id },
        data: {
          mandateStatus: 'COMPLETED',
          executedAt: new Date(),
        },
        include: {
          vendor: true,
          company: true,
          po: true,
        },
      });

      // Update PO status to COMPLETED
      await this.prisma.purchaseOrder.update({
        where: { id: mandate.poId },
        data: { status: 'COMPLETED' },
      });

      // Audit log
      await this.auditLogService.log(
        companyId,
        userId || null,
        'MANDATE_EXECUTED',
        'Mandate',
        mandate.id,
        { totalAmount: mandate.totalAmount, status: 'COMPLETED' }
      );

      // Notify both parties
      await this.emailService.notifyMandateCompleted(updatedMandate);
      await this.whatsappService.notifyMandateCompleted(updatedMandate);

      return {
        success: true,
        message: 'Payment processed successfully',
        mandate: updatedMandate,
      };
    } catch (error) {
      const updatedMandate = await this.prisma.mandate.update({
        where: { id },
        data: {
          mandateStatus: 'FAILED',
          failureReason: executeMandateDto?.reason || error.message || 'Payment processing failed',
        },
      });

      // Audit log for failure
      await this.auditLogService.log(
        companyId,
        userId || null,
        'MANDATE_FAILED',
        'Mandate',
        mandate.id,
        { reason: executeMandateDto?.reason || error.message }
      );

      return {
        success: false,
        message: 'Payment failed',
        mandate: updatedMandate,
      };
    }
  }

  async cancelMandate(id: string, companyId: string, userId?: string, reason?: string) {
    const mandate = await this.prisma.mandate.findFirst({
      where: { id, companyId },
    });

    if (!mandate) {
      throw new NotFoundException('Mandate not found');
    }

    if (mandate.mandateStatus === 'COMPLETED' || mandate.mandateStatus === 'FAILED') {
      throw new BadRequestException('Cannot cancel a completed or failed mandate');
    }

    const updatedMandate = await this.prisma.mandate.update({
      where: { id },
      data: {
        mandateStatus: 'CANCELLED',
        failureReason: reason || 'Cancelled by company',
      },
      include: {
        vendor: true,
        company: true,
        po: true,
      },
    });

    // Audit log
    await this.auditLogService.log(
      companyId,
      userId || null,
      'MANDATE_CANCELLED',
      'Mandate',
      mandate.id,
      { reason: reason || 'Cancelled by company', previousStatus: mandate.mandateStatus }
    );

    return updatedMandate;
  }

  async getUpcomingMandates(companyId: string) {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    return this.prisma.mandate.findMany({
      where: {
        companyId,
        mandateStatus: 'ACTIVE',
        dueDate: {
          gte: today,
          lte: next30Days,
        },
      },
      include: {
        vendor: true,
        po: {
          select: {
            poNumber: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getMandateAuditLogs(id: string, companyId: string) {
    const mandate = await this.prisma.mandate.findFirst({
      where: { id, companyId },
    });

    if (!mandate) {
      throw new NotFoundException('Mandate not found');
    }

    return this.auditLogService.getLogsForEntity(companyId, 'Mandate', id);
  }
}
