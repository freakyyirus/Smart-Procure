import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(
    companyId: string,
    userId: string | null,
    action: string,
    entity: string,
    entityId: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.prisma.auditLog.create({
      data: {
        companyId,
        userId: userId || undefined,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  async getLogsForEntity(companyId: string, entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        companyId,
        entity,
        entityId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCompanyLogs(companyId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
