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
  HttpStatus,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/types/request';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  createWishlist(
    @Body() createWishlistDto: CreateWishlistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.wishlistsService.create(createWishlistDto, +req.user.id);
  }

  @Get()
  findAllWishlists() {
    return this.wishlistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.wishlistsService.findOne(+id);
  }

  @Patch(':id')
  updateOne(
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.updateOne(id, updateWishlistDto);
  }

  @Delete(':id')
  removeOneWishlist(@Param('id') id: number) {
    return this.wishlistsService.removeOne(+id);
  }
}
