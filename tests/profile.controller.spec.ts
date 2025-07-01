import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from '../src/profile/profile.controller';
import { ProfileService } from '../src/profile/profile.service';
import { AuthGuard } from '@nestjs/passport';
import { INestApplication, HttpStatus, ConflictException, NotFoundException, BadRequestException, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { CreateProfileDto } from '../src/profile/dto/create-profile.dto';
import { UpdateProfileDto } from '../src/profile/dto/update-profile.dto';
import { Types } from 'mongoose';

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: ProfileService;
  let app: INestApplication;

  const mockProfile = {
    _id: new Types.ObjectId(),
    userId: 'user123',
    name: 'Test User',
    gender: 'Male',
    birthday: new Date('1990-01-01'),
    horoscope: 'Capricorn',
    zodiac: 'Horse',
    height: 170,
    weight: 65,
    interests: ['reading', 'hiking'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Helper function to convert Date objects in mockProfile to ISO strings for comparison
  const getExpectedProfile = () => ({
    ...mockProfile,
    _id: mockProfile._id.toHexString(),
    birthday: mockProfile.birthday.toISOString(),
    createdAt: mockProfile.createdAt.toISOString(),
    updatedAt: mockProfile.updatedAt.toISOString(),
  });

  const mockProfileService = {
    createProfile: jest.fn(),
    getProfileByUserId: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { userId: 'user123', email: 'test@example.com' }; // Mock authenticated user
          return true;
        },
      })
      .compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProfile', () => {
    const createDto: CreateProfileDto = {
      name: 'New User',
      gender: 'Male',
      birthday: '1990-01-01',
      height: 170,
      weight: 65,
      interests: ['coding'],
    };

    it('should create a profile successfully', async () => {
      mockProfileService.createProfile.mockResolvedValue(mockProfile);

      const response = await request(app.getHttpServer())
        .post('/profile/createProfile')
        .send(createDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(getExpectedProfile());
      expect(mockProfileService.createProfile).toHaveBeenCalledWith('user123', createDto);
    });

    it('should handle conflict when profile already exists', async () => {
      mockProfileService.createProfile.mockRejectedValue(new ConflictException('Profil sudah ada untuk pengguna ini.'));

      const response = await request(app.getHttpServer())
        .post('/profile/createProfile')
        .send(createDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toEqual('Profil sudah ada untuk pengguna ini.');
      expect(mockProfileService.createProfile).toHaveBeenCalledWith('user123', createDto);
    });

    it('should handle bad request for invalid birthday format', async () => {
      const invalidDto = { ...createDto, birthday: 'invalid-date' };
      mockProfileService.createProfile.mockRejectedValue(new BadRequestException('Format tanggal lahir tidak valid.'));

      const response = await request(app.getHttpServer())
        .post('/profile/createProfile')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual('Format tanggal lahir tidak valid.');
      expect(mockProfileService.createProfile).toHaveBeenCalledWith('user123', invalidDto);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      const response = await request(app.getHttpServer())
        .get('/profile/getProfile')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(getExpectedProfile());
      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith('user123');
    });

    it('should handle not found when profile does not exist', async () => {
      mockProfileService.getProfileByUserId.mockRejectedValue(new NotFoundException('Profil tidak ditemukan.'));

      const response = await request(app.getHttpServer())
        .get('/profile/getProfile')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual('Profil tidak ditemukan.');
      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith('user123');
    });
  });

  describe('updateProfile', () => {
    const updateDto: UpdateProfileDto = {
      height: 175,
      interests: ['gaming'],
    };

    it('should update the user profile successfully', async () => {
      mockProfileService.updateProfile.mockResolvedValue(mockProfile);

      const response = await request(app.getHttpServer())
        .put('/profile/updateProfile')
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(getExpectedProfile());
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith('user123', updateDto);
    });

    it('should handle not found when profile to update does not exist', async () => {
      mockProfileService.updateProfile.mockRejectedValue(new NotFoundException('Profil tidak ditemukan.'));

      const response = await request(app.getHttpServer())
        .put('/profile/updateProfile')
        .send(updateDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual('Profil tidak ditemukan.');
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith('user123', updateDto);
    });

    it('should handle bad request for invalid updated birthday format', async () => {
      const invalidUpdateDto = { birthday: 'invalid-date' };
      mockProfileService.updateProfile.mockRejectedValue(new BadRequestException('Format tanggal lahir tidak valid.'));

      const response = await request(app.getHttpServer())
        .put('/profile/updateProfile')
        .send(invalidUpdateDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual('Format tanggal lahir tidak valid.');
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith('user123', invalidUpdateDto);
    });
  });
});
