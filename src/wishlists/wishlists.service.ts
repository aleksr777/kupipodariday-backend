import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  async findOne(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) {
      throw new NotFoundException(`Wishlist with ID ${id} not found`);
    }
    return wishlist;
  }

  async findAll(): Promise<Wishlist[]> {
    return await this.wishlistRepository.find();
  }

  async create(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    const wishlist = new Wishlist();
    wishlist.name = createWishlistDto.name;
    wishlist.description = createWishlistDto.description;
    wishlist.image = createWishlistDto.image;
    wishlist.items = createWishlistDto.items;
    return await this.wishlistRepository.save(wishlist);
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne(id);
    wishlist.name = updateWishlistDto.name || wishlist.name;
    wishlist.description =
      updateWishlistDto.description || wishlist.description;
    wishlist.image = updateWishlistDto.image || wishlist.image;
    wishlist.items = updateWishlistDto.items || wishlist.items;
    return await this.wishlistRepository.save(wishlist);
  }

  async removeOne(id: number): Promise<void> {
    const result = await this.wishlistRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Wishlist with ID ${id} not found`);
    }
  }
}
