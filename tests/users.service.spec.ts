import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../src/users/schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<UserDocument>;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserModel = {
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    create: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should find a user by ID', async () => {
      mockUserModel.exec.mockResolvedValue(mockUser);
      const result = await service.findById(mockUser._id.toHexString());
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUser._id.toHexString());
      expect(mockUserModel.exec).toHaveBeenCalled();
    });

    it('should return null if user not found by ID', async () => {
      mockUserModel.exec.mockResolvedValue(null);
      const result = await service.findById(new Types.ObjectId().toHexString());
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockUserModel.exec.mockResolvedValue(mockUser);
      const result = await service.findByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
      expect(mockUserModel.exec).toHaveBeenCalled();
    });

    it('should return null if user not found by email', async () => {
      mockUserModel.exec.mockResolvedValue(null);
      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockUserModel.create.mockResolvedValue(mockUser);
      const newUser = { email: 'new@example.com', password: 'newpassword' };
      const result = await service.create(newUser);
      expect(result).toEqual(mockUser);
      expect(mockUserModel.create).toHaveBeenCalledWith(newUser);
    });
  });
});
