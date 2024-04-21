import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  createOffer(@Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(createOfferDto);
  }

  @Get()
  findAllOffers() {
    return this.offersService.findAll();
  }

  @Get(':id')
  findOneOffer(@Param('id') id: string) {
    return this.offersService.findOne(+id);
  }

  @Delete(':id')
  removeOneOffer(@Param('id') id: string) {
    return this.offersService.removeOne(+id);
  }
}
