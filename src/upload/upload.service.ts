import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/pjpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};
const RECEIPT_EXTENSIONS: Record<string, string> = {
  ...MIME_EXTENSIONS,
  'application/pdf': 'pdf',
};
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private config: ConfigService) {}

  private validate(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file was uploaded');
    }
    const mimeType = file.mimetype.toLowerCase();
    if (!MIME_EXTENSIONS[mimeType]) {
      throw new BadRequestException(
        `Unsupported file type "${file.mimetype}". Allowed: JPEG, PNG, WEBP, GIF, AVIF.`,
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File is too large. Maximum size is 8MB.');
    }
  }

  private getUploadRoot() {
    return join(process.cwd(), 'uploads');
  }

  private getBaseUrl() {
    return this.config.get<string>('APP_URL') ?? 'http://localhost:4000';
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'general',
  ): Promise<{ url: string; publicId: string }> {
    this.validate(file);

    const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '-');
    const extension = MIME_EXTENSIONS[file.mimetype.toLowerCase()];
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    const folderPath = join(this.getUploadRoot(), safeFolder);
    await fs.mkdir(folderPath, { recursive: true });
    const filePath = join(folderPath, filename);
    await fs.writeFile(filePath, file.buffer);

    const relativePath = `uploads/${safeFolder}/${filename}`;
    const url = `${this.getBaseUrl()}/${relativePath.replace(/\\/g, '/')}`;

    this.logger.log(`Saved local upload: ${url}`);
    return { url, publicId: relativePath };
  }

  async uploadReceipt(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No receipt file was uploaded');
    }
    const mimeType = file.mimetype.toLowerCase();
    const extension = RECEIPT_EXTENSIONS[mimeType];
    if (!extension) {
      throw new BadRequestException('Receipt files must be PDF, JPEG, PNG, WebP, GIF, or AVIF.');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Receipt file is too large. Maximum size is 8MB.');
    }

    const folderPath = join(this.getUploadRoot(), 'receipts');
    await fs.mkdir(folderPath, { recursive: true });
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    const filePath = join(folderPath, filename);
    await fs.writeFile(filePath, file.buffer);

    const relativePath = `uploads/receipts/${filename}`;
    return {
      url: `${this.getBaseUrl()}/${relativePath}`,
      publicId: relativePath,
    };
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;
    const filePath = join(process.cwd(), publicId.replace(/^\//, ''));
    try {
      await fs.unlink(filePath);
    } catch (err) {
      this.logger.warn(`Could not delete image ${publicId}: ${(err as Error).message}`);
    }
  }
}
