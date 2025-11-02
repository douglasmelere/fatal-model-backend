import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppointmentEntity,
  AppointmentStatus,
  UserEntity,
  UserRole,
  UserStatus,
  ProfileEntity,
} from '../../database/entities';
import { CreateBookingDto } from './dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentsRepository: Repository<AppointmentEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profilesRepository: Repository<ProfileEntity>,
  ) {}

  async createBooking(
    clientId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<AppointmentEntity> {
    const {
      escort_id,
      scheduled_date,
      duration,
      service_type,
      total_price,
      location,
      special_requests,
    } = createBookingDto;

    // Validate that escort exists and has ESCORT role
    // First try as user_id, then try as profile_id
    let escort = await this.usersRepository.findOne({
      where: { id: escort_id },
    });

    // If not found as user_id, try as profile_id
    if (!escort) {
      const profile = await this.profilesRepository.findOne({
        where: { id: escort_id },
        relations: ['user'],
      });

      if (profile && profile.user) {
        escort = profile.user;
      }
    }

    if (!escort) {
      throw new NotFoundException(
        'Escort not found. Please provide a valid escort user ID or profile ID.',
      );
    }

    if (escort.role !== UserRole.ESCORT) {
      throw new BadRequestException(
        'The specified user is not an escort',
      );
    }

    if (escort.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(
        'The escort account is not active',
      );
    }

    // Get the actual user_id (escort.id) - in case escort_id was a profile_id
    const actualEscortId = escort.id;

    // Validate that client is not booking themselves
    if (clientId === actualEscortId) {
      throw new BadRequestException(
        'Cannot create a booking with yourself',
      );
    }

    // Validate scheduled date is in the future
    const scheduledDate = new Date(scheduled_date);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException(
        'Scheduled date must be in the future',
      );
    }

    const appointment = this.appointmentsRepository.create({
      client_id: clientId,
      escort_id: actualEscortId,
      scheduled_date: scheduledDate,
      duration,
      service_type,
      total_price,
      location,
      special_requests,
      status: AppointmentStatus.PENDING,
    });

    return this.appointmentsRepository.save(appointment);
  }

  async getBookingById(bookingId: string): Promise<AppointmentEntity> {
    const booking = await this.appointmentsRepository.findOne({
      where: { id: bookingId },
      relations: ['client', 'escort', 'payment', 'review'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async confirmBooking(
    bookingId: string,
    escortId: string,
  ): Promise<AppointmentEntity> {
    const booking = await this.getBookingById(bookingId);

    // Verify that the user is the escort
    if (booking.escort_id !== escortId) {
      throw new ForbiddenException(
        'Only the escort can confirm this booking',
      );
    }

    if (booking.status !== AppointmentStatus.PENDING) {
      throw new BadRequestException(
        'Booking cannot be confirmed in its current status',
      );
    }

    booking.status = AppointmentStatus.CONFIRMED;
    return this.appointmentsRepository.save(booking);
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    userRole: string,
  ): Promise<AppointmentEntity> {
    const booking = await this.getBookingById(bookingId);

    // Verify authorization
    if (userRole === 'CLIENT' && booking.client_id !== userId) {
      throw new ForbiddenException('Only the client can cancel this booking');
    }

    if (userRole === 'ESCORT' && booking.escort_id !== userId) {
      throw new ForbiddenException('Only the escort can cancel this booking');
    }

    if (booking.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    booking.status = AppointmentStatus.CANCELLED;
    return this.appointmentsRepository.save(booking);
  }

  async completeBooking(
    bookingId: string,
    escortId: string,
  ): Promise<AppointmentEntity> {
    const booking = await this.getBookingById(bookingId);

    // Verify that the user is the escort
    if (booking.escort_id !== escortId) {
      throw new ForbiddenException(
        'Only the escort can complete this booking',
      );
    }

    if (booking.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException(
        'Only confirmed bookings can be completed',
      );
    }

    booking.status = AppointmentStatus.COMPLETED;
    booking.completed_at = new Date();
    return this.appointmentsRepository.save(booking);
  }

  async getUpcomingBookings(
    userId: string,
    userRole: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: AppointmentEntity[]; total: number }> {
    // Ensure limit and offset are numbers
    const limitNum = Number(limit) || 10;
    const offsetNum = Number(offset) || 0;

    let query = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.escort', 'escort')
      .leftJoinAndSelect('appointment.payment', 'payment')
      .leftJoinAndSelect('appointment.review', 'review')
      .where('appointment.scheduled_date > :now', { now: new Date() })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      });

    if (userRole === 'CLIENT') {
      query = query.andWhere('appointment.client_id = :userId', { userId });
    } else if (userRole === 'ESCORT') {
      query = query.andWhere('appointment.escort_id = :userId', { userId });
    }

    const [data, total] = await query
      .orderBy('appointment.scheduled_date', 'ASC')
      .skip(offsetNum)
      .take(limitNum)
      .getManyAndCount();

    return { data, total };
  }

  async getBookingHistory(
    userId: string,
    userRole: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: AppointmentEntity[]; total: number }> {
    // Ensure limit and offset are numbers
    const limitNum = Number(limit) || 10;
    const offsetNum = Number(offset) || 0;

    let query = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.escort', 'escort')
      .leftJoinAndSelect('appointment.payment', 'payment')
      .leftJoinAndSelect('appointment.review', 'review')
      .where('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
      });

    if (userRole === 'CLIENT') {
      query = query.andWhere('appointment.client_id = :userId', { userId });
    } else if (userRole === 'ESCORT') {
      query = query.andWhere('appointment.escort_id = :userId', { userId });
    }

    const [data, total] = await query
      .orderBy('appointment.scheduled_date', 'DESC')
      .skip(offsetNum)
      .take(limitNum)
      .getManyAndCount();

    return { data, total };
  }
}
