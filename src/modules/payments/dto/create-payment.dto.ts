import { IsUUID, IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '../../../database/entities';

export class CreatePaymentDto {
  @IsUUID()
  escort_id: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @IsOptional()
  @IsUUID()
  appointment_id?: string;
}
