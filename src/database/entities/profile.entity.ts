import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('profiles')
@Index(['user_id'])
@Index(['location', 'is_verified'])
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  // Physical Attributes
  @Column({ type: 'varchar', length: 50, nullable: true })
  height: string; // e.g., "1.65m"

  @Column({ type: 'varchar', length: 50, nullable: true })
  weight: string; // e.g., "55kg"

  @Column({ type: 'varchar', length: 50, nullable: true })
  hair_color: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  eye_color: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  body_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ethnicity: string;

  // Services and Pricing
  @Column({ type: 'simple-array', default: [] })
  services_offered: string[];

  @Column({ type: 'jsonb', nullable: true })
  pricing: {
    hourly_rate: number;
    package_rates?: Record<string, number>;
    minimum_duration?: number;
  };

  // Availability
  @Column({ type: 'jsonb', nullable: true })
  availability_calendar: Record<string, boolean>;

  // Payment Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  pix_key: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pix_key_type: string; // 'CPF', 'CNPJ', 'EMAIL', 'PHONE'

  // Photos
  @Column({ type: 'simple-array', default: [] })
  photos: string[]; // URLs to photos

  @Column({ type: 'varchar', length: 255, nullable: true })
  main_photo: string;

  // Verification
  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  // Statistics
  @Column({ type: 'int', default: 0 })
  total_views: number;

  @Column({ type: 'int', default: 0 })
  total_bookings: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  average_rating: number;

  @Column({ type: 'int', default: 0 })
  total_reviews: number;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
