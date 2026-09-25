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
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AnnouncementsService = class AnnouncementsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findPublished(params) {
        const { page, limit, search, category } = params;
        const where = {
            status: client_1.ContentStatus.PUBLISHED,
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
    async findOnePublished(id) {
        const announcement = await this.prisma.announcement.findFirst({
            where: { id, status: client_1.ContentStatus.PUBLISHED },
        });
        if (!announcement)
            throw new common_1.NotFoundException('Announcement not found');
        return announcement;
    }
    async findAllAdmin(params) {
        const { page, limit, search } = params;
        const where = search
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
    async findOneAdmin(id) {
        const announcement = await this.prisma.announcement.findUnique({ where: { id } });
        if (!announcement)
            throw new common_1.NotFoundException('Announcement not found');
        return announcement;
    }
    create(authorId, dto) {
        const status = dto.status ?? client_1.ContentStatus.DRAFT;
        return this.prisma.announcement.create({
            data: {
                ...dto,
                authorId,
                status,
                publishedAt: status === client_1.ContentStatus.PUBLISHED ? new Date() : null,
                scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
            },
        });
    }
    async update(id, dto) {
        await this.findOneAdmin(id);
        const existing = await this.prisma.announcement.findUnique({ where: { id } });
        const willPublishNow = dto.status === client_1.ContentStatus.PUBLISHED && existing?.status !== client_1.ContentStatus.PUBLISHED;
        return this.prisma.announcement.update({
            where: { id },
            data: {
                ...dto,
                scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
                publishedAt: willPublishNow ? new Date() : undefined,
            },
        });
    }
    async publish(id) {
        await this.findOneAdmin(id);
        return this.prisma.announcement.update({
            where: { id },
            data: { status: client_1.ContentStatus.PUBLISHED, publishedAt: new Date() },
        });
    }
    async unpublish(id) {
        await this.findOneAdmin(id);
        return this.prisma.announcement.update({
            where: { id },
            data: { status: client_1.ContentStatus.DRAFT },
        });
    }
    async remove(id) {
        await this.findOneAdmin(id);
        await this.prisma.announcement.delete({ where: { id } });
        return { message: 'Announcement deleted' };
    }
    async publishDueScheduled() {
        const due = await this.prisma.announcement.findMany({
            where: {
                status: client_1.ContentStatus.DRAFT,
                scheduledFor: { lte: new Date() },
            },
        });
        if (due.length === 0)
            return 0;
        await this.prisma.announcement.updateMany({
            where: { id: { in: due.map((a) => a.id) } },
            data: { status: client_1.ContentStatus.PUBLISHED, publishedAt: new Date() },
        });
        return due.length;
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnnouncementsService);
//# sourceMappingURL=announcements.service.js.map