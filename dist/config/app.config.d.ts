export declare const appConfig: (() => {
    port: number;
    host: string;
    env: string;
    name: string;
    version: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    host: string;
    env: string;
    name: string;
    version: string;
}>;
export declare const databaseConfig: (() => {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    entities: string[];
    migrations: string[];
    migrationsTableName: string;
    synchronize: boolean;
    logging: boolean;
    ssl: {
        rejectUnauthorized: boolean;
    } | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    entities: string[];
    migrations: string[];
    migrationsTableName: string;
    synchronize: boolean;
    logging: boolean;
    ssl: {
        rejectUnauthorized: boolean;
    } | undefined;
}>;
export declare const redisConfig: (() => {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    password: string | undefined;
    db: number;
}>;
export declare const jwtConfig: (() => {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
}>;
export declare const awsConfig: (() => {
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string;
    s3Bucket: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string;
    s3Bucket: string | undefined;
}>;
export declare const emailConfig: (() => {
    host: string | undefined;
    port: number;
    user: string | undefined;
    password: string | undefined;
    from: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string | undefined;
    port: number;
    user: string | undefined;
    password: string | undefined;
    from: string;
}>;
export declare const openaiConfig: (() => {
    apiKey: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    apiKey: string | undefined;
}>;
