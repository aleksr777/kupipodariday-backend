import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { modifyOffer, modifyOffersArr } from '../utils/wishes-utils';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(user: User, createOfferDto: CreateOfferDto) {
    const itemId = createOfferDto.itemId;
    const item = await this.wishRepository.findOne({
      where: { id: itemId },
    });
    if (!item) {
      throw new NotFoundException(`Предложение с ID ${itemId} не найдено!`);
    }
    const offer = this.offerRepository.create({
      ...createOfferDto,
      owner: user,
      item: item,
    });
    await this.offerRepository.save(offer);
    return {};
  }

  async findAll() {
    const offers = await this.offerRepository.find({
      relations: [
        'item',
        'owner',
        'owner.wishes',
        'owner.offers',
        'owner.wishlists',
        'owner.wishlists.owner',
        'owner.wishlists.items',
      ],
    });
    return await modifyOffersArr(offers);
  }

  async findOne(offerId: number) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: [
        'item',
        'owner',
        'owner.wishes',
        'owner.offers',
        'owner.wishlists',
        'owner.wishlists.owner',
        'owner.wishlists.items',
      ],
    });
    if (!offer) {
      throw new NotFoundException(`Предложение с ID ${offerId} не найдено!`);
    }
    return await modifyOffer(offer);
  }
}
