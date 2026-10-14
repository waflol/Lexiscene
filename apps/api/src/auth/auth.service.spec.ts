import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { REDIS } from '../common/redis/redis.module.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TEST_PASSWORD = 'correct horse battery staple';

async function createFixtureUser() {
  return {
    _id: { toString: () => '507f1f77bcf86cd799439011' } as any,
    email: 'user@example.com',
    passwordHash: await argon2.hash(TEST_PASSWORD, { type: argon2.argon2id }),
    roles: ['user'],
    profile: { uiLocale: 'vi', nativeLocale: 'vi', targetLangs: [] },
    providers: [],
    emailVerifiedAt: null,
    toJSON: function() { return { ...this, _id: this._id.toString() }; },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: Partial<UsersService>;
  let mockJwtService: Partial<JwtService>;
  let mockRedis: Record<string, any>;

  beforeEach(async () => {
    mockUsersService = {
      findByEmail: vi.fn(),
      createWithPassword: vi.fn(),
      requireById: vi.fn(),
    };
    mockJwtService = { sign: vi.fn().mockReturnValue('mock.jwt.token') };
    mockRedis = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      scan: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: REDIS, useValue: mockRedis },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('returns tokens on valid credentials', async () => {
      const user = await createFixtureUser();
      mockUsersService.findByEmail!.mockResolvedValue(user);
      mockRedis.scan.mockResolvedValue(['0', []]);

      const result = await authService.login({ email: 'user@example.com', password: TEST_PASSWORD });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('stores refresh token in Redis', async () => {
      const user = await createFixtureUser();
      mockUsersService.findByEmail!.mockResolvedValue(user);
      mockRedis.scan.mockResolvedValue(['0', []]);

      await authService.login({ email: 'user@example.com', password: TEST_PASSWORD });

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('refresh:'),
        expect.any(String),
        'EX',
        expect.any(Number),
      );
    });

    it('throws 401 on wrong password', async () => {
      const user = await createFixtureUser();
      mockUsersService.findByEmail!.mockResolvedValue(user);
      mockRedis.scan.mockResolvedValue(['0', []]);

      await expect(
        authService.login({ email: 'user@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws 401 on non-existent email', async () => {
      mockUsersService.findByEmail!.mockResolvedValue(null);
      mockRedis.scan.mockResolvedValue(['0', []]);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'any' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('creates user with normalized email', async () => {
      const user = await createFixtureUser();
      mockUsersService.findByEmail!.mockResolvedValue(null);
      mockUsersService.createWithPassword!.mockResolvedValue(user);
      mockRedis.scan.mockResolvedValue(['0', []]);

      await authService.register({
        email: '  User@Example.COM  ',
        password: 'password',
        uiLocale: 'vi',
        nativeLocale: 'vi',
      });

      expect(mockUsersService.createWithPassword).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@example.com' }),
      );
    });

    it('throws on existing email', async () => {
      const user = await createFixtureUser();
      mockUsersService.findByEmail!.mockResolvedValue(user);

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password',
          uiLocale: 'vi',
          nativeLocale: 'vi',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('issues new access token', async () => {
      const user = await createFixtureUser();
      const key = 'refresh:family123:0';
      mockRedis.scan.mockResolvedValue(['0', [key]]);
      mockRedis.get.mockResolvedValue(JSON.stringify({ userId: '507f1f77bcf86cd799439011', familyId: 'family123' }));
      mockUsersService.requireById!.mockResolvedValue(user);

      const result = await authService.refresh('anytoken');

      expect(result).toHaveProperty('accessToken');
    });

    it('throws 401 when token not found', async () => {
      mockRedis.scan.mockResolvedValue(['0', []]);

      await expect(authService.refresh('invalidtoken')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('clears refresh token family', async () => {
      const key = 'refresh:family123:0';
      mockRedis.scan.mockResolvedValue(['0', [key]]);
      mockRedis.get.mockResolvedValue(JSON.stringify({ userId: '123', familyId: 'family123' }));

      await authService.logout('anytoken');

      expect(mockRedis.del).toHaveBeenCalled();
    });
  });

  describe('requestPasswordReset', () => {
    it('always returns 200 for non-existent email', async () => {
      mockUsersService.findByEmail!.mockResolvedValue(null);

      await expect(
        authService.requestPasswordReset({ email: 'nobody@example.com' }),
      ).resolves.toBeUndefined();
    });
  });
});
