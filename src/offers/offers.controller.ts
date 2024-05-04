import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../types/request';

@UseGuards(JwtGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  createOffer(
    @Body() createOfferDto: CreateOfferDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.offersService.create(req.user, createOfferDto);
  }

  @Get()
  getAllOffers() {
    return this.offersService.findAll();
  }

  @Get(':id')
  getOneOffer(@Param('id') id: string) {
    return this.offersService.findOne(+id);
  }
}
