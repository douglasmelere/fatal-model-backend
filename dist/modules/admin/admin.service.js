"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
let AdminService = class AdminService {
    usersRepository;
    profilesRepository;
    paymentsRepository;
    appointmentsRepository;
    constructor(usersRepository, profilesRepository, paymentsRepository, appointmentsRepository) {
        this.usersRepository = usersRepository;
        this.profilesRepository = profilesRepository;
        this.paymentsRepository = paymentsRepository;
        this.appointmentsRepository = appointmentsRepository;
    }
    async getDashboardStats() {
        const totalUsers = await this.usersRepository.count();
        const totalEscorts = await this.usersRepository.count({
            where: { role: entities_1.UserRole.ESCORT },
        });
        const totalClients = await this.usersRepository.count({
            where: { role: entities_1.UserRole.CLIENT },
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
    async getAllUsers(limit = 10, offset = 0) {
        const [data, total] = await this.usersRepository.findAndCount({
            skip: offset,
            take: limit,
            relations: ['profile'],
        });
        return { data, total };
    }
    async verifyProfile(profileId) {
        const profile = await this.profilesRepository.findOne({
            where: { id: profileId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        profile.is_verified = true;
        profile.is_active = true;
        profile.verified_at = new Date();
        return this.profilesRepository.save(profile);
    }
    async rejectProfile(profileId) {
        const profile = await this.profilesRepository.findOne({
            where: { id: profileId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        profile.is_verified = false;
        profile.is_active = false;
        return this.profilesRepository.save(profile);
    }
    async getPaymentReports(startDate, endDate) {
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
    async getBookingReports(startDate, endDate) {
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
    async suspendUser(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.status = entities_1.UserStatus.SUSPENDED;
        return this.usersRepository.save(user);
    }
    async banUser(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.status = entities_1.UserStatus.BANNED;
        return this.usersRepository.save(user);
    }
    async activateUser(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.status = entities_1.UserStatus.ACTIVE;
        await this.usersRepository.save(user);
        if (user.role === entities_1.UserRole.ESCORT) {
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
    async createAnnouncement(announcement) {
        console.log('Announcement created:', announcement);
        return { message: 'Announcement created successfully' };
    }
    async getAllPayments(limit = 10, offset = 0) {
        const [data, total] = await this.paymentsRepository.findAndCount({
            skip: offset,
            take: limit,
            order: { created_at: 'DESC' },
            relations: ['client', 'escort'],
        });
        return { data, total };
    }
    async getAllAppointments(limit = 10, offset = 0) {
        const [data, total] = await this.appointmentsRepository.findAndCount({
            skip: offset,
            take: limit,
            order: { scheduled_date: 'DESC' },
            relations: ['client', 'escort', 'payment'],
        });
        return { data, total };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(entities_1.UserEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(entities_1.ProfileEntity)),
    __param(2, (0, typeorm_2.InjectRepository)(entities_1.PaymentEntity)),
    __param(3, (0, typeorm_2.InjectRepository)(entities_1.AppointmentEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map