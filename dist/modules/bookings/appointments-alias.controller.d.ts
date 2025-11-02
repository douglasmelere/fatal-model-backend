import { BookingsService } from './bookings.service';
import { UserEntity } from '../../database/entities';
export declare class AppointmentsAliasController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    getUpcomingAppointments(user: UserEntity, limit: number, offset: number): Promise<{
        data: import("../../database/entities").AppointmentEntity[];
        total: number;
    }>;
    getAppointmentsHistory(user: UserEntity, limit: number, offset: number): Promise<{
        data: import("../../database/entities").AppointmentEntity[];
        total: number;
    }>;
}
