import { Body, Controller, Get, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UploadService } from '../upload/upload.service';
import { ReceiptsService } from './receipts.service';

@ApiTags('Receipts')
@Controller('api')
export class ReceiptsController {
  constructor(
    private receiptsService: ReceiptsService,
    private uploadService: UploadService,
  ) {}

  @ApiBearerAuth()
  @Get('receipts')
  findMine(@CurrentUser('id') userId: string) {
    return this.receiptsService.findMine(userId);
  }

  @ApiBearerAuth()
  @Get('receipts/requests')
  findMyRequests(@CurrentUser('id') userId: string) {
    return this.receiptsService.findMineRequests(userId);
  }

  @ApiBearerAuth()
  @Post('receipts/request')
  createRequest(
    @CurrentUser('id') userId: string,
    @Body() body: { transactionId: string; firstName?: string; surname?: string; requestedName?: string },
  ) {
    return this.receiptsService.createReceiptRequest(
      userId,
      body.transactionId,
      body.firstName,
      body.surname,
      body.requestedName,
    );
  }

  @ApiBearerAuth()
  @Get('receipts/:id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.receiptsService.findOne(id, userId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/receipts/requests')
  findAllAdminRequests(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.receiptsService.findAllRequestsAdmin(Number(page), Number(limit));
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/receipts/:id/approve')
  approveRequest(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.receiptsService.approveReceiptRequest(id, adminId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('admin/receipts/:id/reject')
  rejectRequest(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() body: { adminNote?: string },
  ) {
    return this.receiptsService.rejectReceiptRequest(id, adminId, body?.adminNote);
  }

  @ApiBearerAuth()
  @Get('receipts/:id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const receipt = await this.receiptsService.findOne(id, userId);
    if (receipt.pdfUrl) {
      const uploaded = await this.receiptsService.getUploadedFile(id, userId);
      res.download(uploaded.filePath, receipt.receiptNumber, (error) => {
        if (error && !res.headersSent) res.status(404).send('Receipt file not found');
      });
      return;
    }

    // Approved receipts are generated automatically; an uploaded file is only an optional override.
    const pdfBuffer = await this.receiptsService.generatePdfBuffer(id, userId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${receipt.receiptNumber}.pdf"`,
    });
    res.send(pdfBuffer);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('admin/receipts/:id/file')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 } }))
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const uploaded = await this.uploadService.uploadReceipt(file);
    return this.receiptsService.attachFile(id, uploaded.url);
  }

  @Public()
  @Get('verify-receipt/:receiptNumber')
  verify(@Param('receiptNumber') receiptNumber: string) {
    return this.receiptsService.verifyByNumber(receiptNumber);
  }
}
