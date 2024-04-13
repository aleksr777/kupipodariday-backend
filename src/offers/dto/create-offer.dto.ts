import { IsNumber, IsString, IsBoolean } from 'class-validator';

export class CreateOfferDto {
  constructor(partial: Partial<CreateOfferDto>) {
    Object.assign(this, partial);
    if (!isNaN(this.amount)) {
      this.amount = parseFloat(this.amount.toFixed(2)); // Округляем до двух знаков после запятой
    }
  }

  @IsNumber()
  user: number;

  @IsString()
  item: string;

  @IsNumber()
  amount: number;

  @IsBoolean()
  hidden?: boolean;
}
