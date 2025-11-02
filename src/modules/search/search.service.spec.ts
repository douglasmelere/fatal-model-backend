import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { ProfileEntity } from '../../database/entities';

describe('SearchService', () => {
  let service: SearchService;
  let mockProfilesRepository: any;

  beforeEach(async () => {
    mockProfilesRepository = {
      createQueryBuilder: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(ProfileEntity),
          useValue: mockProfilesRepository,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  describe('searchProfiles', () => {
    it('should search profiles with filters', async () => {
      const filters = {
        location: 'São Paulo',
        minAge: 18,
        maxAge: 30,
        minPrice: 100,
        maxPrice: 500,
      };

      const mockProfiles = [
        {
          id: '1',
          display_name: 'Profile 1',
          location: 'São Paulo',
          age: 25,
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockProfiles, 1]),
      };

      mockProfilesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchProfiles(filters, 10, 0);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should search by keyword', async () => {
      const keyword = 'massage';
      const mockProfiles = [
        {
          id: '1',
          display_name: 'Massage Specialist',
          bio: 'Relaxing massage services',
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockProfiles, 1]),
      };

      mockProfilesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchByKeyword(keyword, 10, 0);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result.data).toHaveLength(1);
    });

    it('should get top rated profiles', async () => {
      const mockProfiles = [
        {
          id: '1',
          display_name: 'Top Rated',
          average_rating: 5,
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProfiles),
      };

      mockProfilesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTopRatedProfiles(10);

      expect(result).toHaveLength(1);
      expect(result[0].average_rating).toBe(5);
    });
  });
});
