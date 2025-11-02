import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { UserEntity } from '../../database/entities';

@Controller('appointments')
export class AppointmentsAliasController {
  constructor(private bookingsService: BookingsService) {}

  @Get('upcoming')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUpcomingAppointments(
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
  async getAppointmentsHistory(
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
}
