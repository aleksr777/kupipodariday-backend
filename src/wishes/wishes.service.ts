import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  verifyOwner,
  protectPrivacyUser,
  protectPrivacyItems,
} from '../utils/guard-utils';
import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(user: User, createWishDto: CreateWishDto) {
    protectPrivacyUser(user);
    const item = this.wishRepository.create({
      ...createWishDto,
      owner: user,
    });
    this.wishRepository.save(item);
  }

  async findLast() {
    const items = await this.wishRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
      relations: ['owner', 'offers'],
    });
    protectPrivacyItems(items);
    return items;
  }

  async findTop() {
    const items = await this.wishRepository.find({
      take: 20,
      order: { copied: 'DESC' },
      relations: ['owner', 'offers'],
    });
    protectPrivacyItems(items);
    return items;
  }

  async findOne(itemId: number) {
    const item = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner', 'offers'],
    });
    if (!item) {
      throw new NotFoundException(
        `Подарок с ID ${itemId} не найден в базе данных!`,
      );
    }
    protectPrivacyUser(item.owner);
    return item;
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
        'Нельзя редактировать этот подарок, на него уже скидываются!',
      );
    }
    protectPrivacyUser(item.owner);
    this.wishRepository.update(itemId, updateWishDto);
  }

  async removeOne(itemId: number, currentUserId: number) {
    const item = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner', 'offers'],
    });
    if (!item) {
      throw new NotFoundException('Подарок не найден в базе данных!');
    }
    verifyOwner(item.owner.id, currentUserId, itemId);
    await this.wishRepository.delete({ id: itemId });
    protectPrivacyUser(item.owner);
    return item;
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
    protectPrivacyUser(user);
    const newItem = {
      ...originalWish,
      raised: 0,
      copied: 0,
      offers: [],
      owner: user,
    };
    return await this.wishRepository.save(newItem);
  }
}
