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

    // Location filter (by city name) - works independently or together with coordinates
    if (filters.location) {
      query = query.andWhere('profile.location ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    // Distance calculation (Haversine formula) - if latitude/longitude provided
    let hasDistanceFilter = false;
    if (filters.latitude !== undefined && filters.longitude !== undefined) {
      query = query.setParameter('userLat', filters.latitude)
        .setParameter('userLon', filters.longitude);
      
      // Only require coordinates if maxDistance is specified
      // Otherwise, show profiles with AND without coordinates
      if (filters.maxDistance !== undefined && filters.maxDistance > 0) {
        // Filter only profiles with coordinates within maxDistance
        query = query
          .andWhere('profile.latitude IS NOT NULL')
          .andWhere('profile.longitude IS NOT NULL');
        
        // Haversine formula in WHERE clause to filter by max distance
        const distanceFilter = `6371 * acos(
          LEAST(1.0, 
            sin(radians(:userLat)) * sin(radians(profile.latitude)) + 
            cos(radians(:userLat)) * cos(radians(profile.latitude)) * 
            cos(radians(profile.longitude) - radians(:userLon))
          )
        ) <= :maxDistance`;
        
        query = query.andWhere(distanceFilter, {
          maxDistance: filters.maxDistance,
        });
      }
      // If no maxDistance, don't filter by coordinates - show all matching profiles
      // (they'll be sorted by distance if they have coordinates, or by rating otherwise)
      
      hasDistanceFilter = true;
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
    const sortBy = filters.sortBy || (hasDistanceFilter ? 'distance' : 'newest');
    const sortOrder = filters.sortOrder || (sortBy === 'distance' ? 'ASC' : 'DESC');

    // Handle distance sorting separately (requires calculation after fetch)
    if (sortBy === 'distance' && hasDistanceFilter && filters.latitude !== undefined && filters.longitude !== undefined) {
      const lat = parseFloat(filters.latitude.toString());
      const lon = parseFloat(filters.longitude.toString());
      
      if (isNaN(lat) || isNaN(lon)) {
        // Invalid coordinates, fallback to newest
        query = query.orderBy('profile.created_at', sortOrder);
      } else {
        // For distance, we'll fetch all matching and sort in memory
        // (This is less efficient but works reliably with TypeORM)
        query = query.orderBy('profile.average_rating', 'DESC'); // Temporary order
      }
    } else {
      // Normal sorting
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
    }

    // Get total count first (before pagination)
    const total = await query.getCount();

    // For distance sorting, fetch more and sort in memory
    if (sortBy === 'distance' && hasDistanceFilter && filters.latitude !== undefined && filters.longitude !== undefined) {
      const lat = parseFloat(filters.latitude.toString());
      const lon = parseFloat(filters.longitude.toString());
      
      if (!isNaN(lat) && !isNaN(lon)) {
        // Fetch all matching profiles (up to reasonable limit)
        const allProfiles = await query.limit(1000).getMany();
        
        // Calculate distance and sort
        // Profiles WITH coordinates: calculate distance
        // Profiles WITHOUT coordinates: put at end with distance = Infinity
        const profilesWithDistance = allProfiles
          .map((profile) => {
            if (profile.latitude && profile.longitude) {
              // Haversine formula
              const R = 6371; // Earth's radius in km
              const dLat = ((profile.latitude - lat) * Math.PI) / 180;
              const dLon = ((profile.longitude - lon) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((lat * Math.PI) / 180) *
                  Math.cos((profile.latitude * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = R * c;
              return { profile, distance };
            }
            // Profile without coordinates - put at end
            return { profile, distance: Infinity };
          })
          .sort((a, b) => a.distance - b.distance) // Sort by distance ASC (Infinity goes to end)
          .slice(offset, offset + limit)
          .map((item) => item.profile);
        
        return { data: profilesWithDistance, total };
      }
    }

    const data = await query
      .skip(offset)
      .take(limit)
      .getMany();

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