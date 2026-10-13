import { Global, Module, OnModuleDestroy, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '../config/config.service.js';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: (cfg) =>
        new Redis(cfg.get('REDIS_URL'), {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
        }),
      inject: [ConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}
  async onModuleDestroy() {
    await this.redis.quit();
  }
}
