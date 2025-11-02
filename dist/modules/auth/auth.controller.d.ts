import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { UserEntity } from '../../database/entities';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import("../../database/entities").UserRole;
            status: import("../../database/entities").UserStatus;
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
            role: import("../../database/entities").UserRole;
            status: import("../../database/entities").UserStatus;
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
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user: UserEntity): Promise<{
        message: string;
    }>;
}
