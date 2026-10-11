import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  ready() {
    return {
      status: 'ok',
      checks: { mongodb: 'pending', redis: 'pending' },
    };
  }
}
