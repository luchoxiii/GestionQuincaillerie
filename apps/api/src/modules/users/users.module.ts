import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController, RolesController } from './users.controller';

@Module({
  controllers: [UsersController, RolesController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
