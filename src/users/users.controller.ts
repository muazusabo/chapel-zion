import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditService } from '../audit/audit.service';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private auditService: AuditService,
  ) {}

  // ---- Authenticated user's own profile ----

  @Get('users/me')
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('users/me')
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('users/me/password')
  changeMyPassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Get('users/me/dashboard')
  getMyDashboard(@CurrentUser('id') userId: string) {
    return this.usersService.getDashboardStats(userId);
  }

  // ---- Admin user management ----

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/users')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
  ) {
    return this.usersService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
    });
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/users/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/users/:id/suspend')
  async suspend(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    const user = await this.usersService.setStatus(id, UserStatus.SUSPENDED);
    await this.auditService.log({
      adminId,
      action: 'SUSPEND_USER',
      entity: 'User',
      entityId: id,
    });
    return user;
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/users/:id/activate')
  async activate(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    const user = await this.usersService.setStatus(id, UserStatus.ACTIVE);
    await this.auditService.log({
      adminId,
      action: 'ACTIVATE_USER',
      entity: 'User',
      entityId: id,
    });
    return user;
  }

  // ---- Super admin only: manage admin roles ----

  @Roles(Role.SUPER_ADMIN)
  @Patch('admin/users/:id/role')
  async setRole(
    @Param('id') id: string,
    @Body('role') role: Role,
    @CurrentUser('id') adminId: string,
  ) {
    const user = await this.usersService.setRole(id, role);
    await this.auditService.log({
      adminId,
      action: 'CHANGE_USER_ROLE',
      entity: 'User',
      entityId: id,
      metadata: { newRole: role },
    });
    return user;
  }
}
