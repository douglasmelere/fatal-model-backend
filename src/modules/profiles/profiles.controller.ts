import {
  Controller,
  Get,
  Post,
  Put,
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
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserEntity, UserRole } from '../../database/entities';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new profile (for escorts)' })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
  })
  async createProfile(
    @CurrentUser() user: UserEntity,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.profilesService.createProfile(user.id, createProfileDto);
  }

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  async getMyProfile(@CurrentUser() user: UserEntity) {
    return this.profilesService.getProfileByUserId(user.id);
  }

  @Get('verified')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all verified profiles' })
  @ApiResponse({
    status: 200,
    description: 'Profiles retrieved successfully',
  })
  async getVerifiedProfiles(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.profilesService.getVerifiedProfiles(limit, offset);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search profiles with filters' })
  @ApiResponse({
    status: 200,
    description: 'Profiles retrieved successfully',
  })
  async searchProfiles(
    @Query() filters: any,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.profilesService.searchProfiles(filters, limit, offset);
  }

  @Get('devtools-debug') // DEBUG ONLY!
  async debugProfiles() {
    const profiles = await this.profilesService['profilesRepository'].find({
      relations: ['user'],
    });
    return profiles.map(p => ({
      id: p.id,
      display_name: p.display_name,
      is_active: p.is_active,
      user_id: p.user_id,
      user_role: p.user?.role,
      user_email: p.user?.email,
    }));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get profile by ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  async getProfileById(@Param('id') id: string) {
    return this.profilesService.getProfileById(id);
  }

  @Put('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.updateProfile(user.id, updateProfileDto);
  }

  @Post('photos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add photos to profile' })
  @ApiResponse({
    status: 200,
    description: 'Photos added successfully',
  })
  async addPhotos(
    @CurrentUser() user: UserEntity,
    @Body() body: { photoUrls: string[] },
  ) {
    return this.profilesService.addPhotos(user.id, body.photoUrls);
  }

  @Put('main-photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set main profile photo' })
  @ApiResponse({
    status: 200,
    description: 'Main photo updated successfully',
  })
  async setMainPhoto(
    @CurrentUser() user: UserEntity,
    @Body() body: { photoUrl: string },
  ) {
    return this.profilesService.setMainPhoto(user.id, body.photoUrl);
  }

  @Put('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update availability calendar' })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
  })
  async updateAvailability(
    @CurrentUser() user: UserEntity,
    @Body() body: { availability: Record<string, boolean> },
  ) {
    return this.profilesService.updateAvailability(user.id, body.availability);
  }

  @Put('pix-key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update PIX key' })
  @ApiResponse({
    status: 200,
    description: 'PIX key updated successfully',
  })
  async updatePixKey(
    @CurrentUser() user: UserEntity,
    @Body() body: { pixKey: string; pixKeyType: string },
  ) {
    return this.profilesService.updatePixKey(
      user.id,
      body.pixKey,
      body.pixKeyType,
    );
  }
}
