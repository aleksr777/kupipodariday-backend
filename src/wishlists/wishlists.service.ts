import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import {
  verifyOwner,
  protectPrivacyUser,
  protectPrivacyInArray,
} from '../utils/guard-utils';
import { updateProperties } from '../utils/update-properties';
import { validateAndGetWishes } from '../utils/wishes-utils';

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

  async findAll() {
    const wishlists = await this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });
    protectPrivacyInArray(wishlists);
    return wishlists;
  }

  async create(createWishlistDto: CreateWishlistDto, user: User) {
    let items = [];
    if (createWishlistDto.itemsId) {
      items = await validateAndGetWishes(
        this.wishRepository,
        createWishlistDto,
        user.id,
      );
    }
    protectPrivacyUser(user);
    try {
      const newWishlist = await this.wishlistRepository.save({
        ...createWishlistDto,
        owner: user,
        items: items,
      });
      return newWishlist;
    } catch {
      throw new InternalServerErrorException(
        `Ошибка сервера! Не удалось создать новый список желаний!`,
      );
    }
  }

  async findOne(wishlistId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException(`Список желаний не найден в базе данных!`);
    }
    protectPrivacyUser(wishlist.owner);
    return wishlist;
  }

  async updateOne(
    wishlistId: number,
    currentUserId: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException(`Список желаний не найден в базе данных!`);
    }
    verifyOwner(
      wishlist.owner.id,
      currentUserId,
      `Нельзя редактировать чужой список желаний!`,
    );
    if (updateWishlistDto.itemsId) {
      wishlist.items = await validateAndGetWishes(
        this.wishRepository,
        updateWishlistDto,
        currentUserId,
      );
    }
    updateProperties(wishlist, updateWishlistDto, [
      'name',
      'description',
      'image',
    ]);
    protectPrivacyUser(wishlist.owner);
    await this.wishlistRepository.save(wishlist);
    return wishlist;
  }

  async removeOne(wishlistId: number, currentUserId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException(`Список желаний не найден в базе данных!`);
    }
    try {
      verifyOwner(
        wishlist.owner.id,
        currentUserId,
        `Нельзя удалить чужой список желаний!`,
      );
      await this.wishlistRepository.delete({ id: wishlistId });
      protectPrivacyUser(wishlist.owner);
      return wishlist;
    } catch (err) {
      throw new InternalServerErrorException(
        `Ошибка сервера! Не удалось удалить список желаний!`,
      );
    }
  }
}
