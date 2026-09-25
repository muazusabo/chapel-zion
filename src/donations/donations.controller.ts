import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { DonationsService } from './donations.service';

@ApiTags('Admin / Donations')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/admin/donations')
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.donationsService.findAllAdmin(Number(page), Number(limit));
  }

  @Get('monthly')
  monthly(@Query('months') months = '6') {
    return this.donationsService.monthlyTotals(Number(months));
  }
}
