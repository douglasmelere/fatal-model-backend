import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserEntity, UserRole } from '../../database/entities';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new review (Client only)' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
  })
  async createReview(
    @CurrentUser() user: UserEntity,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(user.id, createReviewDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
  })
  async getReviewById(@Param('id') id: string) {
    return this.reviewsService.getReviewById(id);
  }

  @Get('escort/:escortId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all reviews for an escort' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
  })
  async getEscortReviews(
    @Param('escortId') escortId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.reviewsService.getEscortReviews(escortId, limit, offset);
  }

  @Put(':id/response')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ESCORT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Respond to a review (Escort only)' })
  @ApiResponse({
    status: 200,
    description: 'Response added successfully',
  })
  async respondToReview(
    @Param('id') reviewId: string,
    @CurrentUser() user: UserEntity,
    @Body() body: { response: string },
  ) {
    return this.reviewsService.respondToReview(reviewId, user.id, body.response);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a review (Client only)' })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  async deleteReview(
    @Param('id') reviewId: string,
    @CurrentUser() user: UserEntity,
  ) {
    await this.reviewsService.deleteReview(reviewId, user.id);
    return { message: 'Review deleted successfully' };
  }
}
