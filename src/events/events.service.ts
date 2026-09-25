import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findUpcoming(limit = 6) {
    return this.prisma.event.findMany({
      where: { date: { gte: new Date() }, status: { not: 'CANCELLED' } },
      orderBy: { date: 'asc' },
      take: limit,
    });
  }

  async findAll(page = 1, limit = 12) {
    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  create(dto: CreateEventDto) {
    return this.prisma.event.create({ data: { ...dto, date: new Date(dto.date) } });
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted' };
  }
}
