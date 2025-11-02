import { Repository } from 'typeorm';
import { ProfileEntity } from './database/entities/profile.entity';
import { UserEntity, UserRole, UserStatus } from './database/entities/user.entity';
export declare class DebugController {
    private profilesRepository;
    private usersRepository;
    constructor(profilesRepository: Repository<ProfileEntity>, usersRepository: Repository<UserEntity>);
    debugProfiles(): Promise<{
        id: string;
        display_name: string;
        is_active: boolean;
        user_id: string;
        user_role: UserRole;
        user_email: string;
    }[]>;
    debugAdmins(): Promise<{
        count: number;
        admins: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            status: UserStatus;
            created_at: Date;
        }[];
    }>;
    createAdmin(body: {
        email: string;
        password: string;
        first_name?: string;
        last_name?: string;
    }): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        message: string;
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: UserRole;
            status: UserStatus;
        };
    }>;
}
