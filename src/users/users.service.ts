import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: number) {
    console.log('findOne');
  }

  async findAll() {
    console.log('findAll');
  }

  async create(createUserDto: CreateUserDto) {
    console.log('create');
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    console.log('updateOne');
  }

  async removeOne(id: number) {
    console.log('removeOne');
  }
}
