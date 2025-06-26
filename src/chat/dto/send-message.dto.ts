import { IsNotEmpty, IsString } from 'class-validator';

// DTO untuk mengirim pesan baru
export class SendMessageDto {
    @IsString({ message: 'ID penerima harus berupa string.' })
    @IsNotEmpty({ message: 'ID penerima tidak boleh kosong.' })
    receiverId: string; // ID pengguna yang akan menerima pesan

    @IsString({ message: 'Isi pesan harus berupa string.' })
    @IsNotEmpty({ message: 'Isi pesan tidak boleh kosong.' })
    message: string; // Konten teks pesan
}
