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
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  async createOneWish(@Req() req, @Body() createWishDto: CreateWishDto) {
    return this.wishesService.createOne(req.user, createWishDto);
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
  async findOneWish(@Param('id') id: number) {
    return this.wishesService.findOne(+id);
  }

  @Patch(':id')
  async updateOneWish(
    @Body() updateWishDto: UpdateWishDto,
    @Req() req,
    @Param('id') id: number,
  ) {
    const wishId = +id;
    const userId = +req?.user?.id;
    return this.wishesService.updateOne(updateWishDto, wishId, userId);
  }

  @Delete(':id')
  async removeOneWish(@Param('id') id: number, @Req() req) {
    const wishId = +id;
    const userId = +req?.user?.id;
    return this.wishesService.removeOne(wishId, userId);
  }

  
  @Post(':id/copy')
  async copyOneWish(@Param('id') id: number, @Req() req) {
    return this.wishesService.copyOne(+id, req.user);
  }
}
