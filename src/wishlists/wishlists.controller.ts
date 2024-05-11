import {
  Req,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/types/request';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  getAllWishlists() {
    return this.wishlistsService.findAll();
  }

  @Post()
  createWishlist(
    @Body() createWishlistDto: CreateWishlistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.wishlistsService.create(createWishlistDto, req.user);
  }

  @Get(':id')
  getWishlist(@Param('id') id: number) {
    return this.wishlistsService.findOne(+id);
  }

  @Patch(':id')
  updateWishlist(
    @Param('id') id: number,
    @Req() req: AuthenticatedRequest,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.updateOne(
      +id,
      +req.user.id,
      updateWishlistDto,
    );
  }

  @Delete(':id')
  deleteWishlist(@Param('id') id: number, @Req() req: AuthenticatedRequest) {
    return this.wishlistsService.removeOne(+id, +req.user.id);
  }
}
