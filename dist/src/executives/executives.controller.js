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
exports.ExecutivesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_service_1 = require("../audit/audit.service");
const executives_service_1 = require("./executives.service");
const executive_dto_1 = require("./dto/executive.dto");
let ExecutivesController = class ExecutivesController {
    constructor(executivesService, auditService) {
        this.executivesService = executivesService;
        this.auditService = auditService;
    }
    findPublished() {
        return this.executivesService.findPublished();
    }
    findAllAdmin() {
        return this.executivesService.findAllAdmin();
    }
    async create(dto, adminId) {
        const exec = await this.executivesService.create(dto);
        await this.auditService.log({ adminId, action: 'CREATE_EXECUTIVE', entity: 'Executive', entityId: exec.id });
        return exec;
    }
    async reorder(dto, adminId) {
        const result = await this.executivesService.reorder(dto);
        await this.auditService.log({ adminId, action: 'REORDER_EXECUTIVES', entity: 'Executive' });
        return result;
    }
    async update(id, dto, adminId) {
        const exec = await this.executivesService.update(id, dto);
        await this.auditService.log({ adminId, action: 'UPDATE_EXECUTIVE', entity: 'Executive', entityId: id });
        return exec;
    }
    async remove(id, adminId) {
        const result = await this.executivesService.remove(id);
        await this.auditService.log({ adminId, action: 'DELETE_EXECUTIVE', entity: 'Executive', entityId: id });
        return result;
    }
};
exports.ExecutivesController = ExecutivesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('executives'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExecutivesController.prototype, "findPublished", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/executives'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExecutivesController.prototype, "findAllAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('admin/executives'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [executive_dto_1.CreateExecutiveDto, String]),
    __metadata("design:returntype", Promise)
], ExecutivesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/executives/reorder'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [executive_dto_1.ReorderExecutivesDto, String]),
    __metadata("design:returntype", Promise)
], ExecutivesController.prototype, "reorder", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/executives/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, executive_dto_1.UpdateExecutiveDto, String]),
    __metadata("design:returntype", Promise)
], ExecutivesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)('admin/executives/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExecutivesController.prototype, "remove", null);
exports.ExecutivesController = ExecutivesController = __decorate([
    (0, swagger_1.ApiTags)('Executives'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [executives_service_1.ExecutivesService,
        audit_service_1.AuditService])
], ExecutivesController);
//# sourceMappingURL=executives.controller.js.map