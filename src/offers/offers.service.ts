import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({ where: { id } });
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return offer;
  }

  async findAll(): Promise<Offer[]> {
    return await this.offerRepository.find();
  }

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    const offer = new Offer();
    offer.item = createOfferDto.item;
    offer.amount = createOfferDto.amount;
    offer.hidden = createOfferDto.hidden || false;
    return await this.offerRepository.save(offer);
  }

  async updateOne(id: number, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    const offer = await this.findOne(id);
    offer.item = updateOfferDto.item;
    offer.amount = updateOfferDto.amount;
    offer.hidden = updateOfferDto.hidden;
    return await this.offerRepository.save(offer);
  }

  async removeOne(id: number): Promise<void> {
    const result = await this.offerRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
  }
}
