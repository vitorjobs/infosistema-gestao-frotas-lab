import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'aivacol' })
  nickname!: string;

  @ApiProperty({ example: 'Aivacol Admin' })
  name!: string;

  @ApiProperty({ example: 'aivacol@example.com' })
  email!: string;

  @ApiProperty({ example: 'system' })
  created_by!: string;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;
}
