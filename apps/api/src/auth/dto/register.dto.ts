import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/index.js';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'officer@parking.com',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @ApiProperty({
    description: 'User password (min 6 characters)',
    example: 'password123',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'Parking Officer',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'User role in the system',
    enum: Role,
    example: Role.OPERATOR,
  })
  @IsEnum(Role, { message: 'Role must be ADMIN, OPERATOR, or USER' })
  @IsOptional()
  role?: Role;
}
