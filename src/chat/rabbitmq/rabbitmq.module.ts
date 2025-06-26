import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Untuk mengakses variabel lingkungan
import { RabbitMQService } from './rabbitmq.service';

@Global() // Membuat RabbitMQService tersedia secara global di seluruh aplikasi
@Module({
    imports: [ConfigModule], // Mengimpor ConfigModule untuk mengakses variabel lingkungan
    providers: [RabbitMQService], // Menyediakan RabbitMQService
    exports: [RabbitMQService], // Mengekspor RabbitMQService agar dapat diinjeksikan ke modul lain
})
export class RabbitMQModule { }
