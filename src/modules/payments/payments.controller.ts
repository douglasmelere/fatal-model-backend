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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ConfirmPaymentDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserEntity, UserRole } from '../../database/entities';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment (PIX)' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
  })
  async createPayment(
    @CurrentUser() user: UserEntity,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(user.id, createPaymentDto);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
  })
  async getPaymentHistory(
    @CurrentUser() user: UserEntity,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.paymentsService.getPaymentHistory(
      user.id,
      user.role,
      limit,
      offset,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
  })
  async getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  @Put(':id/confirm-payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ESCORT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm payment received (Escort only)' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully',
  })
  async confirmPayment(
    @Param('id') paymentId: string,
    @CurrentUser() user: UserEntity,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ) {
    return this.paymentsService.confirmPayment(
      paymentId,
      user.id,
      confirmPaymentDto,
    );
  }

  @Put(':id/upload-proof')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload payment proof (Client only)' })
  @ApiResponse({
    status: 200,
    description: 'Payment proof uploaded successfully',
  })
  async uploadPaymentProof(
    @Param('id') paymentId: string,
    @CurrentUser() user: UserEntity,
    @Body() body: { proofImageUrl: string },
  ) {
    return this.paymentsService.uploadPaymentProof(
      paymentId,
      user.id,
      body.proofImageUrl,
    );
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel payment (Client only)' })
  @ApiResponse({
    status: 200,
    description: 'Payment cancelled successfully',
  })
  async cancelPayment(
    @Param('id') paymentId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.paymentsService.cancelPayment(paymentId, user.id);
  }
}
