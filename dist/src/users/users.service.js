"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../prisma/prisma.service");
const SAFE_USER_SELECT = {
    id: true,
    fullName: true,
    email: true,
    phoneNumber: true,
    studentId: true,
    department: true,
    faculty: true,
    level: true,
    profilePicture: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
};
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (existing) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        if (data.studentId) {
            const existingStudent = await this.prisma.user.findUnique({
                where: { studentId: data.studentId },
            });
            if (existingStudent) {
                throw new common_1.ConflictException('An account with this student/matric number already exists');
            }
        }
        const passwordHash = await argon2.hash(data.password);
        return this.prisma.user.create({
            data: {
                fullName: data.fullName,
                email: data.email.toLowerCase(),
                passwordHash,
                phoneNumber: data.phoneNumber,
                studentId: data.studentId,
                department: data.department,
                faculty: data.faculty,
                level: data.level,
                role: data.role ?? client_1.Role.USER,
            },
            select: SAFE_USER_SELECT,
        });
    }
    findByEmailWithPassword(email) {
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: SAFE_USER_SELECT,
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateLastLogin(id) {
        return this.prisma.user.update({
            where: { id },
            data: { lastLoginAt: new Date() },
        });
    }
    async updateProfile(id, data) {
        await this.findById(id);
        return this.prisma.user.update({
            where: { id },
            data,
            select: SAFE_USER_SELECT,
        });
    }
    async changePassword(id, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const valid = await argon2.verify(user.passwordHash, currentPassword);
        if (!valid) {
            throw new common_1.ConflictException('Current password is incorrect');
        }
        const passwordHash = await argon2.hash(newPassword);
        await this.prisma.user.update({ where: { id }, data: { passwordHash } });
        return { message: 'Password updated successfully' };
    }
    async setPassword(id, newPassword) {
        const passwordHash = await argon2.hash(newPassword);
        return this.prisma.user.update({ where: { id }, data: { passwordHash } });
    }
    async findAll(params) {
        const { page, limit, search, status, role } = params;
        const where = {
            ...(status ? { status } : {}),
            ...(role ? { role } : {}),
            ...(search
                ? {
                    OR: [
                        { fullName: { contains: search } },
                        { email: { contains: search } },
                        { studentId: { contains: search } },
                        { department: { contains: search } },
                    ],
                }
                : {}),
        };
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: SAFE_USER_SELECT,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            items: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async setStatus(id, status) {
        await this.findById(id);
        return this.prisma.user.update({
            where: { id },
            data: { status },
            select: SAFE_USER_SELECT,
        });
    }
    async setRole(id, role) {
        await this.findById(id);
        return this.prisma.user.update({
            where: { id },
            data: { role },
            select: SAFE_USER_SELECT,
        });
    }
    async getDashboardStats(userId) {
        const [donationsAgg, offeringsAgg, receiptCount] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: { userId, status: 'SUCCESSFUL', givingType: { in: ['DONATION', 'SPECIAL_CONTRIBUTION', 'BUILDING_PROJECT', 'OTHER'] } },
                _sum: { amount: true },
            }),
            this.prisma.transaction.aggregate({
                where: { userId, status: 'SUCCESSFUL', givingType: { in: ['OFFERING', 'TITHE'] } },
                _sum: { amount: true },
            }),
            this.prisma.receipt.count({ where: { userId } }),
        ]);
        return {
            totalDonations: donationsAgg._sum.amount ?? 0,
            totalOfferings: offeringsAgg._sum.amount ?? 0,
            totalReceipts: receiptCount,
            totalGiving: Number(donationsAgg._sum.amount ?? 0) + Number(offeringsAgg._sum.amount ?? 0),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map