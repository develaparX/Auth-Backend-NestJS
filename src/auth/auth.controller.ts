import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport'; // Guard untuk melindungi rute
import { CurrentUser } from '../common/decorators/current-user.decorator'; // Dekorator kustom

@Controller('auth') // Semua endpoint di controller ini akan diawali dengan /api/auth
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * @api {post} /api/auth/register Mendaftarkan pengguna baru
     * @apiName RegisterUser
     * @apiGroup Auth
     * @apiBody {string} email Alamat email pengguna.
     * @apiBody {string} password Kata sandi pengguna.
     * @apiSuccess {string} message Pesan konfirmasi.
     * @apiError (409 Conflict) {string} message Email sudah ada.
     */
    @Post('register') // Menangani permintaan POST ke /api/auth/register
    @HttpCode(HttpStatus.CREATED) // Mengatur kode status HTTP ke 201 Created
    async register(@Body() registerDto: RegisterDto) {
        // Memanggil metode register dari AuthService dengan data dari DTO
        return this.authService.register(registerDto);
    }

    /**
     * @api {post} /api/auth/login Masuk sebagai pengguna
     * @apiName LoginUser
     * @apiGroup Auth
     * @apiBody {string} email Alamat email pengguna.
     * @apiBody {string} password Kata sandi pengguna.
     * @apiSuccess {string} accessToken Token akses JWT.
     * @apiError (401 Unauthorized) {string} message Kredensial tidak valid.
     */
    @Post('login') // Menangani permintaan POST ke /api/auth/login
    @HttpCode(HttpStatus.OK) // Mengatur kode status HTTP ke 200 OK
    async login(@Body() loginDto: LoginDto) {
        // Memanggil metode login dari AuthService dengan data dari DTO
        return this.authService.login(loginDto);
    }

    /**
     * @api {post} /api/auth/profile Mendapatkan profil pengguna yang diautentikasi (contoh rute yang dilindungi)
     * @apiName GetAuthenticatedUserProfile
     * @apiGroup Auth
     * @apiHeader {String} Authorization Bearer Token (JWT)
     * @apiSuccess {object} user Objek pengguna yang diautentikasi.
     * @apiError (401 Unauthorized) {string} message Tidak berwenang jika token tidak valid atau hilang.
     */
    @UseGuards(AuthGuard('jwt')) // Melindungi rute ini dengan JWT Guard
    @Post('profile') // Menggunakan POST seperti yang diminta pengguna, meskipun GET lebih umum untuk mengambil data
    @HttpCode(HttpStatus.OK)
    getProfile(@CurrentUser() user: any) {
        // Ini adalah endpoint contoh yang menunjukkan cara mengakses data pengguna yang diautentikasi
        // Data profil sebenarnya ditangani oleh ProfileModule
        return {
            message: 'Data pengguna yang diautentikasi',
            user: {
                userId: user.userId,
                email: user.email,
                // Anda mungkin mengambil detail lebih lanjut dari UsersService atau ProfileService di sini
            },
        };
    }
}
