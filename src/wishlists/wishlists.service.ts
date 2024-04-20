import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
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
      console.log(`Вишлист с ID:${id} не найден`);
      throw new NotFoundException(`Вишлист с ID:${id} не найден`);
    }
    return wishlist;
  }

  async findAll(): Promise<Wishlist[]> {
    return await this.wishlistRepository.find();
  }

  async create(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    const WishlistDto = this.wishlistRepository.create(createWishlistDto);
    return this.wishlistRepository
      .save(WishlistDto)
      .then((res) => {
        console.log(`Новый вишлист успешно создан`);
        return res;
      })
      .catch((err) => {
        console.log('Не удалось сохранить новое желание в базе данных.');
        throw new InternalServerErrorException(
          'Не удалось сохранить новый вишлист в базе данных.',
        );
      });
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
      console.log(`Вишлист с ID:${id} не найден`);
      throw new NotFoundException(`Вишлист с ID:${id} не найден`);
    } else {
      return await this.findOne(id);
    }
  }

  async removeOne(id: number): Promise<void> {
    const result = await this.wishlistRepository.delete({ id });
    if (result.affected === 0) {
      console.log(`Вишлист с ID:${id} не найден`);
      throw new NotFoundException(`Вишлист с ID:${id} не найден`);
    }
    console.log(`Вишлист с ID:${id} успешно удалён`);
  }
}
