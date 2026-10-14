import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';

@Module({
  imports: [
    // Register the User model for this module. Other modules (auth, billing)
    // can re-import the schema with `MongooseModule.forFeature([...])` to
    // get the same Model<UserDocument> injected.
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  // Export so future modules (auth, billing) can inject UsersService without
  // re-registering the model.
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
