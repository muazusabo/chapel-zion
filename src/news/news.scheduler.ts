import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from './news.service';

@Injectable()
export class NewsScheduler {
  private readonly logger = new Logger(NewsScheduler.name);

  constructor(private newsService: NewsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handlePublishDue() {
    const count = await this.newsService.publishDueScheduled();
    if (count > 0) {
      this.logger.log(`Auto-published ${count} scheduled article(s)`);
    }
  }
}
