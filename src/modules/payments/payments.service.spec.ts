import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentEntity, UserEntity, ProfileEntity } from '../../database/entities';
import { QRCodeService } from '../../common/services';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPaymentsRepository: any;
  let mockUsersRepository: any;
  let mockProfilesRepository: any;
  let mockQRCodeService: any;

  beforeEach(async () => {
    mockPaymentsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
    };

    mockUsersRepository = {
      findOne: jest.fn(),
    };

    mockProfilesRepository = {
      findOne: jest.fn(),
    };

    mockQRCodeService = {
      generatePixQRCode: jest.fn().mockResolvedValue('qrcode_data'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(PaymentEntity),
          useValue: mockPaymentsRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(ProfileEntity),
          useValue: mockProfilesRepository,
        },
        {
          provide: QRCodeService,
          useValue: mockQRCodeService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const createPaymentDto = {
        escort_id: 'escort-123',
        amount: 300,
        description: 'Service payment',
      };

      const mockEscort = { id: 'escort-123', email: 'escort@example.com' };
      const mockProfile = {
        id: 'profile-123',
        user_id: 'escort-123',
        pix_key: 'pix-key-123',
        pix_key_type: 'CPF',
        display_name: 'Escort Name',
      };

      mockUsersRepository.findOne.mockResolvedValue(mockEscort);
      mockProfilesRepository.findOne.mockResolvedValue(mockProfile);
      mockPaymentsRepository.create.mockReturnValue({
        ...createPaymentDto,
        client_id: 'client-123',
        status: 'PENDING',
      });
      mockPaymentsRepository.save.mockResolvedValue({
        id: 'payment-123',
        ...createPaymentDto,
        qr_code: 'qrcode_data',
      });

      const result = await service.createPayment('client-123', createPaymentDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('qr_code');
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: createPaymentDto.escort_id },
      });
    });

    it('should throw NotFoundException if escort not found', async () => {
      const createPaymentDto = {
        escort_id: 'non-existent',
        amount: 300,
      };

      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createPayment('client-123', createPaymentDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if escort has no PIX key', async () => {
      const createPaymentDto = {
        escort_id: 'escort-123',
        amount: 300,
      };

      const mockEscort = { id: 'escort-123' };

      mockUsersRepository.findOne.mockResolvedValue(mockEscort);
      mockProfilesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createPayment('client-123', createPaymentDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentById', () => {
    it('should get payment by id', async () => {
      const mockPayment = {
        id: 'payment-123',
        amount: 300,
        status: 'PENDING',
      };

      mockPaymentsRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById('payment-123');

      expect(result).toEqual(mockPayment);
      expect(mockPaymentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'payment-123' },
        relations: ['client', 'escort'],
      });
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(null);

      await expect(service.getPaymentById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
