import { Injectable } from '@nestjs/common';
import type { ConfigService as NestConfigService } from '@nestjs/config';
import { Env } from './schema.js';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T): Env[T] {
    return this.configService.get(key, { infer: true });
  }
}
