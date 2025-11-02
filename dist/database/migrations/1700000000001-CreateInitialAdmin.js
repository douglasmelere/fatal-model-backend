"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInitialAdmin1700000000001 = void 0;
class CreateInitialAdmin1700000000001 {
    async up(queryRunner) {
        const existingAdmin = await queryRunner.query(`SELECT id FROM users WHERE email = $1 AND role = 'ADMIN'`, ['admin@duoclub.com.br']);
        if (existingAdmin && existingAdmin.length > 0) {
            console.log('Admin user already exists, skipping...');
            return;
        }
        const hashedPassword = '$2b$10$WsQjwkloWqlMezmzdmQGjOQpfoVNr6r.eC5O6bYWxNI/ZQUd66xlC';
        await queryRunner.query(`INSERT INTO users (
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
      )`, ['admin@duoclub.com.br', hashedPassword]);
        console.log('Initial admin user created: admin@duoclub.com.br');
        console.log('Default password: admin123 - PLEASE CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM users WHERE email = $1 AND role = 'ADMIN'`, ['admin@duoclub.com.br']);
    }
}
exports.CreateInitialAdmin1700000000001 = CreateInitialAdmin1700000000001;
//# sourceMappingURL=1700000000001-CreateInitialAdmin.js.map