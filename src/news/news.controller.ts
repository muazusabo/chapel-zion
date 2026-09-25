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
import { ContentStatus, Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';

@ApiTags('News')
@Controller('api')
export class NewsController {
  constructor(
    private newsService: NewsService,
    private auditService: AuditService,
  ) {}

  // ---- Public ----

  @Public()
  @Get('news')
  findPublished(
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.newsService.findPublished({ page: Number(page), limit: Number(limit), search, category });
  }

  @Public()
  @Get('news/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  // ---- Admin ----

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/news')
  findAllAdmin(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('status') status?: ContentStatus,
  ) {
    return this.newsService.findAllAdmin({ page: Number(page), limit: Number(limit), search, status });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/news/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.newsService.findOneAdmin(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('admin/news')
  async create(@CurrentUser('id') adminId: string, @Body() dto: CreateNewsDto) {
    const article = await this.newsService.create(adminId, dto);
    await this.auditService.log({ adminId, action: 'CREATE_NEWS', entity: 'News', entityId: article.id });
    return article;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/news/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateNewsDto, @CurrentUser('id') adminId: string) {
    const article = await this.newsService.update(id, dto);
    await this.auditService.log({ adminId, action: 'UPDATE_NEWS', entity: 'News', entityId: id });
    return article;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/news/:id/publish')
  async publish(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const article = await this.newsService.setStatus(id, ContentStatus.PUBLISHED);
    await this.auditService.log({ adminId, action: 'PUBLISH_NEWS', entity: 'News', entityId: id });
    return article;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/news/:id/draft')
  async draft(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const article = await this.newsService.setStatus(id, ContentStatus.DRAFT);
    await this.auditService.log({ adminId, action: 'DRAFT_NEWS', entity: 'News', entityId: id });
    return article;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/news/:id/archive')
  async archive(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const article = await this.newsService.setStatus(id, ContentStatus.ARCHIVED);
    await this.auditService.log({ adminId, action: 'ARCHIVE_NEWS', entity: 'News', entityId: id });
    return article;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('admin/news/:id')
  async remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const result = await this.newsService.remove(id);
    await this.auditService.log({ adminId, action: 'DELETE_NEWS', entity: 'News', entityId: id });
    return result;
  }
}
