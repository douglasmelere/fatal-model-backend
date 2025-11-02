import { Repository } from 'typeorm';
import { UserEntity } from '../../database/entities';
import { UpdateProfileDto } from './dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<UserEntity>);
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserEntity>;
    getProfile(userId: string): Promise<UserEntity>;
    getAllUsers(limit?: number, offset?: number): Promise<{
        data: UserEntity[];
        total: number;
    }>;
    getUsersByRole(role: string, limit?: number, offset?: number): Promise<{
        data: UserEntity[];
        total: number;
    }>;
    suspendUser(userId: string): Promise<UserEntity>;
    activateUser(userId: string): Promise<UserEntity>;
    deleteUser(userId: string): Promise<void>;
    updateNotificationPreferences(userId: string, emailNotifications: boolean, smsNotifications: boolean): Promise<UserEntity>;
}
