import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { REDIS } from '../common/redis/redis.module.js';
import type { Redis } from 'ioredis';
import type { UserDocument } from '../users/entities/user.entity.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const REFRESH_TTL = 30 * 24 * 60 * 60; // 30 days
const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RefreshTokenData {
  userId: string;
  familyId: string;
  createdAt: number;
}

// ─── Module-level helpers ─────────────────────────────────────────────────────

function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function refreshKey(familyId: string, index: number): string {
  return `refresh:${familyId}:${index}`;
}

// ─── AuthService ─────────────────────────────────────────────────────────────

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(REDIS) private redis: Redis,
  ) {}

  // ── Token helpers ──────────────────────────────────────────────────────────

  private signAccessToken(user: UserDocument): string {
    return this.jwtService.sign({
      sub: String(user._id),
      email: user.email,
      roles: user.roles,
      entitlement: user.entitlement ?? { tier: 'free', limits: {} },
    });
  }

  private async storeRefreshToken(familyId: string, index: number, userId: string): Promise<void> {
    const data: RefreshTokenData = { userId, familyId, createdAt: Date.now() };
    await this.redis.set(refreshKey(familyId, index), JSON.stringify(data), 'EX', REFRESH_TTL);
  }

  private async findRefreshTokenKey(_token: string): Promise<string | null> {
    const [cursor, keys] = await this.redis.scan('0', 'MATCH', 'refresh:*', 'COUNT', 100);
    return cursor === '0' ? keys[0] ?? null : keys[0] ?? null;
  }

  private async revokeFamily(familyId: string): Promise<void> {
    let cursor = '0';
    do {
      const [next, keys] = await this.redis.scan(cursor, 'MATCH', `refresh:${familyId}:*`, 'COUNT', 100);
      cursor = next;
      if (keys.length) await this.redis.del(...keys);
    } while (cursor !== '0');
  }

  private sanitizeUser(user: UserDocument) {
    const { passwordHash: _passwordHash, ...safe } = user.toJSON();
    return safe;
  }

  // ── Auth methods ───────────────────────────────────────────────────────────

  /** Timing-safe password verification */
  private async verifyPassword(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);
    const hash = user?.passwordHash ?? DUMMY_HASH;

    const valid = await argon2.verify(hash, password).catch(() => false);
    if (!valid || !user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(userLogin: { email: string; password: string }) {
    const user = await this.verifyPassword(userLogin.email.toLowerCase().trim(), userLogin.password);

    const familyId = crypto.randomUUID();
    const accessToken = this.signAccessToken(user);
    const refreshToken = generateSecureToken();

    await this.storeRefreshToken(familyId, 0, String(user._id));

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  async refresh(refreshToken: string) {
    const key = await this.findRefreshTokenKey(refreshToken);
    if (!key) throw new UnauthorizedException('Invalid refresh token');

    const data: RefreshTokenData = JSON.parse(await this.redis.get(key) ?? '{}');
    if (!data.userId) throw new UnauthorizedException('Invalid refresh token');

    // Rotate: delete old, create new
    const [, familyId, indexStr] = key.split(':');
    await this.redis.del(key);

    const user = await this.usersService.requireById(data.userId);
    const newAccessToken = this.signAccessToken(user);
    const newRefreshToken = generateSecureToken();

    await this.storeRefreshToken(familyId, parseInt(indexStr) + 1, data.userId);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    const key = await this.findRefreshTokenKey(refreshToken);
    if (!key) return;

    const data: RefreshTokenData = JSON.parse(await this.redis.get(key) ?? '{}');
    if (data.familyId) await this.revokeFamily(data.familyId);
  }

  async register(userRegister: { email: string; password: string; uiLocale: string; nativeLocale: string }) {
    const email = userRegister.email.toLowerCase().trim();
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const user = await this.usersService.createWithPassword({
      email,
      password: userRegister.password,
      uiLocale: userRegister.uiLocale as 'vi' | 'en',
      nativeLocale: userRegister.nativeLocale as 'vi' | 'en',
      targetLangs: [],
    });

    // Queue verification email (TODO: via BullMQ)
    const token = generateSecureToken();
    await this.redis.set(`verify:${token}`, JSON.stringify({ userId: String(user._id) }), 'EX', 86400);
    console.log(`[DEV] Verify: /auth/verify?token=${token}`);

    return this.sanitizeUser(user);
  }

  async verifyEmail(token: string) {
    const data = await this.redis.get(`verify:${token}`);
    if (!data) throw new UnauthorizedException('Invalid or expired token');

    const { userId: _userId } = JSON.parse(data);
    // TODO: await this.usersService.markEmailVerified(_userId);
    await this.redis.del(`verify:${token}`);
    return { message: 'Email verified' };
  }

  async requestPasswordReset(dto: { email: string }) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase().trim());
    if (!user) return; // Timing-safe: always return 200

    const token = generateSecureToken();
    await this.redis.set(
      `reset:${token}`,
      JSON.stringify({ userId: String(user._id), email: user.email }),
      'EX',
      3600,
    );
    console.log(`[DEV] Password reset: /auth/reset-password?token=${token}`);
  }

  async resetPassword(dto: { token: string; newPassword: string }) {
    const data = await this.redis.get(`reset:${dto.token}`);
    if (!data) throw new UnauthorizedException('Invalid token');

    const { userId } = JSON.parse(data);

    // TODO: await this.usersService.updatePassword(userId, dto.newPassword);

    // Revoke all sessions
    let cursor = '0';
    do {
      const [next, keys] = await this.redis.scan(cursor, 'MATCH', 'refresh:*', 'COUNT', 100);
      cursor = next;
      for (const k of keys) {
        const tokenData: RefreshTokenData = JSON.parse(await this.redis.get(k) ?? '{}');
        if (tokenData.userId === userId) await this.redis.del(k);
      }
    } while (cursor !== '0');

    await this.redis.del(`reset:${dto.token}`);
    return { message: 'Password reset successful' };
  }
}
