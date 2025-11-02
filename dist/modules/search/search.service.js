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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
let SearchService = class SearchService {
    profilesRepository;
    usersRepository;
    constructor(profilesRepository, usersRepository) {
        this.profilesRepository = profilesRepository;
        this.usersRepository = usersRepository;
    }
    async searchProfiles(filters, limit = 10, offset = 0) {
        let query = this.profilesRepository
            .createQueryBuilder('profile')
            .innerJoin('profile.user', 'user')
            .where('profile.is_active = :isActive', { isActive: true })
            .andWhere('profile.is_verified = :isVerified', { isVerified: true })
            .andWhere('user.role = :escortRole', { escortRole: 'ESCORT' })
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
        else if (filters.minAge) {
            query = query.andWhere('profile.age >= :minAge', {
                minAge: filters.minAge,
            });
        }
        else if (filters.maxAge) {
            query = query.andWhere('profile.age <= :maxAge', {
                maxAge: filters.maxAge,
            });
        }
        if (filters.minPrice && filters.maxPrice) {
            query = query.andWhere(`(profile.pricing->>'hourly_rate')::numeric BETWEEN :minPrice AND :maxPrice`, {
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
            });
        }
        else if (filters.minPrice) {
            query = query.andWhere(`(profile.pricing->>'hourly_rate')::numeric >= :minPrice`, {
                minPrice: filters.minPrice,
            });
        }
        else if (filters.maxPrice) {
            query = query.andWhere(`(profile.pricing->>'hourly_rate')::numeric <= :maxPrice`, {
                maxPrice: filters.maxPrice,
            });
        }
        if (filters.services && filters.services.length > 0) {
            query = query.andWhere('profile.services_offered && :services', {
                services: filters.services,
            });
        }
        if (filters.bodyType) {
            query = query.andWhere('profile.body_type ILIKE :bodyType', {
                bodyType: `%${filters.bodyType}%`,
            });
        }
        if (filters.hairColor) {
            query = query.andWhere('profile.hair_color ILIKE :hairColor', {
                hairColor: `%${filters.hairColor}%`,
            });
        }
        if (filters.minRating) {
            query = query.andWhere('profile.average_rating >= :minRating', {
                minRating: filters.minRating,
            });
        }
        const sortBy = filters.sortBy || 'newest';
        const sortOrder = filters.sortOrder || 'DESC';
        switch (sortBy) {
            case 'rating':
                query = query.orderBy('profile.average_rating', sortOrder);
                break;
            case 'price':
                query = query.orderBy(`(profile.pricing->>'hourly_rate')::numeric`, sortOrder);
                break;
            case 'views':
                query = query.orderBy('profile.total_views', sortOrder);
                break;
            case 'newest':
            default:
                query = query.orderBy('profile.created_at', sortOrder);
                break;
        }
        const [data, total] = await query
            .skip(offset)
            .take(limit)
            .getManyAndCount();
        return { data, total };
    }
    async searchByKeyword(keyword, limit = 10, offset = 0) {
        const query = this.profilesRepository
            .createQueryBuilder('profile')
            .where('profile.is_active = :isActive', { isActive: true })
            .andWhere('profile.is_verified = :isVerified', { isVerified: true })
            .andWhere('(profile.display_name ILIKE :keyword OR profile.bio ILIKE :keyword OR profile.services_offered::text ILIKE :keyword)', { keyword: `%${keyword}%` })
            .innerJoin('profile.user', 'user')
            .andWhere('user.role = :escortRole', { escortRole: 'ESCORT' })
            .andWhere('user.status = :userStatus', { userStatus: entities_1.UserStatus.ACTIVE });
        const [data, total] = await query
            .skip(offset)
            .take(limit)
            .getManyAndCount();
        return { data, total };
    }
    async getTopRated(limit = 10) {
        const query = this.profilesRepository
            .createQueryBuilder('profile')
            .innerJoin('profile.user', 'user')
            .where('profile.is_active = :isActive', { isActive: true })
            .andWhere('profile.is_verified = :isVerified', { isVerified: true })
            .andWhere('user.role = :escortRole', { escortRole: 'ESCORT' })
            .andWhere('user.status = :userStatus', { userStatus: entities_1.UserStatus.ACTIVE })
            .andWhere('profile.average_rating > 0')
            .orderBy('profile.average_rating', 'DESC')
            .addOrderBy('profile.total_reviews', 'DESC');
        const [data, total] = await query.skip(0).take(limit).getManyAndCount();
        return { data, total };
    }
    async getMostViewed(limit = 10) {
        const query = this.profilesRepository
            .createQueryBuilder('profile')
            .innerJoin('profile.user', 'user')
            .where('profile.is_active = :isActive', { isActive: true })
            .andWhere('profile.is_verified = :isVerified', { isVerified: true })
            .andWhere('user.role = :escortRole', { escortRole: 'ESCORT' })
            .andWhere('user.status = :userStatus', { userStatus: entities_1.UserStatus.ACTIVE })
            .orderBy('profile.total_views', 'DESC')
            .addOrderBy('profile.average_rating', 'DESC');
        const [data, total] = await query.skip(0).take(limit).getManyAndCount();
        return { data, total };
    }
    async getNewProfiles(limit = 10) {
        const query = this.profilesRepository
            .createQueryBuilder('profile')
            .innerJoin('profile.user', 'user')
            .where('profile.is_active = :isActive', { isActive: true })
            .andWhere('profile.is_verified = :isVerified', { isVerified: true })
            .andWhere('user.role = :escortRole', { escortRole: 'ESCORT' })
            .andWhere('user.status = :userStatus', { userStatus: entities_1.UserStatus.ACTIVE })
            .orderBy('profile.created_at', 'DESC');
        const [data, total] = await query.skip(0).take(limit).getManyAndCount();
        return { data, total };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(entities_1.ProfileEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(entities_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], SearchService);
//# sourceMappingURL=search.service.js.map