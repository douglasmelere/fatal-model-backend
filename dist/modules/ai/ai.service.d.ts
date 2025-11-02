import { Repository } from 'typeorm';
import { ProfileEntity, UserEntity } from '../../database/entities';
import { RecommendationRequestDto } from './dto';
export declare class AiService {
    private profilesRepository;
    private usersRepository;
    constructor(profilesRepository: Repository<ProfileEntity>, usersRepository: Repository<UserEntity>);
    getRecommendations(userId: string, recommendationRequest: RecommendationRequestDto): Promise<{
        recommendations: ProfileEntity[];
        explanation: string;
        matched_keywords: string[];
        confidence_score: number;
    }>;
    getFeedback(userId: string, recommendationId: string, rating: number, feedback: string): Promise<{
        message: string;
    }>;
    getRecommendationHistory(userId: string, limit?: number, offset?: number): Promise<{
        data: any[];
        total: number;
    }>;
    private extractKeywords;
    private generateExplanation;
}
