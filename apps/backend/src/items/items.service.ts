import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createItemDto: CreateItemDto) {
    return this.prisma.item.create({
      data: {
        ...createItemDto,
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.item.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const item = await this.prisma.item.findFirst({
      where: { id, companyId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async update(id: string, companyId: string, updateItemDto: UpdateItemDto) {
    const item = await this.prisma.item.findFirst({
      where: { id, companyId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.item.update({
      where: { id },
      data: updateItemDto,
    });
  }

  async remove(id: string, companyId: string) {
    const item = await this.prisma.item.findFirst({
      where: { id, companyId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Soft delete
    return this.prisma.item.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
