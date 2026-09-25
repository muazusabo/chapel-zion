import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContactMessageStatus, Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/contact.dto';

@ApiTags('Contact')
@Controller('api')
export class ContactController {
  constructor(
    private contactService: ContactService,
    private auditService: AuditService,
  ) {}

  @Public()
  @Post('contact')
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/contact-messages')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: ContactMessageStatus,
  ) {
    return this.contactService.findAllAdmin({ page: Number(page), limit: Number(limit), status });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/contact-messages/:id')
  findOne(@Param('id') id: string) {
    return this.contactService.findOneAdmin(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/contact-messages/:id/archive')
  async archive(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const result = await this.contactService.archive(id);
    await this.auditService.log({ adminId, action: 'ARCHIVE_CONTACT_MESSAGE', entity: 'ContactMessage', entityId: id });
    return result;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('admin/contact-messages/:id')
  async remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const result = await this.contactService.remove(id);
    await this.auditService.log({ adminId, action: 'DELETE_CONTACT_MESSAGE', entity: 'ContactMessage', entityId: id });
    return result;
  }
}
