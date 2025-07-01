import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { RegisterDto } from '../src/auth/dto/register.dto';
import { LoginDto } from '../src/auth/dto/login.dto';
import { HttpStatus, INestApplication, ConflictException, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { AuthGuard } from '@nestjs/passport';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let app: INestApplication;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { userId: 'someUserId', email: 'test@example.com' }; // Mock user
          return true;
        },
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
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

  describe('register', () => {
    it('should register a user successfully', async () => {
      const registerDto: RegisterDto = { email: 'test@example.com', password: 'password123' };
      mockAuthService.register.mockResolvedValue({ message: 'Pengguna berhasil terdaftar' });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({ message: 'Pengguna berhasil terdaftar' });
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle registration conflict', async () => {
      const registerDto: RegisterDto = { email: 'existing@example.com', password: 'password123' };
      mockAuthService.register.mockRejectedValue(new ConflictException('Email sudah ada'));

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toEqual('Email sudah ada');
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should log in a user successfully and return an access token', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      mockAuthService.login.mockResolvedValue({ accessToken: 'mockAccessToken' });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({ accessToken: 'mockAccessToken' });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle invalid login credentials', async () => {
      const loginDto: LoginDto = { email: 'wrong@example.com', password: 'wrongpassword' };
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Kredensial tidak valid'));

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.message).toEqual('Kredensial tidak valid');
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('should return authenticated user profile', async () => {
      const mockUser = { userId: 'someUserId', email: 'test@example.com' };
      jest.spyOn(controller, 'getProfile').mockImplementation((user) => {
        return {
          message: 'Data pengguna yang diautentikasi',
          user: {
            userId: user.userId,
            email: user.email,
          },
        };
      });

      const response = await request(app.getHttpServer())
        .post('/auth/profile')
        .set('Authorization', 'Bearer someToken') // Mocking the presence of a token
        .send(mockUser) // Send the mock user data in the request body
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        message: 'Data pengguna yang diautentikasi',
        user: mockUser,
      });
    });
  });
});
