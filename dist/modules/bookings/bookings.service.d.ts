import { Repository } from 'typeorm';
import { AppointmentEntity, UserEntity, ProfileEntity } from '../../database/entities';
import { CreateBookingDto } from './dto';
export declare class BookingsService {
    private appointmentsRepository;
    private usersRepository;
    private profilesRepository;
    constructor(appointmentsRepository: Repository<AppointmentEntity>, usersRepository: Repository<UserEntity>, profilesRepository: Repository<ProfileEntity>);
    createBooking(clientId: string, createBookingDto: CreateBookingDto): Promise<AppointmentEntity>;
    getBookingById(bookingId: string): Promise<AppointmentEntity>;
    confirmBooking(bookingId: string, escortId: string): Promise<AppointmentEntity>;
    cancelBooking(bookingId: string, userId: string, userRole: string): Promise<AppointmentEntity>;
    completeBooking(bookingId: string, escortId: string): Promise<AppointmentEntity>;
    getUpcomingBookings(userId: string, userRole: string, limit?: number, offset?: number): Promise<{
        data: AppointmentEntity[];
        total: number;
    }>;
    getBookingHistory(userId: string, userRole: string, limit?: number, offset?: number): Promise<{
        data: AppointmentEntity[];
        total: number;
    }>;
}
