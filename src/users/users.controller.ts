import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  HttpStatus,
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
  async getProfileData(@Req() req: AuthenticatedRequest) {
    return this.usersService.findOne(+req.user.id);
  }

  @Patch('me')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateOne(+req.user.id, updateUserDto);
  }

  @Get('me/wishes')
  async getProfileWishes(@Req() req: AuthenticatedRequest) {
    return this.usersService.getWishes(+req.user.id);
  }

  @Get(':username')
  async findUserByName(@Param('username') username: string) {
    return this.usersService.findByName(username);
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    return this.usersService.getUserWishes(username);
  }

  @Post('find')
  findUserByQuery(@Body() queryUserDto: QueryUserDto) {
    return this.usersService.findByQuery(queryUserDto);
  }
}
