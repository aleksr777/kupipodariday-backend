import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateWishlistDto } from './create-wishlist.dto';
import { Wish } from '../../wishes/entities/wish.entity';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  itemsID: number[] | Wish[];
}
