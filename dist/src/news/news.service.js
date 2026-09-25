"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
let NewsService = class NewsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateUniqueSlug(base, excludeId) {
        const baseSlug = slugify(base) || `article-${Date.now()}`;
        let slug = baseSlug;
        let counter = 1;
        while (await this.prisma.news.findFirst({
            where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
        })) {
            slug = `${baseSlug}-${counter++}`;
        }
        return slug;
    }
    async findPublished(params) {
        const { page, limit, search, category } = params;
        const where = {
            status: client_1.ContentStatus.PUBLISHED,
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
    async findBySlug(slug) {
        const article = await this.prisma.news.findFirst({
            where: { slug, status: client_1.ContentStatus.PUBLISHED },
            include: { author: { select: { id: true, fullName: true } } },
        });
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        return article;
    }
    async findAllAdmin(params) {
        const { page, limit, search, status } = params;
        const where = {
            ...(status ? { status } : {}),
            ...(search ? { OR: [{ title: { contains: search } }] } : {}),
        };
        const [items, total] = await Promise.all([
            this.prisma.news.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
            this.prisma.news.count({ where }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findOneAdmin(id) {
        const article = await this.prisma.news.findUnique({ where: { id } });
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        return article;
    }
    async create(authorId, dto) {
        const slug = await this.generateUniqueSlug(dto.slug || dto.title);
        const status = dto.status ?? client_1.ContentStatus.DRAFT;
        return this.prisma.news.create({
            data: {
                ...dto,
                slug,
                authorId,
                status,
                publishedAt: status === client_1.ContentStatus.PUBLISHED ? new Date() : null,
                scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
            },
        });
    }
    async update(id, dto) {
        const existing = await this.findOneAdmin(id);
        let slug = existing.slug;
        if (dto.slug || dto.title) {
            slug = await this.generateUniqueSlug(dto.slug || dto.title || existing.title, id);
        }
        const willPublishNow = dto.status === client_1.ContentStatus.PUBLISHED && existing.status !== client_1.ContentStatus.PUBLISHED;
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
    async setStatus(id, status) {
        await this.findOneAdmin(id);
        return this.prisma.news.update({
            where: { id },
            data: { status, publishedAt: status === client_1.ContentStatus.PUBLISHED ? new Date() : undefined },
        });
    }
    async remove(id) {
        await this.findOneAdmin(id);
        await this.prisma.news.delete({ where: { id } });
        return { message: 'Article deleted' };
    }
    async publishDueScheduled() {
        const due = await this.prisma.news.findMany({
            where: { status: client_1.ContentStatus.DRAFT, scheduledFor: { lte: new Date() } },
        });
        if (due.length === 0)
            return 0;
        await this.prisma.news.updateMany({
            where: { id: { in: due.map((n) => n.id) } },
            data: { status: client_1.ContentStatus.PUBLISHED, publishedAt: new Date() },
        });
        return due.length;
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NewsService);
//# sourceMappingURL=news.service.js.map