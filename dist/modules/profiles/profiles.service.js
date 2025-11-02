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
exports.ProfilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
let ProfilesService = class ProfilesService {
    profilesRepository;
    usersRepository;
    constructor(profilesRepository, usersRepository) {
        this.profilesRepository = profilesRepository;
        this.usersRepository = usersRepository;
    }
    async createProfile(userId, createProfileDto) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role !== entities_1.UserRole.ESCORT) {
            throw new common_1.BadRequestException('Only escorts can create profiles');
        }
        const existingProfile = await this.profilesRepository.findOne({
            where: { user_id: userId },
        });
        if (existingProfile) {
            throw new common_1.BadRequestException('Profile already exists for this user');
        }
        if (!createProfileDto.display_name || createProfileDto.display_name.trim() === '') {
            throw new common_1.BadRequestException('display_name is required');
        }
        try {
            const profileData = {
                user_id: userId,
                display_name: createProfileDto.display_name,
                bio: createProfileDto.bio,
                age: createProfileDto.age,
                location: createProfileDto.location,
                latitude: createProfileDto.latitude,
                longitude: createProfileDto.longitude,
                height: createProfileDto.height,
                weight: createProfileDto.weight,
                hair_color: createProfileDto.hair_color,
                eye_color: createProfileDto.eye_color,
                body_type: createProfileDto.body_type,
                ethnicity: createProfileDto.ethnicity,
                services_offered: createProfileDto.services_offered || [],
                pricing: createProfileDto.pricing,
                pix_key: createProfileDto.pix_key,
                pix_key_type: createProfileDto.pix_key_type,
                is_active: true,
                is_verified: false,
            };
            const profile = this.profilesRepository.create(profileData);
            const savedProfile = await this.profilesRepository.save(profile);
            return savedProfile;
        }
        catch (error) {
            console.error('Error creating profile:', error);
            if (error.code === '23505') {
                throw new common_1.BadRequestException('Profile already exists for this user');
            }
            if (error.code === '23502') {
                throw new common_1.BadRequestException(`Missing required field: ${error.column}`);
            }
            throw new common_1.BadRequestException(error.message || 'Failed to create profile. Please check your data and try again.');
        }
    }
    async getProfileByUserId(userId) {
        const profile = await this.profilesRepository.findOne({
            where: { user_id: userId },
            relations: ['user'],
        });
        return profile || null;
    }
    async getProfileById(profileId) {
        const profile = await this.profilesRepository.findOne({
            where: { id: profileId },
            relations: ['user'],
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        profile.total_views += 1;
        await this.profilesRepository.save(profile);
        return profile;
    }
    async updateProfile(userId, updateProfileDto) {
        const profile = await this.getProfileByUserId(userId);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found. Please create a profile first.');
        }
        Object.assign(profile, updateProfileDto);
        return this.profilesRepository.save(profile);
    }
    async addPhotos(userId, photoUrls) {
        const profile = await this.getProfileByUserId(userId);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found. Please create a profile first.');
        }
        profile.photos = [...(profile.photos || []), ...photoUrls];
        if (!profile.main_photo && photoUrls.length > 0) {
            profile.main_photo = photoUrls[0];
        }
        return this.profilesRepository.save(profile);
    }
    async setMainPhoto(userId, photoUrl) {
        const profile = await this.getProfileByUserId(userId);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found. Please create a profile first.');
        }
        if (!profile.photos.includes(photoUrl)) {
            throw new common_1.BadRequestException('Photo not found in profile');
        }
        profile.main_photo = photoUrl;
        return this.profilesRepository.save(profile);
    }
    async updateAvailability(userId, availability) {
        const profile = await this.getProfileByUserId(userId);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found. Please create a profile first.');
        }
        profile.availability_calendar = availability;
        return this.profilesRepository.save(profile);
    }
    async updatePixKey(userId, pixKey, pixKeyType) {
        const profile = await this.getProfileByUserId(userId);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found. Please create a profile first.');
        }
        profile.pix_key = pixKey;
        profile.pix_key_type = pixKeyType;
        return this.profilesRepository.save(profile);
    }
    async getVerifiedProfiles(limit = 10, offset = 0) {
        const query = this.profilesRepository
            .createQueryBuilder('profile')
            .innerJoin('profile.user', 'user')
            .where('profile.is_verified = :isVerified', { isVerified: true })
            .andWhere('profile.is_active = :isActive', { isActive: true })
            .andWhere('user.status = :userStatus', { userStatus: 'ACTIVE' })
            .skip(offset)
            .take(limit);
        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }
    async searchProfiles(filters, limit = 10, offset = 0) {
        let query = this.profilesRepository
            .createQueryBuilder('profile')
            .innerJoin('profile.user', 'user')
            .where('profile.is_active = :isActive', { isActive: true })
            .andWhere('profile.is_verified = :isVerified', { isVerified: true })
            .andWhere('user.status = :userStatus', { userStatus: entities_1.UserStatus.ACTIVE });
        if (filters.location) {
            query = query.andWhere('profile.location ILIKE :location', {
                location: `%${filters.location}%`,
            });
        }
        if (filters.minAge && filters.maxAge) {
            query = query.andWhere('profile.age BETWEEN :minAge AND :maxAge', {
                minAge: filters.minAge,
                maxAge: filters.maxAge,
            });
        }
        if (filters.minPrice && filters.maxPrice) {
            query = query.andWhere('profile.pricing->\'hourly_rate\' BETWEEN :minPrice AND :maxPrice', {
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
            });
        }
        if (filters.services && filters.services.length > 0) {
            query = query.andWhere('profile.services_offered && :services', {
                services: filters.services,
            });
        }
        const [data, total] = await query
            .skip(offset)
            .take(limit)
            .getManyAndCount();
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
        profile.verified_at = new Date();
        return this.profilesRepository.save(profile);
    }
    async deactivateProfile(userId) {
        const profile = await this.getProfileByUserId(userId);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        profile.is_active = false;
        return this.profilesRepository.save(profile);
    }
    async activateProfile(userId) {
        const profile = await this.getProfileByUserId(userId);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        profile.is_active = true;
        return this.profilesRepository.save(profile);
    }
};
exports.ProfilesService = ProfilesService;
exports.ProfilesService = ProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(entities_1.ProfileEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(entities_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], ProfilesService);
//# sourceMappingURL=profiles.service.js.map