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
      throw new NotFoundException(
        `Предложение не найдено в базе данных!`,
      );
    }
    if (!item.owner) {
      throw new InternalServerErrorException(
        `Данные владельца желания не найдены в базе данных!`,
      );
    }
    if (item.owner.id === user.id) {
      throw new BadRequestException(
        `Нельзя скинуться на собственное желание!`,
      );
    }
    const sumOffer = Number(item.raised) + Number(createOfferDto.amount);
    if (sumOffer > item.price) {
      throw new BadRequestException(
        `Сумма ${sumOffer} руб. превышает стоимость желания!`,
      );
    }
    const newOffer = this.offerRepository.create({
      ...createOfferDto,
      owner: user,
      item: item,
    });
    await queryRunner.startTransaction();
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
        `Ошибка сервера! Не удалось создать новое предложение скинуться на желание!`,
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
      throw new NotFoundException(
        `Предложение скинуться не найдено в базе данных!`,
      );
    }
    return await modifyOffer(offer);
  }
}
