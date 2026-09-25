import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { existsSync } from 'fs';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { PaymentStatus, Prisma, ReceiptRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';

@Injectable()
export class ReceiptsService {
  constructor(private prisma: PrismaService) {}

  private generateVerificationCode(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  private async generateReceiptNumber(tx: Prisma.TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `FCS-${year}-`;
    const count = await tx.receipt.count({
      where: { receiptNumber: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }

  private amountToWords(amount: number): string {
    const digits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const underHundred = (value: number): string => {
      if (value < 10) return digits[value];
      if (value < 20) return teens[value - 10];
      return `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${digits[value % 10]}` : ''}`;
    };
    const underThousand = (value: number): string => {
      if (value < 100) return underHundred(value);
      return `${digits[Math.floor(value / 100)]} hundred${value % 100 ? ` ${underHundred(value % 100)}` : ''}`;
    };
    const underMillion = (value: number): string => {
      if (value < 1000) return underThousand(value);
      return `${underThousand(Math.floor(value / 1000))} thousand${value % 1000 ? ` ${underThousand(value % 1000)}` : ''}`;
    };
    const words = underMillion(Math.trunc(Number(amount) || 0));
    return `${words.charAt(0).toUpperCase()}${words.slice(1)} Naira Only`;
  }

  async createForTransaction(transactionId: string, userId: string | null) {
    return this.prisma.receipt.create({
      data: {
        transactionId,
        userId,
        receiptNumber: `FCS-${new Date().getFullYear()}-${String((await this.prisma.receipt.count()) + 1).padStart(6, '0')}`,
        verificationCode: this.generateVerificationCode(),
      },
    });
  }

  async createReceiptRequest(
    userId: string,
    transactionId: string,
    firstName?: string,
    surname?: string,
    requestedName?: string,
  ) {
    const combinedName = [firstName, surname].map((value) => value?.trim()).filter(Boolean).join(' ');
    const trimmedName = (requestedName ?? combinedName).trim();
    if (!trimmedName) {
      throw new BadRequestException('Please enter the first name and surname that should appear on the receipt.');
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { receipt: true, receiptRequests: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (transaction.userId !== userId) {
      throw new ForbiddenException('This transaction does not belong to your account.');
    }
    if (transaction.status !== PaymentStatus.SUCCESSFUL) {
      throw new BadRequestException('Only successful transactions are eligible for a receipt request.');
    }
    if (transaction.receipt) {
      throw new ConflictException('A receipt has already been issued for this transaction.');
    }
    const pendingRequest = transaction.receiptRequests.find((request) => request.status === ReceiptRequestStatus.PENDING);
    if (pendingRequest) {
      throw new ConflictException('You already have a receipt request awaiting approval.');
    }
    const approvedRequest = transaction.receiptRequests.find((request) => request.status === ReceiptRequestStatus.APPROVED);
    if (approvedRequest) {
      throw new ConflictException('A receipt has already been issued for this transaction.');
    }

    return this.prisma.receiptRequest.create({
      data: {
        userId,
        transactionId: transaction.id,
        requestedName: trimmedName,
        status: ReceiptRequestStatus.PENDING,
      },
      include: {
        transaction: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async findMineRequests(userId: string) {
    return this.prisma.receiptRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: 'desc' },
      include: {
        transaction: true,
        receipt: true,
      },
    });
  }

  async findAllRequestsAdmin(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.receiptRequest.findMany({
        where: {},
        orderBy: { requestedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          transaction: true,
          receipt: true,
        },
      }),
      this.prisma.receiptRequest.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async approveReceiptRequest(requestId: string, approvedBy: string) {
    const request = await this.prisma.receiptRequest.findUnique({
      where: { id: requestId },
      include: { transaction: true, receipt: true },
    });

    if (!request) {
      throw new NotFoundException('Receipt request not found');
    }
    if (request.status !== ReceiptRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved.');
    }
    if (request.transaction.status !== PaymentStatus.SUCCESSFUL) {
      throw new BadRequestException('This payment is not marked as successful.');
    }
    if (request.receipt) {
      throw new ConflictException('A receipt was already generated for this request.');
    }

    const receipt = await this.prisma.$transaction(async (tx) => {
      const uniqueNumber = await this.generateReceiptNumber(tx);
      const created = await tx.receipt.create({
        data: {
          receiptNumber: uniqueNumber,
          verificationCode: this.generateVerificationCode(),
          transactionId: request.transactionId,
          userId: request.userId,
          requestedName: request.requestedName,
          amount: request.transaction.amount,
          paymentType: request.transaction.givingType,
          paymentMethod: request.transaction.provider,
          issuedAt: new Date(),
        },
      });

      await tx.receiptRequest.update({
        where: { id: request.id },
        data: {
          status: ReceiptRequestStatus.APPROVED,
          approvedAt: new Date(),
          approvedBy,
          receiptId: created.id,
        },
      });

      return created;
    });

    return { receipt, status: ReceiptRequestStatus.APPROVED };
  }

  async rejectReceiptRequest(requestId: string, rejectedBy: string, adminNote?: string) {
    const request = await this.prisma.receiptRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Receipt request not found');
    }
    if (request.status !== ReceiptRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected.');
    }

    return this.prisma.receiptRequest.update({
      where: { id: requestId },
      data: {
        status: ReceiptRequestStatus.REJECTED,
        adminNote: adminNote?.trim() || undefined,
        rejectedAt: new Date(),
        rejectedBy,
      },
      include: {
        transaction: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async findMine(userId: string) {
    return this.prisma.receipt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { transaction: true },
    });
  }

  async findOne(id: string, userId?: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: { transaction: true, user: { select: { fullName: true, email: true } } },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    if (userId && receipt.userId !== userId) {
      throw new NotFoundException('Receipt not found');
    }
    return receipt;
  }

  async attachFile(receiptId: string, fileUrl: string) {
    const receipt = await this.prisma.receipt.findUnique({ where: { id: receiptId } });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return this.prisma.receipt.update({
      where: { id: receiptId },
      data: { pdfUrl: fileUrl },
      include: { transaction: true },
    });
  }

  async getUploadedFile(id: string, userId: string) {
    const receipt = await this.findOne(id, userId);
    if (!receipt.pdfUrl) throw new NotFoundException('Receipt file is not available yet');
    const filePath = new URL(receipt.pdfUrl).pathname.replace(/^\//, '');
    return {
      receipt,
      filePath: join(process.cwd(), filePath),
    };
  }

  async verifyByNumber(receiptNumber: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { receiptNumber },
      include: { transaction: true },
    });
    if (!receipt) {
      return { valid: false };
    }
    return {
      valid: true,
      receiptNumber: receipt.receiptNumber,
      paymentType: receipt.paymentType ?? receipt.transaction.givingType,
      amount: receipt.amount ?? receipt.transaction.amount,
      date: receipt.issuedAt ?? receipt.createdAt,
      status: receipt.transaction.status,
      transactionReference: receipt.transaction.reference,
    };
  }

  async generatePdfBuffer(receiptId: string, userId?: string): Promise<Buffer> {
    const receipt = await this.findOne(receiptId, userId);
    const verifyUrl = `${process.env.CLIENT_URL ?? 'http://localhost:3000'}/verify-receipt?number=${receipt.receiptNumber}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl);
    const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    return new Promise((resolve, reject) => {
      const ink = '#174A7C';
      const paper = '#F4F8FB';
      const pageWidth = 720;
      const pageHeight = 480;
      const margin = 28;
      const contentWidth = pageWidth - margin * 2;
      const amount = Number(receipt.amount ?? receipt.transaction.amount);
      const formattedAmount = `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const [nairaAmount, koboAmount] = formattedAmount.replace('₦', '').split('.');
      const logoPath = process.env.FCS_RECEIPT_LOGO_PATH ?? join(__dirname, '../../../client/public/images/logo.jfif');
      const pdfFont = join(__dirname, '../../../node_modules/typeface-noto-sans/files/noto-sans-latin-400.woff');
      const currencyFont = existsSync(pdfFont) ? pdfFont : 'Helvetica';
      const doc = new PDFDocument({ size: [pageWidth, pageHeight], margin });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.rect(0, 0, pageWidth, pageHeight).fill(paper);
      doc.rect(0.5, 0.5, pageWidth - 1, pageHeight - 1).lineWidth(1).strokeColor(ink).stroke();

      if (existsSync(logoPath)) doc.image(logoPath, margin, margin, { width: 52, height: 52 });
      doc.fillColor(ink).font('Helvetica-Bold').fontSize(15).text('FELLOWSHIP OF CHRISTIAN STUDENTS', margin + 62, margin + 6);
      doc.fontSize(30).text('FCS', margin + 62, margin + 22);
      doc.fontSize(10).text(`No.  ${receipt.receiptNumber}`, pageWidth - 190, margin + 8, { width: 162, align: 'right' });
      doc.font('Helvetica').text(`Date:  ${new Date(receipt.issuedAt ?? receipt.createdAt).toLocaleDateString('en-GB')}`, pageWidth - 190, margin + 27, { width: 162, align: 'right' });

      const badgeWidth = 180;
      const badgeX = (pageWidth - badgeWidth) / 2;
      doc.roundedRect(badgeX, 88, badgeWidth, 25, 3).fillAndStroke('#27659A', ink);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(12).text('OFFICIAL RECEIPT', badgeX, 95, { width: badgeWidth, align: 'center' });

      const line = (label: string, value: string, y: number, valueX = margin + 92, valueWidth = contentWidth - 92) => {
        doc.fillColor(ink).font('Helvetica-Oblique').fontSize(11).text(label, margin, y);
        doc.moveTo(valueX, y + 13).lineTo(valueX + valueWidth, y + 13).lineWidth(0.7).strokeColor(ink).stroke();
        if (value) doc.font('Helvetica').fontSize(10).text(value, valueX + 4, y + 1, { width: valueWidth - 8, lineBreak: false });
      };

      line('Received from', receipt.requestedName ?? receipt.user?.fullName ?? '', 132);
      line('The sum of', this.amountToWords(amount), 160);
      line('Naira', nairaAmount, 188, margin + 44, 125);
      doc.font('Helvetica-Oblique').fontSize(11).text('Kobo', margin + 190, 188);
      doc.moveTo(margin + 224, 201).lineTo(margin + 300, 201).strokeColor(ink).lineWidth(0.7).stroke();
      doc.font('Helvetica').fontSize(10).text(koboAmount, margin + 228, 189);
      line('Being', (receipt.paymentType ?? receipt.transaction.givingType).replace('_', ' '), 216);

      const amountX = margin;
      const amountY = 277;
      doc.rect(amountX, amountY, 180, 62).lineWidth(2).strokeColor(ink).stroke();
      doc.rect(amountX + 5, amountY + 5, 170, 52).lineWidth(0.8).strokeColor(ink).stroke();
      doc.fillColor(ink).font('Helvetica').fontSize(9).text('AMOUNT', amountX, amountY + 12, { width: 180, align: 'center' });
      doc.font(currencyFont).fontSize(21).text(formattedAmount, amountX, amountY + 27, { width: 180, align: 'center' });

      const tableX = pageWidth - margin - 205;
      const tableY = 280;
      doc.lineWidth(0.8).strokeColor(ink).rect(tableX, tableY, 205, 62).stroke();
      doc.moveTo(tableX + 102.5, tableY).lineTo(tableX + 102.5, tableY + 62).stroke();
      doc.moveTo(tableX, tableY + 22).lineTo(tableX + 205, tableY + 22).stroke();
      doc.fillColor(ink).font('Helvetica-Bold').fontSize(9).text('CASH', tableX, tableY + 7, { width: 102.5, align: 'center' });
      doc.text('CHEQUE NO', tableX + 102.5, tableY + 7, { width: 102.5, align: 'center' });
      doc.font('Helvetica').fontSize(8).text(receipt.paymentMethod ?? 'Manual Transfer', tableX + 4, tableY + 32, { width: 94, align: 'center' });
      doc.text(receipt.transaction.reference ?? '', tableX + 107, tableY + 32, { width: 94, align: 'center' });

      doc.font('Helvetica-Bold').fontSize(10).text('RECEIVED WITH THANKS', pageWidth - margin - 190, 373, { width: 190, align: 'right' });
      doc.font('Helvetica').fontSize(9).text('Signature', pageWidth - margin - 110, 411, { width: 110, align: 'center' });
      doc.moveTo(pageWidth - margin - 110, 408).lineTo(pageWidth - margin, 408).strokeColor(ink).stroke();
      doc.image(qrImageBuffer, pageWidth - margin - 38, pageHeight - margin - 38, { width: 38, height: 38 });

      doc.end();
    });
  }
}
