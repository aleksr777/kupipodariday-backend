import { IsNumber, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOfferDto {
  @IsNumber()
  user: number;

  @IsString()
  item: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value).toFixed(2))
  amount: number;

  @IsBoolean()
  hidden?: boolean = false;
}
