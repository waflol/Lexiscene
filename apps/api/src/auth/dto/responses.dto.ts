import { ApiProperty } from '@nestjs/swagger';

// ─── Request DTOs (classes for Swagger body schema) ──────────────────────────

export class RegisterRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  password!: string;

  @ApiProperty({ example: 'vi', enum: ['vi', 'en'] })
  uiLocale!: string;

  @ApiProperty({ example: 'vi', enum: ['vi', 'en'] })
  nativeLocale!: string;
}

export class LoginRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  password!: string;
}

export class PasswordResetRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;
}

export class PasswordResetConfirmDto {
  @ApiProperty({ example: 'abc123token' })
  token!: string;

  @ApiProperty({ example: 'NewSecurePass456!', minLength: 8 })
  newPassword!: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: ['user'] })
  roles!: string[];

  @ApiProperty({ example: { uiLocale: 'vi', nativeLocale: 'vi', targetLangs: [] } })
  profile!: Record<string, unknown>;

  @ApiProperty({ example: null, nullable: true })
  emailVerifiedAt!: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt!: string;
}

export class AuthTokensResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'a1b2c3d4e5f6...' })
  refreshToken!: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}

export class RefreshResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Email verified' })
  message!: string;
}
