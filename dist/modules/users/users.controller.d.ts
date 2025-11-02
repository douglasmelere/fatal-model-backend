import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto';
import { UserEntity } from '../../database/entities';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: UserEntity): Promise<UserEntity>;
    updateProfile(user: UserEntity, updateProfileDto: UpdateProfileDto): Promise<UserEntity>;
    getUserById(id: string): Promise<UserEntity | null>;
    getAllUsers(limit?: number, offset?: number): Promise<{
        data: UserEntity[];
        total: number;
    }>;
    getUsersByRole(role: string, limit?: number, offset?: number): Promise<{
        data: UserEntity[];
        total: number;
    }>;
    updateNotificationPreferences(user: UserEntity, body: {
        emailNotifications: boolean;
        smsNotifications: boolean;
    }): Promise<UserEntity>;
}
