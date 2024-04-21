import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../hash/hash.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private hashService: HashService,
    private usersService: UsersService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findByName(username);
    if (user) {
      if (await this.hashService.isPasswordCorrect(password, user.password)) {
        const { password, ...result } = user;
        return result;
      } else
        throw new UnauthorizedException(
          'Неверно введены логин или пароль',
        );
    }
    return null;
  }
}
