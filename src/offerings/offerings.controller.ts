import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { OfferingsService } from './offerings.service';

@ApiTags('Admin / Offerings')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/admin/offerings')
export class OfferingsController {
  constructor(private offeringsService: OfferingsService) {}

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.offeringsService.findAllAdmin(Number(page), Number(limit));
  }

  @Get('monthly')
  monthly(@Query('months') months = '6') {
    return this.offeringsService.monthlyTotals(Number(months));
  }
}
