import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../types/request';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  async createWish(
    @Req() req: AuthenticatedRequest,
    @Body() createWishDto: CreateWishDto,
  ) {
    return this.wishesService.create(req.user, createWishDto);
  }

  @Get('last')
  async getLastWishes() {
    return this.wishesService.findLast();
  }

  @Get('top')
  async getTopWishes() {
    return this.wishesService.findTop();
  }

  @Get(':id')
  async getWish(@Param('id') id: number) {
    return this.wishesService.findOne(+id);
  }

  @Patch(':id')
  async updateWish(
    @Body() updateWishDto: UpdateWishDto,
    @Req() req: AuthenticatedRequest,
    @Param('id') id: number,
  ) {
    return this.wishesService.updateOne(updateWishDto, +id, +req.user.id);
  }

  @Delete(':id')
  async deleteWish(@Param('id') id: number, @Req() req: AuthenticatedRequest) {
    return this.wishesService.removeOne(+id, +req.user.id);
  }

  @Post(':id/copy')
  async copyOneWish(@Param('id') id: number, @Req() req: AuthenticatedRequest) {
    return this.wishesService.copyOne(+id, req.user);
  }
}
