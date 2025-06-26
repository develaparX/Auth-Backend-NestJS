import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// Tipe dokumen yang dihidrasi untuk Mongoose
export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ timestamps: true }) // Secara otomatis menambahkan createdAt dan updatedAt
export class Profile {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId; // Referensi ke model User (menunjukkan kepemilikan profil)

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: ['Male', 'Female'] })
    gender: 'Male' | 'Female';

    @Prop({ required: true, type: Date })
    birthday: Date;

    @Prop({ required: false }) // Akan dihitung dan disimpan
    horoscope: string;

    @Prop({ required: false }) // Akan dihitung dan disimpan
    zodiac: string;

    @Prop({ required: true, min: 1, max: 300 }) // Tinggi dalam cm
    height: number;

    @Prop({ required: true, min: 1, max: 500 }) // Berat dalam kg
    weight: number;

    @Prop({ type: [String], default: [] }) // Array string untuk minat
    interests: string[];

    // createdAt dan updatedAt ditangani oleh { timestamps: true }
}

// Membuat skema Mongoose dari kelas Profile
export const ProfileSchema = SchemaFactory.createForClass(Profile);
