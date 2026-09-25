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
exports.AnnouncementsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_service_1 = require("../audit/audit.service");
const announcements_service_1 = require("./announcements.service");
const announcement_dto_1 = require("./dto/announcement.dto");
let AnnouncementsController = class AnnouncementsController {
    constructor(announcementsService, auditService) {
        this.announcementsService = announcementsService;
        this.auditService = auditService;
    }
    findPublished(page = '1', limit = '12', search, category) {
        return this.announcementsService.findPublished({
            page: Number(page),
            limit: Number(limit),
            search,
            category,
        });
    }
    findOnePublished(id) {
        return this.announcementsService.findOnePublished(id);
    }
    findAllAdmin(page = '1', limit = '20', search) {
        return this.announcementsService.findAllAdmin({
            page: Number(page),
            limit: Number(limit),
            search,
        });
    }
    findOneAdmin(id) {
        return this.announcementsService.findOneAdmin(id);
    }
    async create(adminId, dto) {
        const announcement = await this.announcementsService.create(adminId, dto);
        await this.auditService.log({
            adminId,
            action: 'CREATE_ANNOUNCEMENT',
            entity: 'Announcement',
            entityId: announcement.id,
        });
        return announcement;
    }
    async update(id, dto, adminId) {
        const announcement = await this.announcementsService.update(id, dto);
        await this.auditService.log({
            adminId,
            action: 'UPDATE_ANNOUNCEMENT',
            entity: 'Announcement',
            entityId: id,
        });
        return announcement;
    }
    async publish(id, adminId) {
        const announcement = await this.announcementsService.publish(id);
        await this.auditService.log({
            adminId,
            action: 'PUBLISH_ANNOUNCEMENT',
            entity: 'Announcement',
            entityId: id,
        });
        return announcement;
    }
    async unpublish(id, adminId) {
        const announcement = await this.announcementsService.unpublish(id);
        await this.auditService.log({
            adminId,
            action: 'UNPUBLISH_ANNOUNCEMENT',
            entity: 'Announcement',
            entityId: id,
        });
        return announcement;
    }
    async remove(id, adminId) {
        const result = await this.announcementsService.remove(id);
        await this.auditService.log({
            adminId,
            action: 'DELETE_ANNOUNCEMENT',
            entity: 'Announcement',
            entityId: id,
        });
        return result;
    }
};
exports.AnnouncementsController = AnnouncementsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('announcements'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "findPublished", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('announcements/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "findOnePublished", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/announcements'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "findAllAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/announcements/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "findOneAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('admin/announcements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, announcement_dto_1.CreateAnnouncementDto]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/announcements/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, announcement_dto_1.UpdateAnnouncementDto, String]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/announcements/:id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "publish", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/announcements/:id/unpublish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "unpublish", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)('admin/announcements/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "remove", null);
exports.AnnouncementsController = AnnouncementsController = __decorate([
    (0, swagger_1.ApiTags)('Announcements'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [announcements_service_1.AnnouncementsService,
        audit_service_1.AuditService])
], AnnouncementsController);
//# sourceMappingURL=announcements.controller.js.map