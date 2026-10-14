import { z } from 'zod';

export const passwordResetConfirmSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export type PasswordResetConfirmDto = z.infer<typeof passwordResetConfirmSchema>;
