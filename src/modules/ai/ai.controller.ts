import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { RecommendationRequestDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { UserEntity } from '../../database/entities';

@ApiTags('AI Recommendations')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('recommend')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get AI-powered recommendations (Me Surpreenda)' })
  @ApiResponse({
    status: 200,
    description: 'Recommendations generated successfully',
  })
  async getRecommendations(
    @CurrentUser() user: UserEntity,
    @Body() recommendationRequest: RecommendationRequestDto,
  ) {
    return this.aiService.getRecommendations(user.id, recommendationRequest);
  }

  @Get('recommendations/history')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get recommendation history' })
  @ApiResponse({
    status: 200,
    description: 'Recommendation history retrieved successfully',
  })
  async getRecommendationHistory(
    @CurrentUser() user: UserEntity,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.aiService.getRecommendationHistory(user.id, limit, offset);
  }

  @Post('feedback')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Provide feedback on recommendations' })
  @ApiResponse({
    status: 200,
    description: 'Feedback recorded successfully',
  })
  async provideFeedback(
    @CurrentUser() user: UserEntity,
    @Body()
    body: {
      recommendationId: string;
      rating: number;
      feedback: string;
    },
  ) {
    return this.aiService.getFeedback(
      user.id,
      body.recommendationId,
      body.rating,
      body.feedback,
    );
  }
}
