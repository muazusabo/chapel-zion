"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const client_1 = require("@prisma/client");
const supertest_1 = __importDefault(require("supertest"));
const receipts_controller_1 = require("../src/receipts/receipts.controller");
const receipts_service_1 = require("../src/receipts/receipts.service");
const upload_service_1 = require("../src/upload/upload.service");
const jwt_auth_guard_1 = require("../src/common/guards/jwt-auth.guard");
const roles_guard_1 = require("../src/common/guards/roles.guard");
const jwt_strategy_1 = require("../src/auth/strategies/jwt.strategy");
const prisma_service_1 = require("../src/prisma/prisma.service");
const transform_interceptor_1 = require("../src/common/interceptors/transform.interceptor");
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
    let app;
    let token;
    beforeAll(async () => {
        const receiptsService = {
            findOne: jest.fn().mockImplementation(async (id, userId) => {
                if (id !== receipt.id || (userId && userId !== receipt.userId)) {
                    throw new Error('Receipt not found');
                }
                return receipt;
            }),
            getUploadedFile: jest.fn(),
            generatePdfBuffer: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 FCS receipt')),
            verifyByNumber: jest.fn().mockImplementation(async (receiptNumber) => ({
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
                    role: client_1.Role.USER,
                    status: client_1.UserStatus.ACTIVE,
                }),
            },
        };
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [passport_1.PassportModule.register({ defaultStrategy: 'jwt' })],
            controllers: [receipts_controller_1.ReceiptsController],
            providers: [
                { provide: receipts_service_1.ReceiptsService, useValue: receiptsService },
                { provide: upload_service_1.UploadService, useValue: {} },
                { provide: prisma_service_1.PrismaService, useValue: prisma },
                { provide: config_1.ConfigService, useValue: { get: jest.fn().mockReturnValue('test-secret') } },
                jwt_strategy_1.JwtStrategy,
                jwt_auth_guard_1.JwtAuthGuard,
                roles_guard_1.RolesGuard,
            ],
        }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalGuards(app.get(jwt_auth_guard_1.JwtAuthGuard), app.get(roles_guard_1.RolesGuard));
        app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
        await app.init();
        token = new jwt_1.JwtService({ secret: 'test-secret' }).sign({
            sub: 'user-1',
            email: 'test@example.com',
            role: client_1.Role.USER,
        });
    });
    afterAll(async () => {
        await app.close();
    });
    it('rejects anonymous downloads, downloads with a bearer token, and verifies publicly', async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .get(`/api/receipts/${receipt.id}/download`)
            .expect(401);
        const download = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/api/receipts/${receipt.id}/download`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(download.headers['content-type']).toMatch(/application\/pdf/);
        expect(download.headers['content-disposition']).toContain(receipt.receiptNumber);
        expect(download.body.toString()).toContain('%PDF-1.4 FCS receipt');
        const verification = await (0, supertest_1.default)(app.getHttpServer())
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
//# sourceMappingURL=receipts.e2e-spec.js.map