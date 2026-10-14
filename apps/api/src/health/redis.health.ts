import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { Redis } from 'ioredis';
import { REDIS } from '../common/redis/redis.module.js';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly indicator: HealthIndicatorService,
  ) {}

  ping(key: string) {
    return this.indicator.check(key).attempt(async () => {
      const reply = await this.redis.ping();
      if (typeof reply !== 'string' || reply !== 'PONG') {
        throw new Error(`Unexpected reply: ${reply}`);
      }
      return { reply };
      // signal.timeout() nếu cần dừng sớm; ioredis không hỗ trợ AbortSignal nên bỏ qua
    }).withTimeout(2000);
  }
}
