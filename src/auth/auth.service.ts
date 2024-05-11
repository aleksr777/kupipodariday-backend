import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../hash/hash.service';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private hashService: HashService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      if (await this.hashService.isPasswordCorrect(password, user.password)) {
        const { password, ...result } = user;
        return result;
      } else
        throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }
    return null;
  }
}
