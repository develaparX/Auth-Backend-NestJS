import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose'; // Untuk mendapatkan token model Mongoose
import { Model, Types } from 'mongoose';
// Mengubah jalur impor agar relatif terhadap rootDir Jest (yaitu, 'src')
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ProfileService } from 'src/profile/profile.service';
import { Profile, ProfileDocument } from 'src/profile/schemas/profile.schema';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { UpdateProfileDto } from 'src/profile/dto/update-profile.dto';



// Membuat mock Mongoose Model
// Ini memungkinkan kita untuk menguji ProfileService tanpa perlu koneksi database yang sebenarnya.
const mockProfileModel = {
    findOne: jest.fn(), // Mock fungsi findOne
    // `create` dan `findByIdAndUpdate` tidak perlu di-mock di sini jika tidak digunakan langsung pada model
    // melainkan pada instance dokumen (misalnya, `new Model().save()`).
    // Jika `model.create()` atau `model.findByIdAndUpdate()` digunakan di service, maka perlu di-mock di sini.
    // Untuk `new this.profileModel(...)` yang diikuti `.save()`, kita akan mock `prototype.save`.
    prototype: {
        save: jest.fn(), // Mock metode save pada dokumen Mongoose prototype
    },
};

describe('ProfileService', () => {
    let service: ProfileService;
    let model: Model<ProfileDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProfileService,
                {
                    provide: getModelToken(Profile.name), // Menyediakan mock model Mongoose
                    useValue: mockProfileModel,
                },
            ],
        }).compile();

        service = module.get<ProfileService>(ProfileService);
        model = module.get<Model<ProfileDocument>>(getModelToken(Profile.name));
    });

    afterEach(() => {
        jest.clearAllMocks(); // Membersihkan semua mock calls setelah setiap test
    });

    it('harus terdefinisi', () => {
        expect(service).toBeDefined();
    });

    describe('createProfile', () => {
        const userId = new Types.ObjectId().toHexString(); // ID pengguna palsu
        const createDto: CreateProfileDto = {
            name: 'John Doe',
            gender: 'Male',
            birthday: '1990-05-15',
            height: 175,
            weight: 70,
            interests: ['coding', 'reading'],
        };

        it('harus berhasil membuat profil', async () => {
            mockProfileModel.findOne.mockResolvedValue(null); // findOne tidak menemukan profil yang ada

            // Mock instance dokumen yang akan dibuat oleh `new model()`
            const createdProfileMock = {
                userId: new Types.ObjectId(userId),
                ...createDto,
                horoscope: 'Taurus', // Harapkan perhitungan horoskop
                zodiac: 'Horse',     // Harapkan perhitungan zodiak
                _id: new Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                // Metode save ini tidak akan dipanggil karena kita meng-mock prototype.save
                // Tapi penting untuk menjaga struktur tipe yang konsisten
                save: jest.fn().mockResolvedValue(true),
            } as unknown as ProfileDocument;

            // Mengatur mockResolvedValue pada metode `save` dari `mockProfileModel.prototype`
            // Ini akan mengintersep panggilan `new Profile(...).save()`
            (mockProfileModel.prototype.save as jest.Mock).mockResolvedValue(createdProfileMock);

            const result = await service.createProfile(userId, createDto);
            expect(result).toBeDefined();
            expect(result.name).toEqual(createDto.name);
            expect(result.horoscope).toBeDefined();
            expect(result.zodiac).toBeDefined();
            expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId }); // Verifikasi findOne dipanggil
            expect(mockProfileModel.prototype.save).toHaveBeenCalled(); // Memastikan save pada prototype dipanggil
        });

        it('harus melemparkan ConflictException jika profil sudah ada', async () => {
            mockProfileModel.findOne.mockResolvedValueOnce({}); // findOne menemukan profil yang ada

            await expect(service.createProfile(userId, createDto)).rejects.toThrow(ConflictException);
            expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId });
            // Pastikan `save` tidak dipanggil jika ada konflik
            expect(mockProfileModel.prototype.save).not.toHaveBeenCalled();
        });

        it('harus melemparkan BadRequestException untuk format tanggal lahir tidak valid', async () => {
            const invalidDto = { ...createDto, birthday: 'invalid-date' };
            mockProfileModel.findOne.mockResolvedValue(null);

            await expect(service.createProfile(userId, invalidDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getProfileByUserId', () => {
        const userId = new Types.ObjectId().toHexString();
        const mockProfile = {
            userId: new Types.ObjectId(userId),
            name: 'John Doe',
            gender: 'Male',
            birthday: new Date('1990-05-15'),
            horoscope: 'Taurus',
            zodiac: 'Horse',
            _id: new Types.ObjectId(),
            // Hapus properti `exec` dari sini, karena `mockProfile` adalah hasil yang sudah di-resolve
        } as unknown as ProfileDocument; // Cast ke unknown dulu untuk mengatasi masalah tipe saat mocking

        it('harus mengembalikan profil jika ditemukan', async () => {
            // Mengatur mock findOne untuk mengembalikan objek dengan metode exec
            // yang me-resolve mockProfile
            mockProfileModel.findOne.mockReturnValue({ exec: () => Promise.resolve(mockProfile) });

            const result = await service.getProfileByUserId(userId);
            // Bandingkan langsung dengan mockProfile, karena result adalah dokumen yang sudah di-resolve
            expect(result).toEqual(mockProfile);
            expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId });
        });

        it('harus melemparkan NotFoundException jika profil tidak ditemukan', async () => {
            mockProfileModel.findOne.mockReturnValue({ exec: () => Promise.resolve(null) });

            await expect(service.getProfileByUserId(userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateProfile', () => {
        const userId = new Types.ObjectId().toHexString();
        const existingProfile = {
            userId: new Types.ObjectId(userId),
            name: 'John Doe',
            gender: 'Male',
            birthday: new Date('1990-05-15'),
            horoscope: 'Taurus',
            zodiac: 'Horse',
            height: 175,
            weight: 70,
            interests: ['coding'],
            _id: new Types.ObjectId(),
            save: jest.fn(), // Mock metode save pada dokumen
        } as unknown as ProfileDocument;

        const updateDto: UpdateProfileDto = {
            name: 'Jane Doe',
            interests: ['gaming', 'hiking'],
        };

        it('harus berhasil memperbarui profil', async () => {
            mockProfileModel.findOne.mockResolvedValue(existingProfile); // findOne menemukan profil yang ada
            // Mengatur mockResolvedValue pada metode `save` dari `existingProfile`
            (existingProfile.save as jest.Mock).mockResolvedValue({ // save berhasil dengan perubahan yang diterapkan
                ...existingProfile,
                ...updateDto,
                updatedAt: expect.any(Date)
            });

            const result = await service.updateProfile(userId, updateDto);
            expect(result.name).toEqual(updateDto.name);
            expect(result.interests).toEqual(updateDto.interests);
            expect(result.horoscope).toEqual('Taurus'); // Seharusnya tidak berubah jika tanggal lahir tidak diupdate
            expect(result.zodiac).toEqual('Horse');     // Seharusnya tidak berubah jika tanggal lahir tidak diupdate
            expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId });
            expect(existingProfile.save).toHaveBeenCalled();
        });

        it('harus memperbarui horoskop dan zodiak jika tanggal lahir diperbarui', async () => {
            const updateDtoWithBirthday: UpdateProfileDto = {
                birthday: '1995-01-25', // Aquarius, Pig
            };
            mockProfileModel.findOne.mockResolvedValue(existingProfile);
            (existingProfile.save as jest.Mock).mockResolvedValue({
                ...existingProfile,
                birthday: new Date('1995-01-25'),
                horoscope: 'Aquarius',
                zodiac: 'Pig',
                updatedAt: expect.any(Date),
            });

            const result = await service.updateProfile(userId, updateDtoWithBirthday);
            expect(result.birthday).toEqual(new Date('1995-01-25'));
            expect(result.horoscope).toEqual('Aquarius');
            expect(result.zodiac).toEqual('Pig');
            expect(existingProfile.save).toHaveBeenCalled();
        });

        it('harus melemparkan NotFoundException jika profil tidak ditemukan', async () => {
            mockProfileModel.findOne.mockResolvedValue(null); // findOne tidak menemukan profil

            await expect(service.updateProfile(userId, updateDto)).rejects.toThrow(NotFoundException);
        });

        it('harus melemparkan BadRequestException untuk format tanggal lahir tidak valid saat update', async () => {
            const invalidDto = { birthday: 'invalid-date' };
            mockProfileModel.findOne.mockResolvedValue(existingProfile);

            await expect(service.updateProfile(userId, invalidDto)).rejects.toThrow(BadRequestException);
        });
    });
});
