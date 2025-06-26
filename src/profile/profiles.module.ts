import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from './schemas/profile.schema'; // Mengimpor skema Profil
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UsersModule } from '../users/users.module'; // Untuk memeriksa apakah userId ada (opsional, tergantung kebutuhan)

@Module({
    imports: [
        // Mendefinisikan skema Profil untuk Mongoose
        MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
        UsersModule, // Mengimpor UsersModule (jika diperlukan untuk validasi userId)
    ],
    controllers: [ProfileController], // Controller untuk menangani permintaan profil
    providers: [ProfileService], // Provider layanan profil
    exports: [ProfileService], // Mengekspor ProfileService jika modul lain perlu berinteraksi dengan profil
})
export class ProfilesModule { }
