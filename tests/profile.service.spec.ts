import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../src/profile/profile.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from '../src/profile/schemas/profile.schema';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { HoroscopeCalculator } from '../src/profile/utils/horoscope.calculator';
import { ZodiacCalculator } from '../src/profile/utils/zodiac.calculator';

describe('ProfileService', () => {
  let service: ProfileService;
  let profileModel: Model<ProfileDocument>;

  const mockProfile = {
    _id: new Types.ObjectId(),
    userId: 'user123',
    gender: 'Male',
    birthday: new Date('1990-01-01'),
    horoscope: 'Capricorn',
    zodiac: 'Horse',
    height: 170,
    weight: 65,
    interests: ['reading', 'hiking'],
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
    set: jest.fn(function (this: any, data: any) {
      Object.assign(this, data);
      return this;
    }),
  };

  const mockProfileModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getModelToken(Profile.name),
          useValue: mockProfileModel,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    profileModel = module.get<Model<ProfileDocument>>(getModelToken(Profile.name));

    jest.spyOn(HoroscopeCalculator, 'getHoroscope').mockReturnValue('Capricorn');
    jest.spyOn(ZodiacCalculator, 'getZodiac').mockReturnValue('Horse');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProfile', () => {
    const createDto = {
      name: 'Test User',
      gender: 'Male' as const,
      birthday: '1990-01-01',
      height: 170,
      weight: 65,
      interests: ['reading', 'hiking'],
    };

    it('should successfully create a new profile', async () => {
      mockProfileModel.findOne.mockResolvedValue(null);
      mockProfileModel.create.mockResolvedValue(mockProfile);

      const result = await service.createProfile('user123', createDto);
      expect(result).toEqual(mockProfile);
      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockProfileModel.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        gender: createDto.gender,
        birthday: new Date(createDto.birthday),
        horoscope: 'Capricorn',
        zodiac: 'Horse',
      }));
    });

    it('should throw ConflictException if profile already exists', async () => {
      mockProfileModel.findOne.mockResolvedValue(mockProfile);

      await expect(service.createProfile('user123', createDto))
        .rejects.toThrow(ConflictException);
      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockProfileModel.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if birthday format is invalid', async () => {
      const invalidDto = { ...createDto, name: 'Test User', birthday: 'invalid-date' };
      mockProfileModel.findOne.mockResolvedValue(null); // Ensure no existing profile

      await expect(service.createProfile('user123', invalidDto))
        .rejects.toThrow(BadRequestException);
      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockProfileModel.create).not.toHaveBeenCalled();
    });
  });

  describe('getProfileByUserId', () => {
    it('should return a profile if found', async () => {
      mockProfileModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockProfile) });

      const result = await service.getProfileByUserId('user123');
      expect(result).toEqual(mockProfile);
      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.getProfileByUserId('nonexistentUser'))
        .rejects.toThrow(NotFoundException);
      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId: 'nonexistentUser' });
    });
  });

  describe('updateProfile', () => {
    const updateDto = {
      height: 175,
      interests: ['coding', 'gaming'],
    };

    it('should successfully update an existing profile', async () => {
      mockProfileModel.findOne.mockResolvedValue(mockProfile);
      mockProfile.save.mockResolvedValue(mockProfile);

      const result = await service.updateProfile('user123', updateDto);
      expect(result).toEqual(mockProfile);
      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockProfile.set).toHaveBeenCalledWith(updateDto);
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('should update birthday and recalculate horoscope/zodiac if birthday is provided', async () => {
      const updatedBirthdayDto = { birthday: '1995-05-15' };
      const updatedMockProfile = { ...mockProfile, birthday: new Date('1995-05-15'), horoscope: 'Taurus', zodiac: 'Pig' };

      mockProfileModel.findOne.mockResolvedValue(mockProfile);
      mockProfile.save.mockResolvedValue(updatedMockProfile);
      jest.spyOn(HoroscopeCalculator, 'getHoroscope').mockReturnValue('Taurus');
      jest.spyOn(ZodiacCalculator, 'getZodiac').mockReturnValue('Pig');

      const result = await service.updateProfile('user123', updatedBirthdayDto);
      expect(result.birthday).toEqual(new Date('1995-05-15'));
      expect(result.horoscope).toEqual('Taurus');
      expect(result.zodiac).toEqual('Pig');
      expect(HoroscopeCalculator.getHoroscope).toHaveBeenCalledWith(new Date('1995-05-15'));
      expect(ZodiacCalculator.getZodiac).toHaveBeenCalledWith(1995);
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if profile to update does not exist', async () => {
      mockProfileModel.findOne.mockResolvedValue(null);

      await expect(service.updateProfile('nonexistentUser', updateDto))
        .rejects.toThrow(NotFoundException);
      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId: 'nonexistentUser' });
      expect(mockProfile.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if updated birthday format is invalid', async () => {
      const invalidBirthdayDto = { birthday: 'invalid-date' };
      mockProfileModel.findOne.mockResolvedValue(mockProfile);

      await expect(service.updateProfile('user123', invalidBirthdayDto))
        .rejects.toThrow(BadRequestException);
      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockProfile.save).not.toHaveBeenCalled();
    });
  });
});
