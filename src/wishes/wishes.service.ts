import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async findOne(id: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: [
        'owner',
        'offers',
        'offers.user',
        'offers.user.wishes',
        'offers.user.offers',
        'offers.user.wishlists',
      ],
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден в базе данных!');
    }
    return wish;
  }

  async findLast() {
    const wishes = await this.wishRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
    });
    return wishes;
  }

  async findTop() {
    const wishes = await this.wishRepository.find({
      take: 20,
      order: { copied: 'DESC' },
    });
    return wishes;
  }

  async createOne(user: User, createWishDto: CreateWishDto) {
    delete user.email;
    delete user.password;
    const wish = this.wishRepository.create({
      ...createWishDto,
      owner: user,
    });
    return this.wishRepository.save(wish);
  }

  async updateOne(
    updateWishDto: UpdateWishDto,
    wishId: number,
    userId: number,
  ) {
    const wish = await this.findOne(wishId);
    if (!wish) {
      throw new NotFoundException('Подарок не найден в базе данных!');
    }
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Нельзя редактировать чужой подарок!');
    }
    if (wish.raised !== 0 && wish.offers.length > 0) {
      throw new ForbiddenException(
        'Нельзя редактировать подарок, на него уже скидываются!',
      );
    }
    await this.wishRepository.update(wishId, updateWishDto);
  }

  async removeOne(wishId: number, userId: number) {
    const wish = await this.findOne(wishId);
    if (!wish) {
      throw new NotFoundException('Подарок не найден в базе данных!');
    }
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Нельзя удалить чужой подарок!');
    }
    await this.wishRepository.delete({ id: wishId });
  }

  async copyOne(wishId: number, user: User) {
    const originalWish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });
    if (!originalWish) {
      throw new NotFoundException('Запрашиваемый подарок не найден!');
    }
    if (user.id === originalWish.owner.id) {
      throw new ForbiddenException(
        'Вы не можете копировать свой собственный подарок!',
      );
    }
    await this.wishRepository.update(wishId, {
      copied: originalWish.copied + 1,
    });
    const newWish = {
      ...originalWish,
      raised: 0,
      copied: 0,
      owner: user,
      offers: [],
    };
    return await this.wishRepository.save(newWish);
  }
}
