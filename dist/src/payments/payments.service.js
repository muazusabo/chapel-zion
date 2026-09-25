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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const receipts_service_1 = require("../receipts/receipts.service");
let PaymentsService = class PaymentsService {
    constructor(prisma, notifications, receiptsService) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.receiptsService = receiptsService;
    }
    generateReference() {
        return `SAZUFCS-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    }
    async createOfflineRequest(userId, dto, transactionScreenshotUrl) {
        const reference = this.generateReference();
        const transaction = await this.prisma.transaction.create({
            data: {
                reference,
                userId,
                amount: dto.amount,
                givingType: dto.givingType,
                note: dto.note,
                provider: client_1.PaymentProvider.MANUAL,
                status: client_1.PaymentStatus.PENDING,
                metadata: {
                    transactionScreenshotUrl,
                    transferDate: dto.transferDate ?? null,
                },
            },
        });
        return {
            success: true,
            message: 'Your giving request has been submitted. Please make the transfer using the chapel account details and wait for admin approval.',
            reference,
            transactionId: transaction.id,
            paymentMethod: 'OFFLINE_TRANSFER',
        };
    }
    async finalizeApprovedTransaction(transactionId) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { user: true, receipt: true },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status === client_1.PaymentStatus.SUCCESSFUL && transaction.receipt) {
            return { transaction, receipt: transaction.receipt, alreadyProcessed: true };
        }
        const finalized = await this.prisma.$transaction(async (tx) => {
            const updatedTransaction = await tx.transaction.update({
                where: { id: transaction.id },
                data: { status: client_1.PaymentStatus.SUCCESSFUL, provider: client_1.PaymentProvider.MANUAL },
            });
            return updatedTransaction;
        });
        let receipt = transaction.receipt;
        if (!receipt) {
            try {
                receipt = await this.receiptsService.createForTransaction(transaction.id, transaction.userId);
            }
            catch {
                receipt = await this.prisma.receipt.findUnique({ where: { transactionId: transaction.id } });
            }
        }
        if (transaction.user) {
            this.notifications.sendPaymentConfirmationEmail(transaction.user.email, transaction.user.fullName, `NGN ${Number(transaction.amount).toLocaleString()}`, transaction.givingType, receipt?.receiptNumber ?? 'N/A', receipt?.id ?? '').catch(() => undefined);
        }
        return { transaction: finalized, receipt, alreadyProcessed: false };
    }
    async approveTransaction(transactionId) {
        const transaction = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status === client_1.PaymentStatus.SUCCESSFUL) {
            return this.finalizeApprovedTransaction(transaction.id);
        }
        return this.finalizeApprovedTransaction(transaction.id);
    }
    async rejectTransaction(transactionId) {
        const transaction = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        const updated = await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: client_1.PaymentStatus.FAILED },
        });
        return { transaction: updated, rejected: true };
    }
    async findAllAdmin(params) {
        const { page, limit, status, search } = params;
        const where = {
            ...(status ? { status } : {}),
            ...(search
                ? {
                    OR: [
                        { reference: { contains: search } },
                        { user: { fullName: { contains: search } } },
                        { user: { email: { contains: search } } },
                        { receipt: { receiptNumber: { contains: search } } },
                    ],
                }
                : {}),
        };
        const [items, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: { select: { id: true, fullName: true, email: true } },
                    receipt: { select: { id: true, receiptNumber: true, pdfUrl: true } },
                },
            }),
            this.prisma.transaction.count({ where }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findMine(userId) {
        return this.prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { receipt: { select: { id: true, receiptNumber: true, pdfUrl: true } } },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        receipts_service_1.ReceiptsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map