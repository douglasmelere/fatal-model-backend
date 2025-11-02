export declare class CreateProfileDto {
    display_name: string;
    bio?: string;
    age?: number;
    location?: string;
    height?: string;
    weight?: string;
    hair_color?: string;
    eye_color?: string;
    body_type?: string;
    ethnicity?: string;
    services_offered?: string[];
    pricing?: {
        hourly_rate: number;
        package_rates?: Record<string, number>;
        minimum_duration?: number;
    };
    pix_key?: string;
    pix_key_type?: string;
}
