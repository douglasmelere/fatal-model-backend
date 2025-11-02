import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserEntity, UserRole } from '../../database/entities';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking (Client only)' })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
  })
  async createBooking(
    @CurrentUser() user: UserEntity,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(user.id, createBookingDto);
  }

  @Get('upcoming')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get upcoming bookings' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming bookings retrieved successfully',
  })
  async getUpcomingBookings(
    @CurrentUser() user: UserEntity,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.bookingsService.getUpcomingBookings(
      user.id,
      user.role,
      limit,
      offset,
    );
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get booking history' })
  @ApiResponse({
    status: 200,
    description: 'Booking history retrieved successfully',
  })
  async getBookingHistory(
    @CurrentUser() user: UserEntity,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.bookingsService.getBookingHistory(
      user.id,
      user.role,
      limit,
      offset,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking retrieved successfully',
  })
  async getBookingById(@Param('id') id: string) {
    return this.bookingsService.getBookingById(id);
  }

  @Put(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ESCORT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm booking (Escort only)' })
  @ApiResponse({
    status: 200,
    description: 'Booking confirmed successfully',
  })
  async confirmBooking(
    @Param('id') bookingId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.confirmBooking(bookingId, user.id);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled successfully',
  })
  async cancelBooking(
    @Param('id') bookingId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.cancelBooking(bookingId, user.id, user.role);
  }

  @Put(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ESCORT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete booking (Escort only)' })
  @ApiResponse({
    status: 200,
    description: 'Booking completed successfully',
  })
  async completeBooking(
    @Param('id') bookingId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.completeBooking(bookingId, user.id);
  }
}
