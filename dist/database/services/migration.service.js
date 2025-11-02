"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MigrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
let MigrationService = MigrationService_1 = class MigrationService {
    dataSource;
    configService;
    logger = new common_1.Logger(MigrationService_1.name);
    constructor(dataSource, configService) {
        this.dataSource = dataSource;
        this.configService = configService;
    }
    async onModuleInit() {
        if (process.env.RUN_MIGRATIONS === 'true') {
            await new Promise(resolve => setTimeout(resolve, 3000));
            await this.runMigrations();
        }
        else {
            this.logger.log('Migrations disabled (RUN_MIGRATIONS != true)');
        }
    }
    async runMigrations() {
        try {
            this.logger.log('Checking for pending migrations...');
            let retries = 10;
            while (!this.dataSource.isInitialized && retries > 0) {
                this.logger.warn(`DataSource not initialized, waiting... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                retries--;
            }
            if (!this.dataSource.isInitialized) {
                this.logger.error('DataSource not initialized after waiting, skipping migrations');
                return;
            }
            this.logger.log('DataSource initialized, checking for migrations...');
            const hasPendingMigrations = await this.dataSource.showMigrations();
            if (!hasPendingMigrations) {
                this.logger.log('No pending migrations found - database is up to date');
                return;
            }
            this.logger.log('Found pending migrations, running...');
            const migrations = await this.dataSource.runMigrations();
            this.logger.log(`✅ Successfully ran ${migrations.length} migration(s)`);
            migrations.forEach((migration) => {
                this.logger.log(`  ✓ ${migration.name}`);
            });
        }
        catch (error) {
            this.logger.error('Error running migrations:', error.message);
            this.logger.error(error.stack);
            const errorMessage = error.message?.toLowerCase() || '';
            const harmlessErrors = [
                'already exists',
                'duplicate',
                'relation already exists',
                'no pending migrations',
            ];
            const isHarmless = harmlessErrors.some(msg => errorMessage.includes(msg));
            if (isHarmless) {
                this.logger.warn('Migration error appears harmless (migrations may have already run)');
            }
            else {
                this.logger.error('Migration error may require attention');
            }
        }
    }
};
exports.MigrationService = MigrationService;
exports.MigrationService = MigrationService = MigrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        config_1.ConfigService])
], MigrationService);
//# sourceMappingURL=migration.service.js.map