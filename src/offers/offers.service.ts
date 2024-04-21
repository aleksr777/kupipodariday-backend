import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>
  ) {}

  async findOne(id: number): Promise<Offer> {
    const wish = await this.offerRepository.findOne({ where: { id } });
    if (!wish) {
      console.log(`Предложение скинуться с ID:${id} не найдено`);
      throw new NotFoundException(
        `Предложение скинуться с ID:${id} не найдено`,
      );
    }
    return wish;
  }

  async findAll(): Promise<Offer[]> {
    return await this.offerRepository.find();
  }

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    const offerDto = this.offerRepository.create(createOfferDto);
    return this.offerRepository
      .save(offerDto)
      .then((res) => {
        console.log(`Новое предложение скинуться успешно создано`);
        return res;
      })
      .catch((err) => {
        if (err?.code === '23503') {
          console.log(
            `Желание с ID:${offerDto.itemId} не найдено в базе данных.`,
          );
          throw new NotFoundException(
            `Желание с ID:${offerDto.itemId} не найдено в базе данных.`,
          );
        }
        console.log(
          'Не удалось сохранить новое предложение скинуться в базе данных.',
        );
        throw new InternalServerErrorException(
          'Не удалось сохранить новое предложение скинуться в базе данных.',
        );
      });
  }

  async removeOne(id: number): Promise<void> {
    const result = await this.offerRepository.delete({ id });
    if (result.affected === 0) {
      console.log(`Предложение скинуться с ID:${id} не найдено`);
      throw new NotFoundException(
        `Предложение скинуться с ID:${id} не найдено`,
      );
    }
    console.log(`Предложение скинуться с ID:${id} успешно удалено`);
  }
}
