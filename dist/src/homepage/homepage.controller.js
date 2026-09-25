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
exports.HomepageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_service_1 = require("../audit/audit.service");
const homepage_service_1 = require("./homepage.service");
const homepage_dto_1 = require("./dto/homepage.dto");
let HomepageController = class HomepageController {
    constructor(homepageService, auditService) {
        this.homepageService = homepageService;
        this.auditService = auditService;
    }
    getHomepage() {
        return this.homepageService.getHomepage();
    }
    getAbout() {
        return this.homepageService.getAbout();
    }
    getScripture() {
        return this.homepageService.getScripture();
    }
    getSettings() {
        return this.homepageService.getSettings();
    }
    async updateHomepage(dto, adminId) {
        const result = await this.homepageService.updateHomepage(dto);
        await this.auditService.log({ adminId, action: 'UPDATE_HOMEPAGE_CONTENT', entity: 'HomepageContent' });
        return result;
    }
    async updateAbout(dto, adminId) {
        const result = await this.homepageService.updateAbout(dto);
        await this.auditService.log({ adminId, action: 'UPDATE_ABOUT_CONTENT', entity: 'AboutContent' });
        return result;
    }
    async updateScripture(dto, adminId) {
        const result = await this.homepageService.updateScripture(dto);
        await this.auditService.log({ adminId, action: 'UPDATE_SCRIPTURE', entity: 'Scripture', entityId: result.id });
        return result;
    }
    async updateSettings(dto, adminId) {
        const result = await this.homepageService.updateSettings(dto);
        await this.auditService.log({ adminId, action: 'UPDATE_FELLOWSHIP_SETTINGS', entity: 'FellowshipSettings' });
        return result;
    }
    getDashboardStats() {
        return this.homepageService.getAdminDashboardStats();
    }
};
exports.HomepageController = HomepageController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('homepage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomepageController.prototype, "getHomepage", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('about'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomepageController.prototype, "getAbout", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('scripture'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomepageController.prototype, "getScripture", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomepageController.prototype, "getSettings", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Put)('admin/homepage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [homepage_dto_1.UpdateHomepageDto, String]),
    __metadata("design:returntype", Promise)
], HomepageController.prototype, "updateHomepage", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Put)('admin/about'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [homepage_dto_1.UpdateAboutDto, String]),
    __metadata("design:returntype", Promise)
], HomepageController.prototype, "updateAbout", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Put)('admin/scripture'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [homepage_dto_1.UpdateScriptureDto, String]),
    __metadata("design:returntype", Promise)
], HomepageController.prototype, "updateScripture", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Put)('admin/settings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [homepage_dto_1.UpdateFellowshipSettingsDto, String]),
    __metadata("design:returntype", Promise)
], HomepageController.prototype, "updateSettings", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomepageController.prototype, "getDashboardStats", null);
exports.HomepageController = HomepageController = __decorate([
    (0, swagger_1.ApiTags)('Homepage / CMS'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [homepage_service_1.HomepageService,
        audit_service_1.AuditService])
], HomepageController);
//# sourceMappingURL=homepage.controller.js.map