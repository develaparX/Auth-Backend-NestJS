// nest-app/src/auth/interfaces/jwt-payload-user.interface.ts
import { Types } from 'mongoose';

/**
 * @interface JwtPayloadUser
 * @description Merepresentasikan subset data pengguna yang disimpan dalam payload JWT
 * dan dikembalikan setelah validasi token. Tidak termasuk informasi sensitif seperti password.
 */
export interface JwtPayloadUser {
    userId: Types.ObjectId; // ID pengguna dari MongoDB
    email: string;          // Email pengguna
    // Anda bisa menambahkan properti lain yang tidak sensitif di sini jika diperlukan
}
