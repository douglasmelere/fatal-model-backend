import { IsString, IsOptional } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  transaction_id: string;

  @IsOptional()
  @IsString()
  confirmation_notes?: string;
}
