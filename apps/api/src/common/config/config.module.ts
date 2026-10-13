import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './schema.js';
import { ConfigService } from './config.service.js';
import z from 'zod';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: (env) => {
        const result = envSchema.safeParse(env);
        if (!result.success) {
          const formatted = z.prettifyError(result.error);
          throw new Error(
            `Invalid environment variables:\n${JSON.stringify(formatted, null, 2)}`,
          );
        }
        return result.data;
      },
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
