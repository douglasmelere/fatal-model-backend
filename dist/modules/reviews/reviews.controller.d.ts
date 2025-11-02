import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto';
import { UserEntity } from '../../database/entities';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(user: UserEntity, createReviewDto: CreateReviewDto): Promise<import("../../database/entities").ReviewEntity>;
    getReviewById(id: string): Promise<import("../../database/entities").ReviewEntity>;
    getEscortReviews(escortId: string, limit?: number, offset?: number): Promise<{
        data: import("../../database/entities").ReviewEntity[];
        total: number;
    }>;
    respondToReview(reviewId: string, user: UserEntity, body: {
        response: string;
    }): Promise<import("../../database/entities").ReviewEntity>;
    deleteReview(reviewId: string, user: UserEntity): Promise<{
        message: string;
    }>;
}
