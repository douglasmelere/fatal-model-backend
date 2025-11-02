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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findById(id) {
        return this.usersRepository.findOne({
            where: { id },
            relations: ['profile'],
        });
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email },
            relations: ['profile'],
        });
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const existingUser = await this.findByEmail(updateProfileDto.email);
            if (existingUser) {
                throw new common_1.BadRequestException('Email already in use');
            }
        }
        Object.assign(user, updateProfileDto);
        return this.usersRepository.save(user);
    }
    async getProfile(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getAllUsers(limit = 10, offset = 0) {
        const [data, total] = await this.usersRepository.findAndCount({
            where: { status: entities_1.UserStatus.ACTIVE },
            skip: offset,
            take: limit,
            relations: ['profile'],
        });
        return { data, total };
    }
    async getUsersByRole(role, limit = 10, offset = 0) {
        const roleEnum = Object.values(entities_1.UserRole).includes(role) ? role : undefined;
        if (!roleEnum) {
            throw new common_1.BadRequestException('Invalid user role');
        }
        const [data, total] = await this.usersRepository.findAndCount({
            where: { role: roleEnum, status: entities_1.UserStatus.ACTIVE },
            skip: offset,
            take: limit,
            relations: ['profile'],
        });
        return { data, total };
    }
    async suspendUser(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.status = entities_1.UserStatus.SUSPENDED;
        return this.usersRepository.save(user);
    }
    async activateUser(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.status = entities_1.UserStatus.ACTIVE;
        return this.usersRepository.save(user);
    }
    async deleteUser(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.status = entities_1.UserStatus.INACTIVE;
        await this.usersRepository.save(user);
    }
    async updateNotificationPreferences(userId, emailNotifications, smsNotifications) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.email_notifications = emailNotifications;
        user.sms_notifications = smsNotifications;
        return this.usersRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(entities_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map