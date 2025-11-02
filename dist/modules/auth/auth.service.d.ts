import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserEntity, UserStatus, UserRole } from '../../database/entities';
import { RegisterDto, LoginDto } from './dto';
import { ProfilesService } from '../profiles/profiles.service';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    private profilesService;
    constructor(usersRepository: Repository<UserEntity>, jwtService: JwtService, profilesService: ProfilesService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            role: UserRole;
            status: UserStatus;
            verification_status: import("../../database/entities").VerificationStatus;
            phone: string;
            phone_verified: boolean;
            first_name: string;
            last_name: string;
            avatar_url: string;
            last_login: Date;
            email_notifications: boolean;
            sms_notifications: boolean;
            created_at: Date;
            updated_at: Date;
            profile: import("../../database/entities").ProfileEntity;
            appointments_as_client: import("../../database/entities").AppointmentEntity[];
            appointments_as_escort: import("../../database/entities").AppointmentEntity[];
            payments_as_client: import("../../database/entities").PaymentEntity[];
            payments_as_escort: import("../../database/entities").PaymentEntity[];
            reviews_as_client: import("../../database/entities").ReviewEntity[];
            reviews_as_escort: import("../../database/entities").ReviewEntity[];
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            role: UserRole;
            status: UserStatus;
            verification_status: import("../../database/entities").VerificationStatus;
            phone: string;
            phone_verified: boolean;
            first_name: string;
            last_name: string;
            avatar_url: string;
            last_login: Date;
            email_notifications: boolean;
            sms_notifications: boolean;
            created_at: Date;
            updated_at: Date;
            profile: import("../../database/entities").ProfileEntity;
            appointments_as_client: import("../../database/entities").AppointmentEntity[];
            appointments_as_escort: import("../../database/entities").AppointmentEntity[];
            payments_as_client: import("../../database/entities").PaymentEntity[];
            payments_as_escort: import("../../database/entities").PaymentEntity[];
            reviews_as_client: import("../../database/entities").ReviewEntity[];
            reviews_as_escort: import("../../database/entities").ReviewEntity[];
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    generateTokens(userId: string, email: string, role: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private sanitizeUser;
}
