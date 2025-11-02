import { AiService } from './ai.service';
import { RecommendationRequestDto } from './dto';
import { UserEntity } from '../../database/entities';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    getRecommendations(user: UserEntity, recommendationRequest: RecommendationRequestDto): Promise<{
        recommendations: import("../../database/entities").ProfileEntity[];
        explanation: string;
        matched_keywords: string[];
        confidence_score: number;
    }>;
    getRecommendationHistory(user: UserEntity, limit?: number, offset?: number): Promise<{
        data: any[];
        total: number;
    }>;
    provideFeedback(user: UserEntity, body: {
        recommendationId: string;
        rating: number;
        feedback: string;
    }): Promise<{
        message: string;
    }>;
}
