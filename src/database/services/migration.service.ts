import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    if (process.env.RUN_MIGRATIONS === 'true') {
      // Wait a bit for the database connection to be established
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.runMigrations();
    } else {
      this.logger.log('Migrations disabled (RUN_MIGRATIONS != true)');
    }
  }

  async runMigrations(): Promise<void> {
    try {
      this.logger.log('Checking for pending migrations...');
      
      // Wait for DataSource to be initialized
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

      // Check pending migrations
      // showMigrations() returns true if there are pending migrations, false otherwise
      // To get the actual list, we need to use runMigrations() which returns the executed migrations
      const hasPendingMigrations = await this.dataSource.showMigrations();
      
      if (!hasPendingMigrations) {
        this.logger.log('No pending migrations found - database is up to date');
        return;
      }

      this.logger.log('Found pending migrations, running...');

      // Run migrations - this will return the list of executed migrations
      const migrations = await this.dataSource.runMigrations();
      
      this.logger.log(`✅ Successfully ran ${migrations.length} migration(s)`);
      migrations.forEach((migration) => {
        this.logger.log(`  ✓ ${migration.name}`);
      });
    } catch (error) {
      this.logger.error('Error running migrations:', error.message);
      this.logger.error(error.stack);
      
      // Check if it's a harmless error (migrations already run, table exists, etc.)
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
      } else {
        this.logger.error('Migration error may require attention');
        // Still don't throw - allow app to continue
        // Admin can manually check and fix if needed
      }
    }
  }
}

