import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema'; // Skema dan tipe dokumen Profil
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { HoroscopeCalculator } from './utils/horoscope.calculator'; // Utilitas untuk horoskop
import { ZodiacCalculator } from './utils/zodiac.calculator';     // Utilitas untuk zodiak

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>, // Menginjeksi model Mongoose untuk Profil
    ) { }

    /**
     * Membuat profil pengguna baru.
     * Menghitung horoskop dan zodiak berdasarkan tanggal lahir yang diberikan.
     * @param userId ID pengguna yang membuat profil.
     * @param createProfileDto DTO yang berisi data profil.
     * @returns Dokumen profil yang dibuat.
     * @throws ConflictException jika profil sudah ada untuk pengguna ini.
     * @throws BadRequestException jika format tanggal lahir tidak valid.
     */
    async createProfile(userId: string, createProfileDto: CreateProfileDto): Promise<Profile> {
        // Memeriksa apakah profil sudah ada untuk userId ini
        const existingProfile = await this.profileModel.findOne({ userId });
        if (existingProfile) {
            throw new ConflictException('Profil sudah ada untuk pengguna ini.');
        }

        const { birthday, ...rest } = createProfileDto;

        // Memvalidasi dan mengurai tanggal lahir
        const birthDate = new Date(birthday);
        if (isNaN(birthDate.getTime())) {
            throw new BadRequestException('Format tanggal lahir tidak valid. GunakanYYYY-MM-DD.');
        }

        // Menghitung horoskop dan zodiak menggunakan utilitas
        const horoscope = HoroscopeCalculator.getHoroscope(birthDate);
        const zodiac = ZodiacCalculator.getZodiac(birthDate.getFullYear());

        // Membuat instance profil baru
        return this.profileModel.create({
            userId,
            ...rest,
            birthday: birthDate,
            horoscope,
            zodiac,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    /**
     * Mengambil profil pengguna berdasarkan userId.
     * @param userId ID pengguna.
     * @returns Dokumen profil.
     * @throws NotFoundException jika profil tidak ditemukan.
     */
    async getProfileByUserId(userId: string): Promise<Profile> {
        const profile = await this.profileModel.findOne({ userId }).exec();
        if (!profile) {
            throw new NotFoundException('Profil tidak ditemukan.');
        }
        return profile;
    }

    /**
     * Memperbarui profil pengguna yang sudah ada.
     * Recalculates horoscope and zodiac if birthday is updated.
     * @param userId ID pengguna yang profilnya sedang diperbarui.
     * @param updateProfileDto DTO yang berisi bidang-bidang yang akan diperbarui.
     * @returns Dokumen profil yang diperbarui.
     * @throws NotFoundException jika profil tidak ditemukan.
     * @throws BadRequestException jika format tanggal lahir yang diperbarui tidak valid.
     */
    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
        const existingProfile = await this.profileModel.findOne({ userId });
        if (!existingProfile) {
            throw new NotFoundException('Profil tidak ditemukan.');
        }

        // Menggunakan metode `set()` Mongoose untuk menerapkan pembaruan dari DTO.
        // Ini lebih baik daripada `Object.assign` untuk dokumen Mongoose.
        existingProfile.set(updateProfileDto);

        // Menghitung ulang horoskop dan zodiak jika tanggal lahir diperbarui
        if (updateProfileDto.birthday) {
            const birthDate = new Date(updateProfileDto.birthday);
            if (isNaN(birthDate.getTime())) {
                throw new BadRequestException('Format tanggal lahir tidak valid. GunakanYYYY-MM-DD.');
            }
            existingProfile.birthday = birthDate;
            existingProfile.horoscope = HoroscopeCalculator.getHoroscope(birthDate);
            existingProfile.zodiac = ZodiacCalculator.getZodiac(birthDate.getFullYear());
        }

        // `timestamps: true` di skema akan secara otomatis memperbarui `updatedAt` saat `save()` dipanggil.
        // Jadi, baris `existingProfile.updatedAt = new Date();` tidak diperlukan dan telah dihapus.

        return existingProfile.save(); // Menyimpan perubahan profil
    }
}
