import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export class LoginDto {
  @ApiProperty({ example: 'aivacol', minLength: 1, maxLength: 80 })
  nickname!: string;

  @ApiProperty({ example: 'aivacol', minLength: 1, maxLength: 120 })
  password!: string;
}

export const loginSchema = z
  .object({
    nickname: z.string().trim().min(1).max(80),
    password: z.string().min(1).max(120),
  })
  .strict();
