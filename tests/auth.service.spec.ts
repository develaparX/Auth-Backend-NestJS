import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../src/users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mockAccessToken'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'testsecret';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.register({ email: 'new@example.com', password: 'password123' });
      expect(result).toEqual({ message: 'Pengguna berhasil terdaftar' });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserModel.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new@example.com',
        password: 'hashedPassword',
      }));
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.register({ email: 'test@example.com', password: 'password123' }))
        .rejects.toThrow(ConflictException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully log in a user and return an access token', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({ email: 'test@example.com', password: 'password123' });
      expect(result).toEqual({ accessToken: 'mockAccessToken' });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, userId: mockUser._id });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login({ email: 'nonexistent@example.com', password: 'password123' }))
        .rejects.toThrow(UnauthorizedException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login({ email: 'test@example.com', password: 'wrongpassword' }))
        .rejects.toThrow(UnauthorizedException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user payload if user is found', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      const payload = { userId: mockUser._id, email: mockUser.email };
      const result = await service.validateUser(payload);
      expect(result).toEqual({ userId: mockUser._id, email: mockUser.email });
      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUser._id);
    });

    it('should return null if user is not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const payload = { userId: new Types.ObjectId(), email: 'nonexistent@example.com' };
      const result = await service.validateUser(payload);
      expect(result).toBeNull();
      expect(mockUserModel.findById).toHaveBeenCalledWith(payload.userId);
    });
  });
});
