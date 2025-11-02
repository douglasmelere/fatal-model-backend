import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialAdmin1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if admin already exists
    const existingAdmin = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1 AND role = 'ADMIN'`,
      ['admin@duoclub.com.br'],
    );

    if (existingAdmin && existingAdmin.length > 0) {
      console.log('Admin user already exists, skipping...');
      return;
    }

    // Hash for password 'admin123' (bcrypt hash)
    // To generate a new hash: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('yourpassword', 10).then(h => console.log(h))"
    const hashedPassword = '$2b$10$WsQjwkloWqlMezmzdmQGjOQpfoVNr6r.eC5O6bYWxNI/ZQUd66xlC';

    // Insert initial admin user
    await queryRunner.query(
      `INSERT INTO users (
        id,
        email,
        password,
        role,
        status,
        verification_status,
        first_name,
        last_name,
        email_notifications,
        sms_notifications,
        created_at,
        updated_at
      ) VALUES (
        uuid_generate_v4(),
        $1,
        $2,
        'ADMIN',
        'ACTIVE',
        'VERIFIED',
        'Admin',
        'DuoClub',
        true,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )`,
      ['admin@duoclub.com.br', hashedPassword],
    );

    console.log('Initial admin user created: admin@duoclub.com.br');
    console.log('Default password: admin123 - PLEASE CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove initial admin user
    await queryRunner.query(
      `DELETE FROM users WHERE email = $1 AND role = 'ADMIN'`,
      ['admin@duoclub.com.br'],
    );
  }
}

