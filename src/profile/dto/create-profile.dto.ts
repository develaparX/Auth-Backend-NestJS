import { IsNotEmpty, IsString, IsEnum, IsNumber, IsArray, IsDateString, Min, ArrayNotEmpty, ArrayUnique } from 'class-validator';

// DTO untuk membuat profil pengguna baru
export class CreateProfileDto {
    @IsString({ message: 'Nama harus berupa string.' })
    @IsNotEmpty({ message: 'Nama tidak boleh kosong.' })
    name: string;

    @IsEnum(['Male', 'Female'], { message: 'Jenis kelamin harus salah satu dari Male atau Female.' })
    @IsNotEmpty({ message: 'Jenis kelamin tidak boleh kosong.' })
    gender: 'Male' | 'Female';

    @IsDateString({}, { message: 'Ulang tahun harus berupa string tanggal yang valid (YYYY-MM-DD).' })
    @IsNotEmpty({ message: 'Ulang tahun tidak boleh kosong.' })
    birthday: string; // Format YYYY-MM-DD

    @IsNumber({}, { message: 'Tinggi harus berupa angka.' })
    @IsNotEmpty({ message: 'Tinggi tidak boleh kosong.' })
    @Min(1, { message: 'Tinggi harus angka positif.' })
    height: number; // dalam cm

    @IsNumber({}, { message: 'Berat harus berupa angka.' })
    @IsNotEmpty({ message: 'Berat tidak boleh kosong.' })
    @Min(1, { message: 'Berat harus angka positif.' })
    weight: number; // dalam kg

    @IsArray({ message: 'Minat harus berupa array.' })
    @ArrayNotEmpty({ message: 'Minat tidak boleh kosong.' })
    @ArrayUnique({ message: 'Minat tidak boleh mengandung nilai duplikat.' })
    @IsString({ each: true, message: 'Setiap minat harus berupa string.' })
    interests: string[];
}
