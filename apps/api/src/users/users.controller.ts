import { Controller } from '@nestjs/common';
import { UsersService } from './users.service.js';

// HTTP routes for users land in a follow-up Phase 1 task. The endpoints
// we eventually need (per docs/en/api-design.md §2 Users) are:
//   GET    /users/me            -> profile + entitlement
//   PATCH  /users/me            -> locales, target languages, daily goal
//   DELETE /users/me            (P1)
//   GET    /users/me/export     (P1)
//
// Until then, this controller is intentionally empty. We keep it (and
// register it in UsersModule) so the route prefix is reserved and the
// module wiring is exercised by tests.
@Controller('users')
export class UsersController {
  // Service is injected so the controller remains a valid NestJS bean
  // (it would be tree-shaken otherwise) and so future handlers can use it
  // without re-wiring the module.
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly _users: UsersService) {}
}
