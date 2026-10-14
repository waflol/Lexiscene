import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  RegisterRequestDto,
  LoginRequestDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
} from './dto/index.js';
import type {
  RegisterDto,
  LoginDto,
  PasswordResetRequestDtoType,
  PasswordResetConfirmDtoType,
} from './dto/index.js';

// ─── Controller ────────────────────────────────────────────────────────────────

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(registerSchema))
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterRequestDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginRequestDto })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const result = await this.authService.login(dto);

    // Set refresh token cookie
    req.res?.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Uses refresh token from httpOnly cookie. Token is rotated.',
  })
  @ApiCookieAuth('refreshToken')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return { accessToken: null };
    }

    const result = await this.authService.refresh(refreshToken);

    // Set new refresh token cookie
    req.res?.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Logout and invalidate refresh token',
    description: 'Clears refresh_token cookie and revokes the token family.',
  })
  @ApiCookieAuth('refreshToken')
  async logout(@Req() req: Request) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    req.res?.clearCookie('refresh_token');
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(passwordResetRequestSchema))
  @ApiOperation({
    summary: 'Request password reset email',
    description: 'Sends reset email if account exists. Always returns 200 to prevent email enumeration.',
  })
  @ApiBody({ type: PasswordResetRequestDto })
  async requestPasswordReset(@Body() dto: PasswordResetRequestDtoType) {
    await this.authService.requestPasswordReset(dto);
    return { message: 'If the email exists, a reset link was sent' };
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(passwordResetConfirmSchema))
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: PasswordResetConfirmDto })
  resetPassword(@Body() dto: PasswordResetConfirmDtoType) {
    return this.authService.resetPassword(dto);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify email address' })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
