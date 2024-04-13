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

  async findOne(id: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({ where: { id } });
    if (!wish) {
      throw new NotFoundException(`Wish with ID ${id} not found`);
    }
    return wish;
  }

  async findAll(): Promise<Wish[]> {
    return await this.wishRepository.find();
  }

  async create(createWishDto: CreateWishDto): Promise<Wish> {
    const createdWish = await this.wishRepository.save(createWishDto);
    return createdWish;
  }

  async updateOne(id: number, updateWishDto: UpdateWishDto): Promise<Wish> {
    const existingWish = await this.findOne(id);
    if (!existingWish) {
      throw new NotFoundException(`Wish with ID ${id} not found`);
    }
    await this.wishRepository.update({ id }, updateWishDto);
    return this.findOne(id);
  }

  async removeOne(id: number): Promise<void> {
    const result = await this.wishRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Wish with ID ${id} not found`);
    }
  }
}
