import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../../database/entities';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  first_name?: string;

  @IsString()
  last_name?: string;
}
