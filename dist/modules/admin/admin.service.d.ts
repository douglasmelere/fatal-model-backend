import { Repository } from 'typeorm';
import { UserEntity, ProfileEntity, PaymentEntity, AppointmentEntity } from '../../database/entities';
export declare class AdminService {
    private usersRepository;
    private profilesRepository;
    private paymentsRepository;
    private appointmentsRepository;
    constructor(usersRepository: Repository<UserEntity>, profilesRepository: Repository<ProfileEntity>, paymentsRepository: Repository<PaymentEntity>, appointmentsRepository: Repository<AppointmentEntity>);
    getDashboardStats(): Promise<any>;
    getAllUsers(limit?: number, offset?: number): Promise<{
        data: UserEntity[];
        total: number;
    }>;
    verifyProfile(profileId: string): Promise<ProfileEntity>;
    rejectProfile(profileId: string): Promise<ProfileEntity>;
    getPaymentReports(startDate?: Date, endDate?: Date): Promise<any[]>;
    getBookingReports(startDate?: Date, endDate?: Date): Promise<any[]>;
    suspendUser(userId: string): Promise<UserEntity>;
    banUser(userId: string): Promise<UserEntity>;
    activateUser(userId: string): Promise<UserEntity>;
    createAnnouncement(announcement: {
        title: string;
        message: string;
        type: string;
    }): Promise<any>;
    getAllPayments(limit?: number, offset?: number): Promise<{
        data: PaymentEntity[];
        total: number;
    }>;
    getAllAppointments(limit?: number, offset?: number): Promise<{
        data: AppointmentEntity[];
        total: number;
    }>;
}
