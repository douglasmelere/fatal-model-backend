import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, ProfileEntity, PaymentEntity, AppointmentEntity, UserStatus, UserRole } from '../../database/entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profilesRepository: Repository<ProfileEntity>,
    @InjectRepository(PaymentEntity)
    private paymentsRepository: Repository<PaymentEntity>,
    @InjectRepository(AppointmentEntity)
    private appointmentsRepository: Repository<AppointmentEntity>,
  ) {}

  async getDashboardStats(): Promise<any> {
    const totalUsers = await this.usersRepository.count();
    const totalEscorts = await this.usersRepository.count({
      where: { role: UserRole.ESCORT },
    });
    const totalClients = await this.usersRepository.count({
      where: { role: UserRole.CLIENT },
    });
    const totalPayments = await this.paymentsRepository.count();
    const totalBookings = await this.appointmentsRepository.count();

    const paymentStats = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total_revenue')
      .getRawOne();

    return {
      total_users: totalUsers,
      total_escorts: totalEscorts,
      total_clients: totalClients,
      total_payments: totalPayments,
      total_bookings: totalBookings,
      total_revenue: paymentStats?.total_revenue || 0,
    };
  }

  async getAllUsers(
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: UserEntity[]; total: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      skip: offset,
      take: limit,
      relations: ['profile'],
    });

    return { data, total };
  }

  async verifyProfile(profileId: string): Promise<ProfileEntity> {
    const profile = await this.profilesRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    profile.is_verified = true;
    profile.is_active = true;
    profile.verified_at = new Date();
    return this.profilesRepository.save(profile);
  }

  async rejectProfile(profileId: string): Promise<ProfileEntity> {
    const profile = await this.profilesRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    profile.is_verified = false;
    profile.is_active = false;
    return this.profilesRepository.save(profile);
  }

  async getPaymentReports(
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    let query = this.paymentsRepository.createQueryBuilder('payment');

    if (startDate && endDate) {
      query = query.where('payment.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return query
      .select('payment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'total')
      .groupBy('payment.status')
      .getRawMany();
  }

  async getBookingReports(
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    let query = this.appointmentsRepository.createQueryBuilder('appointment');

    if (startDate && endDate) {
      query = query.where('appointment.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return query
      .select('appointment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('appointment.status')
      .getRawMany();
  }

  async suspendUser(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = UserStatus.SUSPENDED;
    return this.usersRepository.save(user);
  }

  async banUser(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = UserStatus.BANNED;
    return this.usersRepository.save(user);
  }

  async activateUser(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = UserStatus.ACTIVE;
    await this.usersRepository.save(user);

    // If user is an escort, verify their profile
    if (user.role === UserRole.ESCORT) {
      const profile = await this.profilesRepository.findOne({
        where: { user_id: userId },
      });
      if (profile) {
        profile.is_verified = true;
        profile.is_active = true;
        profile.verified_at = new Date();
        await this.profilesRepository.save(profile);
      }
    }

    return user;
  }

  async createAnnouncement(announcement: {
    title: string;
    message: string;
    type: string;
  }): Promise<any> {
    // In a real implementation, you would save this to an announcements table
    // For now, this is a placeholder
    console.log('Announcement created:', announcement);
    return { message: 'Announcement created successfully' };
  }

  async getAllPayments(
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: PaymentEntity[]; total: number }> {
    const [data, total] = await this.paymentsRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['client', 'escort'],
    });

    return { data, total };
  }

  async getAllAppointments(
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: AppointmentEntity[]; total: number }> {
    const [data, total] = await this.appointmentsRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { scheduled_date: 'DESC' },
      relations: ['client', 'escort', 'payment'],
    });

    return { data, total };
  }
}
