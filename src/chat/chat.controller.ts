import { Controller, Post, Get, Body, UseGuards, HttpStatus, HttpCode, Param, Query, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Guard untuk melindungi rute
import { CurrentUser } from '../common/decorators/current-user.decorator'; // Dekorator kustom
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './schemas/message.schema';

@Controller('messages') // Semua endpoint di controller ini akan diawali dengan /api/messages
@UseGuards(AuthGuard('jwt')) // Semua rute obrolan dilindungi oleh JWT Guard
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    /**
     * @api {post} /api/messages/sendMessage Mengirim pesan baru
     * @apiName SendMessage
     * @apiGroup Chat
     * @apiHeader {String} Authorization Bearer Token (JWT)
     * @apiBody {string} receiverId ID pengguna yang menerima pesan.
     * @apiBody {string} message Isi pesan.
     * @apiSuccess {object} message Objek pesan yang dikirim.
     * @apiError (404 Not Found) {string} message Pengguna penerima tidak ditemukan.
     */
    @Post('sendMessage')
    @HttpCode(HttpStatus.CREATED)
    async sendMessage(@CurrentUser() user: any, @Body() sendMessageDto: SendMessageDto): Promise<Message> {
        const { receiverId, message } = sendMessageDto;
        // Memanggil service untuk mengirim pesan dari pengguna saat ini ke penerima
        return this.chatService.sendMessage(user.userId, receiverId, message);
    }

    /**
     * @api {get} /api/messages/viewMessages Mendapatkan pesan antara pengguna saat ini dan pengguna lain
     * @apiName ViewMessages
     * @apiGroup Chat
     * @apiHeader {String} Authorization Bearer Token (JWT)
     * @apiQuery {string} participantId ID peserta lain dalam percakapan.
     * @apiSuccess {object[]} messages Array objek pesan.
     * @apiError (400 Bad Request) {string} message ID peserta diperlukan.
     */
    @Get('viewMessages')
    @HttpCode(HttpStatus.OK)
    async viewMessages(@CurrentUser() user: any, @Query('participantId') participantId: string): Promise<Message[]> {
        if (!participantId) {
            // Mengubah dari `new HttpStatus(...)` menjadi `throw new BadRequestException(...)`
            throw new BadRequestException('Participant ID is required.'); // Validasi parameter query
        }
        // Memanggil service untuk mendapatkan pesan antara dua pengguna
        return this.chatService.getMessagesBetweenUsers(user.userId, participantId);
    }
}
