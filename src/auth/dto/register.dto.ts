import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO (Data Transfer Object) untuk data registrasi pengguna
export class RegisterDto {
    @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
    @IsEmail({}, { message: 'Harap berikan alamat email yang valid.' })
    @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
    email: string;

    @ApiProperty({ description: 'Password for the user (min 6 characters, at least one uppercase, one lowercase, one number, one special character)', example: 'Password123!' })
    @IsString({ message: 'Kata sandi harus berupa string.' })
    @IsNotEmpty({ message: 'Kata sandi tidak boleh kosong.' })
    @MinLength(6, { message: 'Kata sandi harus minimal 6 karakter.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
        message: 'Kata sandi harus berisi setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus (@$!%*?&).',
    })
    password: string;
}
