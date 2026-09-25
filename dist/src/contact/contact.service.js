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
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ContactService = class ContactService {
    constructor(prisma, notifications, config) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.config = config;
    }
    async create(dto, userId) {
        const message = await this.prisma.contactMessage.create({
            data: { ...dto, userId },
        });
        const adminEmail = this.config.get('SUPER_ADMIN_EMAIL');
        if (adminEmail) {
            this.notifications
                .notifyAdminNewContactMessage(adminEmail, dto.name, dto.subject)
                .catch(() => undefined);
        }
        return { message: 'Your message has been sent. We will get back to you soon.', id: message.id };
    }
    async findAllAdmin(params) {
        const { page, limit, status } = params;
        const where = status ? { status } : {};
        const [items, total] = await Promise.all([
            this.prisma.contactMessage.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.contactMessage.count({ where }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findOneAdmin(id) {
        const message = await this.prisma.contactMessage.findUnique({ where: { id } });
        if (!message)
            throw new common_1.NotFoundException('Message not found');
        if (message.status === client_1.ContactMessageStatus.UNREAD) {
            return this.prisma.contactMessage.update({
                where: { id },
                data: { status: client_1.ContactMessageStatus.READ },
            });
        }
        return message;
    }
    async archive(id) {
        await this.findOneAdmin(id);
        return this.prisma.contactMessage.update({
            where: { id },
            data: { status: client_1.ContactMessageStatus.ARCHIVED },
        });
    }
    async remove(id) {
        await this.prisma.contactMessage.findUniqueOrThrow({ where: { id } }).catch(() => {
            throw new common_1.NotFoundException('Message not found');
        });
        await this.prisma.contactMessage.delete({ where: { id } });
        return { message: 'Message deleted' };
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], ContactService);
//# sourceMappingURL=contact.service.js.map