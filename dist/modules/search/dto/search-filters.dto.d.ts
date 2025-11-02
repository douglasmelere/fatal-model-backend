export declare class SearchFiltersDto {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    minAge?: number;
    maxAge?: number;
    services?: string[];
    bodyType?: string;
    hairColor?: string;
    minRating?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
}
