import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateChapelAccountDto } from './dto/chapel-account.dto';

@Injectable()
export class ChapelService {
  constructor(private prisma: PrismaService) {}

  async getAccount() {
    const account = await this.prisma.chapelAccount.findFirst();
    // Should always exist after seeding, but never invent real bank details
    // if it somehow doesn't — return editable placeholders instead.
    return (
      account ??
      this.prisma.chapelAccount.create({
        data: {
          bankName: '[CHAPEL BANK NAME]',
          accountName: '[CHAPEL ACCOUNT NAME]',
          accountNumber: '[ACCOUNT NUMBER]',
        },
      })
    );
  }

  async updateAccount(dto: UpdateChapelAccountDto) {
    const existing = await this.prisma.chapelAccount.findFirst();
    if (!existing) {
      return this.prisma.chapelAccount.create({ data: dto });
    }
    return this.prisma.chapelAccount.update({ where: { id: existing.id }, data: dto });
  }
}
