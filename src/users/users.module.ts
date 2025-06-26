import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema'; // Mengimpor skema User
import { UsersService } from './users.service'; // Mengimpor UsersService

@Module({
    imports: [
        // Mendefinisikan skema User untuk Mongoose di dalam UsersModule
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    providers: [UsersService], // Menyediakan UsersService
    exports: [UsersService], // Mengekspor UsersService agar modul lain dapat menginjeksinya
})
export class UsersModule { }
