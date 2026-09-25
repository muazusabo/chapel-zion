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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const audit_service_1 = require("../audit/audit.service");
const users_service_1 = require("./users.service");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
let UsersController = class UsersController {
    constructor(usersService, auditService) {
        this.usersService = usersService;
        this.auditService = auditService;
    }
    getMe(userId) {
        return this.usersService.findById(userId);
    }
    updateMe(userId, dto) {
        return this.usersService.updateProfile(userId, dto);
    }
    changeMyPassword(userId, dto) {
        return this.usersService.changePassword(userId, dto.currentPassword, dto.newPassword);
    }
    getMyDashboard(userId) {
        return this.usersService.getDashboardStats(userId);
    }
    findAll(page = '1', limit = '20', search, status) {
        return this.usersService.findAll({
            page: Number(page),
            limit: Number(limit),
            search,
            status,
        });
    }
    findOne(id) {
        return this.usersService.findById(id);
    }
    async suspend(id, adminId) {
        const user = await this.usersService.setStatus(id, client_1.UserStatus.SUSPENDED);
        await this.auditService.log({
            adminId,
            action: 'SUSPEND_USER',
            entity: 'User',
            entityId: id,
        });
        return user;
    }
    async activate(id, adminId) {
        const user = await this.usersService.setStatus(id, client_1.UserStatus.ACTIVE);
        await this.auditService.log({
            adminId,
            action: 'ACTIVATE_USER',
            entity: 'User',
            entityId: id,
        });
        return user;
    }
    async setRole(id, role, adminId) {
        const user = await this.usersService.setRole(id, role);
        await this.auditService.log({
            adminId,
            action: 'CHANGE_USER_ROLE',
            entity: 'User',
            entityId: id,
            metadata: { newRole: role },
        });
        return user;
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('users/me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('users/me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Patch)('users/me/password'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changeMyPassword", null);
__decorate([
    (0, common_1.Get)('users/me/dashboard'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyDashboard", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/users/:id/suspend'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "suspend", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/users/:id/activate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "activate", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/users/:id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('role')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setRole", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        audit_service_1.AuditService])
], UsersController);
//# sourceMappingURL=users.controller.js.map