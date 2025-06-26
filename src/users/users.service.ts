import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema'; // Mengimpor skema dan tipe dokumen User

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { } // Menginjeksi model Mongoose untuk User

    /**
     * Mencari pengguna berdasarkan ID.
     * @param id ID pengguna.
     * @returns Dokumen pengguna atau null jika tidak ditemukan.
     */
    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    /**
     * Mencari pengguna berdasarkan email.
     * @param email Email pengguna.
     * @returns Dokumen pengguna atau null jika tidak ditemukan.
     */
    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    /**
     * Membuat pengguna baru.
     * @param user Objek pengguna yang akan dibuat.
     * @returns Dokumen pengguna yang dibuat.
     */
    async create(user: Partial<User>): Promise<UserDocument> {
        const newUser = new this.userModel(user);
        return newUser.save();
    }
}
