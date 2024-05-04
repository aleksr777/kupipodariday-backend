import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';

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
      throw new NotFoundException(
        `Предложение скинуться с ID ${itemId} не найдено!`,
      );
    }
    const offer = this.offerRepository.create({
      ...createOfferDto,
      owner: user,
      item: item,
    });
    await this.offerRepository.save(offer);
  }

  async findAll() {
    return await this.offerRepository.find({
      relations: ['item', 'owner'],
    });
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
      throw new NotFoundException(
        `Предложение скинуться с ID ${offerId} не найдено!`,
      );
    }
    const resObj = {
      id: offer.id,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      item: offer.item,
      amount: offer.amount,
      hidden: offer.hidden,
      user: {
        id: 5,
        username: offer.owner.username,
        about: offer.owner.about,
        avatar: offer.owner.avatar,
        email: offer.owner.email,
        createdAt: offer.owner.createdAt,
        updatedAt: offer.owner.updatedAt,
        wishes: offer.owner.wishes,
        offers: offer.owner.offers,
        wishlists: offer.owner.wishlists,
      },
    };
    return resObj;
  }
}
