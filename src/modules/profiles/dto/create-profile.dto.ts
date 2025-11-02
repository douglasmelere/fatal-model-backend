import { IsString, IsOptional, IsInt, IsArray, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProfileDto {
  @IsString()
  display_name: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
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
  pricing?: Record<string, any>; // Accept any JSON object to allow flexible pricing fields

  @IsOptional()
  @IsString()
  pix_key?: string;

  @IsOptional()
  @IsString()
  pix_key_type?: string;
}
