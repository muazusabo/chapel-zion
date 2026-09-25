import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  private async generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(base) || `article-${Date.now()}`;
    let slug = baseSlug;
    let counter = 1;
    // Loop until we find a slug that isn't taken by a *different* article.
    while (
      await this.prisma.news.findFirst({
        where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }
    return slug;
  }

  // ---- Public ----
  async findPublished(params: { page: number; limit: number; search?: string; category?: string }) {
    const { page, limit, search, category } = params;
    const where: Prisma.NewsWhereInput = {
      status: ContentStatus.PUBLISHED,
      ...(category ? { category } : {}),
      ...(search
        ? { OR: [{ title: { contains: search } }, { excerpt: { contains: search } }] }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, title: true, slug: true, featuredImage: true, excerpt: true,
          category: true, publishedAt: true,
        },
      }),
      this.prisma.news.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.news.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: { author: { select: { id: true, fullName: true } } },
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  // ---- Admin ----
  async findAllAdmin(params: { page: number; limit: number; search?: string; status?: ContentStatus }) {
    const { page, limit, search, status } = params;
    const where: Prisma.NewsWhereInput = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ title: { contains: search } }] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.news.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.news.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneAdmin(id: string) {
    const article = await this.prisma.news.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async create(authorId: string, dto: CreateNewsDto) {
    const slug = await this.generateUniqueSlug(dto.slug || dto.title);
    const status = dto.status ?? ContentStatus.DRAFT;
    return this.prisma.news.create({
      data: {
        ...dto,
        slug,
        authorId,
        status,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
      },
    });
  }

  async update(id: string, dto: UpdateNewsDto) {
    const existing = await this.findOneAdmin(id);
    let slug = existing.slug;
    if (dto.slug || dto.title) {
      slug = await this.generateUniqueSlug(dto.slug || dto.title || existing.title, id);
    }
    const willPublishNow = dto.status === ContentStatus.PUBLISHED && existing.status !== ContentStatus.PUBLISHED;

    return this.prisma.news.update({
      where: { id },
      data: {
        ...dto,
        slug,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        publishedAt: willPublishNow ? new Date() : undefined,
      },
    });
  }

  async setStatus(id: string, status: ContentStatus) {
    await this.findOneAdmin(id);
    return this.prisma.news.update({
      where: { id },
      data: { status, publishedAt: status === ContentStatus.PUBLISHED ? new Date() : undefined },
    });
  }

  async remove(id: string) {
    await this.findOneAdmin(id);
    await this.prisma.news.delete({ where: { id } });
    return { message: 'Article deleted' };
  }

  async publishDueScheduled() {
    const due = await this.prisma.news.findMany({
      where: { status: ContentStatus.DRAFT, scheduledFor: { lte: new Date() } },
    });
    if (due.length === 0) return 0;
    await this.prisma.news.updateMany({
      where: { id: { in: due.map((n: { id: string }) => n.id) } },
      data: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    });
    return due.length;
  }
}
