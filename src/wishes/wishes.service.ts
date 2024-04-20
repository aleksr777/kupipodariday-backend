import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
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
      console.log(`Желание с ID:${id} не найдено`);
      throw new NotFoundException(`Желание с ID:${id} не найдено`);
    }
    return wish;
  }

  async findAll(): Promise<Wish[]> {
    return await this.wishRepository.find();
  }

  async create(createWishDto: CreateWishDto): Promise<Wish> {
    const wishDto = this.wishRepository.create(createWishDto);
    return this.wishRepository
      .save(wishDto)
      .then((res) => {
        console.log(`Новый пользователь успешно создан`);
        return res;
      })
      .catch((err) => {
        console.log('Не удалось сохранить новое желание в базе данных.');
        throw new InternalServerErrorException(
          'Не удалось сохранить новое желание в базе данных.',
        );
      });
  }

  async updateOne(id: number, updateWishDto: UpdateWishDto): Promise<Wish> {
    const result = await this.wishRepository.update({ id }, updateWishDto);
    if (result.affected === 0) {
      console.log(`Желание с ID:${id} не найдено`);
      throw new NotFoundException(`Желание с ID:${id} не найдено`);
    } else {
      return await this.findOne(id);
    }
  }

  async removeOne(id: number): Promise<void> {
    const result = await this.wishRepository.delete({ id });
    if (result.affected === 0) {
      console.log(`Желание с ID:${id} не найдено`);
      throw new NotFoundException(`Желание с ID:${id} не найдено`);
    }
    console.log(`Желание с ID:${id} успешно удалено`);
  }
}
