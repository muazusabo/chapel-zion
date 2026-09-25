import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { GivingType, PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { InitializePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private receiptsService: ReceiptsService,
  ) {}

  private generateReference(): string {
    return `SAZUFCS-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  async createOfflineRequest(userId: string, dto: InitializePaymentDto, transactionScreenshotUrl: string) {
    const reference = this.generateReference();

    const transaction = await this.prisma.transaction.create({
      data: {
        reference,
        userId,
        amount: dto.amount,
        givingType: dto.givingType,
        note: dto.note,
        provider: PaymentProvider.MANUAL,
        status: PaymentStatus.PENDING,
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

  private async finalizeApprovedTransaction(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, receipt: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === PaymentStatus.SUCCESSFUL && transaction.receipt) {
      return { transaction, receipt: transaction.receipt, alreadyProcessed: true };
    }

    const finalized = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedTransaction = await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: PaymentStatus.SUCCESSFUL, provider: PaymentProvider.MANUAL },
      });

      return updatedTransaction;
    });

    let receipt = transaction.receipt;
    if (!receipt) {
      try {
        receipt = await this.receiptsService.createForTransaction(transaction.id, transaction.userId);
      } catch {
        receipt = await this.prisma.receipt.findUnique({ where: { transactionId: transaction.id } });
      }
    }

    if (transaction.user) {
      this.notifications.sendPaymentConfirmationEmail(
        transaction.user.email,
        transaction.user.fullName,
        `NGN ${Number(transaction.amount).toLocaleString()}`,
        transaction.givingType,
        receipt?.receiptNumber ?? 'N/A',
        receipt?.id ?? '',
      ).catch(() => undefined);
    }

    return { transaction: finalized, receipt, alreadyProcessed: false };
  }

  async approveTransaction(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (transaction.status === PaymentStatus.SUCCESSFUL) {
      return this.finalizeApprovedTransaction(transaction.id);
    }
    return this.finalizeApprovedTransaction(transaction.id);
  }

  async rejectTransaction(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: PaymentStatus.FAILED },
    });

    return { transaction: updated, rejected: true };
  }

  async findAllAdmin(params: {
    page: number;
    limit: number;
    status?: PaymentStatus;
    search?: string;
  }) {
    const { page, limit, status, search } = params;
    const where: Prisma.TransactionWhereInput = {
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

  async findMine(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { receipt: { select: { id: true, receiptNumber: true, pdfUrl: true } } },
    });
  }
}
