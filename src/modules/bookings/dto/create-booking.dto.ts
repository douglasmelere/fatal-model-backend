import { IsUUID, IsDateString, IsInt, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  escort_id: string;

  @IsDateString()
  scheduled_date: string;

  @IsInt()
  duration: number; // in minutes

  @IsOptional()
  @IsString()
  service_type?: string;

  @IsNumber()
  total_price: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  special_requests?: string;
}
