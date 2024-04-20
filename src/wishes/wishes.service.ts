import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async findOne(id: number) {
    console.log('findOne');
  }

  async findAll() {
    console.log('findAll');
  }

  async create(createWishDto: CreateWishDto) {
    console.log('create');
  }

  async updateOne(id: number, updateWishDto: UpdateWishDto) {
    console.log('updateOne');
  }

  async removeOne(id: number) {
    console.log('removeOne');
  }
}
