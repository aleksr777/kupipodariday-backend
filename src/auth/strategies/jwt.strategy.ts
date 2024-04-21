import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt_secret') || 'jwt_secret',
    });
  }

  async validate(jwtPayload: { sub: number }) {
    const user = await this.usersService.findOne(jwtPayload.sub);
    if (!user) {
      throw new UnauthorizedException('Авторизация не пройдена');
    }
    return user;
  }
}
