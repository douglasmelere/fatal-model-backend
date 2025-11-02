import { IsString, IsOptional, IsObject } from 'class-validator';

export class RecommendationRequestDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsObject()
  budget_range?: {
    min: number;
    max: number;
  };

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
