import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateChatTables1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create message_type enum
    await queryRunner.query(`
      CREATE TYPE "message_type_enum" AS ENUM('TEXT', 'IMAGE', 'SYSTEM');
    `);

    // Create conversations table
    await queryRunner.createTable(
      new Table({
        name: 'conversations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'client_id',
            type: 'uuid',
          },
          {
            name: 'escort_id',
            type: 'uuid',
          },
          {
            name: 'booking_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'last_message_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create indexes for conversations
    await queryRunner.createIndex(
      'conversations',
      new TableIndex({
        name: 'IDX_conversations_booking_id',
        columnNames: ['booking_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'conversations',
      new TableIndex({
        name: 'IDX_conversations_client_escort',
        columnNames: ['client_id', 'escort_id'],
      }),
    );

    // Create foreign keys for conversations
    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        columnNames: ['client_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        columnNames: ['escort_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        columnNames: ['booking_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'appointments',
        onDelete: 'CASCADE',
      }),
    );

    // Create messages table
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'conversation_id',
            type: 'uuid',
          },
          {
            name: 'sender_id',
            type: 'uuid',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'message_type',
            type: 'enum',
            enum: ['TEXT', 'IMAGE', 'SYSTEM'],
            default: "'TEXT'",
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'read_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create indexes for messages
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_messages_conversation_created',
        columnNames: ['conversation_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_messages_sender_id',
        columnNames: ['sender_id'],
      }),
    );

    // Create foreign keys for messages
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['conversation_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conversations',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['sender_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys for messages
    const messagesTable = await queryRunner.getTable('messages');
    if (messagesTable) {
      const foreignKeys = messagesTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('messages', fk);
      }
    }

    // Drop indexes for messages
    await queryRunner.dropIndex('messages', 'IDX_messages_conversation_created');
    await queryRunner.dropIndex('messages', 'IDX_messages_sender_id');

    // Drop messages table
    await queryRunner.dropTable('messages');

    // Drop foreign keys for conversations
    const conversationsTable = await queryRunner.getTable('conversations');
    if (conversationsTable) {
      const foreignKeys = conversationsTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('conversations', fk);
      }
    }

    // Drop indexes for conversations
    await queryRunner.dropIndex(
      'conversations',
      'IDX_conversations_booking_id',
    );
    await queryRunner.dropIndex(
      'conversations',
      'IDX_conversations_client_escort',
    );

    // Drop conversations table
    await queryRunner.dropTable('conversations');

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "message_type_enum"`);
  }
}

