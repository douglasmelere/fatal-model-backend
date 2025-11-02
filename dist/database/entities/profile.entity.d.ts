import { UserEntity } from './user.entity';
export declare class ProfileEntity {
    id: string;
    user_id: string;
    display_name: string;
    bio: string;
    age: number;
    location: string;
    latitude: number;
    longitude: number;
    height: string;
    weight: string;
    hair_color: string;
    eye_color: string;
    body_type: string;
    ethnicity: string;
    services_offered: string[];
    pricing: {
        hourly_rate: number;
        package_rates?: Record<string, number>;
        minimum_duration?: number;
    };
    availability_calendar: Record<string, boolean>;
    pix_key: string;
    pix_key_type: string;
    photos: string[];
    main_photo: string;
    is_verified: boolean;
    verified_at: Date;
    total_views: number;
    total_bookings: number;
    average_rating: number;
    total_reviews: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    user: UserEntity;
}
