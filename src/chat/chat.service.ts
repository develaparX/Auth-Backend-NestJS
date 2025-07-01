import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema'; // Skema dan tipe dokumen Pesan
import { RabbitMQService } from './rabbitmq/rabbitmq.service'; // Layanan RabbitMQ
import { UsersService } from '../users/users.service'; // Layanan pengguna untuk validasi ID

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>, // Menginjeksi model Mongoose untuk Pesan
        private readonly rabbitMQService: RabbitMQService, // Menginjeksi RabbitMQService
        private readonly usersService: UsersService, // Menginjeksi UsersService
    ) {
        // Mulai mengonsumsi pesan untuk notifikasi saat service diinisialisasi.
        // Di aplikasi nyata, ini akan mendorong ke websockets. Untuk demo ini, hanya log.
        this.rabbitMQService.consumeMessages(this.handleIncomingMessageNotification.bind(this));
    }

    /**
     * Mengirim pesan baru antara dua pengguna.
     * Menyimpan pesan di MongoDB dan memublikasikan notifikasi ke RabbitMQ.
     * @param senderId ID pengirim pesan.
     * @param receiverId ID penerima pesan.
     * @param messageContent Isi pesan.
     * @returns Dokumen pesan yang dibuat.
     * @throws NotFoundException jika pengguna pengirim atau penerima tidak ada.
     */
    async sendMessage(senderId: string, receiverId: string, messageContent: string): Promise<Message> {
        // Memvalidasi apakah ID pengirim dan penerima adalah pengguna yang valid
        const sender = await this.usersService.findById(senderId);
        if (!sender) {
            throw new NotFoundException('Pengguna pengirim tidak ditemukan.');
        }
        const receiver = await this.usersService.findById(receiverId);
        if (!receiver) {
            throw new NotFoundException('Pengguna penerima tidak ditemukan.');
        }

        // Membuat instance pesan baru
        const savedMessage = await this.messageModel.create({
            senderId: new Types.ObjectId(senderId), // Mengonversi string ID ke ObjectId
            receiverId: new Types.ObjectId(receiverId),
            message: messageContent,
            timestamp: new Date(), // Waktu pesan dikirim
            read: false, // Default: belum dibaca
        });

        // Memublikasikan notifikasi pesan ke RabbitMQ
        // Payload notifikasi berisi detail pesan
        const notificationPayload = {
            messageId: savedMessage._id.toString(),
            senderId: savedMessage.senderId.toString(),
            receiverId: savedMessage.receiverId.toString(),
            message: savedMessage.message,
            timestamp: savedMessage.timestamp.toISOString(),
            type: 'NEW_MESSAGE', // Tipe notifikasi
        };

        // Memublikasikan notifikasi ke exchange dengan routing key yang spesifik untuk penerima.
        // Ini memungkinkan layanan lain atau klien (melalui WebSocket) untuk berlangganan
        // notifikasi yang ditujukan untuk pengguna tertentu.
        await this.rabbitMQService.publishNotification(
            `user.${receiverId}`, // Routing key untuk penerima
            notificationPayload,
        );
        // Juga memublikasikan notifikasi ke pengirim, sebagai konfirmasi pesan terkirim
        await this.rabbitMQService.publishNotification(
            `user.${senderId}`, // Routing key untuk pengirim
            notificationPayload,
        );

        console.log(`Pesan dikirim dari ${senderId} ke ${receiverId}. Notifikasi dipublikasikan.`);
        return savedMessage;
    }

    /**
     * Mengambil pesan yang dipertukarkan antara dua pengguna tertentu.
     * Pesan diurutkan berdasarkan stempel waktu.
     * @param userId1 ID pengguna pertama.
     * @param userId2 ID pengguna kedua.
     * @returns Array dokumen pesan.
     */
    async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
        // Mencari pesan di mana pengirim adalah userId1 dan penerima adalah userId2 ATAU
        // pengirim adalah userId2 dan penerima adalah userId1.
        const messages = await this.messageModel
            .find({
                $or: [
                    { senderId: new Types.ObjectId(userId1), receiverId: new Types.ObjectId(userId2) },
                    { senderId: new Types.ObjectId(userId2), receiverId: new Types.ObjectId(userId1) },
                ],
            })
            .sort({ timestamp: 1 }) // Urutkan berdasarkan stempel waktu secara ascending
            .exec();

        // Secara opsional, tandai pesan sebagai sudah dibaca jika pengguna saat ini adalah penerima.
        // Ini adalah contoh yang disederhanakan; solusi yang lebih kuat akan menangani tanda terima baca
        // dengan lebih hati-hati. Untuk saat ini, kita hanya akan mengembalikan pesan.

        return messages;
    }

    /**
     * Handler untuk notifikasi pesan masuk dari RabbitMQ.
     * Di aplikasi nyata, ini akan mendorong pembaruan ke server WebSocket
     * untuk memberi tahu klien frontend yang relevan.
     * Untuk proyek backend-saja ini, itu hanya mencatat notifikasi.
     * @param message Pesan yang diterima dari RabbitMQ.
     */
    private handleIncomingMessageNotification(message: any) {
        // Di sini Anda biasanya akan berintegrasi dengan gateway WebSocket (misalnya, NestJS @nestjs/platform-socket.io)
        // untuk mendorong notifikasi real-time ke klien yang terhubung (pengguna).
        // Untuk proyek ini, kita hanya akan mencatat notifikasi ke konsol.
        console.log('Notifikasi pesan diterima dari RabbitMQ:', message);
        // Contoh: this.socketGateway.server.to(message.receiverId).emit('newMessage', message);
    }
}
