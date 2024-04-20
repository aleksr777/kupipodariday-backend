import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}

  async findOne(id: number) {
    console.log('findOne');
  }

  async findAll() {
    console.log('findAll');
  }

  async create(createOfferDto: CreateOfferDto) {
    console.log('create');
  }

  async removeOne(id: number) {
    console.log('removeOne');
  }
}
