import { PartialType } from '@nestjs/swagger';
import { CreateWishlistDto } from './create-wishlist.dto';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsString()
  @MaxLength(1500)
  description: string;

  @IsString()
  image: string;

  @IsString({ each: true })
  items: string[];
}
