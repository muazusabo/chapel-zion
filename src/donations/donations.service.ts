import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService) {}

  async findAllAdmin(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          transaction: {
            include: { user: { select: { fullName: true, email: true } } },
          },
        },
      }),
      this.prisma.donation.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async monthlyTotals(months = 6) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    const donations = await this.prisma.donation.findMany({
      where: { createdAt: { gte: since } },
      select: { amount: true, createdAt: true },
    });
    const buckets: Record<string, number> = {};
    for (const d of donations) {
      const key = d.createdAt.toISOString().slice(0, 7); // YYYY-MM
      buckets[key] = (buckets[key] ?? 0) + Number(d.amount);
    }
    return buckets;
  }
}
