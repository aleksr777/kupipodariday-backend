import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  getOwnUser() {
    return this.usersService.getOwnUser();
  }

  @Patch('me')
  updateProfile(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(updateUserDto);
  }

  @Get('me/wishes')
  getOwnWishes() {
    return this.usersService.getOwnWishes();
  }

  @Get(':username')
  findByName(@Param('username') username: string) {
    return this.usersService.findByName(username);
  }

  @Get(':username/wishes')
  getAnotherUserWishes(@Param('username') username: string) {
    return this.usersService.getAnotherUserWishes(username);
  }

  @Post('find')
  @HttpCode(HttpStatus.OK)
  findByQuery(@Body() queryUserDto: QueryUserDto) {
    return this.usersService.findByQuery(queryUserDto);
  }
}
