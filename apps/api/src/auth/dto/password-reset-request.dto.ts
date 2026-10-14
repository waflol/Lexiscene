import { z } from 'zod';

export const passwordResetRequestSchema = z.object({
  email: z.email(),
});

export type PasswordResetRequestDto = z.infer<typeof passwordResetRequestSchema>;
