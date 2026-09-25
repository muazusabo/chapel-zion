import { Module } from '@nestjs/common';
import { ExecutivesService } from './executives.service';
import { ExecutivesController } from './executives.controller';

@Module({
  controllers: [ExecutivesController],
  providers: [ExecutivesService],
  exports: [ExecutivesService],
})
export class ExecutivesModule {}
