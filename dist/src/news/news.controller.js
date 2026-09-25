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
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_service_1 = require("../audit/audit.service");
const news_service_1 = require("./news.service");
const news_dto_1 = require("./dto/news.dto");
let NewsController = class NewsController {
    constructor(newsService, auditService) {
        this.newsService = newsService;
        this.auditService = auditService;
    }
    findPublished(page = '1', limit = '12', search, category) {
        return this.newsService.findPublished({ page: Number(page), limit: Number(limit), search, category });
    }
    findBySlug(slug) {
        return this.newsService.findBySlug(slug);
    }
    findAllAdmin(page = '1', limit = '20', search, status) {
        return this.newsService.findAllAdmin({ page: Number(page), limit: Number(limit), search, status });
    }
    findOneAdmin(id) {
        return this.newsService.findOneAdmin(id);
    }
    async create(adminId, dto) {
        const article = await this.newsService.create(adminId, dto);
        await this.auditService.log({ adminId, action: 'CREATE_NEWS', entity: 'News', entityId: article.id });
        return article;
    }
    async update(id, dto, adminId) {
        const article = await this.newsService.update(id, dto);
        await this.auditService.log({ adminId, action: 'UPDATE_NEWS', entity: 'News', entityId: id });
        return article;
    }
    async publish(id, adminId) {
        const article = await this.newsService.setStatus(id, client_1.ContentStatus.PUBLISHED);
        await this.auditService.log({ adminId, action: 'PUBLISH_NEWS', entity: 'News', entityId: id });
        return article;
    }
    async draft(id, adminId) {
        const article = await this.newsService.setStatus(id, client_1.ContentStatus.DRAFT);
        await this.auditService.log({ adminId, action: 'DRAFT_NEWS', entity: 'News', entityId: id });
        return article;
    }
    async archive(id, adminId) {
        const article = await this.newsService.setStatus(id, client_1.ContentStatus.ARCHIVED);
        await this.auditService.log({ adminId, action: 'ARCHIVE_NEWS', entity: 'News', entityId: id });
        return article;
    }
    async remove(id, adminId) {
        const result = await this.newsService.remove(id);
        await this.auditService.log({ adminId, action: 'DELETE_NEWS', entity: 'News', entityId: id });
        return result;
    }
};
exports.NewsController = NewsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('news'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "findPublished", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('news/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "findBySlug", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/news'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "findAllAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/news/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "findOneAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('admin/news'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, news_dto_1.CreateNewsDto]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/news/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, news_dto_1.UpdateNewsDto, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/news/:id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "publish", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/news/:id/draft'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "draft", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/news/:id/archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "archive", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)('admin/news/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "remove", null);
exports.NewsController = NewsController = __decorate([
    (0, swagger_1.ApiTags)('News'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [news_service_1.NewsService,
        audit_service_1.AuditService])
], NewsController);
//# sourceMappingURL=news.controller.js.map