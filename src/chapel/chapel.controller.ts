import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { ChapelService } from './chapel.service';
import { UpdateChapelAccountDto } from './dto/chapel-account.dto';

@ApiTags('Chapel Account')
@Controller('api')
export class ChapelController {
  constructor(
    private chapelService: ChapelService,
    private auditService: AuditService,
  ) {}

  @Public()
  @Get('chapel/account')
  getAccount() {
    return this.chapelService.getAccount();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/chapel/account')
  async update(@Body() dto: UpdateChapelAccountDto, @CurrentUser('id') adminId: string) {
    const account = await this.chapelService.updateAccount(dto);
    await this.auditService.log({
      adminId,
      action: 'UPDATE_CHAPEL_ACCOUNT',
      entity: 'ChapelAccount',
      entityId: account.id,
    });
    return account;
  }
}
