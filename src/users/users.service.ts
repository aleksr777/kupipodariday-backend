import { Like } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { HashService } from '../hash/hash.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    private hashService: HashService,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Пользователь c ID:${id} не найден`);
    }
    return user;
  }

  async findByName(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user;
  }

  async findByQuery(queryUserDto: QueryUserDto): Promise<User[]> {
    const query = queryUserDto.query;
    const users = this.userRepository.find({
      where: [
        { email: query },
        { username: Like(`%${query}%`) },
        { about: Like(`%${query}%`) },
      ],
    });
    if (!users) {
      throw new NotFoundException(`Пользователи не найдены`);
    }
    return users;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashService.getHash(
      createUserDto.password,
    );
    createUserDto.password = hashedPassword;
    const userDto = this.userRepository.create(createUserDto);
    return this.userRepository
      .save(userDto)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        if (err?.code === '23505') {
          throw new ConflictException(
            'Пользователь с такими уникальными данными уже существует.',
          );
        }
        throw new InternalServerErrorException(
          'Не удалось сохранить нового пользователя в базе данных.',
        );
      });
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const result = await this.userRepository.update({ id }, updateUserDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Пользователь с ID:${id} не найден`);
    } else {
      return await this.userRepository.findOne({ where: { id } });
    }
  }

  async getWishes(userId: number) {
    const wishes = await this.wishRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
    });
    return wishes;
  }

  async getAnotherUserWishes(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`Пользователь ${username} не найден`);
    }
    const wishes = await this.getWishes(user.id);
    return wishes;
  }

  async removeOne(id: number): Promise<void> {
    const result = await this.userRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Пользователь с ID:${id} не найден`);
    }
  }
}
