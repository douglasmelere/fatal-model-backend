import { Repository } from 'typeorm';
import { ReviewEntity, AppointmentEntity, ProfileEntity } from '../../database/entities';
import { CreateReviewDto } from './dto';
export declare class ReviewsService {
    private reviewsRepository;
    private appointmentsRepository;
    private profilesRepository;
    constructor(reviewsRepository: Repository<ReviewEntity>, appointmentsRepository: Repository<AppointmentEntity>, profilesRepository: Repository<ProfileEntity>);
    createReview(clientId: string, createReviewDto: CreateReviewDto): Promise<ReviewEntity>;
    getReviewById(reviewId: string): Promise<ReviewEntity>;
    getEscortReviews(escortId: string, limit?: number, offset?: number): Promise<{
        data: ReviewEntity[];
        total: number;
    }>;
    respondToReview(reviewId: string, escortId: string, response: string): Promise<ReviewEntity>;
    deleteReview(reviewId: string, clientId: string): Promise<void>;
    private updateEscortRating;
}
