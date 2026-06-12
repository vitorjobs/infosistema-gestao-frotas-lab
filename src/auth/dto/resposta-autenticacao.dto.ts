import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: 1 })
  sub!: number;

  @ApiProperty({ example: 'aivacol' })
  nickname!: string;

  @ApiProperty({ example: 'aivacol@example.com' })
  email!: string;

  @ApiProperty({ example: 'Aivacol Admin' })
  name!: string;
}

export class AuthLoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT usado no header Authorization como Bearer token.',
  })
  access_token!: string;

  @ApiProperty({ example: 'Bearer' })
  token_type!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}
