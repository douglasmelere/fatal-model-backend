import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { AppointmentEntity } from './appointment.entity';
import { PaymentEntity } from './payment.entity';
import { ReviewEntity } from './review.entity';
import { ConversationEntity } from './conversation.entity';

export enum UserRole {
  CLIENT = 'CLIENT',
  ESCORT = 'ESCORT',
  ADMIN = 'ADMIN',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['status'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verification_status: VerificationStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: false })
  phone_verified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_name: string;

  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'boolean', default: true })
  email_notifications: boolean;

  @Column({ type: 'boolean', default: true })
  sms_notifications: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => ProfileEntity, (profile) => profile.user, {
    cascade: true,
    nullable: true,
  })
  profile: ProfileEntity;

  @OneToMany(() => AppointmentEntity, (appointment) => appointment.client)
  appointments_as_client: AppointmentEntity[];

  @OneToMany(() => AppointmentEntity, (appointment) => appointment.escort)
  appointments_as_escort: AppointmentEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.client)
  payments_as_client: PaymentEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.escort)
  payments_as_escort: PaymentEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.client)
  reviews_as_client: ReviewEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.escort)
  reviews_as_escort: ReviewEntity[];

  @OneToMany(
    () => ConversationEntity,
    (conversation) => conversation.client,
  )
  conversations_as_client: ConversationEntity[];

  @OneToMany(
    () => ConversationEntity,
    (conversation) => conversation.escort,
  )
  conversations_as_escort: ConversationEntity[];
}
