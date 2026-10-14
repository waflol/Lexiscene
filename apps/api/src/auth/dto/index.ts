// Schemas
export { registerSchema } from './register.dto.js';
export { loginSchema } from './login.dto.js';
export { passwordResetRequestSchema } from './password-reset-request.dto.js';
export { passwordResetConfirmSchema } from './password-reset-confirm.dto.js';

// Types
export type { RegisterDto } from './register.dto.js';
export type { LoginDto } from './login.dto.js';
export type { PasswordResetRequestDto as PasswordResetRequestDtoType } from './password-reset-request.dto.js';
export type { PasswordResetConfirmDto as PasswordResetConfirmDtoType } from './password-reset-confirm.dto.js';

// Request DTOs (classes for Swagger)
export {
  RegisterRequestDto,
  LoginRequestDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto
} from './responses.dto.js';

// Response DTOs (classes for Swagger)
export { UserResponseDto, AuthTokensResponseDto, RefreshResponseDto, MessageResponseDto } from './responses.dto.js';
