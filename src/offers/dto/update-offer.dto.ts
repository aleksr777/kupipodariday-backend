import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateOfferDto } from './create-offer.dto';

export class UpdateOfferDto extends PartialType(CreateOfferDto) {
  @ApiProperty()
  amount?: number;

  @ApiProperty()
  hidden?: boolean;
}
