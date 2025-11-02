import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity, UserEntity, UserRole, UserStatus } from '../../database/entities';
import { CreateProfileDto, UpdateProfileDto } from './dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(ProfileEntity)
    private profilesRepository: Repository<ProfileEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<ProfileEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.ESCORT) {
      throw new BadRequestException(
        'Only escorts can create profiles',
      );
    }

    const existingProfile = await this.profilesRepository.findOne({
      where: { user_id: userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Profile already exists for this user');
    }

    // Validar campos obrigatórios
    if (!createProfileDto.display_name || createProfileDto.display_name.trim() === '') {
      throw new BadRequestException('display_name is required');
    }

    try {
      const profile = this.profilesRepository.create({
        user_id: userId,
        display_name: createProfileDto.display_name,
        bio: createProfileDto.bio || null,
        age: createProfileDto.age || null,
        location: createProfileDto.location || null,
        height: createProfileDto.height || null,
        weight: createProfileDto.weight || null,
        hair_color: createProfileDto.hair_color || null,
        eye_color: createProfileDto.eye_color || null,
        body_type: createProfileDto.body_type || null,
        ethnicity: createProfileDto.ethnicity || null,
        services_offered: createProfileDto.services_offered || [],
        pricing: createProfileDto.pricing || null,
        pix_key: createProfileDto.pix_key || null,
        pix_key_type: createProfileDto.pix_key_type || null,
        is_active: true,
        is_verified: false,
      });

      return await this.profilesRepository.save(profile);
    } catch (error) {
      // Log do erro para debug
      console.error('Error creating profile:', error);
      
      // Se for erro de validação do TypeORM, retornar mensagem mais clara
      if (error.code === '23505') { // Unique violation
        throw new BadRequestException('Profile already exists for this user');
      }
      
      if (error.code === '23502') { // Not null violation
        throw new BadRequestException(`Missing required field: ${error.column}`);
      }
      
      throw new BadRequestException(
        error.message || 'Failed to create profile. Please check your data and try again.'
      );
    }
  }

  async getProfileByUserId(userId: string): Promise<ProfileEntity | null> {
    const profile = await this.profilesRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    return profile || null;
  }

  async getProfileById(profileId: string): Promise<ProfileEntity> {
    const profile = await this.profilesRepository.findOne({
      where: { id: profileId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Increment view count
    profile.total_views += 1;
    await this.profilesRepository.save(profile);

    return profile;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileEntity> {
    const profile = await this.getProfileByUserId(userId);
    
    if (!profile) {
      throw new NotFoundException('Profile not found. Please create a profile first.');
    }
    
    Object.assign(profile, updateProfileDto);
    return this.profilesRepository.save(profile);
  }

  async addPhotos(userId: string, photoUrls: string[]): Promise<ProfileEntity> {
    const profile = await this.getProfileByUserId(userId);
    
    if (!profile) {
      throw new NotFoundException('Profile not found. Please create a profile first.');
    }
    
    profile.photos = [...(profile.photos || []), ...photoUrls];

    if (!profile.main_photo && photoUrls.length > 0) {
      profile.main_photo = photoUrls[0];
    }

    return this.profilesRepository.save(profile);
  }

  async setMainPhoto(userId: string, photoUrl: string): Promise<ProfileEntity> {
    const profile = await this.getProfileByUserId(userId);
    
    if (!profile) {
      throw new NotFoundException('Profile not found. Please create a profile first.');
    }

    if (!profile.photos.includes(photoUrl)) {
      throw new BadRequestException('Photo not found in profile');
    }

    profile.main_photo = photoUrl;
    return this.profilesRepository.save(profile);
  }

  async updateAvailability(
    userId: string,
    availability: Record<string, boolean>,
  ): Promise<ProfileEntity> {
    const profile = await this.getProfileByUserId(userId);
    
    if (!profile) {
      throw new NotFoundException('Profile not found. Please create a profile first.');
    }
    
    profile.availability_calendar = availability;
    return this.profilesRepository.save(profile);
  }

  async updatePixKey(
    userId: string,
    pixKey: string,
    pixKeyType: string,
  ): Promise<ProfileEntity> {
    const profile = await this.getProfileByUserId(userId);
    
    if (!profile) {
      throw new NotFoundException('Profile not found. Please create a profile first.');
    }
    
    profile.pix_key = pixKey;
    profile.pix_key_type = pixKeyType;
    return this.profilesRepository.save(profile);
  }

  async getVerifiedProfiles(
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: ProfileEntity[]; total: number }> {
    const query = this.profilesRepository
      .createQueryBuilder('profile')
      .innerJoin('profile.user', 'user')
      .where('profile.is_verified = :isVerified', { isVerified: true })
      .andWhere('profile.is_active = :isActive', { isActive: true })
      .andWhere('user.status = :userStatus', { userStatus: 'ACTIVE' })
      .skip(offset)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async searchProfiles(
    filters: any,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: ProfileEntity[]; total: number }> {
    let query = this.profilesRepository
      .createQueryBuilder('profile')
      .innerJoin('profile.user', 'user')
      .where('profile.is_active = :isActive', { isActive: true })
      .andWhere('profile.is_verified = :isVerified', { isVerified: true })
      .andWhere('user.status = :userStatus', { userStatus: UserStatus.ACTIVE });

    if (filters.location) {
      query = query.andWhere('profile.location ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    if (filters.minAge && filters.maxAge) {
      query = query.andWhere('profile.age BETWEEN :minAge AND :maxAge', {
        minAge: filters.minAge,
        maxAge: filters.maxAge,
      });
    }

    if (filters.minPrice && filters.maxPrice) {
      query = query.andWhere(
        'profile.pricing->\'hourly_rate\' BETWEEN :minPrice AND :maxPrice',
        {
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        },
      );
    }

    if (filters.services && filters.services.length > 0) {
      query = query.andWhere('profile.services_offered && :services', {
        services: filters.services,
      });
    }

    const [data, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async verifyProfile(profileId: string): Promise<ProfileEntity> {
    const profile = await this.profilesRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    profile.is_verified = true;
    profile.verified_at = new Date();
    return this.profilesRepository.save(profile);
  }

  async deactivateProfile(userId: string): Promise<ProfileEntity> {
    const profile = await this.getProfileByUserId(userId);
    
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    
    profile.is_active = false;
    return this.profilesRepository.save(profile);
  }

  async activateProfile(userId: string): Promise<ProfileEntity> {
    const profile = await this.getProfileByUserId(userId);
    
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    
    profile.is_active = true;
    return this.profilesRepository.save(profile);
  }
}
