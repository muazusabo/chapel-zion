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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_service_1 = require("../audit/audit.service");
const events_service_1 = require("./events.service");
const event_dto_1 = require("./dto/event.dto");
let EventsController = class EventsController {
    constructor(eventsService, auditService) {
        this.eventsService = eventsService;
        this.auditService = auditService;
    }
    upcoming(limit = '6') {
        return this.eventsService.findUpcoming(Number(limit));
    }
    findAll(page = '1', limit = '12') {
        return this.eventsService.findAll(Number(page), Number(limit));
    }
    findOne(id) {
        return this.eventsService.findOne(id);
    }
    async create(dto, adminId) {
        const event = await this.eventsService.create(dto);
        await this.auditService.log({ adminId, action: 'CREATE_EVENT', entity: 'Event', entityId: event.id });
        return event;
    }
    async update(id, dto, adminId) {
        const event = await this.eventsService.update(id, dto);
        await this.auditService.log({ adminId, action: 'UPDATE_EVENT', entity: 'Event', entityId: id });
        return event;
    }
    async remove(id, adminId) {
        const result = await this.eventsService.remove(id);
        await this.auditService.log({ adminId, action: 'DELETE_EVENT', entity: 'Event', entityId: id });
        return result;
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('events/upcoming'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "upcoming", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('events/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('admin/events'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_dto_1.CreateEventDto, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('admin/events/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, event_dto_1.UpdateEventDto, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)('admin/events/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "remove", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        audit_service_1.AuditService])
], EventsController);
//# sourceMappingURL=events.controller.js.map