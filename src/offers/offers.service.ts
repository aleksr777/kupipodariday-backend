import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { modifyOffer, modifyOffersArr } from '../utils/wishes-utils';
import { ErrTextOffers } from '../constants/error-messages';

@Injectable()
export class OffersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(user: User, createOfferDto: CreateOfferDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const itemId = createOfferDto.itemId;
    const item = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner'],
    });
    if (!item) {
      throw new NotFoundException(ErrTextOffers.OFFER_NOT_FOUND);
    }
    if (!item.owner) {
      throw new InternalServerErrorException(
        ErrTextOffers.OWNER_DATA_NOT_FOUND,
      );
    }
    if (item.owner.id === user.id) {
      throw new BadRequestException(
        ErrTextOffers.CANNOT_CONTRIBUTE_TO_OWN_WISH,
      );
    }
    const sumOffer = Number(item.raised) + Number(createOfferDto.amount);
    if (sumOffer > item.price) {
      throw new BadRequestException(`${ErrTextOffers.SUM_EXCEEDS_WISH_PRICE}`);
    }
    await queryRunner.startTransaction();
    const newOffer = this.offerRepository.create({
      ...createOfferDto,
      owner: user,
      item: item,
    });
    try {
      await queryRunner.manager.save(Wish, {
        ...item,
        raised: sumOffer,
      });
      await queryRunner.manager.save(Offer, newOffer);
      await queryRunner.commitTransaction();
      return {};
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        ErrTextOffers.SERVER_ERROR_CREATE_OFFER,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const offers = await this.offerRepository.find({
      relations: [
        'item',
        'owner',
        'owner.wishes',
        'owner.offers',
        'owner.offers.item',
        'owner.offers.owner',
        'owner.wishlists',
        'owner.wishlists.owner',
        'owner.wishlists.items',
      ],
    });
    if (!offers.length) {
      throw new NotFoundException(ErrTextOffers.NO_OFFERS_FOUND);
    }
    const modifiedOffers = await modifyOffersArr(offers);
    return modifiedOffers;
  }

  async findOne(offerId: number) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: [
        'item',
        'owner',
        'owner.wishes',
        'owner.offers',
        'owner.offers.item',
        'owner.offers.owner',
        'owner.wishlists',
        'owner.wishlists.owner',
        'owner.wishlists.items',
      ],
    });
    if (!offer) {
      throw new NotFoundException(ErrTextOffers.OFFER_NOT_FOUND_SINGLE);
    }
    const modifiedOffer = await modifyOffer(offer);
    return modifiedOffer;
  }
}
