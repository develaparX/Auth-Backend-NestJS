import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// DTO (Data Transfer Object) untuk data login pengguna
export class LoginDto {
    @IsEmail({}, { message: 'Harap berikan alamat email yang valid.' })
    @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
    email: string;

    @IsString({ message: 'Kata sandi harus berupa string.' })
    @IsNotEmpty({ message: 'Kata sandi tidak boleh kosong.' })
    password: string;
}
