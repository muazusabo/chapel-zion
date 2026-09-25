import { Module } from '@nestjs/common';
import { ChapelService } from './chapel.service';
import { ChapelController } from './chapel.controller';

@Module({
  controllers: [ChapelController],
  providers: [ChapelService],
  exports: [ChapelService],
})
export class ChapelModule {}
