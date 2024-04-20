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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.removeOne(+id);
  }

  @Patch('me')
  updateProfile(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(updateUserDto);
  }

  @Get('me')
  getOwnUser() {
    return this.usersService.getOwnUser();
  }

  @Get('me/wishes')
  getOwnWishes() {
    return this.usersService.getOwnWishes();
  }

  @Post('find')
  @HttpCode(HttpStatus.OK)
  findByQuery(@Body() queryUserDto: QueryUserDto) {
    return this.usersService.findByQuery(queryUserDto.query);
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }

  @Get(':username/wishes')
  getAnotherUserWishes(@Param('username') username: string) {
    return this.usersService.getAnotherUserWishes(username);
  }
}
