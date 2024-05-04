import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  hidden: boolean;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  itemId: number;
}
