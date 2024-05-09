import {
  Injectable,
  NotFoundException,
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

  async create(createWishlistDto: CreateWishlistDto, currentUserId: number) {
    const wishlist = createWishlistDto;
    const owner = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!owner) {
      throw new NotFoundException(
        `Пользователь с ID ${currentUserId} не найден!`,
      );
    }
    let items = [];
    if (wishlist.itemsId) {
      items = await validateAndGetWishes(
        this.wishRepository,
        createWishlistDto,
        currentUserId,
      );
    }
    protectPrivacyUser(owner);
    const newWishlist = this.wishlistRepository.create({
      ...wishlist,
      owner,
      items,
    });
    await this.wishlistRepository.save(newWishlist);
    return newWishlist;
  }

  async findOne(wishlistId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException(
        `Список желаний с ID ${wishlistId} не найден!`,
      );
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
      throw new NotFoundException(`Список желаний ID ${wishlistId} не найден!`);
    }
    verifyOwner(wishlist.owner.id, currentUserId, wishlistId);
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
      throw new NotFoundException(
        `Список желаний с ID ${wishlistId} не найден!`,
      );
    }
    verifyOwner(wishlist.owner.id, currentUserId, wishlistId);
    await this.wishlistRepository.delete({ id: wishlistId });
    protectPrivacyUser(wishlist.owner);
    return wishlist;
  }
}
