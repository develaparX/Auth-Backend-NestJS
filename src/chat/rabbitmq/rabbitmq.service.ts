import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, Connection, ChannelModel } from 'amqplib'; // Mengubah import amqplib dan menambahkan ChannelModel

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQService.name); // Logger untuk output konsol
    private connection: ChannelModel; // Mengubah tipe koneksi menjadi ChannelModel
    private channel: Channel;     // Objek channel RabbitMQ
    private readonly rabbitMqUrl: string;
    private readonly messageQueueName: string;
    private readonly notificationExchangeName: string;

    constructor(private configService: ConfigService) {
        // Mengambil konfigurasi RabbitMQ dari variabel lingkungan
        // Menggunakan non-null assertion (!) karena kita yakin variabel ini akan selalu ada
        this.rabbitMqUrl = this.configService.get<string>('RABBITMQ_URL')!;
        this.messageQueueName = this.configService.get<string>('RABBITMQ_QUEUE_MESSAGE')!;
        this.notificationExchangeName = this.configService.get<string>('RABBITMQ_EXCHANGE_NOTIFICATION')!;
    }

    /**
     * Menginisialisasi koneksi dan channel RabbitMQ saat modul dimulai.
     */
    async onModuleInit() {
        await this.connect();
    }

    /**
     * Menutup channel dan koneksi RabbitMQ saat modul dihancurkan.
     */
    async onModuleDestroy() {
        await this.close();
    }

    /**
     * Membangun koneksi ke RabbitMQ dan membuat channel.
     * Juga mendeklarasikan antrian dan exchange yang diperlukan.
     */
    private async connect() {
        try {
            // Menggunakan named import `connect` langsung.
            // Hasil dari `connect` adalah `ChannelModel`, yang sekarang sesuai dengan tipe `this.connection`.
            this.connection = await connect(this.rabbitMqUrl);
            // `createChannel` sekarang harus dikenali dengan benar pada objek `ChannelModel`
            this.channel = await this.connection.createChannel();
            this.logger.log('Terhubung ke RabbitMQ');

            // Mendeklarasikan antrian pesan (durable: true berarti antrian akan bertahan meskipun RabbitMQ restart)
            await this.channel.assertQueue(this.messageQueueName, { durable: true });
            this.logger.log(`Antrian dinyatakan: ${this.messageQueueName}`);

            // Mendeklarasikan exchange notifikasi (tipe 'direct' untuk perutean notifikasi pengguna tertentu)
            await this.channel.assertExchange(this.notificationExchangeName, 'direct', { durable: true });
            this.logger.log(`Exchange dinyatakan: ${this.notificationExchangeName}`);

        } catch (error) {
            this.logger.error('Gagal terhubung ke RabbitMQ', error.stack);
            // Coba untuk menyambung kembali setelah penundaan jika koneksi gagal
            setTimeout(() => this.connect(), 5000);
        }
    }

    /**
     * Menutup channel dan koneksi RabbitMQ.
     */
    private async close() {
        try {
            if (this.channel) {
                await this.channel.close();
                this.logger.log('Channel RabbitMQ ditutup.');
            }
            if (this.connection) {
                // Metode `close` sekarang seharusnya dikenali langsung pada `this.connection` (tipe ChannelModel)
                await this.connection.close();
                this.logger.log('Koneksi RabbitMQ ditutup.');
            }
        } catch (error) {
            this.logger.error('Kesalahan saat menutup koneksi RabbitMQ', error.stack);
        }
    }

    /**
     * Memublikasikan pesan ke antrian tertentu.
     * @param queueName Nama antrian yang akan dipublikasikan.
     * @param message Payload pesan.
     */
    async sendToQueue(queueName: string, message: any) {
        if (!this.channel) {
            this.logger.error('Channel RabbitMQ tidak tersedia. Pesan tidak terkirim.');
            return;
        }
        try {
            // Mengirim pesan ke antrian (persistent: true berarti pesan akan bertahan meskipun RabbitMQ restart)
            await this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
            this.logger.debug(`Pesan dikirim ke antrian ${queueName}: ${JSON.stringify(message)}`);
        } catch (error) {
            this.logger.error(`Kesalahan saat mengirim pesan ke antrian ${queueName}:`, error.stack);
        }
    }

    /**
     * Memublikasikan pesan notifikasi ke exchange notifikasi dengan routing key tertentu.
     * Ini memungkinkan konsumen tertentu (misalnya, pengguna) untuk menerima notifikasi yang relevan.
     * @param routingKey Routing key (misalnya, `user.<userId>`).
     * @param message Payload notifikasi.
     */
    async publishNotification(routingKey: string, message: any) {
        if (!this.channel) {
            this.logger.error('Channel RabbitMQ tidak tersedia. Notifikasi tidak dipublikasikan.');
            return;
        }
        try {
            // Memublikasikan pesan ke exchange dengan routing key yang ditentukan
            await this.channel.publish(
                this.notificationExchangeName,
                routingKey,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );
            this.logger.debug(`Notifikasi dipublikasikan ke exchange ${this.notificationExchangeName} dengan routing key ${routingKey}: ${JSON.stringify(message)}`);
        } catch (error) {
            this.logger.error(`Kesalahan saat memublikasikan notifikasi ke exchange ${this.notificationExchangeName}:`, error.stack);
        }
    }

    /**
     * Mengonsumsi pesan dari exchange notifikasi.
     * Ini mengikat antrian sementara ke exchange notifikasi untuk pengguna tertentu,
     * memungkinkannya menerima notifikasi real-time.
     * Dalam sistem nyata, setiap klien yang terhubung (misalnya, koneksi WebSocket)
     * akan berlangganan ke antrian uniknya sendiri atau routing key.
     * Untuk demo backend-only, kita akan mengikat ke antrian generik dan mencatat pesan.
     * @param callback Fungsi yang akan dipanggil saat pesan diterima.
     */
    async consumeMessages(callback: (msg: any) => void) {
        if (!this.channel) {
            this.logger.error('Channel RabbitMQ tidak tersedia. Tidak dapat mengonsumsi pesan.');
            return;
        }

        try {
            // Membuat antrian sementara, eksklusif, auto-delete untuk notifikasi.
            // Antrian ini akan diikat ke exchange notifikasi untuk routing key tertentu.
            const q = await this.channel.assertQueue('', { exclusive: true, durable: false, autoDelete: true });
            this.logger.log(`Antrian sementara dibuat untuk konsumsi: ${q.queue}`);

            // Mengikat antrian sementara ke exchange notifikasi dengan routing key wildcard untuk tujuan demo.
            // Di chat multi-pengguna, Anda akan mengikat dengan ID pengguna tertentu sebagai routing key, misalnya, `user.${userId}`.
            // Untuk demo backend ini, kita akan menunjukkan bagaimana ia akan menerima semua notifikasi jika kita memiliki satu konsumen,
            // dan di ChatService, kita memublikasikan dengan routing key tertentu.
            // Untuk menunjukkan notifikasi pengguna individual dengan benar di sisi backend,
            // pengaturan yang lebih kompleks akan melibatkan instance konsumen terpisah atau gateway WebSocket.
            // Untuk logging backend, kita bisa mendengarkan ke binding umum.

            // Untuk mengonsumsi semua notifikasi, kita bisa mengikat ke '#' jika itu adalah topic exchange.
            // Untuk exchange 'direct', kita memerlukan routing key tertentu.
            // Untuk menunjukkan notifikasi yang diterima di backend, kita dapat membuat antrian tetap yang mendapatkan semua notifikasi.
            // CATATAN: Pendekatan ini adalah untuk demo notifikasi yang diterima backend. Untuk notifikasi per-pengguna yang sebenarnya,
            // frontend setiap pengguna (melalui WebSocket) akan berlangganan ke antrian/binding RabbitMQ unik mereka.
            const globalNotificationQueue = 'global_notification_log_queue';
            await this.channel.assertQueue(globalNotificationQueue, { durable: true });
            // Mengikat antrian ini ke exchange notifikasi dengan wildcard '#'
            // Ini berarti semua pesan yang dipublikasikan ke `notificationExchangeName` (dengan routing key apa pun)
            // akan diduplikasi dan dikirim ke `global_notification_log_queue`.
            // Ini terutama untuk logging dan demo di sisi backend.
            await this.channel.bindQueue(globalNotificationQueue, this.notificationExchangeName, '#');

            // Mulai mengonsumsi pesan dari antrian notifikasi global
            this.channel.consume(globalNotificationQueue, (msg) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        callback(content); // Memanggil callback dengan isi pesan
                        this.channel.ack(msg); // Mengakui pesan untuk menghapusnya dari antrian
                    } catch (error) {
                        this.logger.error('Kesalahan saat mengurai atau memproses pesan RabbitMQ:', error.stack);
                        this.channel.nack(msg); // Nack pesan jika pemrosesan gagal (dapat dikirim ulang)
                    }
                }
            }, { noAck: false }); // Nonaktifkan auto-acknowledgement

            this.logger.log(`Mulai mengonsumsi dari antrian: ${globalNotificationQueue}`);
        } catch (error) {
            this.logger.error('Gagal mengonsumsi pesan dari RabbitMQ', error.stack);
        }
    }
}
