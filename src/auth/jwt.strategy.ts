import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport'; // Basis kelas untuk strategi Passport
import { Strategy, ExtractJwt } from 'passport-jwt'; // Strategi JWT dan fungsi ekstraksi token
import { ConfigService } from '@nestjs/config'; // Untuk mengakses konfigurasi
import { AuthService } from './auth.service'; // Untuk memvalidasi pengguna
import { JwtPayloadUser } from './interfaces/jwt-payload-user.interface'; // Mengimpor interface baru
import { Types } from 'mongoose'; // Mengimpor Types dari mongoose

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService, // Menginjeksi ConfigService
        private authService: AuthService, // Menginjeksi AuthService
    ) {
        super({
            // Cara mengekstrak JWT dari permintaan (dari header Authorization sebagai Bearer token)
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // Jangan abaikan waktu kadaluarsa token
            // Kunci rahasia untuk memverifikasi tanda tangan JWT (harus sama dengan yang digunakan untuk menandatangani)
            // Menggunakan non-null assertion (!) karena kita yakin JWT_SECRET akan selalu ada
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    /**
     * Memvalidasi payload JWT.
     * Metode ini dipanggil setelah token berhasil didekode dan divalidasi.
     * Objek yang dikembalikan dari `validate` akan dilampirkan ke `req.user`.
     * @param payload Payload JWT yang didekode (misalnya, { email, userId }).
     * @returns Objek pengguna yang divalidasi (sesuai JwtPayloadUser).
     * @throws UnauthorizedException jika pengguna tidak ditemukan atau token tidak valid.
     */
    async validate(payload: { userId: Types.ObjectId; email: string }): Promise<JwtPayloadUser> {
        // Memanggil AuthService untuk memvalidasi pengguna berdasarkan payload
        const user = await this.authService.validateUser(payload);
        if (!user) {
            throw new UnauthorizedException('Token tidak valid'); // Melemparkan error jika pengguna tidak valid
        }
        return user; // Mengembalikan objek pengguna yang akan dilampirkan ke req.user
    }
}
