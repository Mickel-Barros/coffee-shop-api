import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../../domain/enums/role.enum.js';

export class SignupDto {
  @ApiProperty({
    description: 'User email address',
    example: 'customer@coffee.com',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Coffee',
    minLength: 3,
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must have at least 3 characters' })
  name!: string;

  @ApiProperty({
    description: 'User password',
    example: 'strongPassword123',
    minLength: 6,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must have at least 6 characters' })
  password!: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    enumName: 'UserRole',
    example: Role.CUSTOMER,
    required: false,
  })
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role;
}
