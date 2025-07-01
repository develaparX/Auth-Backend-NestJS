import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../src/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let authService: AuthService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'testsecret';
      }
      return null;
    }),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user if validation is successful', async () => {
      const payload = { userId: new Types.ObjectId(), email: 'test@example.com' };
      const user = { userId: payload.userId, email: payload.email };
      mockAuthService.validateUser.mockResolvedValue(user);

      const result = await jwtStrategy.validate(payload);
      expect(result).toEqual(user);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(payload);
    });

    it('should throw UnauthorizedException if user validation fails', async () => {
      const payload = { userId: new Types.ObjectId(), email: 'test@example.com' };
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(payload);
    });
  });
});
