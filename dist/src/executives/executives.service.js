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
exports.ExecutivesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExecutivesService = class ExecutivesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findPublished() {
        const executives = await this.prisma.executive.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        return executives.sort((first, second) => {
            const firstPosition = first.position.toLowerCase();
            const secondPosition = second.position.toLowerCase();
            const firstPriority = firstPosition.includes('vice president')
                ? 1
                : firstPosition.includes('president')
                    ? 0
                    : 2;
            const secondPriority = secondPosition.includes('vice president')
                ? 1
                : secondPosition.includes('president')
                    ? 0
                    : 2;
            return firstPriority - secondPriority || first.order - second.order;
        });
    }
    findAllAdmin() {
        return this.prisma.executive.findMany({ orderBy: { order: 'asc' } });
    }
    async findOne(id) {
        const exec = await this.prisma.executive.findUnique({ where: { id } });
        if (!exec)
            throw new common_1.NotFoundException('Executive not found');
        return exec;
    }
    async create(dto) {
        const maxOrder = await this.prisma.executive.aggregate({ _max: { order: true } });
        return this.prisma.executive.create({
            data: { ...dto, order: dto.order ?? (maxOrder._max.order ?? 0) + 1 },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.executive.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.executive.delete({ where: { id } });
        return { message: 'Executive removed' };
    }
    async reorder(dto) {
        await this.prisma.$transaction(dto.items.map((item) => this.prisma.executive.update({ where: { id: item.id }, data: { order: item.order } })));
        return this.findAllAdmin();
    }
};
exports.ExecutivesService = ExecutivesService;
exports.ExecutivesService = ExecutivesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExecutivesService);
//# sourceMappingURL=executives.service.js.map