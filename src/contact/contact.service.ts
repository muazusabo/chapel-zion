import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactMessageStatus, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateContactMessageDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private config: ConfigService,
  ) {}

  async create(dto: CreateContactMessageDto, userId?: string) {
    const message = await this.prisma.contactMessage.create({
      data: { ...dto, userId },
    });

    const adminEmail = this.config.get<string>('SUPER_ADMIN_EMAIL');
    if (adminEmail) {
      this.notifications
        .notifyAdminNewContactMessage(adminEmail, dto.name, dto.subject)
        .catch(() => undefined);
    }

    return { message: 'Your message has been sent. We will get back to you soon.', id: message.id };
  }

  async findAllAdmin(params: { page: number; limit: number; status?: ContactMessageStatus }) {
    const { page, limit, status } = params;
    const where: Prisma.ContactMessageWhereInput = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneAdmin(id: string) {
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    // Reading a message marks it read — mirrors typical inbox behavior.
    if (message.status === ContactMessageStatus.UNREAD) {
      return this.prisma.contactMessage.update({
        where: { id },
        data: { status: ContactMessageStatus.READ },
      });
    }
    return message;
  }

  async archive(id: string) {
    await this.findOneAdmin(id);
    return this.prisma.contactMessage.update({
      where: { id },
      data: { status: ContactMessageStatus.ARCHIVED },
    });
  }

  async remove(id: string) {
    await this.prisma.contactMessage.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Message not found');
    });
    await this.prisma.contactMessage.delete({ where: { id } });
    return { message: 'Message deleted' };
  }
}
