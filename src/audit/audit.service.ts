import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    adminId: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.adminActivityLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata as any,
      },
    });
  }

  async findAll(page = 1, limit = 25) {
    const [logs, total] = await Promise.all([
      this.prisma.adminActivityLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, fullName: true, email: true } },
        },
      }),
      this.prisma.adminActivityLog.count(),
    ]);
    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
