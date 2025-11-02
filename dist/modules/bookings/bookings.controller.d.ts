import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto';
import { UserEntity } from '../../database/entities';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    createBooking(user: UserEntity, createBookingDto: CreateBookingDto): Promise<import("../../database/entities").AppointmentEntity>;
    getUpcomingBookings(user: UserEntity, limit: number, offset: number): Promise<{
        data: import("../../database/entities").AppointmentEntity[];
        total: number;
    }>;
    getBookingHistory(user: UserEntity, limit: number, offset: number): Promise<{
        data: import("../../database/entities").AppointmentEntity[];
        total: number;
    }>;
    getBookingById(id: string): Promise<import("../../database/entities").AppointmentEntity>;
    confirmBooking(bookingId: string, user: UserEntity): Promise<import("../../database/entities").AppointmentEntity>;
    cancelBooking(bookingId: string, user: UserEntity): Promise<import("../../database/entities").AppointmentEntity>;
    completeBooking(bookingId: string, user: UserEntity): Promise<import("../../database/entities").AppointmentEntity>;
}
