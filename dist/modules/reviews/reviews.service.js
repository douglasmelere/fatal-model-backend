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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
let ReviewsService = class ReviewsService {
    reviewsRepository;
    appointmentsRepository;
    profilesRepository;
    constructor(reviewsRepository, appointmentsRepository, profilesRepository) {
        this.reviewsRepository = reviewsRepository;
        this.appointmentsRepository = appointmentsRepository;
        this.profilesRepository = profilesRepository;
    }
    async createReview(clientId, createReviewDto) {
        const { appointment_id, rating, comment, is_anonymous } = createReviewDto;
        const appointment = await this.appointmentsRepository.findOne({
            where: { id: appointment_id },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.client_id !== clientId) {
            throw new common_1.ForbiddenException('Only the client can review this appointment');
        }
        const existingReview = await this.reviewsRepository.findOne({
            where: { appointment_id },
        });
        if (existingReview) {
            throw new common_1.BadRequestException('Review already exists for this appointment');
        }
        const review = this.reviewsRepository.create({
            appointment_id,
            client_id: clientId,
            escort_id: appointment.escort_id,
            rating,
            comment,
            is_anonymous: is_anonymous || false,
            is_verified_purchase: true,
        });
        const savedReview = await this.reviewsRepository.save(review);
        appointment.review_id = savedReview.id;
        await this.appointmentsRepository.save(appointment);
        await this.updateEscortRating(appointment.escort_id);
        return savedReview;
    }
    async getReviewById(reviewId) {
        const review = await this.reviewsRepository.findOne({
            where: { id: reviewId },
            relations: ['client', 'escort', 'appointment'],
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async getEscortReviews(escortId, limit = 10, offset = 0) {
        const [data, total] = await this.reviewsRepository.findAndCount({
            where: { escort_id: escortId },
            relations: ['client', 'appointment'],
            order: { created_at: 'DESC' },
            skip: offset,
            take: limit,
        });
        return { data, total };
    }
    async respondToReview(reviewId, escortId, response) {
        const review = await this.getReviewById(reviewId);
        if (review.escort_id !== escortId) {
            throw new common_1.ForbiddenException('Only the escort can respond to this review');
        }
        review.response_from_escort = response;
        review.responded_at = new Date();
        return this.reviewsRepository.save(review);
    }
    async deleteReview(reviewId, clientId) {
        const review = await this.getReviewById(reviewId);
        if (review.client_id !== clientId) {
            throw new common_1.ForbiddenException('Only the client who created the review can delete it');
        }
        const appointment = await this.appointmentsRepository.findOne({
            where: { id: review.appointment_id },
        });
        if (appointment) {
            appointment.review_id = undefined;
            await this.appointmentsRepository.save(appointment);
        }
        await this.reviewsRepository.remove(review);
        await this.updateEscortRating(review.escort_id);
    }
    async updateEscortRating(escortId) {
        const profile = await this.profilesRepository.findOne({
            where: { user_id: escortId },
        });
        if (!profile) {
            return;
        }
        const reviews = await this.reviewsRepository.find({
            where: { escort_id: escortId },
        });
        if (reviews.length === 0) {
            profile.average_rating = 0;
            profile.total_reviews = 0;
        }
        else {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            profile.average_rating = parseFloat((totalRating / reviews.length).toFixed(2));
            profile.total_reviews = reviews.length;
        }
        await this.profilesRepository.save(profile);
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(entities_1.ReviewEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(entities_1.AppointmentEntity)),
    __param(2, (0, typeorm_2.InjectRepository)(entities_1.ProfileEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map