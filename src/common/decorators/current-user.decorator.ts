import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @decorator CurrentUser
 * @description Dekorator parameter kustom untuk mengekstrak pengguna yang diautentikasi
 * dari objek permintaan (request object).
 * Data pengguna ini biasanya ditambahkan ke `req.user` oleh strategi Passport JWT.
 * @returns Pengguna yang diautentikasi (misalnya, { userId, email })
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        // Diasumsikan strategi JWT menambahkan objek pengguna ke `request.user`.
        // Objek pengguna berisi payload dari JWT (misalnya, userId, email)
        return request.user;
    },
);
