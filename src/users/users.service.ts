import { Like } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { protectPrivacyUser } from '../utils/guard-utils';
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

  async findUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Пользователь не найден в базе данных!`);
    }
    protectPrivacyUser(user);
    return user;
  }

  async updateUser(
    currentUserId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await this.hashService.getHash(
          updateUserDto.password,
        );
      }
      const updatedUser = await this.userRepository.save({
        id: currentUserId,
        ...updateUserDto,
      });
      if (!updatedUser) {
        throw new NotFoundException(`Пользователь не найден в базе данных!`);
      }
      delete updatedUser.password;
      return updatedUser;
    } catch (err) {
      switch (err?.code) {
        case '23505':
          throw new ConflictException(
            'Пользователь с такими уникальными данными уже существует в базе данных!',
          );
        case 'EntityNotFound':
          throw new NotFoundException(`Пользователь не найден в базе данных!`);
        default:
          throw new InternalServerErrorException(
            `Не удалось обновить данные пользователя в базе данных!`,
          );
      }
    }
  }

  async getWishes(userId: number, username?: string) {
    const items = await this.wishRepository.find({
      where: { owner: { id: userId } },
      relations: ['offers'],
    });
    if (!items) {
      const errorDetails = username
        ? `У пользователя ${username} не найдены желания в базе данных!`
        : `У текущего пользователя не найдены  желания в базе данных!`;
      throw new NotFoundException(errorDetails);
    }
    return items;
  }

  async findUserByName(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(
        `Пользователь ${username} не найден в базе данных!`,
      );
    }
    protectPrivacyUser(user);
    return user;
  }

  async findUsersByQuery(queryUserDto: QueryUserDto): Promise<User[]> {
    const query = queryUserDto.query;
    const users = await this.userRepository.find({
      where: [
        { email: query },
        { username: Like(`%${query}%`) },
        { about: Like(`%${query}%`) },
      ],
    });
    if (!users) {
      throw new NotFoundException(`Пользователи не найдены в базе данных!`);
    }
    users.forEach((user) => {
      if (user) {
        delete user.password;
      }
    });
    return users;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await this.hashService.getHash(
        createUserDto.password,
      );
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      const savedUser = await this.userRepository.save(newUser);
      protectPrivacyUser(savedUser);
      return savedUser;
    } catch (err) {
      if (err?.code === '23505') {
        throw new ConflictException(
          'Пользователь с такими уникальными данными уже существует!',
        );
      } else {
        throw new InternalServerErrorException(
          'Не удалось сохранить нового пользователя в базе данных!',
        );
      }
    }
  }

  async findWishesByName(username: string) {
    const owner = await this.userRepository.findOne({ where: { username } });
    if (!owner) {
      throw new NotFoundException(
        `Пользователь ${username} не найден в базе данных!`,
      );
    }
    const items = await this.getWishes(owner.id, username);
    return items;
  }
}
