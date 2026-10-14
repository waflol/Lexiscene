import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// Provider link record for OAuth accounts. Capped at 5 in the schema below
// so a misbehaving client can't inflate the array — the doc says max 5.
@Schema({ _id: false })
export class UserProvider {
  @Prop({ required: true })
  provider!: string; // 'google' | 'apple' | ...

  @Prop({ required: true })
  providerId!: string;
}
export const UserProviderSchema = SchemaFactory.createForClass(UserProvider);

// Per-target-language study profile. Subdocument so it embeds with the user
// (read together, bounded — see database-design.md §1 "embed vs reference").
@Schema({ _id: false })
export class TargetLangEntry {
  @Prop({ required: true, enum: ['ja', 'en'] })
  lang!: 'ja' | 'en';

  // CEFR for 'en', JLPT for 'ja'. The service layer enforces which set
  // applies to which `lang`; we keep the union to avoid a migration later.
  @Prop({ type: String, required: false })
  level?: string;
}
export const TargetLangEntrySchema =
  SchemaFactory.createForClass(TargetLangEntry);

@Schema({ _id: false })
export class UserProfile {
  @Prop({ required: false })
  displayName?: string;

  @Prop({ required: true, enum: ['vi', 'en'] })
  uiLocale!: 'vi' | 'en';

  @Prop({ required: true, enum: ['vi', 'en'] })
  nativeLocale!: 'vi' | 'en';

  @Prop({
    type: [TargetLangEntrySchema],
    required: true,
    default: [],
  })
  targetLangs!: TargetLangEntry[];

  // Lessons/saved words per day. Bounded: 5..200 is sane. Future feature.
  @Prop({ type: Number, required: false, min: 5, max: 200 })
  dailyGoal?: number;
}
export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

// Entitlement is a denormalized snapshot of the active subscription. The
// `billing` module is the source of truth and updates this on webhook.
// Optional in v1: nobody is paid yet, and the field is documented as
// absent when the user is on the Free tier.
@Schema({ _id: false })
export class EntitlementSnapshot {
  @Prop({ required: true, default: 'free' })
  tier!: string; // 'free' | 'pro'

  @Prop({ type: Date, required: false })
  validUntil?: Date;

  // Arbitrary feature flags/limits, e.g. { dictationPerDay: 5 }.
  @Prop({ type: Object, required: false, default: {} })
  limits?: Record<string, unknown>;
}
export const EntitlementSnapshotSchema =
  SchemaFactory.createForClass(EntitlementSnapshot);

@Schema({
  collection: 'users',
  timestamps: true,
  // Don't auto-create indexes in production — migrations handle them.
  // `autoIndex` is left default (true) which is fine for the dev replica set.
})
export class User {
  // `lowercase: true` normalizes on assignment, not on save, so any later
  // service-level lookup can rely on the stored form. Combined with a unique
  // index on this field it gives us case-insensitive uniqueness cheaply.
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  // argon2id hash. NEVER returned to clients — see the `toJSON` transform below.
  @Prop({ type: String, required: false })
  passwordHash?: string;

  // OAuth providers. Bounded to 5 per database-design.md §3 `users.providers`.
  @Prop({
    type: [UserProviderSchema],
    required: true,
    default: [],
  })
  providers!: UserProvider[];

  @Prop({ type: Date, required: false })
  emailVerifiedAt?: Date;

  @Prop({
    type: [String],
    enum: ['user', 'admin'],
    required: true,
    default: ['user'],
  })
  roles!: string[];

  @Prop({ type: UserProfileSchema, required: true })
  profile!: UserProfile;

  @Prop({ type: EntitlementSnapshotSchema, required: false })
  entitlement?: EntitlementSnapshot;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes (per database-design.md §3 `users`).
// Note: `unique: true` on `email` already creates an index; this is the
// sparse unique compound for OAuth provider links.
UserSchema.index(
  { 'providers.provider': 1, 'providers.providerId': 1 },
  { unique: true, sparse: true },
);

// Belt-and-suspenders: cap `providers` length at the schema level so a
// future write path that bypasses the service still can't blow the array up.
UserSchema.path('providers').validate(function (arr: UserProvider[]) {
  return Array.isArray(arr) && arr.length <= 5;
}, 'providers exceeds max length of 5');

// Hide the password hash from JSON output. `__v` and `_id` are kept (the
// API returns ObjectId strings for `_id`).
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

// Re-export `Schema` so the test can reuse the same name (avoids the
// "Schema is not a constructor" trap when both Mongoose and @nestjs/mongoose
// are imported in the same file in different places).
export { MongooseSchema };
