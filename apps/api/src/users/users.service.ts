import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import type { CreateUserInput } from './dto/create-user.input.js';
import { User, UserDocument } from './entities/user.entity.js';

// OWASP minimums for argon2id (2024 cheat sheet). Pinned so a future
// argon2 upgrade can't quietly weaken stored hashes.
const ARGON2_OPTS = {
  type: argon2.argon2id,
  memoryCost: 19_456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  // Lower-case + trim here so callers can pass raw user input. We also
  // gate the lookup through the Mongoose model's collation-free path; the
  // `lowercase: true` in the schema means any write that bypassed this
  // service is also normalized, so this stays correct.
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.model.findById(id).exec();
  }

  // Creates a new user with an argon2id password hash. Translates the unique
  // index violation (E11000) into a 409 Conflict so the global filter can
  // format it as problem+json. Other errors bubble up.
  async createWithPassword(input: CreateUserInput): Promise<UserDocument> {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await argon2.hash(input.password, ARGON2_OPTS);

    try {
      const created = await this.model.create({
        email,
        passwordHash,
        profile: {
          uiLocale: input.uiLocale,
          nativeLocale: input.nativeLocale,
          targetLangs: input.targetLangs,
        },
        // roles/providers default in the schema; entitlement is unset (Free).
      });
      return created;
    } catch (err) {
      if (this.isDuplicateKeyError(err)) {
        throw new ConflictException({
          type: 'https://lexiscene.app/problems/conflict',
          title: 'Email already in use',
          status: 409,
          code: 'EMAIL_TAKEN',
          detail: 'An account with this email already exists.',
        });
      }
      throw err;
    }
  }

  // Returns the user if the password matches; null otherwise. We do NOT
  // throw on mismatch — that distinction belongs to the auth flow (it
  // collapses wrong-email and wrong-password into one error to avoid user
  // enumeration).
  async verifyPassword(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    const ok = await argon2.verify(user.passwordHash, password);
    return ok ? user : null;
  }

  // Helper for tests + future flows that need to assert presence.
  async requireById(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException({
        type: 'https://lexiscene.app/problems/not-found',
        title: 'User not found',
        status: 404,
        code: 'USER_NOT_FOUND',
      });
    }
    return user;
  }

  private isDuplicateKeyError(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: unknown }).code === 11000
    );
  }
}
