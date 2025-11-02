import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity, UserEntity, UserStatus } from '../../database/entities';
import { RecommendationRequestDto } from './dto';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(ProfileEntity)
    private profilesRepository: Repository<ProfileEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getRecommendations(
    userId: string,
    recommendationRequest: RecommendationRequestDto,
  ): Promise<{
    recommendations: ProfileEntity[];
    explanation: string;
    matched_keywords: string[];
    confidence_score: number;
  }> {
    const { description, location, budget_range, filters } = recommendationRequest;

    // Extract keywords from description
    const keywords = this.extractKeywords(description);

    // Build search query based on keywords and filters
    let query = this.profilesRepository
      .createQueryBuilder('profile')
      .innerJoin('profile.user', 'user')
      .where('profile.is_active = :isActive', { isActive: true })
      .andWhere('profile.is_verified = :isVerified', { isVerified: true })
      .andWhere('user.status = :userStatus', { userStatus: UserStatus.ACTIVE });

    // Apply location filter
    if (location) {
      query = query.andWhere('profile.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    // Apply budget filter
    if (budget_range) {
      query = query.andWhere(
        `(profile.pricing->>'hourly_rate')::numeric BETWEEN :minBudget AND :maxBudget`,
        {
          minBudget: budget_range.min,
          maxBudget: budget_range.max,
        },
      );
    }

    // Apply keyword matching
    if (keywords.length > 0) {
      const keywordConditions = keywords
        .map(
          (keyword, index) =>
            `(profile.display_name ILIKE :keyword${index} OR profile.bio ILIKE :keyword${index} OR profile.services_offered::text ILIKE :keyword${index})`,
        )
        .join(' OR ');

      const params = {};
      keywords.forEach((keyword, index) => {
        params[`keyword${index}`] = `%${keyword}%`;
      });

      query = query.andWhere(`(${keywordConditions})`, params);
    }

    // Apply additional filters
    if (filters) {
      if (filters.age_range) {
        query = query.andWhere(
          'profile.age BETWEEN :minAge AND :maxAge',
          {
            minAge: filters.age_range.min,
            maxAge: filters.age_range.max,
          },
        );
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

    // Order by rating and views
    query = query.orderBy('profile.average_rating', 'DESC').addOrderBy('profile.total_views', 'DESC');

    const recommendations = await query.limit(10).getMany();

    // Calculate confidence score based on matches
    const confidenceScore = Math.min(
      100,
      (recommendations.length / 10) * 100 * 0.7 + (keywords.length / 5) * 100 * 0.3,
    );

    const explanation = this.generateExplanation(
      keywords,
      recommendations.length,
      location,
      budget_range,
    );

    return {
      recommendations,
      explanation,
      matched_keywords: keywords,
      confidence_score: Math.round(confidenceScore),
    };
  }

  async getFeedback(
    userId: string,
    recommendationId: string,
    rating: number,
    feedback: string,
  ): Promise<{ message: string }> {
    // In a real implementation, you would store this feedback
    // for machine learning model improvement
    console.log(
      `Feedback from user ${userId} on recommendation ${recommendationId}: Rating ${rating}, Feedback: ${feedback}`,
    );

    return { message: 'Feedback recorded successfully' };
  }

  async getRecommendationHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: any[]; total: number }> {
    // In a real implementation, you would fetch from a recommendations_history table
    // For now, return empty
    return { data: [], total: 0 };
  }

  private extractKeywords(description: string): string[] {
    // Simple keyword extraction
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

  private generateExplanation(
    keywords: string[],
    matchCount: number,
    location?: string,
    budget_range?: { min: number; max: number },
  ): string {
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
}
