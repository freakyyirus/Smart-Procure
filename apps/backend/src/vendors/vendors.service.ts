import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createVendorDto: CreateVendorDto) {
    return this.prisma.vendor.create({
      data: {
        ...createVendorDto,
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.vendor.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, companyId },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        pos: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async update(id: string, companyId: string, updateVendorDto: UpdateVendorDto) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, companyId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
    });
  }

  async remove(id: string, companyId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, companyId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return this.prisma.vendor.delete({
      where: { id },
    });
  }
}
