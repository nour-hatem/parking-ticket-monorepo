import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@parking.com',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @ApiProperty({
    description: 'User account password',
    example: 'password123',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}
