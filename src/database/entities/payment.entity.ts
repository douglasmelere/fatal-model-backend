import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

@Entity('payments')
@Index(['escort_id', 'status', 'created_at'])
@Index(['client_id', 'status'])
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid' })
  escort_id: string;

  @Column({ type: 'uuid', nullable: true })
  appointment_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.PIX,
  })
  payment_method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // PIX Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  pix_key: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pix_key_type: string; // 'CPF', 'CNPJ', 'EMAIL', 'PHONE'

  @Column({ type: 'text', nullable: true })
  qr_code: string; // Base64 encoded QR code image

  @Column({ type: 'text', nullable: true })
  pix_copy_paste: string; // Copy-paste string for PIX

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_id: string; // PIX transaction ID

  // Payment Proof
  @Column({ type: 'text', nullable: true })
  payment_proof_image: string; // URL to proof image

  @Column({ type: 'boolean', default: false })
  confirmed_by_escort: boolean;

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at: Date;

  @Column({ type: 'text', nullable: true })
  confirmation_notes: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => UserEntity, (user) => user.payments_as_client)
  @JoinColumn({ name: 'client_id' })
  client: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.payments_as_escort)
  @JoinColumn({ name: 'escort_id' })
  escort: UserEntity;
}
