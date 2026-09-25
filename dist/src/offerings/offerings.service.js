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
exports.OfferingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OfferingsService = class OfferingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllAdmin(page = 1, limit = 20) {
        const [items, total] = await Promise.all([
            this.prisma.offering.findMany({
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    transaction: {
                        include: { user: { select: { fullName: true, email: true } } },
                    },
                },
            }),
            this.prisma.offering.count(),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async monthlyTotals(months = 6) {
        const since = new Date();
        since.setMonth(since.getMonth() - months);
        const offerings = await this.prisma.offering.findMany({
            where: { createdAt: { gte: since } },
            select: { amount: true, createdAt: true },
        });
        const buckets = {};
        for (const o of offerings) {
            const key = o.createdAt.toISOString().slice(0, 7);
            buckets[key] = (buckets[key] ?? 0) + Number(o.amount);
        }
        return buckets;
    }
};
exports.OfferingsService = OfferingsService;
exports.OfferingsService = OfferingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OfferingsService);
//# sourceMappingURL=offerings.service.js.map