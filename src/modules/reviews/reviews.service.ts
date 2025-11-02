import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity, AppointmentEntity, ProfileEntity } from '../../database/entities';
import { CreateReviewDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewsRepository: Repository<ReviewEntity>,
    @InjectRepository(AppointmentEntity)
    private appointmentsRepository: Repository<AppointmentEntity>,
    @InjectRepository(ProfileEntity)
    private profilesRepository: Repository<ProfileEntity>,
  ) {}

  async createReview(
    clientId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    const { appointment_id, rating, comment, is_anonymous } = createReviewDto;

    // Verify appointment exists and belongs to the client
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointment_id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.client_id !== clientId) {
      throw new ForbiddenException(
        'Only the client can review this appointment',
      );
    }

    // Check if review already exists
    const existingReview = await this.reviewsRepository.findOne({
      where: { appointment_id },
    });

    if (existingReview) {
      throw new BadRequestException('Review already exists for this appointment');
    }

    // Create review
    const review = this.reviewsRepository.create({
      appointment_id,
      client_id: clientId,
      escort_id: appointment.escort_id,
      rating,
      comment,
      is_anonymous: is_anonymous || false,
      is_verified_purchase: true,
    });

    const savedReview = await this.reviewsRepository.save(review);

    // Update appointment with review
    appointment.review_id = savedReview.id;
    await this.appointmentsRepository.save(appointment);

    // Update escort profile rating
    await this.updateEscortRating(appointment.escort_id);

    return savedReview;
  }

  async getReviewById(reviewId: string): Promise<ReviewEntity> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
      relations: ['client', 'escort', 'appointment'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async getEscortReviews(
    escortId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: ReviewEntity[]; total: number }> {
    const [data, total] = await this.reviewsRepository.findAndCount({
      where: { escort_id: escortId },
      relations: ['client', 'appointment'],
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
    });

    return { data, total };
  }

  async respondToReview(
    reviewId: string,
    escortId: string,
    response: string,
  ): Promise<ReviewEntity> {
    const review = await this.getReviewById(reviewId);

    // Verify that the user is the escort
    if (review.escort_id !== escortId) {
      throw new ForbiddenException(
        'Only the escort can respond to this review',
      );
    }

    review.response_from_escort = response;
    review.responded_at = new Date();

    return this.reviewsRepository.save(review);
  }

  async deleteReview(reviewId: string, clientId: string): Promise<void> {
    const review = await this.getReviewById(reviewId);

    // Verify that the user is the client who created the review
    if (review.client_id !== clientId) {
      throw new ForbiddenException(
        'Only the client who created the review can delete it',
      );
    }

    // Remove review from appointment
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: review.appointment_id },
    });

    if (appointment) {
      // Ajeitar tipagem para não atribuir null à string
      appointment.review_id = undefined as any; // ou delete appointment.review_id; se for permitido
      await this.appointmentsRepository.save(appointment);
    }

    await this.reviewsRepository.remove(review);

    // Update escort profile rating
    await this.updateEscortRating(review.escort_id);
  }

  private async updateEscortRating(escortId: string): Promise<void> {
    const profile = await this.profilesRepository.findOne({
      where: { user_id: escortId },
    });

    if (!profile) {
      return;
    }

    // Calculate average rating
    const reviews = await this.reviewsRepository.find({
      where: { escort_id: escortId },
    });

    if (reviews.length === 0) {
      profile.average_rating = 0;
      profile.total_reviews = 0;
    } else {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      profile.average_rating = parseFloat((totalRating / reviews.length).toFixed(2));
      profile.total_reviews = reviews.length;
    }

    await this.profilesRepository.save(profile);
  }
}
