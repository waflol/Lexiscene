import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from './common/config/config.module.js';
import { HealthModule } from './health/health.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RedisModule } from './common/redis/redis.module.js';
import { DatabaseModule } from './common/database/database.module.js';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
