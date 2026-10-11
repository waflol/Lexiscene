import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Env } from './schema.js';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T): Env[T] {
    return this.configService.get(key, { infer: true });
  }

  getOrThrow<T extends keyof Env>(key: T): Env[T] {
    const value = this.configService.get(key, { infer: true });
    if (value === undefined) {
      throw new Error(`Missing required env: ${key}`);
    }
    return value;
  }
}
