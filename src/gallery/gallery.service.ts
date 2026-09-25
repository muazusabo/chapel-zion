import { Injectable, NotFoundException } from '@nestjs/common';
import { GalleryCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryImageDto, UpdateGalleryImageDto } from './dto/gallery.dto';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  findAll(category?: GalleryCategory, page = 1, limit = 24) {
    const where = category ? { category } : {};
    return Promise.all([
      this.prisma.galleryImage.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.galleryImage.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit, totalPages: Math.ceil(total / limit) }));
  }

  async findOne(id: string) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    return image;
  }

  create(dto: CreateGalleryImageDto) {
    return this.prisma.galleryImage.create({ data: dto });
  }

  async update(id: string, dto: UpdateGalleryImageDto) {
    await this.findOne(id);
    return this.prisma.galleryImage.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.galleryImage.delete({ where: { id } });
    return { message: 'Image removed' };
  }
}
