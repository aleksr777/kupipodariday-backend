import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { verifyOwner, protectPrivacyUser } from '../utils/guard-utils';
import { modifyOffersArr, modifyItemsArr } from '../utils/wishes-utils';
import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offers/entities/offer.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { ErrTextWishes } from '../constants/error-messages';

@Injectable()
export class WishesService {
  constructor(
    private readonly dataSource: DataSource,
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
    try {
      await this.wishRepository.save(item);
      return {};
    } catch {
      throw new InternalServerErrorException(
        ErrTextWishes.SERVER_ERROR_CREATE_WISH,
      );
    }
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
      throw new NotFoundException(ErrTextWishes.NO_WISHES_FOUND);
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
      throw new NotFoundException(ErrTextWishes.NO_WISHES_FOUND);
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
      throw new NotFoundException(`${ErrTextWishes.WISH_NOT_FOUND} ${itemId}!`);
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
      throw new NotFoundException(ErrTextWishes.WISH_NOT_FOUND_GENERIC);
    }
    verifyOwner(
      item.owner.id,
      currentUserId,
      ErrTextWishes.CANNOT_EDIT_FOREIGN_WISH,
    );
    if (item.raised !== 0 && item.offers.length > 0) {
      throw new ForbiddenException(ErrTextWishes.CANNOT_EDIT_WISH_WITH_OFFERS);
    }
    protectPrivacyUser(item.owner);
    try {
      await this.wishRepository.update(itemId, updateWishDto);
      return {};
    } catch {
      throw new InternalServerErrorException(
        ErrTextWishes.SERVER_ERROR_UPDATE_WISH,
      );
    }
  }

  async removeOne(itemId: number, currentUserId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
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
      throw new NotFoundException(ErrTextWishes.WISH_NOT_FOUND_GENERIC);
    }
    verifyOwner(
      item.owner.id,
      currentUserId,
      ErrTextWishes.CANNOT_DELETE_FOREIGN_WISH,
    );
    if (item.raised > 0) {
      throw new ForbiddenException(
        ErrTextWishes.CANNOT_DELETE_WISH_WITH_OFFERS,
      );
    }
    await queryRunner.startTransaction();
    try {
      await this.offerRepository.remove(item.offers);
      await this.wishRepository.delete({ id: itemId });
      protectPrivacyUser(item.owner);
      const modifiedOffers = await modifyOffersArr(item.offers);
      const modifiedItem = {
        ...item,
        offers: modifiedOffers,
      };
      await queryRunner.commitTransaction();
      return modifiedItem;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        ErrTextWishes.SERVER_ERROR_DELETE_WISH,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async copyOne(itemId: number, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const originalItem = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner'],
    });
    if (!originalItem) {
      throw new NotFoundException(ErrTextWishes.WISH_NOT_FOUND_FOR_COPY);
    }
    if (user.id === originalItem.owner.id) {
      throw new ForbiddenException(ErrTextWishes.CANNOT_COPY_OWN_WISH);
    }
    const newItem = {
      ...originalItem,
      owner: user,
      copied: 0,
      raised: 0,
    };
    delete newItem.id;
    await queryRunner.startTransaction();
    try {
      await this.wishRepository.update(itemId, {
        copied: originalItem.copied + 1,
      });
      await queryRunner.manager.save(Wish, newItem);
      await queryRunner.commitTransaction();
      return {};
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        ErrTextWishes.SERVER_ERROR_COPY_WISH,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
