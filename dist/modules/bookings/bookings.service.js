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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
let BookingsService = class BookingsService {
    appointmentsRepository;
    usersRepository;
    profilesRepository;
    constructor(appointmentsRepository, usersRepository, profilesRepository) {
        this.appointmentsRepository = appointmentsRepository;
        this.usersRepository = usersRepository;
        this.profilesRepository = profilesRepository;
    }
    async createBooking(clientId, createBookingDto) {
        const { escort_id, scheduled_date, duration, service_type, total_price, location, special_requests, } = createBookingDto;
        let escort = await this.usersRepository.findOne({
            where: { id: escort_id },
        });
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
            throw new common_1.NotFoundException('Escort not found. Please provide a valid escort user ID or profile ID.');
        }
        if (escort.role !== entities_1.UserRole.ESCORT) {
            throw new common_1.BadRequestException('The specified user is not an escort');
        }
        if (escort.status !== entities_1.UserStatus.ACTIVE) {
            throw new common_1.BadRequestException('The escort account is not active');
        }
        const actualEscortId = escort.id;
        if (clientId === actualEscortId) {
            throw new common_1.BadRequestException('Cannot create a booking with yourself');
        }
        const scheduledDate = new Date(scheduled_date);
        if (scheduledDate <= new Date()) {
            throw new common_1.BadRequestException('Scheduled date must be in the future');
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
            status: entities_1.AppointmentStatus.PENDING,
        });
        return this.appointmentsRepository.save(appointment);
    }
    async getBookingById(bookingId) {
        const booking = await this.appointmentsRepository.findOne({
            where: { id: bookingId },
            relations: ['client', 'escort', 'payment', 'review'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return booking;
    }
    async confirmBooking(bookingId, escortId) {
        const booking = await this.getBookingById(bookingId);
        if (booking.escort_id !== escortId) {
            throw new common_1.ForbiddenException('Only the escort can confirm this booking');
        }
        if (booking.status !== entities_1.AppointmentStatus.PENDING) {
            throw new common_1.BadRequestException('Booking cannot be confirmed in its current status');
        }
        booking.status = entities_1.AppointmentStatus.CONFIRMED;
        return this.appointmentsRepository.save(booking);
    }
    async cancelBooking(bookingId, userId, userRole) {
        const booking = await this.getBookingById(bookingId);
        if (userRole === 'CLIENT' && booking.client_id !== userId) {
            throw new common_1.ForbiddenException('Only the client can cancel this booking');
        }
        if (userRole === 'ESCORT' && booking.escort_id !== userId) {
            throw new common_1.ForbiddenException('Only the escort can cancel this booking');
        }
        if (booking.status === entities_1.AppointmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel a completed booking');
        }
        booking.status = entities_1.AppointmentStatus.CANCELLED;
        return this.appointmentsRepository.save(booking);
    }
    async completeBooking(bookingId, escortId) {
        const booking = await this.getBookingById(bookingId);
        if (booking.escort_id !== escortId) {
            throw new common_1.ForbiddenException('Only the escort can complete this booking');
        }
        if (booking.status !== entities_1.AppointmentStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Only confirmed bookings can be completed');
        }
        booking.status = entities_1.AppointmentStatus.COMPLETED;
        booking.completed_at = new Date();
        return this.appointmentsRepository.save(booking);
    }
    async getUpcomingBookings(userId, userRole, limit = 10, offset = 0) {
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
            statuses: [entities_1.AppointmentStatus.PENDING, entities_1.AppointmentStatus.CONFIRMED],
        });
        if (userRole === 'CLIENT') {
            query = query.andWhere('appointment.client_id = :userId', { userId });
        }
        else if (userRole === 'ESCORT') {
            query = query.andWhere('appointment.escort_id = :userId', { userId });
        }
        const [data, total] = await query
            .orderBy('appointment.scheduled_date', 'ASC')
            .skip(offsetNum)
            .take(limitNum)
            .getManyAndCount();
        return { data, total };
    }
    async getBookingHistory(userId, userRole, limit = 10, offset = 0) {
        const limitNum = Number(limit) || 10;
        const offsetNum = Number(offset) || 0;
        let query = this.appointmentsRepository
            .createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.client', 'client')
            .leftJoinAndSelect('appointment.escort', 'escort')
            .leftJoinAndSelect('appointment.payment', 'payment')
            .leftJoinAndSelect('appointment.review', 'review')
            .where('appointment.status IN (:...statuses)', {
            statuses: [entities_1.AppointmentStatus.COMPLETED, entities_1.AppointmentStatus.CANCELLED],
        });
        if (userRole === 'CLIENT') {
            query = query.andWhere('appointment.client_id = :userId', { userId });
        }
        else if (userRole === 'ESCORT') {
            query = query.andWhere('appointment.escort_id = :userId', { userId });
        }
        const [data, total] = await query
            .orderBy('appointment.scheduled_date', 'DESC')
            .skip(offsetNum)
            .take(limitNum)
            .getManyAndCount();
        return { data, total };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(entities_1.AppointmentEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(entities_1.UserEntity)),
    __param(2, (0, typeorm_2.InjectRepository)(entities_1.ProfileEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map