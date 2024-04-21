import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateWishDto } from './create-wish.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  link?: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  price?: number;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  raised?: number;
}
