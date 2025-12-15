import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto, ApproveQuoteDto } from './dto/quote.dto';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(createQuoteDto: CreateQuoteDto) {
    // Calculate landed cost
    const gstAmount = (createQuoteDto.basePrice * createQuoteDto.gst) / 100;
    const landedCost = createQuoteDto.basePrice + gstAmount + (createQuoteDto.transportCost || 0);

    // Generate quote number
    const count = await this.prisma.quote.count();
    const quoteNumber = `QT-${Date.now()}-${count + 1}`;

    return this.prisma.quote.create({
      data: {
        quoteNumber,
        ...createQuoteDto,
        gstAmount,
        landedCost,
        status: 'SUBMITTED',
      },
      include: {
        vendor: true,
        rfq: {
          include: {
            items: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(rfqId?: string) {
    return this.prisma.quote.findMany({
      where: rfqId ? { rfqId } : {},
      include: {
        vendor: true,
        rfq: true,
      },
      orderBy: { landedCost: 'asc' },
    });
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        vendor: true,
        rfq: {
          include: {
            items: {
              include: {
                item: true,
              },
            },
            company: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return quote;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async approve(id: string, _approveQuoteDto: ApproveQuoteDto) {
    return this.prisma.quote.update({
      where: { id },
      data: {
        isApproved: true,
        status: 'APPROVED',
        approvedAt: new Date(),
      },
      include: {
        vendor: true,
        rfq: true,
      },
    });
  }
}
