import { IsOptional, IsString, IsEnum, IsNumber, IsArray, IsDateString, Min, ArrayNotEmpty, ArrayUnique, IsNotEmpty } from 'class-validator';

// DTO untuk memperbarui profil pengguna. Semua bidang bersifat opsional.
export class UpdateProfileDto {
    @IsOptional() // Menandai bidang ini sebagai opsional
    @IsString({ message: 'Nama harus berupa string.' })
    @IsNotEmpty({ message: 'Nama tidak boleh kosong.' }) // Jika diberikan, tidak boleh kosong
    name?: string; // Tipe opsional dengan `?`

    @IsOptional()
    @IsEnum(['Male', 'Female'], { message: 'Jenis kelamin harus salah satu dari Male atau Female.' })
    @IsNotEmpty({ message: 'Jenis kelamin tidak boleh kosong.' })
    gender?: 'Male' | 'Female';

    @IsOptional()
    @IsDateString({}, { message: 'Ulang tahun harus berupa string tanggal yang valid (YYYY-MM-DD).' })
    @IsNotEmpty({ message: 'Ulang tahun tidak boleh kosong.' })
    birthday?: string; // Format YYYY-MM-DD

    @IsOptional()
    @IsNumber({}, { message: 'Tinggi harus berupa angka.' })
    @IsNotEmpty({ message: 'Tinggi tidak boleh kosong.' })
    @Min(1, { message: 'Tinggi harus angka positif.' })
    height?: number; // dalam cm

    @IsOptional()
    @IsNumber({}, { message: 'Berat harus berupa angka.' })
    @IsNotEmpty({ message: 'Berat tidak boleh kosong.' })
    @Min(1, { message: 'Berat harus angka positif.' })
    weight?: number; // dalam kg

    @IsOptional()
    @IsArray({ message: 'Minat harus berupa array.' })
    @ArrayNotEmpty({ message: 'Minat tidak boleh kosong.' })
    @ArrayUnique({ message: 'Minat tidak boleh mengandung nilai duplikat.' })
    @IsString({ each: true, message: 'Setiap minat harus berupa string.' })
    interests?: string[];
}
