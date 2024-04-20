import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      console.log(`Пользователь ${username} не найден`);
      throw new NotFoundException(`Пользователь ${username} не найден`);
    }
    return user;
  }

  async findByQuery(query: string): Promise<User[]> {
    const users = this.userRepository.find({ where: { username: query } });
    if (!users) {
      console.log(`Пользователи не найдены`);
      throw new NotFoundException(`Пользователи не найдены`);
    }
    return users;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userDto = this.userRepository.create(createUserDto);
    return this.userRepository
      .save(userDto)
      .then((res) => {
        console.log(`Новый пользователь успешно создан`);
        return res;
      })
      .catch((err) => {
        if (err?.code === '23505') {
          console.log(
            'Пользователь с такими уникальными данными уже существует.',
          );
          throw new ConflictException(
            'Пользователь с такими уникальными данными уже существует.',
          );
        }
        console.log('Не удалось сохранить нового пользователя в базе данных.');
        throw new InternalServerErrorException(
          'Не удалось сохранить нового пользователя в базе данных.',
        );
      });
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const result = await this.userRepository.update({ id }, updateUserDto);
    if (result.affected === 0) {
      console.log(`Пользователь с ID:${id} не найден`);
      throw new NotFoundException(`Пользователь с ID:${id} не найден`);
    } else {
      console.log(`Пользователь с ID:${id} успешно уобновлён`);
      return await this.userRepository.findOne({ where: { id } });
    }
  }

  async removeOne(id: number): Promise<void> {
    const result = await this.userRepository.delete({ id });
    if (result.affected === 0) {
      console.log(`Пользователь с ID:${id} не найден`);
      throw new NotFoundException(`Пользователь с ID:${id} не найден`);
    }
    console.log(`Пользователь с ID:${id} успешно удалён`);
  }

  async updateProfile(updateUserDto: UpdateUserDto) {
    console.log(`Обновление данных профиля`);
  }

  async getOwnUser() {
    console.log(`Получение данных профиля`);
  }

  async getOwnWishes() {
    console.log(`Получение пожеланий профиля`);
  }

  async getAnotherUserWishes(username: string) {
    console.log(`Получение пожеланий пользователя`);
  }
}
