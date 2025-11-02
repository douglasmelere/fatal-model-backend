export declare class SearchFiltersDto {
    location?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    maxDistance?: number;
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
