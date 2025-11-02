import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
export declare class MigrationService implements OnModuleInit {
    private readonly dataSource;
    private readonly configService;
    private readonly logger;
    constructor(dataSource: DataSource, configService: ConfigService);
    onModuleInit(): Promise<void>;
    runMigrations(): Promise<void>;
}
