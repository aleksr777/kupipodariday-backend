import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  username?: string;

  @ApiProperty()
  about?: string;

  @ApiProperty()
  avatar?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  password?: string;
}
