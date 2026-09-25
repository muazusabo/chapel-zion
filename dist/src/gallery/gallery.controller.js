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
exports.GalleryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_service_1 = require("../audit/audit.service");
const gallery_service_1 = require("./gallery.service");
const gallery_dto_1 = require("./dto/gallery.dto");
let GalleryController = class GalleryController {
    constructor(galleryService, auditService) {
        this.galleryService = galleryService;
        this.auditService = auditService;
    }
    findAll(category, page = '1', limit = '24') {
        return this.galleryService.findAll(category, Number(page), Number(limit));
    }
    async create(dto, adminId) {
        const image = await this.galleryService.create(dto);
        await this.auditService.log({ adminId, action: 'UPLOAD_GALLERY_IMAGE', entity: 'GalleryImage', entityId: image.id });
        return image;
    }
    async update(id, dto, adminId) {
        const image = await this.galleryService.update(id, dto);
        await this.auditService.log({ adminId, action: 'UPDATE_GALLERY_IMAGE', entity: 'GalleryImage', entityId: id });
        return image;
    }
    async remove(id, adminId) {
        const result = await this.galleryService.remove(id);
        await this.auditService.log({ adminId, action: 'DELETE_GALLERY_IMAGE', entity: 'GalleryImage', entityId: id });
        return result;
    }
};
exports.GalleryController = GalleryController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('gallery'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('admin/gallery'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [gallery_dto_1.CreateGalleryImageDto, String]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/gallery/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, gallery_dto_1.UpdateGalleryImageDto, String]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)('admin/gallery/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "remove", null);
exports.GalleryController = GalleryController = __decorate([
    (0, swagger_1.ApiTags)('Gallery'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [gallery_service_1.GalleryService,
        audit_service_1.AuditService])
], GalleryController);
//# sourceMappingURL=gallery.controller.js.map