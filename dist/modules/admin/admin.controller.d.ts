import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getDashboardStats(): Promise<any>;
    getAllUsers(limit: number, offset: number): Promise<{
        data: import("../../database/entities").UserEntity[];
        total: number;
    }>;
    getAllPayments(limit: number, offset: number): Promise<{
        data: import("../../database/entities").PaymentEntity[];
        total: number;
    }>;
    getAllTransactions(limit: number, offset: number): Promise<{
        data: import("../../database/entities").PaymentEntity[];
        total: number;
    }>;
    getAllAppointments(limit: number, offset: number): Promise<{
        data: import("../../database/entities").AppointmentEntity[];
        total: number;
    }>;
    verifyProfile(profileId: string): Promise<import("../../database/entities").ProfileEntity>;
    rejectProfile(profileId: string): Promise<import("../../database/entities").ProfileEntity>;
    getPaymentReports(startDate?: string, endDate?: string): Promise<any[]>;
    getBookingReports(startDate?: string, endDate?: string): Promise<any[]>;
    suspendUser(userId: string): Promise<import("../../database/entities").UserEntity>;
    banUser(userId: string): Promise<import("../../database/entities").UserEntity>;
    activateUser(userId: string): Promise<import("../../database/entities").UserEntity>;
    createAnnouncement(body: {
        title: string;
        message: string;
        type: string;
    }): Promise<any>;
}
