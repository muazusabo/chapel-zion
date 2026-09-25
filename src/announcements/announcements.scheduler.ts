import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnnouncementsService } from './announcements.service';

@Injectable()
export class AnnouncementsScheduler {
  private readonly logger = new Logger(AnnouncementsScheduler.name);

  constructor(private announcementsService: AnnouncementsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handlePublishDue() {
    const count = await this.announcementsService.publishDueScheduled();
    if (count > 0) {
      this.logger.log(`Auto-published ${count} scheduled announcement(s)`);
    }
  }
}
