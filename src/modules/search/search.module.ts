import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ProfileEntity, UserEntity } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileEntity, UserEntity])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
