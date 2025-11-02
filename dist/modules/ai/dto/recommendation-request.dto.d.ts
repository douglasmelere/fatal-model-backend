export declare class RecommendationRequestDto {
    description: string;
    location?: string;
    budget_range?: {
        min: number;
        max: number;
    };
    filters?: Record<string, any>;
}
