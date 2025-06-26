import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'; // Opsional: Untuk filter pengecualian global
import * as dotenv from 'dotenv'; // Mengimpor dotenv untuk memuat variabel lingkungan

dotenv.config(); // Memuat variabel lingkungan dari file .env

async function bootstrap() {
  // Membuat instance aplikasi Nest
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan CORS (Cross-Origin Resource Sharing)
  // Untuk pengembangan, izinkan semua origin. Di produksi, tentukan URL frontend Anda.
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Menerapkan ValidationPipe secara global
  // Ini secara otomatis akan memvalidasi payload masuk berdasarkan DTO.
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Menghapus properti yang tidak ada di DTO dari payload
    forbidNonWhitelisted: true, // Melemparkan kesalahan jika properti yang tidak diizinkan ditemukan
    transform: true, // Mengubah payload masuk menjadi instance DTO
  }));

  // Menerapkan filter pengecualian global (opsional, untuk penanganan error terpusat)
  // app.useGlobalFilters(new AllExceptionsFilter());

  // Mengatur prefiks API global
  // Semua endpoint akan diawali dengan /api (misalnya, /api/auth/register)
  app.setGlobalPrefix('api');

  // Mengambil port dari variabel lingkungan atau default ke 3000
  const port = process.env.PORT || 3000;
  // Memulai aplikasi Nest
  await app.listen(port);
  console.log(`Aplikasi berjalan di: ${await app.getUrl()}/api`);
}
bootstrap(); // Memanggil fungsi bootstrap untuk memulai aplikasi
