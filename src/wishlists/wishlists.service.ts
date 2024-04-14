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
    return await this.wishlistRepository.save(createWishlistDto);
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const result = await this.wishlistRepository.update(
      { id },
      updateWishlistDto,
    );
    if (result.affected === 0) {
      throw new NotFoundException(`Wishlist with ID ${id} not found`);
    } else {
      return await this.findOne(id);
    }
  }

  async removeOne(id: number): Promise<void> {
    const result = await this.wishlistRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Wishlist with ID ${id} not found`);
    }
  }
}
