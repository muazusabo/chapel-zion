import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsScheduler } from './news.scheduler';

@Module({
  controllers: [NewsController],
  providers: [NewsService, NewsScheduler],
  exports: [NewsService],
})
export class NewsModule {}
