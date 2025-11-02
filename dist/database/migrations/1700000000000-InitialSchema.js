"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1700000000000 = void 0;
const typeorm_1 = require("typeorm");
class InitialSchema1700000000000 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM('CLIENT', 'ESCORT', 'ADMIN');
      CREATE TYPE "verification_status_enum" AS ENUM('PENDING', 'VERIFIED', 'REJECTED');
      CREATE TYPE "user_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED');
      CREATE TYPE "appointment_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
      CREATE TYPE "payment_status_enum" AS ENUM('PENDING', 'PAID', 'CONFIRMED', 'CANCELLED', 'REFUNDED');
      CREATE TYPE "payment_method_enum" AS ENUM('PIX', 'CREDIT_CARD', 'BANK_TRANSFER');
    `);
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'email',
                    type: 'varchar',
                    length: '255',
                    isUnique: true,
                },
                {
                    name: 'password',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'role',
                    type: 'enum',
                    enum: ['CLIENT', 'ESCORT', 'ADMIN'],
                    default: "'CLIENT'",
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'],
                    default: "'ACTIVE'",
                },
                {
                    name: 'verification_status',
                    type: 'enum',
                    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
                    default: "'PENDING'",
                },
                {
                    name: 'phone',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'phone_verified',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'first_name',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'last_name',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'avatar_url',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'last_login',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'email_notifications',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'sms_notifications',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createIndex('users', new typeorm_1.TableIndex({
            name: 'IDX_users_email',
            columnNames: ['email'],
            isUnique: true,
        }));
        await queryRunner.createIndex('users', new typeorm_1.TableIndex({
            name: 'IDX_users_status',
            columnNames: ['status'],
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'profiles',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'user_id',
                    type: 'uuid',
                },
                {
                    name: 'display_name',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'bio',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'age',
                    type: 'int',
                    isNullable: true,
                },
                {
                    name: 'location',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'latitude',
                    type: 'decimal',
                    precision: 10,
                    scale: 6,
                    isNullable: true,
                },
                {
                    name: 'longitude',
                    type: 'decimal',
                    precision: 10,
                    scale: 6,
                    isNullable: true,
                },
                {
                    name: 'height',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                },
                {
                    name: 'weight',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                },
                {
                    name: 'hair_color',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                },
                {
                    name: 'eye_color',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                },
                {
                    name: 'body_type',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                },
                {
                    name: 'ethnicity',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'services_offered',
                    type: 'text',
                    isArray: true,
                    default: "'{}'",
                },
                {
                    name: 'pricing',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'availability_calendar',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'pix_key',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'pix_key_type',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                },
                {
                    name: 'photos',
                    type: 'text',
                    isArray: true,
                    default: "'{}'",
                },
                {
                    name: 'main_photo',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'is_verified',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'verified_at',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'total_views',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'total_bookings',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'average_rating',
                    type: 'decimal',
                    precision: 3,
                    scale: 2,
                    default: 0,
                },
                {
                    name: 'total_reviews',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createIndex('profiles', new typeorm_1.TableIndex({
            name: 'IDX_profiles_user_id',
            columnNames: ['user_id'],
        }));
        await queryRunner.createIndex('profiles', new typeorm_1.TableIndex({
            name: 'IDX_profiles_location_verified',
            columnNames: ['location', 'is_verified'],
        }));
        await queryRunner.createForeignKey('profiles', new typeorm_1.TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'payments',
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
                    name: 'appointment_id',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'amount',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                },
                {
                    name: 'description',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'payment_method',
                    type: 'enum',
                    enum: ['PIX', 'CREDIT_CARD', 'BANK_TRANSFER'],
                    default: "'PIX'",
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['PENDING', 'PAID', 'CONFIRMED', 'CANCELLED', 'REFUNDED'],
                    default: "'PENDING'",
                },
                {
                    name: 'pix_key',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'pix_key_type',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                },
                {
                    name: 'qr_code',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'pix_copy_paste',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'transaction_id',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'payment_proof_image',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'confirmed_by_escort',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'confirmed_at',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'confirmation_notes',
                    type: 'text',
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
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createIndex('payments', new typeorm_1.TableIndex({
            name: 'IDX_payments_escort_status_created',
            columnNames: ['escort_id', 'status', 'created_at'],
        }));
        await queryRunner.createIndex('payments', new typeorm_1.TableIndex({
            name: 'IDX_payments_client_status',
            columnNames: ['client_id', 'status'],
        }));
        await queryRunner.createForeignKey('payments', new typeorm_1.TableForeignKey({
            columnNames: ['client_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('payments', new typeorm_1.TableForeignKey({
            columnNames: ['escort_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'appointments',
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
                    name: 'scheduled_date',
                    type: 'timestamp',
                },
                {
                    name: 'duration',
                    type: 'int',
                },
                {
                    name: 'service_type',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'total_price',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
                    default: "'PENDING'",
                },
                {
                    name: 'location',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'special_requests',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'payment_id',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'review_id',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'cancellation_reason',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'completed_at',
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
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createIndex('appointments', new typeorm_1.TableIndex({
            name: 'IDX_appointments_escort_date_status',
            columnNames: ['escort_id', 'scheduled_date', 'status'],
        }));
        await queryRunner.createIndex('appointments', new typeorm_1.TableIndex({
            name: 'IDX_appointments_client_status',
            columnNames: ['client_id', 'status'],
        }));
        await queryRunner.createForeignKey('appointments', new typeorm_1.TableForeignKey({
            columnNames: ['client_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('appointments', new typeorm_1.TableForeignKey({
            columnNames: ['escort_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('appointments', new typeorm_1.TableForeignKey({
            columnNames: ['payment_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'payments',
            onDelete: 'SET NULL',
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'reviews',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'appointment_id',
                    type: 'uuid',
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
                    name: 'rating',
                    type: 'int',
                    default: 5,
                },
                {
                    name: 'comment',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'is_anonymous',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'response_from_escort',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'responded_at',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'is_verified_purchase',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'metadata',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createIndex('reviews', new typeorm_1.TableIndex({
            name: 'IDX_reviews_escort_created',
            columnNames: ['escort_id', 'created_at'],
        }));
        await queryRunner.createIndex('reviews', new typeorm_1.TableIndex({
            name: 'IDX_reviews_client',
            columnNames: ['client_id'],
        }));
        await queryRunner.createForeignKey('reviews', new typeorm_1.TableForeignKey({
            columnNames: ['appointment_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'appointments',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('reviews', new typeorm_1.TableForeignKey({
            columnNames: ['client_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('reviews', new typeorm_1.TableForeignKey({
            columnNames: ['escort_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_appointment"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_client"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_escort"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_appointments_client"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_appointments_escort"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_appointments_payment"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "FK_payments_client"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "FK_payments_escort"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "FK_profiles_user"`);
        await queryRunner.dropTable('reviews', true);
        await queryRunner.dropTable('appointments', true);
        await queryRunner.dropTable('payments', true);
        await queryRunner.dropTable('profiles', true);
        await queryRunner.dropTable('users', true);
        await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "appointment_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "verification_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
    }
}
exports.InitialSchema1700000000000 = InitialSchema1700000000000;
//# sourceMappingURL=1700000000000-InitialSchema.js.map