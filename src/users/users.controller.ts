import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/types/request';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.findUser(+req.user.id);
  }

  @Patch('me')
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(+req.user.id, updateUserDto);
  }

  @Get('me/wishes')
  async getMyWishes(@Req() req: AuthenticatedRequest) {
    return this.usersService.getWishes(+req.user.id);
  }

  @Get(':username')
  async getUserByName(@Param('username') username: string) {
    return this.usersService.findUserByName(username);
  }

  @Get(':username/wishes')
  async getWishesByName(@Param('username') username: string) {
    return this.usersService.findWishesByName(username);
  }

  @Post('find')
  getUsersByQuery(@Body() queryUserDto: QueryUserDto) {
    return this.usersService.findUsersByQuery(queryUserDto);
  }
}
