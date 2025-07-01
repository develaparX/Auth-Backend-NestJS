import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../src/chat/chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from '../src/chat/schemas/message.schema';
import { RabbitMQService } from '../src/chat/rabbitmq/rabbitmq.service';
import { UsersService } from '../src/users/users.service';
import { NotFoundException } from '@nestjs/common';

describe('ChatService', () => {
  let service: ChatService;
  let messageModel: Model<MessageDocument>;
  let rabbitMQService: RabbitMQService;
  let usersService: UsersService;

  const mockMessage = {
    _id: new Types.ObjectId(),
    senderId: new Types.ObjectId(),
    receiverId: new Types.ObjectId(),
    message: 'Hello',
    timestamp: new Date(),
    read: false,
    toString: jest.fn().mockReturnThis(),
  };

  const mockMessageModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockRabbitMQService = {
    publishNotification: jest.fn(),
    consumeMessages: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    messageModel = module.get<Model<MessageDocument>>(getModelToken(Message.name));
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
    usersService = module.get<UsersService>(UsersService);

    // Mock the console.log to prevent actual logging during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    const senderId = new Types.ObjectId().toHexString();
    const receiverId = new Types.ObjectId().toHexString();
    const messageContent = 'Test message';

    it('should send a message successfully', async () => {
      mockUsersService.findById.mockResolvedValueOnce({ _id: senderId });
      mockUsersService.findById.mockResolvedValueOnce({ _id: receiverId });
      mockMessageModel.create.mockResolvedValue(mockMessage);

      const result = await service.sendMessage(senderId, receiverId, messageContent);

      expect(result).toEqual(mockMessage);
      expect(mockUsersService.findById).toHaveBeenCalledWith(senderId);
      expect(mockUsersService.findById).toHaveBeenCalledWith(receiverId);
      expect(mockMessageModel.create).toHaveBeenCalledWith(expect.objectContaining({
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(receiverId),
        message: messageContent,
      }));
      expect(mockRabbitMQService.publishNotification).toHaveBeenCalledTimes(2);
      expect(mockRabbitMQService.publishNotification).toHaveBeenCalledWith(
        `user.${receiverId}`,
        expect.any(Object),
      );
      expect(mockRabbitMQService.publishNotification).toHaveBeenCalledWith(
        `user.${senderId}`,
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if sender not found', async () => {
      mockUsersService.findById.mockResolvedValueOnce(null);

      await expect(service.sendMessage(senderId, receiverId, messageContent))
        .rejects.toThrow(NotFoundException);
      expect(mockUsersService.findById).toHaveBeenCalledWith(senderId);
      expect(mockUsersService.findById).not.toHaveBeenCalledWith(receiverId);
      expect(mockMessageModel.create).not.toHaveBeenCalled();
      expect(mockRabbitMQService.publishNotification).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if receiver not found', async () => {
      mockUsersService.findById.mockResolvedValueOnce({ _id: senderId });
      mockUsersService.findById.mockResolvedValueOnce(null);

      await expect(service.sendMessage(senderId, receiverId, messageContent))
        .rejects.toThrow(NotFoundException);
      expect(mockUsersService.findById).toHaveBeenCalledWith(senderId);
      expect(mockUsersService.findById).toHaveBeenCalledWith(receiverId);
      expect(mockMessageModel.create).not.toHaveBeenCalled();
      expect(mockRabbitMQService.publishNotification).not.toHaveBeenCalled();
    });
  });

  describe('getMessagesBetweenUsers', () => {
    const userId1 = new Types.ObjectId().toHexString();
    const userId2 = new Types.ObjectId().toHexString();

    it('should return messages between two users', async () => {
      const messages = [mockMessage];
      mockMessageModel.exec.mockResolvedValue(messages);

      const result = await service.getMessagesBetweenUsers(userId1, userId2);

      expect(result).toEqual(messages);
      expect(mockMessageModel.find).toHaveBeenCalledWith({
        $or: [
          { senderId: new Types.ObjectId(userId1), receiverId: new Types.ObjectId(userId2) },
          { senderId: new Types.ObjectId(userId2), receiverId: new Types.ObjectId(userId1) },
        ],
      });
      expect(mockMessageModel.find).toHaveBeenCalledWith({ $or: expect.any(Array) });
      expect(mockMessageModel.find().sort).toHaveBeenCalledWith({ timestamp: 1 });
      expect(mockMessageModel.exec).toHaveBeenCalled();
    });

    it('should return an empty array if no messages are found', async () => {
      mockMessageModel.exec.mockResolvedValue([]);

      const result = await service.getMessagesBetweenUsers(userId1, userId2);

      expect(result).toEqual([]);
    });
  });

  describe('handleIncomingMessageNotification', () => {
    it('should log the incoming message notification', () => {
      const message = { type: 'NEW_MESSAGE', content: 'Hello from RabbitMQ' };
      const consoleSpy = jest.spyOn(console, 'log');

      // Access the private method using bracket notation
      (service as any).handleIncomingMessageNotification(message);

      expect(consoleSpy).toHaveBeenCalledWith('Notifikasi pesan diterima dari RabbitMQ:', message);
    });
  });
});
