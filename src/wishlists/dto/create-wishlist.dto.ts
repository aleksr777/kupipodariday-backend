import { ApiProperty } from '@nestjs/swagger';

export class CreateWishlistDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  items: number[];
}
