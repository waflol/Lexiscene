// Shared types and utilities
import { z } from 'zod';

// BCP-47 UI/native locales supported in v1 (see docs/en/requirements.md §3).
export const uiLocaleSchema = z.enum(['vi', 'en']);
export const nativeLocaleSchema = z.enum(['vi', 'en']);

// Languages a learner can pick as their target. Must match `dictionary_entries.lang`
// and `videos.lang` enums in docs/en/database-design.md.
export const targetLangSchema = z.enum(['ja', 'en']);

// CEFR levels for English; JLPT levels for Japanese. Kept as separate enums so
// the API can validate per `lang` if needed in the future. The service layer
// will check 'does `level` apply to `lang`?' — we don't enforce that here yet.
export const cefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export const jlptLevelSchema = z.enum(['N5', 'N4', 'N3', 'N2', 'N1']);
export const levelSchema = z.union([cefrLevelSchema, jlptLevelSchema]);

export const targetLangEntrySchema = z.object({
  lang: targetLangSchema,
  level: levelSchema.optional(),
});
export type TargetLangEntry = z.infer<typeof targetLangEntrySchema>;

// Input schema for `POST /auth/register` (deferred). The service in
// apps/api/src/users/users.service.ts also uses this so register/login agree
// on what counts as a valid user. We do NOT lower-case `email` here — the
// service normalizes once before insert, keeping the input pure.
export const createUserInputSchema = z.object({
  email: z.email().max(254),
  // 12 is OWASP's minimum for argon2id-anchored accounts; 128 keeps bcrypt
  // legacy hashes out. No trimming — a leading space is a real password.
  password: z.string().min(12).max(128),
  uiLocale: uiLocaleSchema,
  nativeLocale: nativeLocaleSchema,
  // A learner can study both ja and en. Bounded so a malicious caller can't
  // send 10k entries. The doc allows up to 2 target languages in v1.
  targetLangs: z.array(targetLangEntrySchema).min(1).max(2),
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
