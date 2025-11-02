import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from './database/entities/profile.entity';
import { UserEntity, UserRole, UserStatus, VerificationStatus } from './database/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Controller('debug')
export class DebugController {
  constructor(
    @InjectRepository(ProfileEntity)
    private profilesRepository: Repository<ProfileEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  @Get('profiles')
  async debugProfiles() {
    const profiles = await this.profilesRepository.find({ relations: ['user'] });
    return profiles.map(p => ({
      id: p.id,
      display_name: p.display_name,
      is_active: p.is_active,
      user_id: p.user_id,
      user_role: p.user?.role,
      user_email: p.user?.email,
    }));
  }

  @Get('admins')
  async debugAdmins() {
    const admins = await this.usersRepository.find({
      where: { role: UserRole.ADMIN },
    });
    return {
      count: admins.length,
      admins: admins.map(u => ({
        id: u.id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        status: u.status,
        created_at: u.created_at,
      })),
    };
  }

  @Post('create-admin')
  async createAdmin(@Body() body: { email: string; password: string; first_name?: string; last_name?: string }) {
    // Check if there's already an admin
    const existingAdmins = await this.usersRepository.count({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmins > 0) {
      return {
        success: false,
        message: 'Admin user already exists. Use the register endpoint or contact an existing admin.',
      };
    }

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: body.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create admin user
    const admin = this.usersRepository.create({
      email: body.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      first_name: body.first_name,
      last_name: body.last_name,
      status: UserStatus.ACTIVE,
      verification_status: VerificationStatus.VERIFIED,
    });

    const savedAdmin = await this.usersRepository.save(admin);

    return {
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: savedAdmin.id,
        email: savedAdmin.email,
        first_name: savedAdmin.first_name,
        last_name: savedAdmin.last_name,
        role: savedAdmin.role,
        status: savedAdmin.status,
      },
    };
  }
}
