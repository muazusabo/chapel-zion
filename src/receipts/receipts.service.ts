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
      const ink = '#142B45';
      const paper = '#FFFEFB';
      const gold = '#B8924A';
      const muted = '#657386';
      const pageWidth = 720;
      const pageHeight = 480;
      const margin = 28;
      const contentWidth = pageWidth - margin * 2;
      const amount = Number(receipt.amount ?? receipt.transaction.amount);
      const formattedAmount = `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const [nairaAmount, koboAmount] = formattedAmount.replace('₦', '').split('.');
      const logoPath = process.env.FCS_RECEIPT_LOGO_PATH ?? join(process.cwd(), 'assets/fcs-logo.jfif');
      const pdfFont = join(__dirname, '../../../node_modules/typeface-noto-sans/files/noto-sans-latin-400.woff');
      const currencyFont = existsSync(pdfFont) ? pdfFont : 'Helvetica';
      const doc = new PDFDocument({ size: [pageWidth, pageHeight], margin });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.rect(0, 0, pageWidth, pageHeight).fill(paper);
      doc.roundedRect(0.5, 0.5, pageWidth - 1, pageHeight - 1, 5).lineWidth(1).strokeColor('#D9E0E8').stroke();
      doc.rect(0, 0, pageWidth, 104).fill(ink);
      doc.rect(0, 104, pageWidth, 3).fill(gold);

      doc.roundedRect(margin, 20, 64, 64, 4).fill('#FFFFFF');
      if (existsSync(logoPath)) doc.image(logoPath, margin + 4, 24, { fit: [56, 56], align: 'center', valign: 'center' });
      doc.fillColor(gold).font('Helvetica-Bold').fontSize(9).text('SAZU FCS | CHAPEL OF ZION', margin + 78, 22);
      doc.fillColor('#FFFFFF').fontSize(19).text('Fellowship of Christian Students', margin + 78, 39, { width: 315 });
      doc.fillColor('#D8DFE8').font('Helvetica').fontSize(9).text("Sa'adu Zungur University", margin + 78, 69);
      doc.fillColor(gold).font('Helvetica-Bold').fontSize(9).text('OFFICIAL RECEIPT', pageWidth - 205, 21, { width: 177, align: 'right' });
      doc.fillColor('#FFFFFF').fontSize(11).text(receipt.receiptNumber, pageWidth - 205, 41, { width: 177, align: 'right' });
      doc.fillColor('#D8DFE8').font('Helvetica').fontSize(9).text(`Date: ${new Date(receipt.issuedAt ?? receipt.createdAt).toLocaleDateString('en-GB')}`, pageWidth - 205, 62, { width: 177, align: 'right' });

      const line = (label: string, value: string, y: number, valueX = margin + 92, valueWidth = contentWidth - 92) => {
        doc.fillColor(ink).font('Helvetica-Oblique').fontSize(11).text(label, margin, y);
        doc.moveTo(valueX, y + 13).lineTo(valueX + valueWidth, y + 13).lineWidth(0.7).strokeColor(ink).stroke();
        if (value) doc.font('Helvetica').fontSize(10).text(value, valueX + 4, y + 1, { width: valueWidth - 8, lineBreak: false });
      };

      doc.fillColor(gold).font('Helvetica-Bold').fontSize(8).text('RECEIVED FROM', margin, 127);
      doc.fillColor(ink).font('Helvetica-Bold').fontSize(16).text(receipt.requestedName || receipt.user?.fullName || '', margin, 142, { width: contentWidth, lineBreak: false });
      doc.moveTo(margin, 164).lineTo(pageWidth - margin, 164).lineWidth(0.7).strokeColor('#D9E0E8').stroke();
      line('The sum of', this.amountToWords(amount), 176);
      line('Naira', nairaAmount, 205, margin + 44, 125);
      doc.font('Helvetica-Oblique').fontSize(11).text('Kobo', margin + 190, 205);
      doc.moveTo(margin + 224, 218).lineTo(margin + 300, 218).strokeColor(ink).lineWidth(0.7).stroke();
      doc.font('Helvetica').fontSize(10).text(koboAmount, margin + 228, 206);
      line('Being', (receipt.paymentType ?? receipt.transaction.givingType).replace('_', ' '), 231);

      const amountX = margin;
      const amountY = 282;
      doc.roundedRect(amountX, amountY, 205, 64, 4).fillAndStroke(ink, gold);
      doc.fillColor(gold).font('Helvetica-Bold').fontSize(8).text('AMOUNT RECEIVED', amountX, amountY + 11, { width: 205, align: 'center' });
      doc.fillColor('#FFFFFF').font(currencyFont).fontSize(22).text(formattedAmount, amountX, amountY + 29, { width: 205, align: 'center' });

      const tableX = 258;
      const tableY = amountY;
      const tableWidth = pageWidth - margin - tableX;
      doc.roundedRect(tableX, tableY, tableWidth, 64, 4).lineWidth(0.8).strokeColor('#D9E0E8').stroke();
      doc.moveTo(tableX + tableWidth / 2, tableY).lineTo(tableX + tableWidth / 2, tableY + 64).strokeColor('#D9E0E8').stroke();
      doc.fillColor(gold).font('Helvetica-Bold').fontSize(8).text('PAYMENT METHOD', tableX + 10, tableY + 12, { width: tableWidth / 2 - 20 });
      doc.fillColor(ink).font('Helvetica').fontSize(10).text(receipt.paymentMethod ?? 'Manual Transfer', tableX + 10, tableY + 31, { width: tableWidth / 2 - 20, lineBreak: false });
      doc.fillColor(gold).font('Helvetica-Bold').fontSize(8).text('TRANSACTION REFERENCE', tableX + tableWidth / 2 + 10, tableY + 12, { width: tableWidth / 2 - 20 });
      doc.fillColor(ink).font('Helvetica').fontSize(9).text(receipt.transaction.reference ?? '', tableX + tableWidth / 2 + 10, tableY + 31, { width: tableWidth / 2 - 20, lineBreak: false });

      doc.moveTo(margin, 367).lineTo(pageWidth - margin, 367).lineWidth(0.7).strokeColor('#D9E0E8').stroke();
      doc.fillColor(gold).font('Helvetica-Bold').fontSize(8).text('AUTHORIZED SIGNATURE', margin, 379);
      doc.moveTo(margin, 414).lineTo(margin + 190, 414).lineWidth(0.8).strokeColor(muted).stroke();
      doc.fillColor(muted).font('Helvetica').fontSize(8).text('For SAZU FCS | Chapel of Zion', margin, 420);
      doc.fillColor(ink).font('Helvetica-Bold').fontSize(10).text('RECEIVED WITH THANKS', 275, 389, { width: 210, align: 'center' });
      doc.fillColor(muted).font('Helvetica').fontSize(8).text('Fellowship of Christian Students', 275, 405, { width: 210, align: 'center' });
      doc.image(qrImageBuffer, pageWidth - margin - 42, 389, { width: 42, height: 42 });
      doc.fillColor(muted).fontSize(7).text('VERIFY RECEIPT', pageWidth - margin - 62, 434, { width: 62, align: 'center' });

      doc.end();
    });
  }
}
