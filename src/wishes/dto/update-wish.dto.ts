import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateWishDto } from './create-wish.dto';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @ApiProperty()
  price?: number;

  @ApiProperty()
  description?: string;
}
