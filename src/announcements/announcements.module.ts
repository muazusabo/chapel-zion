import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsScheduler } from './announcements.scheduler';

@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, AnnouncementsScheduler],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
