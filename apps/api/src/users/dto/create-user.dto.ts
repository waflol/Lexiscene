// Local mirror of the create-user input. The canonical schema lives in
// `packages/shared/src/index.ts` so that web + api + worker agree, but
// `@lexiscene/shared` is not yet wired into apps/api as a workspace
// dependency. Keep this in sync with the shared schema.
import { z } from 'zod';

export const uiLocaleSchema = z.enum(['vi', 'en']);
export const nativeLocaleSchema = z.enum(['vi', 'en']);
export const targetLangSchema = z.enum(['ja', 'en']);
export const cefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export const jlptLevelSchema = z.enum(['N5', 'N4', 'N3', 'N2', 'N1']);
export const levelSchema = z.union([cefrLevelSchema, jlptLevelSchema]);

export const targetLangEntrySchema = z.object({
  lang: targetLangSchema,
  level: levelSchema.optional(),
});
export type TargetLangEntry = z.infer<typeof targetLangEntrySchema>;

export const createUserSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(12).max(128),
  uiLocale: uiLocaleSchema,
  nativeLocale: nativeLocaleSchema,
  targetLangs: z.array(targetLangEntrySchema).min(1).max(2),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;
