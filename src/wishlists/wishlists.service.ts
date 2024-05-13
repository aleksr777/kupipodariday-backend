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
import { ErrTextWishlists } from '../constants/error-messages';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
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
        ErrTextWishlists.SERVER_ERROR_CREATE_WISHLIST,
      );
    }
  }

  async findOne(wishlistId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException(ErrTextWishlists.WISHLIST_NOT_FOUND);
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
      throw new NotFoundException(ErrTextWishlists.WISHLIST_NOT_FOUND);
    }
    verifyOwner(
      wishlist.owner.id,
      currentUserId,
      ErrTextWishlists.CANNOT_EDIT_FOREIGN_WISHLIST,
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
      throw new NotFoundException(ErrTextWishlists.WISHLIST_NOT_FOUND);
    }
    try {
      verifyOwner(
        wishlist.owner.id,
        currentUserId,
        ErrTextWishlists.CANNOT_DELETE_FOREIGN_WISHLIST,
      );
      await this.wishlistRepository.delete({ id: wishlistId });
      protectPrivacyUser(wishlist.owner);
      return wishlist;
    } catch (err) {
      throw new InternalServerErrorException(
        ErrTextWishlists.SERVER_ERROR_DELETE_WISHLIST,
      );
    }
  }
}
