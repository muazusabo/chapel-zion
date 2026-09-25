import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { HomepageService } from './homepage.service';
import {
  UpdateAboutDto,
  UpdateFellowshipSettingsDto,
  UpdateHomepageDto,
  UpdateScriptureDto,
} from './dto/homepage.dto';

@ApiTags('Homepage / CMS')
@Controller('api')
export class HomepageController {
  constructor(
    private homepageService: HomepageService,
    private auditService: AuditService,
  ) {}

  // ---- Public reads ----

  @Public()
  @Get('homepage')
  getHomepage() {
    return this.homepageService.getHomepage();
  }

  @Public()
  @Get('about')
  getAbout() {
    return this.homepageService.getAbout();
  }

  @Public()
  @Get('scripture')
  getScripture() {
    return this.homepageService.getScripture();
  }

  @Public()
  @Get('settings')
  getSettings() {
    return this.homepageService.getSettings();
  }

  // ---- Admin writes ----

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/homepage')
  async updateHomepage(@Body() dto: UpdateHomepageDto, @CurrentUser('id') adminId: string) {
    const result = await this.homepageService.updateHomepage(dto);
    await this.auditService.log({ adminId, action: 'UPDATE_HOMEPAGE_CONTENT', entity: 'HomepageContent' });
    return result;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/about')
  async updateAbout(@Body() dto: UpdateAboutDto, @CurrentUser('id') adminId: string) {
    const result = await this.homepageService.updateAbout(dto);
    await this.auditService.log({ adminId, action: 'UPDATE_ABOUT_CONTENT', entity: 'AboutContent' });
    return result;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/scripture')
  async updateScripture(@Body() dto: UpdateScriptureDto, @CurrentUser('id') adminId: string) {
    const result = await this.homepageService.updateScripture(dto);
    await this.auditService.log({ adminId, action: 'UPDATE_SCRIPTURE', entity: 'Scripture', entityId: result.id });
    return result;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/settings')
  async updateSettings(@Body() dto: UpdateFellowshipSettingsDto, @CurrentUser('id') adminId: string) {
    const result = await this.homepageService.updateSettings(dto);
    await this.auditService.log({ adminId, action: 'UPDATE_FELLOWSHIP_SETTINGS', entity: 'FellowshipSettings' });
    return result;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/dashboard')
  getDashboardStats() {
    return this.homepageService.getAdminDashboardStats();
  }
}
