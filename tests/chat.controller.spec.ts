import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from '../src/chat/chat.controller';
import { ChatService } from '../src/chat/chat.service';
import { AuthGuard } from '@nestjs/passport';
import { INestApplication, HttpStatus, BadRequestException, NotFoundException, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { SendMessageDto } from '../src/chat/dto/send-message.dto';
import { Types } from 'mongoose';

describe('ChatController', () => {
  let controller: ChatController;
  let service: ChatService;
  let app: INestApplication;

  const mockMessage = {
    _id: new Types.ObjectId(),
    senderId: new Types.ObjectId(),
    receiverId: new Types.ObjectId(),
    message: 'Test message',
    timestamp: new Date(),
    read: false,
  };

  // Helper function to convert Date objects in mockMessage to ISO strings for comparison
  const getExpectedMessage = (message: any) => ({
    ...message,
    _id: message._id.toHexString(),
    senderId: message.senderId.toHexString(),
    receiverId: message.receiverId.toHexString(),
    timestamp: message.timestamp.toISOString(),
  });

  const mockChatService = {
    sendMessage: jest.fn(),
    getMessagesBetweenUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
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

    controller = module.get<ChatController>(ChatController);
    service = module.get<ChatService>(ChatService);
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

  describe('sendMessage', () => {
    const sendMessageDto: SendMessageDto = {
      receiverId: 'receiver123',
      message: 'Hello there!',
    };

    it('should send a message successfully', async () => {
      mockChatService.sendMessage.mockResolvedValue(mockMessage);

      const response = await request(app.getHttpServer())
        .post('/messages/sendMessage')
        .send(sendMessageDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(getExpectedMessage(mockMessage));
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'user123',
        sendMessageDto.receiverId,
        sendMessageDto.message,
      );
    });

    it('should handle NotFoundException when receiver is not found', async () => {
      mockChatService.sendMessage.mockRejectedValue(new NotFoundException('Pengguna penerima tidak ditemukan.'));

      const response = await request(app.getHttpServer())
        .post('/messages/sendMessage')
        .send(sendMessageDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual('Pengguna penerima tidak ditemukan.');
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'user123',
        sendMessageDto.receiverId,
        sendMessageDto.message,
      );
    });
  });

  describe('viewMessages', () => {
    const participantId = 'participant123';

    it('should return messages between users', async () => {
      const messages = [getExpectedMessage(mockMessage), getExpectedMessage(mockMessage)];
      mockChatService.getMessagesBetweenUsers.mockResolvedValue(messages);

      const response = await request(app.getHttpServer())
        .get(`/messages/viewMessages?participantId=${participantId}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(messages);
      expect(mockChatService.getMessagesBetweenUsers).toHaveBeenCalledWith(
        'user123',
        participantId,
      );
    });

    it('should throw BadRequestException if participantId is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/messages/viewMessages')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual('Participant ID is required.');
      expect(mockChatService.getMessagesBetweenUsers).not.toHaveBeenCalled();
    });

    it('should handle errors from chatService', async () => {
      mockChatService.getMessagesBetweenUsers.mockRejectedValue(new Error('Something went wrong'));

      const response = await request(app.getHttpServer())
        .get(`/messages/viewMessages?participantId=${participantId}`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body.message).toEqual('Internal server error');
      expect(mockChatService.getMessagesBetweenUsers).toHaveBeenCalledWith(
        'user123',
        participantId,
      );
    });
  });
});
