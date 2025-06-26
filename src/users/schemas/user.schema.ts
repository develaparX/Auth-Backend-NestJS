import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Tipe dokumen yang dihidrasi untuk Mongoose
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true }) // Mongoose secara otomatis akan menambahkan bidang createdAt dan updatedAt
export class User {
    @Prop({ required: true, unique: true, index: true })
    email: string;

    @Prop({ required: true })
    password: string; // Akan disimpan sebagai password yang di-hash

    // Bidang createdAt dan updatedAt secara otomatis dikelola oleh { timestamps: true }
    // @Prop({ type: Date, default: Date.now })
    // createdAt: Date;

    // @Prop({ type: Date, default: Date.now })
    // updatedAt: Date;
}

// Membuat skema Mongoose dari kelas User
export const UserSchema = SchemaFactory.createForClass(User);
