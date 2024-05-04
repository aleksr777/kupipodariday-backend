import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsArray, IsOptional } from 'class-validator';

export class CreateWishlistDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  description: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  itemsId: number[];
}
