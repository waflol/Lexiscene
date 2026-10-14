import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER = { id: '507f1f77bcf86cd799439011', email: 'user@example.com', roles: ['user'], profile: {} };
const TOKENS = { accessToken: 'at', refreshToken: 'rt', user: USER };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthController', () => {
  let controller: AuthController;
  let svc: Partial<AuthService>;

  beforeEach(async () => {
    svc = {
      register: vi.fn().mockResolvedValue(USER),
      login: vi.fn().mockResolvedValue(TOKENS),
      logout: vi.fn().mockResolvedValue(undefined),
      refresh: vi.fn().mockResolvedValue({ accessToken: 'new', refreshToken: 'new2' }),
      verifyEmail: vi.fn().mockResolvedValue({ message: 'ok' }),
      requestPasswordReset: vi.fn().mockResolvedValue(undefined),
      resetPassword: vi.fn().mockResolvedValue({ message: 'ok' }),
    };

    const mod: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: svc }],
    }).compile();

    controller = mod.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('returns user on success', async () => {
      const dto = { email: 'a@b.com', password: 'pw', uiLocale: 'vi', nativeLocale: 'vi' as const };
      const result = await controller.register(dto as any);
      expect(result).toEqual(USER);
    });
  });

  describe('login', () => {
    it('returns tokens', async () => {
      const dto = { email: 'a@b.com', password: 'pw' };
      const req = { res: { cookie: vi.fn() } } as any;
      const result = await controller.login(dto as any, req);
      expect(result.accessToken).toBe('at');
      expect(result.user).toEqual(USER);
    });
  });

  describe('refresh', () => {
    it('returns new access token', async () => {
      const req = { cookies: { refresh_token: 'token' }, res: { cookie: vi.fn() } } as any;
      const result = await controller.refresh(req);
      expect(result.accessToken).toBe('new');
    });
  });

  describe('logout', () => {
    it('clears cookie', async () => {
      const req = { cookies: { refresh_token: 'token' }, res: { clearCookie: vi.fn() } } as any;
      await controller.logout(req);
      expect(req.res.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('requestPasswordReset', () => {
    it('returns message', async () => {
      const result = await controller.requestPasswordReset({ email: 'a@b.com' } as any);
      expect(result.message).toBe('If the email exists, a reset link was sent');
    });
  });
});
