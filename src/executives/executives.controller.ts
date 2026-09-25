import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { ExecutivesService } from './executives.service';
import { CreateExecutiveDto, ReorderExecutivesDto, UpdateExecutiveDto } from './dto/executive.dto';

@ApiTags('Executives')
@Controller('api')
export class ExecutivesController {
  constructor(
    private executivesService: ExecutivesService,
    private auditService: AuditService,
  ) {}

  @Public()
  @Get('executives')
  findPublished() {
    return this.executivesService.findPublished();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/executives')
  findAllAdmin() {
    return this.executivesService.findAllAdmin();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('admin/executives')
  async create(@Body() dto: CreateExecutiveDto, @CurrentUser('id') adminId: string) {
    const exec = await this.executivesService.create(dto);
    await this.auditService.log({ adminId, action: 'CREATE_EXECUTIVE', entity: 'Executive', entityId: exec.id });
    return exec;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/executives/reorder')
  async reorder(@Body() dto: ReorderExecutivesDto, @CurrentUser('id') adminId: string) {
    const result = await this.executivesService.reorder(dto);
    await this.auditService.log({ adminId, action: 'REORDER_EXECUTIVES', entity: 'Executive' });
    return result;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/executives/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateExecutiveDto, @CurrentUser('id') adminId: string) {
    const exec = await this.executivesService.update(id, dto);
    await this.auditService.log({ adminId, action: 'UPDATE_EXECUTIVE', entity: 'Executive', entityId: id });
    return exec;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('admin/executives/:id')
  async remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const result = await this.executivesService.remove(id);
    await this.auditService.log({ adminId, action: 'DELETE_EXECUTIVE', entity: 'Executive', entityId: id });
    return result;
  }
}
