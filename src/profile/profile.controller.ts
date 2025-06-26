import { Controller, Post, Get, Put, Body, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Guard untuk melindungi rute
import { CurrentUser } from '../common/decorators/current-user.decorator'; // Dekorator kustom
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './schemas/profile.schema';

@Controller('profile') // Semua endpoint di controller ini akan diawali dengan /api/profile
@UseGuards(AuthGuard('jwt')) // Semua rute profil dilindungi oleh JWT Guard
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    /**
     * @api {post} /api/profile/createProfile Membuat profil pengguna
     * @apiName CreateProfile
     * @apiGroup Profile
     * @apiHeader {String} Authorization Bearer Token (JWT)
     * @apiBody {string} name Nama lengkap pengguna.
     * @apiBody {string="Male","Female"} gender Jenis kelamin pengguna.
     * @apiBody {string} birthday Ulang tahun pengguna (YYYY-MM-DD).
     * @apiBody {number} height Tinggi pengguna dalam cm.
     * @apiBody {number} weight Berat pengguna dalam kg.
     * @apiBody {string[]} interests Array minat pengguna.
     * @apiSuccess {object} profile Objek profil yang dibuat.
     * @apiError (409 Conflict) {string} message Profil sudah ada untuk pengguna ini.
     */
    @Post('createProfile')
    @HttpCode(HttpStatus.CREATED)
    async createProfile(@CurrentUser() user: any, @Body() createProfileDto: CreateProfileDto): Promise<Profile> {
        // Memanggil service untuk membuat profil dengan userId dari token dan data DTO
        return this.profileService.createProfile(user.userId, createProfileDto);
    }

    /**
     * @api {get} /api/profile/getProfile Mendapatkan profil pengguna
     * @apiName GetProfile
     * @apiGroup Profile
     * @apiHeader {String} Authorization Bearer Token (JWT)
     * @apiSuccess {object} profile Objek profil pengguna.
     * @apiError (404 Not Found) {string} message Profil tidak ditemukan.
     */
    @Get('getProfile')
    @HttpCode(HttpStatus.OK)
    async getProfile(@CurrentUser() user: any): Promise<Profile> {
        // Memanggil service untuk mendapatkan profil berdasarkan userId dari token
        return this.profileService.getProfileByUserId(user.userId);
    }

    /**
     * @api {put} /api/profile/updateProfile Memperbarui profil pengguna
     * @apiName UpdateProfile
     * @apiGroup Profile
     * @apiHeader {String} Authorization Bearer Token (JWT)
     * @apiBody {string} [name] Opsional: Nama lengkap pengguna.
     * @apiBody {string="Male","Female"} [gender] Opsional: Jenis kelamin pengguna.
     * @apiBody {string} [birthday] Opsional: Ulang tahun pengguna (YYYY-MM-DD).
     * @apiBody {number} [height] Opsional: Tinggi pengguna dalam cm.
     * @apiBody {number} [weight] Opsional: Berat pengguna dalam kg.
     * @apiBody {string[]} [interests] Opsional: Array minat pengguna.
     * @apiSuccess {object} profile Objek profil yang diperbarui.
     * @apiError (404 Not Found) {string} message Profil tidak ditemukan.
     */
    @Put('updateProfile')
    @HttpCode(HttpStatus.OK)
    async updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto): Promise<Profile> {
        // Memanggil service untuk memperbarui profil berdasarkan userId dan data DTO
        return this.profileService.updateProfile(user.userId, updateProfileDto);
    }
}
