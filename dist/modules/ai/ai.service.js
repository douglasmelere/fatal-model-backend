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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
let AiService = class AiService {
    profilesRepository;
    usersRepository;
    constructor(profilesRepository, usersRepository) {
        this.profilesRepository = profilesRepository;
        this.usersRepository = usersRepository;
    }
    async getRecommendations(userId, recommendationRequest) {
        const { description, location, budget_range, filters } = recommendationRequest;
        const keywords = this.extractKeywords(description);
        let query = this.profilesRepository
            .createQueryBuilder('profile')
            .innerJoin('profile.user', 'user')
            .where('profile.is_active = :isActive', { isActive: true })
            .andWhere('profile.is_verified = :isVerified', { isVerified: true })
            .andWhere('user.status = :userStatus', { userStatus: entities_1.UserStatus.ACTIVE });
        if (location) {
            query = query.andWhere('profile.location ILIKE :location', {
                location: `%${location}%`,
            });
        }
        if (budget_range) {
            query = query.andWhere(`(profile.pricing->>'hourly_rate')::numeric BETWEEN :minBudget AND :maxBudget`, {
                minBudget: budget_range.min,
                maxBudget: budget_range.max,
            });
        }
        if (keywords.length > 0) {
            const keywordConditions = keywords
                .map((keyword, index) => `(profile.display_name ILIKE :keyword${index} OR profile.bio ILIKE :keyword${index} OR profile.services_offered::text ILIKE :keyword${index})`)
                .join(' OR ');
            const params = {};
            keywords.forEach((keyword, index) => {
                params[`keyword${index}`] = `%${keyword}%`;
            });
            query = query.andWhere(`(${keywordConditions})`, params);
        }
        if (filters) {
            if (filters.age_range) {
                query = query.andWhere('profile.age BETWEEN :minAge AND :maxAge', {
                    minAge: filters.age_range.min,
                    maxAge: filters.age_range.max,
                });
            }
            if (filters.services && filters.services.length > 0) {
                query = query.andWhere('profile.services_offered && :services', {
                    services: filters.services,
                });
            }
            if (filters.body_type) {
                query = query.andWhere('profile.body_type ILIKE :bodyType', {
                    bodyType: `%${filters.body_type}%`,
                });
            }
            if (filters.hair_color) {
                query = query.andWhere('profile.hair_color ILIKE :hairColor', {
                    hairColor: `%${filters.hair_color}%`,
                });
            }
            if (filters.min_rating) {
                query = query.andWhere('profile.average_rating >= :minRating', {
                    minRating: filters.min_rating,
                });
            }
        }
        query = query.orderBy('profile.average_rating', 'DESC').addOrderBy('profile.total_views', 'DESC');
        const recommendations = await query.limit(10).getMany();
        const confidenceScore = Math.min(100, (recommendations.length / 10) * 100 * 0.7 + (keywords.length / 5) * 100 * 0.3);
        const explanation = this.generateExplanation(keywords, recommendations.length, location, budget_range);
        return {
            recommendations,
            explanation,
            matched_keywords: keywords,
            confidence_score: Math.round(confidenceScore),
        };
    }
    async getFeedback(userId, recommendationId, rating, feedback) {
        console.log(`Feedback from user ${userId} on recommendation ${recommendationId}: Rating ${rating}, Feedback: ${feedback}`);
        return { message: 'Feedback recorded successfully' };
    }
    async getRecommendationHistory(userId, limit = 10, offset = 0) {
        return { data: [], total: 0 };
    }
    extractKeywords(description) {
        const stopWords = [
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
            'the', 'to', 'was', 'will', 'with', 'que', 'o', 'a', 'e', 'de',
            'para', 'com', 'por', 'em', 'do', 'da', 'um', 'uma', 'os', 'as',
        ];
        const words = description
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 2 && !stopWords.includes(word))
            .slice(0, 5);
        return [...new Set(words)];
    }
    generateExplanation(keywords, matchCount, location, budget_range) {
        let explanation = 'Based on your preferences, ';
        if (keywords.length > 0) {
            explanation += `we found profiles matching your interests in ${keywords.join(', ')}. `;
        }
        if (location) {
            explanation += `We filtered results for the ${location} area. `;
        }
        if (budget_range) {
            explanation += `All results are within your budget of R$ ${budget_range.min} to R$ ${budget_range.max}. `;
        }
        explanation += `We found ${matchCount} profiles that match your criteria.`;
        return explanation;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(entities_1.ProfileEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(entities_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], AiService);
//# sourceMappingURL=ai.service.js.map