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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../common/decorators/public.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const upload_service_1 = require("../upload/upload.service");
const receipts_service_1 = require("./receipts.service");
let ReceiptsController = class ReceiptsController {
    constructor(receiptsService, uploadService) {
        this.receiptsService = receiptsService;
        this.uploadService = uploadService;
    }
    findMine(userId) {
        return this.receiptsService.findMine(userId);
    }
    findMyRequests(userId) {
        return this.receiptsService.findMineRequests(userId);
    }
    createRequest(userId, body) {
        return this.receiptsService.createReceiptRequest(userId, body.transactionId, body.firstName, body.surname, body.requestedName);
    }
    findOne(id, userId) {
        return this.receiptsService.findOne(id, userId);
    }
    findAllAdminRequests(page = '1', limit = '20') {
        return this.receiptsService.findAllRequestsAdmin(Number(page), Number(limit));
    }
    approveRequest(id, adminId) {
        return this.receiptsService.approveReceiptRequest(id, adminId);
    }
    rejectRequest(id, adminId, body) {
        return this.receiptsService.rejectReceiptRequest(id, adminId, body?.adminNote);
    }
    async download(id, userId, res) {
        const receipt = await this.receiptsService.findOne(id, userId);
        if (receipt.pdfUrl) {
            const uploaded = await this.receiptsService.getUploadedFile(id, userId);
            res.download(uploaded.filePath, receipt.receiptNumber, (error) => {
                if (error && !res.headersSent)
                    res.status(404).send('Receipt file not found');
            });
            return;
        }
        const pdfBuffer = await this.receiptsService.generatePdfBuffer(id, userId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${receipt.receiptNumber}.pdf"`,
        });
        res.send(pdfBuffer);
    }
    async uploadFile(id, file) {
        const uploaded = await this.uploadService.uploadReceipt(file);
        return this.receiptsService.attachFile(id, uploaded.url);
    }
    verify(receiptNumber) {
        return this.receiptsService.verifyByNumber(receiptNumber);
    }
};
exports.ReceiptsController = ReceiptsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('receipts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReceiptsController.prototype, "findMine", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('receipts/requests'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReceiptsController.prototype, "findMyRequests", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('receipts/request'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReceiptsController.prototype, "createRequest", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('receipts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReceiptsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/receipts/requests'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ReceiptsController.prototype, "findAllAdminRequests", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/receipts/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReceiptsController.prototype, "approveRequest", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/receipts/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ReceiptsController.prototype, "rejectRequest", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('receipts/:id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReceiptsController.prototype, "download", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('admin/receipts/:id/file'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 8 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReceiptsController.prototype, "uploadFile", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('verify-receipt/:receiptNumber'),
    __param(0, (0, common_1.Param)('receiptNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReceiptsController.prototype, "verify", null);
exports.ReceiptsController = ReceiptsController = __decorate([
    (0, swagger_1.ApiTags)('Receipts'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [receipts_service_1.ReceiptsService,
        upload_service_1.UploadService])
], ReceiptsController);
//# sourceMappingURL=receipts.controller.js.map