import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
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
    const userData = user;
    delete userData.email;
    delete userData.password;
    const wish = this.wishRepository.create({
      ...createWishDto,
      owner: userData,
    });
    this.wishRepository.save(wish);
  }

  async findLast() {
    const items = await this.wishRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
      relations: [
        'owner',
        'offers',
        'offers.user',
        'offers.user.items',
        'offers.user.offers',
        'offers.user.wishlists',
      ],
    });
    return items;
  }

  async findTop() {
    const items = await this.wishRepository.find({
      take: 20,
      order: { copied: 'DESC' },
      relations: [
        'owner',
        'offers',
        'offers.user',
        'offers.user.items',
        'offers.user.offers',
        'offers.user.wishlists',
      ],
    });
    return items;
  }

  async findOne(id: number) {
    const item = await this.wishRepository.findOne({
      where: { id },
      relations: [
        'owner',
        'offers',
        'offers.user',
        'offers.user.items',
        'offers.user.offers',
        'offers.user.wishlists',
      ],
    });
    if (!item) {
      throw new NotFoundException('Подарок не найден в базе данных!');
    }
    return item;
  }

  async updateOne(
    updateWishDto: UpdateWishDto,
    itemId: number,
    userId: number,
  ) {
    const item = await this.findOne(itemId);
    if (!item) {
      throw new NotFoundException('Подарок не найден в базе данных!');
    }
    if (userId !== item.owner.id) {
      throw new ForbiddenException('Нельзя редактировать чужой подарок!');
    }
    if (item.raised !== 0 && item.offers.length > 0) {
      throw new ForbiddenException(
        'Нельзя редактировать подарок, на него уже скидываются!',
      );
    }
    this.wishRepository.update(itemId, updateWishDto);
  }

  async removeOne(itemId: number, userId: number) {
    const item = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: [
        'owner',
        'offers',
        'offers.user',
        'offers.user.items',
        'offers.user.offers',
        'offers.user.wishlists',
      ],
    });
    if (!item) {
      throw new NotFoundException('Подарок не найден в базе данных!');
    }
    if (userId !== item.owner.id) {
      throw new ForbiddenException('Нельзя удалить чужой подарок!');
    }
    await this.wishRepository.delete({ id: itemId });
    return item;
  }

  async copyOne(itemId: number, user: User) {
    const originalItem = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner'],
    });
    if (!originalItem) {
      throw new NotFoundException('Запрашиваемый подарок не найден!');
    }
    if (user.id === originalItem.owner.id) {
      throw new ForbiddenException(
        'Вы не можете копировать свой собственный подарок!',
      );
    }
    await this.wishRepository.update(itemId, {
      copied: originalItem.copied + 1,
    });
    const newItem = {
      ...originalItem,
      raised: 0,
      copied: 0,
      owner: user,
      offers: [],
    };
    return await this.wishRepository.save(newItem);
  }

  async findMany(query: FindManyOptions<Wish>) {
    return this.wishRepository.find(query);
  }
}
