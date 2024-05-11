import { ApiProperty } from '@nestjs/swagger';

export class CreateWishDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  link: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  copied: number;
}
