import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRfqDto, SendRfqDto } from './dto/rfq.dto';
import { EmailService } from '../integrations/email.service';
import { WhatsappService } from '../integrations/whatsapp.service';

@Injectable()
export class RfqsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private whatsappService: WhatsappService
  ) {}

  async create(companyId: string, userId: string, createRfqDto: CreateRfqDto) {
    // Generate RFQ number
    const count = await this.prisma.rFQ.count({ where: { companyId } });
    const rfqNumber = `RFQ-${Date.now()}-${count + 1}`;

    return this.prisma.rFQ.create({
      data: {
        rfqNumber,
        title: createRfqDto.title,
        description: createRfqDto.description,
        dueDate: createRfqDto.dueDate ? new Date(createRfqDto.dueDate) : null,
        companyId,
        createdById: userId,
        status: 'DRAFT',
        items: {
          create: createRfqDto.items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
        vendors: {
          create: createRfqDto.vendorIds.map((vendorId) => ({
            vendorId,
          })),
        },
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        vendors: {
          include: {
            vendor: true,
          },
        },
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.rFQ.findMany({
      where: { companyId },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        vendors: {
          include: {
            vendor: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            quotes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const rfq = await this.prisma.rFQ.findFirst({
      where: { id, companyId },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        vendors: {
          include: {
            vendor: true,
          },
        },
        quotes: {
          include: {
            vendor: true,
          },
          orderBy: { landedCost: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: true,
      },
    });

    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }

    return rfq;
  }

  async sendRfq(id: string, companyId: string, sendRfqDto: SendRfqDto) {
    const rfq = await this.findOne(id, companyId);

    // Update RFQ status and sentAt timestamps
    await this.prisma.rFQ.update({
      where: { id },
      data: { status: 'SENT' },
    });

    await this.prisma.rFQVendor.updateMany({
      where: { rfqId: id },
      data: { sentAt: new Date() },
    });

    // Send emails and WhatsApp messages to vendors
    const promises = rfq.vendors.map(async (rfqVendor) => {
      const vendor = rfqVendor.vendor;

      // Send email
      if (sendRfqDto.sendEmail) {
        await this.emailService.sendRfqToVendor(rfq, vendor);
      }

      // Send WhatsApp
      if (sendRfqDto.sendWhatsapp) {
        await this.whatsappService.sendRfqNotification(rfq, vendor);
      }
    });

    await Promise.all(promises);

    return { message: 'RFQ sent successfully', rfq };
  }
}
