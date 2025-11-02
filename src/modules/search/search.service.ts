import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity, UserEntity, UserStatus } from '../../database/entities';
import { SearchFiltersDto } from './dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(ProfileEntity)
    private profilesRepository: Repository<ProfileEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async searchProfiles(
    filters: SearchFiltersDto,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: ProfileEntity[]; total: number }> {
    let query = this.profilesRepository
      .createQueryBuilder('profile')
      .innerJoin('profile.user', 'user') // join explícito com entidade User
      .where('profile.is_active = :isActive', { isActive: true })
      .andWhere('profile.is_verified = :isVerified', { isVerified: true })
      .andWhere('user.role = :escortRole', { escortRole: 'ESCORT' })
      .andWhere('user.status = :userStatus', { userStatus: UserStatus.ACTIVE });

    // Location filter
    if (filters.location) {
      query = query.andWhere('profile.location ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    // Age range filter
    if (filters.minAge && filters.maxAge) {
      query = query.andWhere('profile.age BETWEEN :minAge AND :maxAge', {
        minAge: filters.minAge,
        maxAge: filters.maxAge,
      });
    } else if (filters.minAge) {
      query = query.andWhere('profile.age >= :minAge', {
        minAge: filters.minAge,
      });
    } else if (filters.maxAge) {
      query = query.andWhere('profile.age <= :maxAge', {
        maxAge: filters.maxAge,
      });
    }

    // Price range filter
    if (filters.minPrice && filters.maxPrice) {
      query = query.andWhere(
        `(profile.pricing->>'hourly_rate')::numeric BETWEEN :minPrice AND :maxPrice`,
        {
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        },
      );
    } else if (filters.minPrice) {
      query = query.andWhere(
        `(profile.pricing->>'hourly_rate')::numeric >= :minPrice`,
        {
          minPrice: filters.minPrice,
        },
      );
    } else if (filters.maxPrice) {
      query = query.andWhere(
        `(profile.pricing->>'hourly_rate')::numeric <= :maxPrice`,
        {
          maxPrice: filters.maxPrice,
        },
      );
    }

    // Services filter
    if (filters.services && filters.services.length > 0) {
      query = query.andWhere('profile.services_offered && :services', {
        services: filters.services,
      });
    }

    // Body type filter
    if (filters.bodyType) {
      query = query.andWhere('profile.body_type ILIKE :bodyType', {
        bodyType: `%${filters.bodyType}%`,
      });
    }

    // Hair color filter
    if (filters.hairColor) {
      query = query.andWhere('profile.hair_color ILIKE :hairColor', {
        hairColor: `%${filters.hairColor}%`,
      });
    }

    // Minimum rating filter
    if (filters.minRating) {
      query = query.andWhere('profile.average_rating >= :minRating', {
        minRating: filters.minRating,
      });
    }

    // Sorting
    const sortBy = filters.sortBy || 'newest';
    const sortOrder = filters.sortOrder || 'DESC';

    switch (sortBy) {
      case 'rating':
        query = query.orderBy('profile.average_rating', sortOrder);
        break;
      case 'price':
        query = query.orderBy(
          `(profile.pricing->>'hourly_rate')::numeric`,
          sortOrder,
        );
        break;
      case 'views':
        query = query.orderBy('profile.total_views', sortOrder);
        break;
      case 'newest':
      default:
        query = query.orderBy('profile.created_at', sortOrder);
        break;
    }

    const [data, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async searchByKeyword(
    keyword: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: ProfileEntity[]; total: number }> {
    const query = this.profilesRepository
      .createQueryBuilder('profile')
      .where('profile.is_active = :isActive', { isActive: true })
      .andWhere('profile.is_verified = :isVerified', { isVerified: true })
      .andWhere(
        '(profile.display_name ILIKE :keyword OR profile.bio ILIKE :keyword OR profile.services_offered::text ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      )
      .innerJoin('profile.user', 'user')
      .andWhere('user.role = :escortRole', { escortRole: 'ESCORT' })
      .andWhere('user.status = :userStatus', { userStatus: UserStatus.ACTIVE });

    const [data, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async getTopRated(
    limit: number = 10,
  ): Promise<{ data: ProfileEntity[]; total: number }> {
    const query = this.profilesRepository
      .createQueryBuilder('profile')
      .innerJoin('profile.user', 'user')
      .where('profile.is_active = :isActive', { isActive: true })
      .andWhere('profile.is_verified = :isVerified', { isVerified: true })
      .andWhere('user.role = :escortRole', { escortRole: 'ESCORT' })
      .andWhere('user.status = :userStatus', { userStatus: UserStatus.ACTIVE })
      .andWhere('profile.average_rating > 0')
      .orderBy('profile.average_rating', 'DESC')
      .addOrderBy('profile.total_reviews', 'DESC');

    const [data, total] = await query.skip(0).take(limit).getManyAndCount();

    return { data, total };
  }

  async getMostViewed(
    limit: number = 10,
  ): Promise<{ data: ProfileEntity[]; total: number }> {
    const query = this.profilesRepository
      .createQueryBuilder('profile')
      .innerJoin('profile.user', 'user')
      .where('profile.is_active = :isActive', { isActive: true })
      .andWhere('profile.is_verified = :isVerified', { isVerified: true })
      .andWhere('user.role = :escortRole', { escortRole: 'ESCORT' })
      .andWhere('user.status = :userStatus', { userStatus: UserStatus.ACTIVE })
      .orderBy('profile.total_views', 'DESC')
      .addOrderBy('profile.average_rating', 'DESC');

    const [data, total] = await query.skip(0).take(limit).getManyAndCount();

    return { data, total };
  }

  async getNewProfiles(
    limit: number = 10,
  ): Promise<{ data: ProfileEntity[]; total: number }> {
    const query = this.profilesRepository
      .createQueryBuilder('profile')
      .innerJoin('profile.user', 'user')
      .where('profile.is_active = :isActive', { isActive: true })
      .andWhere('profile.is_verified = :isVerified', { isVerified: true })
      .andWhere('user.role = :escortRole', { escortRole: 'ESCORT' })
      .andWhere('user.status = :userStatus', { userStatus: UserStatus.ACTIVE })
      .orderBy('profile.created_at', 'DESC');

    const [data, total] = await query.skip(0).take(limit).getManyAndCount();

    return { data, total };
  }
}