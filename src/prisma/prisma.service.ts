import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to PostgreSQL database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Enables Prisma's shutdown hooks to close the Nest app
   * cleanly when the process receives a termination signal.
   */
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
