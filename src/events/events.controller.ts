import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@ApiTags('Events')
@Controller('api')
export class EventsController {
  constructor(
    private eventsService: EventsService,
    private auditService: AuditService,
  ) {}

  @Public()
  @Get('events/upcoming')
  upcoming(@Query('limit') limit = '6') {
    return this.eventsService.findUpcoming(Number(limit));
  }

  @Public()
  @Get('events')
  findAll(@Query('page') page = '1', @Query('limit') limit = '12') {
    return this.eventsService.findAll(Number(page), Number(limit));
  }

  @Public()
  @Get('events/:id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('admin/events')
  async create(@Body() dto: CreateEventDto, @CurrentUser('id') adminId: string) {
    const event = await this.eventsService.create(dto);
    await this.auditService.log({ adminId, action: 'CREATE_EVENT', entity: 'Event', entityId: event.id });
    return event;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/events/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto, @CurrentUser('id') adminId: string) {
    const event = await this.eventsService.update(id, dto);
    await this.auditService.log({ adminId, action: 'UPDATE_EVENT', entity: 'Event', entityId: id });
    return event;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('admin/events/:id')
  async remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    const result = await this.eventsService.remove(id);
    await this.auditService.log({ adminId, action: 'DELETE_EVENT', entity: 'Event', entityId: id });
    return result;
  }
}
