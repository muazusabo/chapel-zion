import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentStatus, Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/payment.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Payments')
@Controller('api')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private uploadService: UploadService,
  ) {}

  @ApiBearerAuth()
  @Post('payments/offline-request')
  @UseInterceptors(FileInterceptor('transactionScreenshot', { limits: { fileSize: 8 * 1024 * 1024 } }))
  createOfflineRequest(
    @CurrentUser('id') userId: string,
    @Body() dto: InitializePaymentDto,
    @UploadedFile() transactionScreenshot: Express.Multer.File,
  ) {
    return this.uploadService
      .uploadImage(transactionScreenshot, 'transaction-screenshots')
      .then(({ url }) => this.paymentsService.createOfflineRequest(userId, dto, url));
  }

  @ApiBearerAuth()
  @Get('payments/mine')
  findMine(@CurrentUser('id') userId: string) {
    return this.paymentsService.findMine(userId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/payments')
  findAllAdmin(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: PaymentStatus,
    @Query('search') search?: string,
  ) {
    return this.paymentsService.findAllAdmin({
      page: Number(page),
      limit: Number(limit),
      status,
      search,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/payments/:id/approve')
  approve(@Param('id') id: string) {
    return this.paymentsService.approveTransaction(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/payments/:id/reject')
  reject(@Param('id') id: string) {
    return this.paymentsService.rejectTransaction(id);
  }
}
