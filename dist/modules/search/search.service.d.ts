import { Repository } from 'typeorm';
import { ProfileEntity, UserEntity } from '../../database/entities';
import { SearchFiltersDto } from './dto';
export declare class SearchService {
    private profilesRepository;
    private usersRepository;
    constructor(profilesRepository: Repository<ProfileEntity>, usersRepository: Repository<UserEntity>);
    searchProfiles(filters: SearchFiltersDto, limit?: number, offset?: number): Promise<{
        data: ProfileEntity[];
        total: number;
    }>;
    searchByKeyword(keyword: string, limit?: number, offset?: number): Promise<{
        data: ProfileEntity[];
        total: number;
    }>;
    getTopRated(limit?: number): Promise<{
        data: ProfileEntity[];
        total: number;
    }>;
    getMostViewed(limit?: number): Promise<{
        data: ProfileEntity[];
        total: number;
    }>;
    getNewProfiles(limit?: number): Promise<{
        data: ProfileEntity[];
        total: number;
    }>;
}
