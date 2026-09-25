import { Injectable, NotFoundException } from '@nestjs/common';
import { AnnouncementCategory, ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  // ---- Public: only published + already-due announcements ----
  async findPublished(params: {
    page: number;
    limit: number;
    search?: string;
    category?: AnnouncementCategory;
  }) {
    const { page, limit, search, category } = params;
    const where: Prisma.AnnouncementWhereInput = {
      status: ContentStatus.PUBLISHED,
      ...(category ? { category } : {}),
      ...(search
        ? { OR: [{ title: { contains: search } }, { description: { contains: search } }] }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.announcement.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOnePublished(id: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, status: ContentStatus.PUBLISHED },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  // ---- Admin ----
  async findAllAdmin(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const where: Prisma.AnnouncementWhereInput = search
      ? { OR: [{ title: { contains: search } }, { description: { contains: search } }] }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.announcement.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneAdmin(id: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  create(authorId: string, dto: CreateAnnouncementDto) {
    const status = dto.status ?? ContentStatus.DRAFT;
    return this.prisma.announcement.create({
      data: {
        ...dto,
        authorId,
        status,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
      },
    });
  }

  async update(id: string, dto: UpdateAnnouncementDto) {
    await this.findOneAdmin(id);
    const existing = await this.prisma.announcement.findUnique({ where: { id } });
    const willPublishNow =
      dto.status === ContentStatus.PUBLISHED && existing?.status !== ContentStatus.PUBLISHED;

    return this.prisma.announcement.update({
      where: { id },
      data: {
        ...dto,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        publishedAt: willPublishNow ? new Date() : undefined,
      },
    });
  }

  async publish(id: string) {
    await this.findOneAdmin(id);
    return this.prisma.announcement.update({
      where: { id },
      data: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    await this.findOneAdmin(id);
    return this.prisma.announcement.update({
      where: { id },
      data: { status: ContentStatus.DRAFT },
    });
  }

  async remove(id: string) {
    await this.findOneAdmin(id);
    await this.prisma.announcement.delete({ where: { id } });
    return { message: 'Announcement deleted' };
  }

  /**
   * Called by a scheduled job (see AnnouncementsScheduler) to auto-publish
   * announcements whose scheduledFor time has arrived.
   */
  async publishDueScheduled() {
    const due = await this.prisma.announcement.findMany({
      where: {
        status: ContentStatus.DRAFT,
        scheduledFor: { lte: new Date() },
      },
    });
    if (due.length === 0) return 0;
    await this.prisma.announcement.updateMany({
      where: { id: { in: due.map((a: { id: string }) => a.id) } },
      data: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    });
    return due.length;
  }
}
