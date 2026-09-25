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
exports.DonationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const donations_service_1 = require("./donations.service");
let DonationsController = class DonationsController {
    constructor(donationsService) {
        this.donationsService = donationsService;
    }
    findAll(page = '1', limit = '20') {
        return this.donationsService.findAllAdmin(Number(page), Number(limit));
    }
    monthly(months = '6') {
        return this.donationsService.monthlyTotals(Number(months));
    }
};
exports.DonationsController = DonationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DonationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('monthly'),
    __param(0, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DonationsController.prototype, "monthly", null);
exports.DonationsController = DonationsController = __decorate([
    (0, swagger_1.ApiTags)('Admin / Donations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('api/admin/donations'),
    __metadata("design:paramtypes", [donations_service_1.DonationsService])
], DonationsController);
//# sourceMappingURL=donations.controller.js.map