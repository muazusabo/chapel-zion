import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Role, UserStatus } from '@prisma/client';
import request from 'supertest';
import { ReceiptsController } from '../src/receipts/receipts.controller';
import { ReceiptsService } from '../src/receipts/receipts.service';
import { UploadService } from '../src/upload/upload.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

const receipt = {
  id: 'receipt-1',
  receiptNumber: 'FCS-2026-000001',
  userId: 'user-1',
  pdfUrl: null,
  amount: 1000,
  paymentType: 'OFFERING',
  paymentMethod: 'BANK_TRANSFER',
  issuedAt: new Date('2026-09-24T10:00:00.000Z'),
  createdAt: new Date('2026-09-24T10:00:00.000Z'),
  requestedName: 'Test Member',
  transaction: { reference: 'TRX-1' },
  user: { fullName: 'Test Member', email: 'test@example.com' },
};

describe('Receipts HTTP flow', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const receiptsService = {
      findOne: jest.fn().mockImplementation(async (id: string, userId?: string) => {
        if (id !== receipt.id || (userId && userId !== receipt.userId)) {
          throw new Error('Receipt not found');
        }
        return receipt;
      }),
      getUploadedFile: jest.fn(),
      generatePdfBuffer: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 FCS receipt')),
      verifyByNumber: jest.fn().mockImplementation(async (receiptNumber: string) => ({
        valid: receiptNumber === receipt.receiptNumber,
        receiptNumber,
        amount: receipt.amount,
        transactionReference: receipt.transaction.reference,
      })),
    };
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          email: 'test@example.com',
          role: Role.USER,
          status: UserStatus.ACTIVE,
        }),
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ReceiptsController],
      providers: [
        { provide: ReceiptsService, useValue: receiptsService },
        { provide: UploadService, useValue: {} },
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-secret') } },
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalGuards(app.get(JwtAuthGuard), app.get(RolesGuard));
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    token = new JwtService({ secret: 'test-secret' }).sign({
      sub: 'user-1',
      email: 'test@example.com',
      role: Role.USER,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects anonymous downloads, downloads with a bearer token, and verifies publicly', async () => {
    await request(app.getHttpServer())
      .get(`/api/receipts/${receipt.id}/download`)
      .expect(401);

    const download = await request(app.getHttpServer())
      .get(`/api/receipts/${receipt.id}/download`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(download.headers['content-type']).toMatch(/application\/pdf/);
    expect(download.headers['content-disposition']).toContain(receipt.receiptNumber);
    expect(download.body.toString()).toContain('%PDF-1.4 FCS receipt');

    const verification = await request(app.getHttpServer())
      .get(`/api/verify-receipt/${receipt.receiptNumber}`)
      .expect(200);

    expect(verification.body.success).toBe(true);
    expect(verification.body.data).toMatchObject({
      valid: true,
      receiptNumber: receipt.receiptNumber,
      transactionReference: receipt.transaction.reference,
    });
  });
});
