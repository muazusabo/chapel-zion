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
exports.ChapelController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_service_1 = require("../audit/audit.service");
const chapel_service_1 = require("./chapel.service");
const chapel_account_dto_1 = require("./dto/chapel-account.dto");
let ChapelController = class ChapelController {
    constructor(chapelService, auditService) {
        this.chapelService = chapelService;
        this.auditService = auditService;
    }
    getAccount() {
        return this.chapelService.getAccount();
    }
    async update(dto, adminId) {
        const account = await this.chapelService.updateAccount(dto);
        await this.auditService.log({
            adminId,
            action: 'UPDATE_CHAPEL_ACCOUNT',
            entity: 'ChapelAccount',
            entityId: account.id,
        });
        return account;
    }
};
exports.ChapelController = ChapelController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('chapel/account'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChapelController.prototype, "getAccount", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Put)('admin/chapel/account'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chapel_account_dto_1.UpdateChapelAccountDto, String]),
    __metadata("design:returntype", Promise)
], ChapelController.prototype, "update", null);
exports.ChapelController = ChapelController = __decorate([
    (0, swagger_1.ApiTags)('Chapel Account'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [chapel_service_1.ChapelService,
        audit_service_1.AuditService])
], ChapelController);
//# sourceMappingURL=chapel.controller.js.map