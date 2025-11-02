import { SearchService } from './search.service';
import { SearchFiltersDto } from './dto';
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    searchEscorts(filters: SearchFiltersDto, limit: number, offset: number): Promise<{
        data: import("../../database/entities").ProfileEntity[];
        total: number;
    }>;
    searchByKeyword(keyword: string, limit: number, offset: number): Promise<{
        data: import("../../database/entities").ProfileEntity[];
        total: number;
    }>;
    getTopRated(limit: number): Promise<{
        data: import("../../database/entities").ProfileEntity[];
        total: number;
    }>;
    getMostViewed(limit: number): Promise<{
        data: import("../../database/entities").ProfileEntity[];
        total: number;
    }>;
    getNewProfiles(limit: number): Promise<{
        data: import("../../database/entities").ProfileEntity[];
        total: number;
    }>;
}
