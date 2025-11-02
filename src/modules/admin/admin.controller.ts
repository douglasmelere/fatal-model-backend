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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../database/entities';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async getAllUsers(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.adminService.getAllUsers(limit, offset);
  }

  @Get('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
  })
  async getAllPayments(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.adminService.getAllPayments(limit, offset);
  }

  @Get('transactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all transactions (alias for payments) (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  async getAllTransactions(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.adminService.getAllPayments(limit, offset);
  }

  @Get('appointments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all appointments (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  async getAllAppointments(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.adminService.getAllAppointments(limit, offset);
  }

  @Put('users/:id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user profile (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Profile verified successfully',
  })
  async verifyProfile(@Param('id') profileId: string) {
    return this.adminService.verifyProfile(profileId);
  }

  @Put('users/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject user profile (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Profile rejected successfully',
  })
  async rejectProfile(@Param('id') profileId: string) {
    return this.adminService.rejectProfile(profileId);
  }

  @Get('reports/payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get payment reports (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Payment reports retrieved successfully',
  })
  async getPaymentReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.adminService.getPaymentReports(start, end);
  }

  @Get('reports/bookings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get booking reports (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Booking reports retrieved successfully',
  })
  async getBookingReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.adminService.getBookingReports(start, end);
  }

  @Put('users/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User suspended successfully',
  })
  async suspendUser(@Param('id') userId: string) {
    return this.adminService.suspendUser(userId);
  }

  @Put('users/:id/ban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ban user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User banned successfully',
  })
  async banUser(@Param('id') userId: string) {
    return this.adminService.banUser(userId);
  }

  @Put('users/:id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully',
  })
  async activateUser(@Param('id') userId: string) {
    return this.adminService.activateUser(userId);
  }

  @Post('announcements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create announcement (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Announcement created successfully',
  })
  async createAnnouncement(
    @Body()
    body: {
      title: string;
      message: string;
      type: string;
    },
  ) {
    return this.adminService.createAnnouncement(body);
  }
}
