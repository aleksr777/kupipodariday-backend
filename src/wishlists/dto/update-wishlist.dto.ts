import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateWishlistDto } from './create-wishlist.dto';
import { IsInt, IsArray, IsOptional } from 'class-validator';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  image?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  itemsId?: number[];
}
