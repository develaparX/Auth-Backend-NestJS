import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profile/profiles.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // Mengonfigurasi ConfigModule untuk memuat variabel lingkungan.
    // `isGlobal: true` membuat ConfigService tersedia di seluruh aplikasi.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Menentukan jalur ke file .env Anda
    }),
    // Mengonfigurasi MongooseModule untuk koneksi MongoDB.
    // Menggunakan `forRootAsync` untuk mengambil URI dari ConfigService.
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Mengimpor ConfigModule agar ConfigService dapat diinjeksikan
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), // Mendapatkan URI MongoDB dari variabel lingkungan
      }),
      inject: [ConfigService], // Menyuntikkan ConfigService ke useFactory
    }),
    // Mengimpor modul-modul fungsionalitas aplikasi
    AuthModule,
    UsersModule,
    ProfilesModule,
    ChatModule,
  ],
  controllers: [], // Tidak ada controller tingkat root
  providers: [],   // Tidak ada provider tingkat root
})
export class AppModule { }
