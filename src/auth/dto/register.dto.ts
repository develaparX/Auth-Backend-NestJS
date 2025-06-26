import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

// DTO (Data Transfer Object) untuk data registrasi pengguna
export class RegisterDto {
    @IsEmail({}, { message: 'Harap berikan alamat email yang valid.' })
    @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
    email: string;

    @IsString({ message: 'Kata sandi harus berupa string.' })
    @IsNotEmpty({ message: 'Kata sandi tidak boleh kosong.' })
    @MinLength(6, { message: 'Kata sandi harus minimal 6 karakter.' })
    // Regex untuk memastikan kata sandi berisi setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
        message: 'Kata sandi harus berisi setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus (@$!%*?&).',
    })
    password: string;
}
