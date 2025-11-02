import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFiltersDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string; // Alias for location

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxDistance?: number; // Maximum distance in kilometers

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minAge?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxAge?: number;

  @IsOptional()
  @IsArray()
  services?: string[];

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsString()
  hairColor?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minRating?: number;

  @IsOptional()
  @IsString()
  sortBy?: string; // 'rating', 'price', 'views', 'newest', 'distance'

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number;
}
