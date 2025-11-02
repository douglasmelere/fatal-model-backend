import { IsString, IsOptional, IsInt, IsArray, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProfileDto {
  @IsString()
  display_name: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  hair_color?: string;

  @IsOptional()
  @IsString()
  eye_color?: string;

  @IsOptional()
  @IsString()
  body_type?: string;

  @IsOptional()
  @IsString()
  ethnicity?: string;

  @IsOptional()
  @IsArray()
  services_offered?: string[];

  @IsOptional()
  @IsObject()
  pricing?: {
    hourly_rate: number;
    package_rates?: Record<string, number>;
    minimum_duration?: number;
  };

  @IsOptional()
  @IsString()
  pix_key?: string;

  @IsOptional()
  @IsString()
  pix_key_type?: string;
}
