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

  async findOne(id: number) {
    console.log('findOne');
  }

  async findAll() {
    console.log('findAll');
  }

  async create(createWishlistDto: CreateWishlistDto) {
    console.log('create');
  }

  async updateOne(id: number, updateWishlistDto: UpdateWishlistDto) {
    console.log('updateOne');
  }

  async removeOne(id: number) {
    console.log('removeOne');
  }
}
