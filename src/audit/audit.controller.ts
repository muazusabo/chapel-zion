import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditService } from './audit.service';

@ApiTags('Admin / Activity Logs')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/admin/activity')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.auditService.findAll(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }
}
