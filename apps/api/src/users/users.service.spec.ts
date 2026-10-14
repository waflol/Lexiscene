import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from './users.service.js';
import type { UserDocument } from './entities/user.entity.js';
import type { CreateUserInput } from './dto/create-user.input.js';

// Helper: build a fake `UserDocument` for assertions. We only stub the
// fields the service actually reads; the rest stays undefined.
function fakeUserDoc(overrides: Partial<{
  email: string;
  passwordHash: string;
  _id: Types.ObjectId;
}> = {}): UserDocument {
  const doc = {
    _id: overrides._id ?? new Types.ObjectId(),
    email: overrides.email ?? 'user@example.com',
    passwordHash: overrides.passwordHash,
    // Methods the service never calls stay undefined; TS sees this as a
    // UserDocument thanks to the cast.
  } as unknown as UserDocument;
  return doc;
}

// Helper: build a fake Mongoose Model. Each method we exercise returns a
// chainable, awaitable object (mimics `.findOne(...).exec()`, `.create(...)`).
function fakeModel() {
  const findOneChain = {
    exec: vi.fn(),
  };
  const findByIdChain = {
    exec: vi.fn(),
  };
  return {
    findOne: vi.fn().mockReturnValue(findOneChain),
    findById: vi.fn().mockReturnValue(findByIdChain),
    create: vi.fn(),
    // expose chains for per-test overrides
    _findOneChain: findOneChain,
    _findByIdChain: findByIdChain,
  };
}

const baseInput: CreateUserInput = {
  email: 'User@Example.com',
  password: 'correct horse battery staple',
  uiLocale: 'vi',
  nativeLocale: 'vi',
  targetLangs: [{ lang: 'en', level: 'A2' }],
};

describe('UsersService', () => {
  let service: UsersService;
  let model: ReturnType<typeof fakeModel>;

  beforeEach(() => {
    model = fakeModel();
    // The constructor type is `Model<UserDocument>`; we satisfy it with a
    // minimal mock because the service only uses a handful of methods.
    service = new UsersService(model as unknown as any);
  });

  describe('findByEmail', () => {
    it('lowercases and trims the input before lookup', async () => {
      model._findOneChain.exec.mockResolvedValue(null);
      await service.findByEmail('  USER@Example.COM  ');
      expect(model.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
    });
  });

  describe('createWithPassword', () => {
    it('stores an argon2id hash, never the plaintext', async () => {
      const created = fakeUserDoc({ email: 'user@example.com' });
      model.create.mockResolvedValue(created);

      const out = await service.createWithPassword(baseInput);

      expect(model.create).toHaveBeenCalledTimes(1);
      const stored = model.create.mock.calls[0][0] as Record<string, unknown>;
      expect(stored.email).toBe('user@example.com'); // normalized
      expect(typeof stored.passwordHash).toBe('string');
      expect(stored.passwordHash).not.toBe(baseInput.password);
      expect((stored.passwordHash as string).startsWith('$argon2id$')).toBe(true);
      expect(out).toBe(created);
    });

    it('maps a duplicate-key (E11000) error to a 409 ConflictException', async () => {
      const dup = Object.assign(new Error('E11000 duplicate key'), { code: 11000 });
      model.create.mockRejectedValue(dup);

      await expect(service.createWithPassword(baseInput)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rethrows non-duplicate errors unchanged', async () => {
      const boom = new Error('connection reset');
      model.create.mockRejectedValue(boom);
      await expect(service.createWithPassword(baseInput)).rejects.toBe(boom);
    });
  });

  describe('verifyPassword', () => {
    it('returns the user on a correct password', async () => {
      const { default: argon2 } = await import('argon2');
      const hash = await argon2.hash(baseInput.password, { type: argon2.argon2id });
      const user = fakeUserDoc({ email: 'user@example.com', passwordHash: hash });
      model._findOneChain.exec.mockResolvedValue(user);

      const out = await service.verifyPassword(baseInput.email, baseInput.password);
      expect(out).toBe(user);
    });

    it('returns null on a wrong password (no enumeration leak)', async () => {
      const { default: argon2 } = await import('argon2');
      const hash = await argon2.hash('a different password', { type: argon2.argon2id });
      const user = fakeUserDoc({ email: 'user@example.com', passwordHash: hash });
      model._findOneChain.exec.mockResolvedValue(user);

      const out = await service.verifyPassword(baseInput.email, baseInput.password);
      expect(out).toBeNull();
    });

    it('returns null when the user has no password (OAuth-only account)', async () => {
      const user = fakeUserDoc({ email: 'user@example.com' }); // no passwordHash
      model._findOneChain.exec.mockResolvedValue(user);
      const out = await service.verifyPassword(baseInput.email, baseInput.password);
      expect(out).toBeNull();
    });

    it('returns null when the user does not exist', async () => {
      model._findOneChain.exec.mockResolvedValue(null);
      const out = await service.verifyPassword('nobody@example.com', 'whatever');
      expect(out).toBeNull();
    });
  });

  describe('requireById', () => {
    it('returns the user when found', async () => {
      const user = fakeUserDoc();
      model._findByIdChain.exec.mockResolvedValue(user);
      await expect(service.requireById(String(user._id))).resolves.toBe(user);
    });

    it('throws 404-shaped error when missing', async () => {
      model._findByIdChain.exec.mockResolvedValue(null);
      const err = await service
        .requireById('507f1f77bcf86cd799439011')
        .then(() => null, (e) => e);
      // NestJS HttpException.getStatus() returns the HTTP status,
      // and getResponse() returns the body we passed to the constructor.
      expect(err.getStatus()).toBe(404);
      expect(err.getResponse()).toMatchObject({
        status: 404,
        code: 'USER_NOT_FOUND',
      });
    });
  });
});
