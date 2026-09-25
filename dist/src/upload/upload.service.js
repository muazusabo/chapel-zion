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
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
const MIME_EXTENSIONS = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/pjpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
};
const RECEIPT_EXTENSIONS = {
    ...MIME_EXTENSIONS,
    'application/pdf': 'pdf',
};
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
let UploadService = UploadService_1 = class UploadService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(UploadService_1.name);
    }
    validate(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file was uploaded');
        }
        const mimeType = file.mimetype.toLowerCase();
        if (!MIME_EXTENSIONS[mimeType]) {
            throw new common_1.BadRequestException(`Unsupported file type "${file.mimetype}". Allowed: JPEG, PNG, WEBP, GIF, AVIF.`);
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new common_1.BadRequestException('File is too large. Maximum size is 8MB.');
        }
    }
    getUploadRoot() {
        return (0, path_1.join)(process.cwd(), 'uploads');
    }
    getBaseUrl() {
        return this.config.get('APP_URL') ?? 'http://localhost:4000';
    }
    async uploadImage(file, folder = 'general') {
        this.validate(file);
        const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '-');
        const extension = MIME_EXTENSIONS[file.mimetype.toLowerCase()];
        const filename = `${Date.now()}-${(0, crypto_1.randomUUID)()}.${extension}`;
        const folderPath = (0, path_1.join)(this.getUploadRoot(), safeFolder);
        await fs_1.promises.mkdir(folderPath, { recursive: true });
        const filePath = (0, path_1.join)(folderPath, filename);
        await fs_1.promises.writeFile(filePath, file.buffer);
        const relativePath = `uploads/${safeFolder}/${filename}`;
        const url = `${this.getBaseUrl()}/${relativePath.replace(/\\/g, '/')}`;
        this.logger.log(`Saved local upload: ${url}`);
        return { url, publicId: relativePath };
    }
    async uploadReceipt(file) {
        if (!file) {
            throw new common_1.BadRequestException('No receipt file was uploaded');
        }
        const mimeType = file.mimetype.toLowerCase();
        const extension = RECEIPT_EXTENSIONS[mimeType];
        if (!extension) {
            throw new common_1.BadRequestException('Receipt files must be PDF, JPEG, PNG, WebP, GIF, or AVIF.');
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new common_1.BadRequestException('Receipt file is too large. Maximum size is 8MB.');
        }
        const folderPath = (0, path_1.join)(this.getUploadRoot(), 'receipts');
        await fs_1.promises.mkdir(folderPath, { recursive: true });
        const filename = `${Date.now()}-${(0, crypto_1.randomUUID)()}.${extension}`;
        const filePath = (0, path_1.join)(folderPath, filename);
        await fs_1.promises.writeFile(filePath, file.buffer);
        const relativePath = `uploads/receipts/${filename}`;
        return {
            url: `${this.getBaseUrl()}/${relativePath}`,
            publicId: relativePath,
        };
    }
    async deleteImage(publicId) {
        if (!publicId)
            return;
        const filePath = (0, path_1.join)(process.cwd(), publicId.replace(/^\//, ''));
        try {
            await fs_1.promises.unlink(filePath);
        }
        catch (err) {
            this.logger.warn(`Could not delete image ${publicId}: ${err.message}`);
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map