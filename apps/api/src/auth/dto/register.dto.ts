import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  uiLocale: z.enum(['vi', 'en']),
  nativeLocale: z.enum(['vi', 'en']),
});

export type RegisterDto = z.infer<typeof registerSchema>;
