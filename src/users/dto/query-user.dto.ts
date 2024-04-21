import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

export class QueryUserDto {
  @ApiProperty()
  @MinLength(2)
  query: string;
}
