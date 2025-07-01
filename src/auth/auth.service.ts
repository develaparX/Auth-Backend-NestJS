import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Pastikan Types diimpor
import { User } from '../users/schemas/user.schema'; // Mengimpor skema User
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'; // Library untuk hashing password
import { JwtService } from '@nestjs/jwt'; // Layanan JWT dari Nest
import { ConfigService } from '@nestjs/config'; // Layanan konfigurasi
import { JwtPayloadUser } from './interfaces/jwt-payload-user.interface'; // Mengimpor interface baru

@Injectable() // Menandai kelas sebagai provider Nest.js yang dapat diinjeksikan
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>, // Menginjeksi model Mongoose untuk User
        private jwtService: JwtService, // Menginjeksi JwtService
        private configService: ConfigService, // Menginjeksi ConfigService
    ) { }

    /**
     * Mendaftarkan pengguna baru.
     * Melakukan hashing password dan menyimpan pengguna ke database.
     * @param registerDto DTO yang berisi data registrasi pengguna.
     * @returns Pesan sukses.
     * @throws ConflictException jika email sudah ada.
     */
    async register(registerDto: RegisterDto): Promise<{ message: string }> {
        const { email, password } = registerDto;

        // Memeriksa apakah pengguna sudah ada dengan email yang sama
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('Email sudah ada'); // Melemparkan error jika email duplikat
        }

        // Melakukan hashing password sebelum menyimpan ke database
        const hashedPassword = await bcrypt.hash(password, 10); // 10 adalah salt rounds (kekuatan hashing)

        // Membuat instance pengguna baru dan menyimpannya
        await this.userModel.create({
            email,
            password: hashedPassword,
            createdAt: new Date(), // Waktu pembuatan
            updatedAt: new Date(), // Waktu update
        });

        return { message: 'Pengguna berhasil terdaftar' };
    }

    /**
     * Masuk sebagai pengguna.
     * Memvalidasi kredensial dan menghasilkan token JWT setelah login berhasil.
     * @param loginDto DTO yang berisi data login pengguna.
     * @returns Objek yang berisi token akses JWT.
     * @throws UnauthorizedException jika kredensial tidak valid.
     */
    async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
        const { email, password } = loginDto;

        // Mencari pengguna berdasarkan email
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Kredensial tidak valid');
        }

        // Membandingkan password yang diberikan dengan hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Kredensial tidak valid');
        }

        // Membuat payload untuk token JWT
        // Menggunakan user._id yang bertipe Types.ObjectId
        const payload = { email: user.email, userId: user._id };
        const accessToken = this.jwtService.sign(payload);

        return { accessToken };
    }

    /**
     * Memvalidasi pengguna berdasarkan payload JWT. Digunakan oleh JwtStrategy.
     * @param payload Payload JWT yang berisi userId dan email.
     * @returns Objek pengguna yang divalidasi (subset) atau null jika tidak ditemukan.
     */
    async validateUser(payload: { userId: Types.ObjectId; email: string }): Promise<JwtPayloadUser | null> {
        // Pastikan payload.userId adalah Types.ObjectId saat mencari
        const user = await this.userModel.findById(payload.userId);
        if (!user) {
            return null; // Pengguna tidak ditemukan
        }
        // Mengembalikan objek yang sesuai dengan interface JwtPayloadUser
        // Memetakan user._id ke userId
        return { userId: user._id, email: user.email };
    }
}
