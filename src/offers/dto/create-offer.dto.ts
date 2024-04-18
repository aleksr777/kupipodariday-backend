import { ApiProperty } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  hidden?: boolean;
}
