import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GalleryCategory, Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { GalleryService } from './gallery.service';
import { CreateGalleryImageDto, UpdateGalleryImageDto } from './dto/gallery.dto';

@ApiTags('Gallery')
@Controller('api')
export class GalleryController {
  constructor(
    private galleryService: GalleryService,
    private auditService: AuditService,
  ) {}

  @Public()
  @Get('gallery')
  findAll(
    @Query('category') category?: GalleryCategory,
    @Query('page') page = '1',
    @Query('limit') limit = '24',
  ) {
    return this.galleryService.findAll(category, Number(page), Number(limit));
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('admin/gallery')
  async create(@Body() dto: CreateGalleryImageDto, @CurrentUser('id') adminId: string) {
    const image = await this.galleryService.create(dto);
    await this.auditService.log({ adminId, action: 'UPLOAD_GALLERY_IMAGE', entity: 'GalleryImage', entityId: image.id });
    return image;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/gallery/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateGalleryImageDto, @CurrentUser('id') adminId: string) {
    const image = await this.galleryService.update(id, dto);
    await this.auditService.log({ adminId, action: 'UPDATE_GALLERY_IMAGE', entity: 'GalleryImage', entityId: id });
    return image;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('admin/gallery/:id')
  async remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const result = await this.galleryService.remove(id);
    await this.auditService.log({ adminId, action: 'DELETE_GALLERY_IMAGE', entity: 'GalleryImage', entityId: id });
    return result;
  }
}
