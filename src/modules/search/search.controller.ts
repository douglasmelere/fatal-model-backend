import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchFiltersDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { UserEntity } from '../../database/entities';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('escorts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search escorts with advanced filters' })
  @ApiResponse({
    status: 200,
    description: 'Escorts retrieved successfully',
  })
  async searchEscorts(
    @Query() filters: SearchFiltersDto,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.searchService.searchProfiles(filters, limit, offset);
  }

  @Get('keyword')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search by keyword' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchByKeyword(
    @Query('q') keyword: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.searchService.searchByKeyword(keyword, limit, offset);
  }

  @Get('top-rated')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get top rated escorts' })
  @ApiResponse({
    status: 200,
    description: 'Top rated escorts retrieved successfully',
  })
  async getTopRated(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.searchService.getTopRated(limit);
  }

  @Get('most-viewed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get most viewed escorts' })
  @ApiResponse({
    status: 200,
    description: 'Most viewed escorts retrieved successfully',
  })
  async getMostViewed(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.searchService.getMostViewed(limit);
  }

  @Get('new')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get newest profiles' })
  @ApiResponse({
    status: 200,
    description: 'Newest profiles retrieved successfully',
  })
  async getNewProfiles(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.searchService.getNewProfiles(limit);
  }
}
