import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Role, { message: 'Role must be ADMIN, OPERATOR, or USER' })
  @IsOptional()
  role?: Role;
}
