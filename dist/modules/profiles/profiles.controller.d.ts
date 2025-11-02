import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { UserEntity, UserRole } from '../../database/entities';
export declare class ProfilesController {
    private profilesService;
    constructor(profilesService: ProfilesService);
    createProfile(user: UserEntity, createProfileDto: CreateProfileDto): Promise<import("../../database/entities").ProfileEntity>;
    getMyProfile(user: UserEntity): Promise<import("../../database/entities").ProfileEntity | null>;
    getVerifiedProfiles(limit?: number, offset?: number): Promise<{
        data: import("../../database/entities").ProfileEntity[];
        total: number;
    }>;
    searchProfiles(filters: any, limit?: number, offset?: number): Promise<{
        data: import("../../database/entities").ProfileEntity[];
        total: number;
    }>;
    debugProfiles(): Promise<{
        id: string;
        display_name: string;
        is_active: boolean;
        user_id: string;
        user_role: UserRole;
        user_email: string;
    }[]>;
    getProfileById(id: string): Promise<import("../../database/entities").ProfileEntity>;
    updateProfile(user: UserEntity, updateProfileDto: UpdateProfileDto): Promise<import("../../database/entities").ProfileEntity>;
    addPhotos(user: UserEntity, body: {
        photoUrls: string[];
    }): Promise<import("../../database/entities").ProfileEntity>;
    setMainPhoto(user: UserEntity, body: {
        photoUrl: string;
    }): Promise<import("../../database/entities").ProfileEntity>;
    updateAvailability(user: UserEntity, body: {
        availability: Record<string, boolean>;
    }): Promise<import("../../database/entities").ProfileEntity>;
    updatePixKey(user: UserEntity, body: {
        pixKey: string;
        pixKeyType: string;
    }): Promise<import("../../database/entities").ProfileEntity>;
}
