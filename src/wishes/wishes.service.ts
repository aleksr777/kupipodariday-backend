import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  verifyOwner,
  protectPrivacyUser,
} from '../utils/guard-utils';
import { modifyOffersArr, modifyItemsArr } from '../utils/wishes-utils';
import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offers/entities/offer.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}

  async create(user: User, createWishDto: CreateWishDto) {
    protectPrivacyUser(user);
    const item = this.wishRepository.create({
      ...createWishDto,
      owner: user,
    });
    this.wishRepository.save(item);
    return {};
  }

  async findLast() {
    const items = await this.wishRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
      relations: [
        'owner',
        'offers',
        'offers.item',
        'offers.owner',
        'offers.owner.wishes',
        'offers.owner.offers',
        'offers.owner.offers.item',
        'offers.owner.wishlists',
        'offers.owner.wishlists.owner',
        'offers.owner.wishlists.items',
      ],
    });
    if (!items.length) {
      throw new NotFoundException(`Подарки в базе данных не найдены!`);
    }
    const modifiedItems = modifyItemsArr(items);
    return modifiedItems;
  }

  async findTop() {
    const items = await this.wishRepository.find({
      take: 20,
      order: { copied: 'DESC' },
      relations: [
        'owner',
        'offers',
        'offers.item',
        'offers.owner',
        'offers.owner.wishes',
        'offers.owner.offers',
        'offers.owner.offers.item',
        'offers.owner.wishlists',
        'offers.owner.wishlists.owner',
        'offers.owner.wishlists.items',
      ],
    });
    if (!items.length) {
      throw new NotFoundException(`Подарки в базе данных не найдены!`);
    }
    const modifiedItems = modifyItemsArr(items);
    return modifiedItems;
  }

  async findOne(itemId: number) {
    const item = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: [
        'owner',
        'offers',
        'offers.item',
        'offers.owner',
        'offers.owner.wishes',
        'offers.owner.offers',
        'offers.owner.offers.item',
        'offers.owner.wishlists',
        'offers.owner.wishlists.owner',
        'offers.owner.wishlists.items',
      ],
    });
    if (!item) {
      throw new NotFoundException(
        `Подарок с ID ${itemId} не найден в базе данных!`,
      );
    }
    protectPrivacyUser(item.owner);
    const modifiedOffers = await modifyOffersArr(item.offers);
    const modifiedItem = {
      ...item,
      offers: modifiedOffers,
    };
    return modifiedItem;
  }

  async updateOne(
    updateWishDto: UpdateWishDto,
    itemId: number,
    currentUserId: number,
  ) {
    const item = await this.findOne(itemId);
    if (!item) {
      throw new NotFoundException(
        `Подарок с ID ${itemId} не найден в базе данных!`,
      );
    }
    verifyOwner(item.owner.id, currentUserId, itemId);
    if (item.raised !== 0 && item.offers.length > 0) {
      throw new ForbiddenException(
        `Подарок с ID ${itemId} нельзя редактировать, на него уже скидываются!`,
      );
    }
    protectPrivacyUser(item.owner);
    await this.wishRepository.update(itemId, updateWishDto);
    return {};
  }

  async removeOne(itemId: number, currentUserId: number) {
    const item = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: [
        'owner',
        'offers',
        'offers.item',
        'offers.owner',
        'offers.owner.wishes',
        'offers.owner.offers',
        'offers.owner.offers.item',
        'offers.owner.wishlists',
        'offers.owner.wishlists.owner',
        'offers.owner.wishlists.items',
      ],
    });

    if (!item) {
      throw new NotFoundException('Подарок не найден в базе данных!');
    }

    verifyOwner(item.owner.id, currentUserId, itemId);

    if (item.offers.length > 0) {
      try {
        await this.offerRepository.remove(item.offers);
      } catch (error) {
        throw new InternalServerErrorException(
          `Не удалось удалить из базы данных связанные данные с желанием с ID: ${itemId}!`,
        );
      }
    }

    try {
      await this.wishRepository.delete({ id: itemId });
      protectPrivacyUser(item.owner);
      const modifiedOffers = await modifyOffersArr(item.offers);
      const modifiedItem = {
        ...item,
        offers: modifiedOffers,
      };
      return modifiedItem;
    } catch (error) {
      throw new InternalServerErrorException(
        `Не удалось удалить желание с ID: ${itemId} из базы данных!`,
      );
    }
  }

  async copyOne(itemId: number, user: User) {
    const originalWish = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner'],
    });
    if (!originalWish) {
      throw new NotFoundException('Запрашиваемый подарок не найден!');
    }
    if (user.id === originalWish.owner.id) {
      throw new ForbiddenException(
        'Нельзя копировать свой собственный подарок!',
      );
    }
    await this.wishRepository.update(itemId, {
      copied: originalWish.copied + 1,
    });
    const newItem = {
      ...originalWish,
      id: undefined,
      raised: 0,
      copied: 0,
      owner: user,
      offers: [],
    };
    try {
      await this.wishRepository.save(newItem);
      return {};
    } catch (error) {
      throw new InternalServerErrorException(
        'Не удалось сохранить скопированное желание в базе данных!',
      );
    }
  }
}
