import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { AppointmentEntity } from './appointment.entity';
import { MessageEntity } from './message.entity';

@Entity('conversations')
@Index(['booking_id'], { unique: true })
@Index(['client_id', 'escort_id'])
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid' })
  escort_id: string;

  @Column({ type: 'uuid', unique: true })
  booking_id: string; // Vincula a conversa a um booking específico

  @Column({ type: 'timestamp', nullable: true })
  last_message_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => UserEntity, (user) => user.conversations_as_client)
  @JoinColumn({ name: 'client_id' })
  client: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.conversations_as_escort)
  @JoinColumn({ name: 'escort_id' })
  escort: UserEntity;

  @ManyToOne(() => AppointmentEntity, (appointment) => appointment.conversation)
  @JoinColumn({ name: 'booking_id' })
  booking: AppointmentEntity;

  @OneToMany(() => MessageEntity, (message) => message.conversation, {
    cascade: true,
  })
  messages: MessageEntity[];
}

