import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Vehicle license plate number',
    example: 'EGY-1001',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{1,3}-\d{1,4}$/, {
    message: 'plate must be in format ABC-1234 (1-3 uppercase letters, hyphen, 1-4 numbers)',
  })
  plate: string;
}
