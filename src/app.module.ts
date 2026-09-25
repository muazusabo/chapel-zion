import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { UploadModule } from './upload/upload.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { NewsModule } from './news/news.module';
import { EventsModule } from './events/events.module';
import { ExecutivesModule } from './executives/executives.module';
import { GalleryModule } from './gallery/gallery.module';
import { PaymentsModule } from './payments/payments.module';
import { DonationsModule } from './donations/donations.module';
import { OfferingsModule } from './offerings/offerings.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { ChapelModule } from './chapel/chapel.module';
import { HomepageModule } from './homepage/homepage.module';
import { ContactModule } from './contact/contact.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),

    // Core infrastructure (all @Global)
    PrismaModule,
    NotificationsModule,
    AuditModule,
    UploadModule,

    // Feature modules
    AuthModule,
    UsersModule,
    AnnouncementsModule,
    NewsModule,
    EventsModule,
    ExecutivesModule,
    GalleryModule,
    ReceiptsModule,
    PaymentsModule,
    DonationsModule,
    OfferingsModule,
    ChapelModule,
    HomepageModule,
    ContactModule,
  ],
  providers: [
    // Every route requires a valid JWT unless explicitly marked @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Role checks run after authentication and are enforced server-side,
    // never just hidden in the UI.
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
