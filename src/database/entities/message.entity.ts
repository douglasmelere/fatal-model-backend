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
import { ConversationEntity } from './conversation.entity';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM', // Para notificações automáticas
}

@Entity('messages')
@Index(['conversation_id', 'created_at'])
@Index(['sender_id'])
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conversation_id: string;

  @Column({ type: 'uuid' })
  sender_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  message_type: MessageType;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Para imagens, arquivos, etc.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;
}

