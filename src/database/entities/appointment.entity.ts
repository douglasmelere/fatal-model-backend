import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PaymentEntity } from './payment.entity';
import { ReviewEntity } from './review.entity';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

@Entity('appointments')
@Index(['escort_id', 'scheduled_date', 'status'])
@Index(['client_id', 'status'])
export class AppointmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid' })
  escort_id: string;

  @Column({ type: 'timestamp' })
  scheduled_date: Date;

  @Column({ type: 'int' })
  duration: number; // in minutes

  @Column({ type: 'varchar', length: 255, nullable: true })
  service_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  special_requests: string;

  @Column({ type: 'uuid', nullable: true })
  payment_id: string;

  @Column({ type: 'uuid', nullable: true })
  review_id: string;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => UserEntity, (user) => user.appointments_as_client)
  @JoinColumn({ name: 'client_id' })
  client: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.appointments_as_escort)
  @JoinColumn({ name: 'escort_id' })
  escort: UserEntity;

  @ManyToOne(() => PaymentEntity, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  @OneToOne(() => ReviewEntity, (review) => review.appointment, {
    nullable: true,
  })
  review: ReviewEntity;
}
