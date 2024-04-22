import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    ownerId: number,
  ): Promise<Wishlist> {
    const { itemsId, ...rest } = createWishlistDto;
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException(
        `Пользователь с идентификатором ${ownerId} не найден.`,
      );
    }
    const items = itemsId
      ? await this.wishRepository.findBy({ id: In(itemsId) })
      : [];
    const wishlist = this.wishlistRepository.create({
      ...rest,
      owner,
      items,
    });
    await this.wishlistRepository.save(wishlist);
    return wishlist;
  }

  async findAll(): Promise<Wishlist[]> {
    const wishlist = await this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });
    return wishlist;
  }

  async findOne(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: id },
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException(`Список желаний с ID:${id} не найден.`);
    }
    return wishlist;
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) {
      throw new NotFoundException(`Список желаний ID:${id} не найден.`);
    }
    if (updateWishlistDto.itemsId) {
      const items = await this.wishRepository.findBy({
        id: In(updateWishlistDto.itemsId),
      });
      if (items.length !== updateWishlistDto.itemsId.length) {
        throw new NotFoundException(
          `Не все желания с ID:[${updateWishlistDto.itemsId.join(
            ', ',
          )}] найдены.`,
        );
      }
      wishlist.items = items;
    }
    if (updateWishlistDto.name) {
      wishlist.name = updateWishlistDto.name;
    }
    if (updateWishlistDto.image) {
      wishlist.image = updateWishlistDto.image;
    }
    await this.wishlistRepository.save(wishlist);
    return wishlist;
  }

  async removeOne(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) {
      throw new NotFoundException(`Список желаний с ID:${id} не найден.`);
    }
    await this.wishlistRepository.remove(wishlist);
    return wishlist;
  }
}
