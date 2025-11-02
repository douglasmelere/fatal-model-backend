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
import { AppointmentEntity } from './appointment.entity';

@Entity('reviews')
@Index(['escort_id', 'created_at'])
@Index(['client_id'])
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  appointment_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid' })
  escort_id: string;

  @Column({ type: 'int', default: 5 })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'boolean', default: false })
  is_anonymous: boolean;

  @Column({ type: 'text', nullable: true })
  response_from_escort: string;

  @Column({ type: 'timestamp', nullable: true })
  responded_at: Date;

  @Column({ type: 'boolean', default: false })
  is_verified_purchase: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => AppointmentEntity, (appointment) => appointment.review)
  @JoinColumn({ name: 'appointment_id' })
  appointment: AppointmentEntity;

  @ManyToOne(() => UserEntity, (user) => user.reviews_as_client)
  @JoinColumn({ name: 'client_id' })
  client: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.reviews_as_escort)
  @JoinColumn({ name: 'escort_id' })
  escort: UserEntity;
}
