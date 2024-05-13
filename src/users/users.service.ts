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
import { ErrTextUsers } from '../constants/error-messages';

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
      throw new NotFoundException(ErrTextUsers.USER_NOT_FOUND);
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
        throw new NotFoundException(ErrTextUsers.SERVER_ERROR_UPDATE_USER);
      }
      delete updatedUser.password;
      return updatedUser;
    } catch (err) {
      switch (err?.code) {
        case '23505':
          throw new ConflictException(ErrTextUsers.CONFLICT_USER_EXISTS);
        case 'EntityNotFound':
          throw new NotFoundException(ErrTextUsers.USER_NOT_FOUND);
        default:
          throw new InternalServerErrorException(
            ErrTextUsers.SERVER_ERROR_UPDATE_USER,
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
        ? `${ErrTextUsers.NO_WISHES_FOUND_FOR_USER} ${username}!`
        : ErrTextUsers.NO_WISHES_FOUND;
      throw new NotFoundException(errorDetails);
    }
    return items;
  }

  async findUserByName(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(
        `${ErrTextUsers.USER_NOT_FOUND_BY_NAME} ${username}!`,
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
    if (!users.length) {
      throw new NotFoundException(ErrTextUsers.USERS_NOT_FOUND);
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
        throw new ConflictException(ErrTextUsers.CONFLICT_USER_EXISTS_SIMPLE);
      } else {
        throw new InternalServerErrorException(
          ErrTextUsers.SERVER_ERROR_SAVE_USER,
        );
      }
    }
  }

  async findWishesByName(username: string) {
    const owner = await this.userRepository.findOne({ where: { username } });
    if (!owner) {
      throw new NotFoundException(
        `${ErrTextUsers.USER_NOT_FOUND_BY_NAME} ${username}!`,
      );
    }
    const items = await this.getWishes(owner.id, username);
    return items;
  }
}
