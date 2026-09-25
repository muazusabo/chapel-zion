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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const payments_service_1 = require("./payments.service");
const payment_dto_1 = require("./dto/payment.dto");
const upload_service_1 = require("../upload/upload.service");
let PaymentsController = class PaymentsController {
    constructor(paymentsService, uploadService) {
        this.paymentsService = paymentsService;
        this.uploadService = uploadService;
    }
    createOfflineRequest(userId, dto, transactionScreenshot) {
        return this.uploadService
            .uploadImage(transactionScreenshot, 'transaction-screenshots')
            .then(({ url }) => this.paymentsService.createOfflineRequest(userId, dto, url));
    }
    findMine(userId) {
        return this.paymentsService.findMine(userId);
    }
    findAllAdmin(page = '1', limit = '20', status, search) {
        return this.paymentsService.findAllAdmin({
            page: Number(page),
            limit: Number(limit),
            status,
            search,
        });
    }
    approve(id) {
        return this.paymentsService.approveTransaction(id);
    }
    reject(id) {
        return this.paymentsService.rejectTransaction(id);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/offline-request'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('transactionScreenshot', { limits: { fileSize: 8 * 1024 * 1024 } })),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payment_dto_1.InitializePaymentDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createOfflineRequest", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('payments/mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findMine", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/payments'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findAllAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/payments/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "approve", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/payments/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "reject", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        upload_service_1.UploadService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map