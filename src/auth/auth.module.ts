import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema'; // Mengimpor skema User
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module'; // Mengimpor UsersModule untuk menggunakan UsersService

@Module({
    imports: [
        // Mendefinisikan skema User untuk Mongoose di dalam AuthModule
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        // Mengonfigurasi PassportModule untuk otentikasi.
        // `defaultStrategy: 'jwt'` mengatur strategi default untuk semua Guard JWT.
        PassportModule.register({ defaultStrategy: 'jwt' }),
        // Mengonfigurasi JwtModule untuk penandatanganan dan verifikasi JWT.
        // Menggunakan `registerAsync` untuk mengambil rahasia JWT dari ConfigService.
        JwtModule.registerAsync({
            imports: [ConfigModule], // Memastikan ConfigModule tersedia
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'), // Mengambil kunci rahasia JWT
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'), // Mengambil waktu kadaluarsa JWT
                },
            }),
            inject: [ConfigService], // Menyuntikkan ConfigService ke useFactory
        }),
        UsersModule, // Diperlukan agar AuthService dapat berinteraksi dengan UsersService
    ],
    controllers: [AuthController], // Controller untuk menangani permintaan otentikasi
    providers: [AuthService, JwtStrategy], // Provider layanan dan strategi Passport
    exports: [AuthService, JwtModule, PassportModule], // Mengekspor untuk digunakan oleh modul lain (misalnya, ProfilesModule)
})
export class AuthModule { }
