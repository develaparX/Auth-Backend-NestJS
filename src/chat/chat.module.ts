import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema'; // Mengimpor skema Pesan
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module'; // Mengimpor RabbitMQModule
import { UsersModule } from '../users/users.module'; // Untuk memvalidasi ID pengirim/penerima

@Module({
    imports: [
        // Mendefinisikan skema Pesan untuk Mongoose
        MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
        RabbitMQModule, // Mengimpor RabbitMQModule untuk menggunakan RabbitMQService
        UsersModule, // Mengimpor UsersModule untuk memvalidasi ID pengirim/penerima
    ],
    controllers: [ChatController], // Controller untuk menangani permintaan obrolan
    providers: [ChatService], // Provider layanan obrolan
    exports: [ChatService], // Mengekspor ChatService jika modul lain perlu menggunakannya
})
export class ChatModule { }
