import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnnouncementCategory, Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

@ApiTags('Announcements')
@Controller('api')
export class AnnouncementsController {
  constructor(
    private announcementsService: AnnouncementsService,
    private auditService: AuditService,
  ) {}

  // ---- Public ----

  @Public()
  @Get('announcements')
  findPublished(
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('search') search?: string,
    @Query('category') category?: AnnouncementCategory,
  ) {
    return this.announcementsService.findPublished({
      page: Number(page),
      limit: Number(limit),
      search,
      category,
    });
  }

  @Public()
  @Get('announcements/:id')
  findOnePublished(@Param('id') id: string) {
    return this.announcementsService.findOnePublished(id);
  }

  // ---- Admin ----

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/announcements')
  findAllAdmin(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.announcementsService.findAllAdmin({
      page: Number(page),
      limit: Number(limit),
      search,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/announcements/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.announcementsService.findOneAdmin(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('admin/announcements')
  async create(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateAnnouncementDto,
  ) {
    const announcement = await this.announcementsService.create(adminId, dto);
    await this.auditService.log({
      adminId,
      action: 'CREATE_ANNOUNCEMENT',
      entity: 'Announcement',
      entityId: announcement.id,
    });
    return announcement;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/announcements/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
    @CurrentUser('id') adminId: string,
  ) {
    const announcement = await this.announcementsService.update(id, dto);
    await this.auditService.log({
      adminId,
      action: 'UPDATE_ANNOUNCEMENT',
      entity: 'Announcement',
      entityId: id,
    });
    return announcement;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/announcements/:id/publish')
  async publish(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const announcement = await this.announcementsService.publish(id);
    await this.auditService.log({
      adminId,
      action: 'PUBLISH_ANNOUNCEMENT',
      entity: 'Announcement',
      entityId: id,
    });
    return announcement;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/announcements/:id/unpublish')
  async unpublish(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const announcement = await this.announcementsService.unpublish(id);
    await this.auditService.log({
      adminId,
      action: 'UNPUBLISH_ANNOUNCEMENT',
      entity: 'Announcement',
      entityId: id,
    });
    return announcement;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('admin/announcements/:id')
  async remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const result = await this.announcementsService.remove(id);
    await this.auditService.log({
      adminId,
      action: 'DELETE_ANNOUNCEMENT',
      entity: 'Announcement',
      entityId: id,
    });
    return result;
  }
}
