import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserStatus, UserRole } from '../../database/entities';
import { UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateProfileDto.email);
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    Object.assign(user, updateProfileDto);
    return this.usersRepository.save(user);
  }

  async getProfile(userId: string): Promise<UserEntity> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getAllUsers(
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: UserEntity[]; total: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      where: { status: UserStatus.ACTIVE },
      skip: offset,
      take: limit,
      relations: ['profile'],
    });

    return { data, total };
  }

  async getUsersByRole(
    role: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: UserEntity[]; total: number }> {
    // Corrigir busca usando UserRole ao invés de string
    const roleEnum = (Object.values(UserRole) as string[]).includes(role) ? (role as UserRole) : undefined;
    if (!roleEnum) {
      throw new BadRequestException('Invalid user role');
    }
    const [data, total] = await this.usersRepository.findAndCount({
      where: { role: roleEnum, status: UserStatus.ACTIVE },
      skip: offset,
      take: limit,
      relations: ['profile'],
    });
    return { data, total };
  }

  async suspendUser(userId: string): Promise<UserEntity> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.status = UserStatus.SUSPENDED;
    return this.usersRepository.save(user);
  }

  async activateUser(userId: string): Promise<UserEntity> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.status = UserStatus.ACTIVE;
    return this.usersRepository.save(user);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.status = UserStatus.INACTIVE;
    await this.usersRepository.save(user);
  }

  async updateNotificationPreferences(
    userId: string,
    emailNotifications: boolean,
    smsNotifications: boolean,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.email_notifications = emailNotifications;
    user.sms_notifications = smsNotifications;
    return this.usersRepository.save(user);
  }
}
