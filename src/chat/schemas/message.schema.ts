import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// Tipe dokumen yang dihidrasi untuk Mongoose
export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true }) // Secara otomatis menambahkan createdAt dan updatedAt
export class Message {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    senderId: Types.ObjectId; // ID pengirim pesan, referensi ke koleksi User

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    receiverId: Types.ObjectId; // ID penerima pesan, referensi ke koleksi User

    @Prop({ required: true })
    message: string; // Isi pesan

    @Prop({ type: Date, required: true, default: Date.now })
    timestamp: Date; // Waktu pesan dikirim

    @Prop({ type: Boolean, default: false })
    read: boolean; // Status pesan: dibaca atau belum dibaca
}

// Membuat skema Mongoose dari kelas Message
export const MessageSchema = SchemaFactory.createForClass(Message);
