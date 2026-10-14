import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  // Database
  MONGODB_URL: z.url(),
  // Redis
  REDIS_URL: z.url(),
  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().regex(/^\d+(ms|s|m|h|d)$/).default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().regex(/^\d+(ms|s|m|h|d)$/).default('7d'),

  // Optional until Phase 1 OAuth task lands. Tighten to required at that point.
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  WEB_ORIGIN: z.url(),
});

export type Env = z.infer<typeof envSchema>;
