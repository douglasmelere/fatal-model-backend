"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChatTables1700000000002 = void 0;
const typeorm_1 = require("typeorm");
class CreateChatTables1700000000002 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TYPE "message_type_enum" AS ENUM('TEXT', 'IMAGE', 'SYSTEM');
    `);
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
        await queryRunner.createIndex('conversations', new typeorm_1.TableIndex({
            name: 'IDX_conversations_booking_id',
            columnNames: ['booking_id'],
            isUnique: true,
        }));
        await queryRunner.createIndex('conversations', new typeorm_1.TableIndex({
            name: 'IDX_conversations_client_escort',
            columnNames: ['client_id', 'escort_id'],
        }));
        await queryRunner.createForeignKey('conversations', new typeorm_1.TableForeignKey({
            columnNames: ['client_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('conversations', new typeorm_1.TableForeignKey({
            columnNames: ['escort_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('conversations', new typeorm_1.TableForeignKey({
            columnNames: ['booking_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'appointments',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
        await queryRunner.createIndex('messages', new typeorm_1.TableIndex({
            name: 'IDX_messages_conversation_created',
            columnNames: ['conversation_id', 'created_at'],
        }));
        await queryRunner.createIndex('messages', new typeorm_1.TableIndex({
            name: 'IDX_messages_sender_id',
            columnNames: ['sender_id'],
        }));
        await queryRunner.createForeignKey('messages', new typeorm_1.TableForeignKey({
            columnNames: ['conversation_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'conversations',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('messages', new typeorm_1.TableForeignKey({
            columnNames: ['sender_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
    }
    async down(queryRunner) {
        const messagesTable = await queryRunner.getTable('messages');
        if (messagesTable) {
            const foreignKeys = messagesTable.foreignKeys;
            for (const fk of foreignKeys) {
                await queryRunner.dropForeignKey('messages', fk);
            }
        }
        await queryRunner.dropIndex('messages', 'IDX_messages_conversation_created');
        await queryRunner.dropIndex('messages', 'IDX_messages_sender_id');
        await queryRunner.dropTable('messages');
        const conversationsTable = await queryRunner.getTable('conversations');
        if (conversationsTable) {
            const foreignKeys = conversationsTable.foreignKeys;
            for (const fk of foreignKeys) {
                await queryRunner.dropForeignKey('conversations', fk);
            }
        }
        await queryRunner.dropIndex('conversations', 'IDX_conversations_booking_id');
        await queryRunner.dropIndex('conversations', 'IDX_conversations_client_escort');
        await queryRunner.dropTable('conversations');
        await queryRunner.query(`DROP TYPE IF EXISTS "message_type_enum"`);
    }
}
exports.CreateChatTables1700000000002 = CreateChatTables1700000000002;
//# sourceMappingURL=1700000000002-CreateChatTables.js.map