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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementQueryDto = exports.UpdateAnnouncementDto = exports.CreateAnnouncementDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateAnnouncementDto {
}
exports.CreateAnnouncementDto = CreateAnnouncementDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.AnnouncementCategory, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AnnouncementCategory),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.AnnouncementPriority, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AnnouncementPriority),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ContentStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ContentStatus),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "scheduledFor", void 0);
class UpdateAnnouncementDto {
}
exports.UpdateAnnouncementDto = UpdateAnnouncementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.AnnouncementCategory, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AnnouncementCategory),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.AnnouncementPriority, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AnnouncementPriority),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ContentStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ContentStatus),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "scheduledFor", void 0);
class AnnouncementQueryDto {
}
exports.AnnouncementQueryDto = AnnouncementQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnnouncementQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.AnnouncementCategory, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AnnouncementCategory),
    __metadata("design:type", String)
], AnnouncementQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnnouncementQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnnouncementQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=announcement.dto.js.map