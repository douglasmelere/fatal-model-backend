import { Repository } from 'typeorm';
import { ProfileEntity, UserEntity } from '../../database/entities';
import { CreateProfileDto, UpdateProfileDto } from './dto';
export declare class ProfilesService {
    private profilesRepository;
    private usersRepository;
    constructor(profilesRepository: Repository<ProfileEntity>, usersRepository: Repository<UserEntity>);
    createProfile(userId: string, createProfileDto: CreateProfileDto): Promise<ProfileEntity>;
    getProfileByUserId(userId: string): Promise<ProfileEntity>;
    getProfileById(profileId: string): Promise<ProfileEntity>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<ProfileEntity>;
    addPhotos(userId: string, photoUrls: string[]): Promise<ProfileEntity>;
    setMainPhoto(userId: string, photoUrl: string): Promise<ProfileEntity>;
    updateAvailability(userId: string, availability: Record<string, boolean>): Promise<ProfileEntity>;
    updatePixKey(userId: string, pixKey: string, pixKeyType: string): Promise<ProfileEntity>;
    getVerifiedProfiles(limit?: number, offset?: number): Promise<{
        data: ProfileEntity[];
        total: number;
    }>;
    searchProfiles(filters: any, limit?: number, offset?: number): Promise<{
        data: ProfileEntity[];
        total: number;
    }>;
    verifyProfile(profileId: string): Promise<ProfileEntity>;
    deactivateProfile(userId: string): Promise<ProfileEntity>;
    activateProfile(userId: string): Promise<ProfileEntity>;
}
