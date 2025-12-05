//src/users/users.controller.ts 
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('users:create')
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user) {
    return this.usersService.create(createUserDto, user.sub);
  }

  @Get()
  @RequirePermissions('users:read')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('users:read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user) {
    return this.usersService.update(id, updateUserDto, user.sub);
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.usersService.remove(id, user.sub);
  }
}