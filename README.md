# YouApp Backend Project

Proyek ini adalah implementasi backend yang komprehensif untuk fitur Login, Profil Pengguna, dan Obrolan. Dibangun menggunakan Nest.js, MongoDB sebagai database, dan diorkestrasi dengan Docker. Ini mencakup JWT (JSON Web Token) untuk otentikasi, DTO (Data Transfer Object) dan validasi untuk input yang aman, serta RabbitMQ untuk sistem obrolan berbasis antrian pesan dan notifikasi, bersama dengan unit test dasar.

## Fitur Utama

### Otentikasi Pengguna

- Registrasi pengguna baru dengan validasi password yang kuat.
- Login pengguna dan pembuatan JWT untuk otentikasi sesi.
- Rute yang dilindungi JWT.

### Manajemen Profil Pengguna

- Membuat profil pengguna dengan detail seperti nama, jenis kelamin, tanggal lahir, tinggi, berat, dan minat.
- Penghitungan otomatis Horoskop dan Zodiak berdasarkan tanggal lahir.
- Melihat dan memperbarui profil pengguna.

### Sistem Obrolan

- Mengirim pesan teks antara pengguna.
- Melihat riwayat pesan antara dua pengguna.
- Notifikasi pesan real-time menggunakan RabbitMQ (simulasi notifikasi backend).

### Arsitektur & Praktik Terbaik

- Menggunakan DTO dan class-validator untuk validasi input yang kuat.
- Pemisahan perhatian yang jelas dengan modul dan layanan.
- Pengelolaan variabel lingkungan yang aman menggunakan @nestjs/config.
- Unit dan E2E test untuk memastikan fungsionalitas.
- Desain skema NoSQL yang terencana dengan baik di MongoDB.
- Penggunaan message broker (RabbitMQ) untuk komunikasi inter-service dan notifikasi.

### Containerization

- Menggunakan Docker dan Docker Compose untuk setup lingkungan yang mudah dan konsisten.

## Teknologi yang Digunakan

- **Backend Framework**: Nest.js (Node.js)
- **Database**: MongoDB
- **Message Broker**: RabbitMQ
- **Authentication**: JWT (JSON Web Token), Passport.js
- **Validation**: class-validator, class-transformer
- **ORM/ODM**: Mongoose
- **Containerization**: Docker, Docker Compose
- **Testing**: Jest, Supertest
- **Bahasa**: TypeScript

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- Docker Desktop
- Node.js (v18 atau lebih baru)
- npm
- Nest CLI: `npm install -g @nestjs/cli`

## Memulai

### 1. Kloning Repositori

```bash
git clone <URL_REPOSITORI_ANDA>
cd <NAMA_FOLDER_PROYEK_ANDA>
```

### 2. Siapkan File Variabel Lingkungan (.env)

Buat file `.env` di root proyek Anda. Contoh isi `.env`:

```
MONGO_URI=mongodb://mongodb:27017/youapp_db
JWT_SECRET=yourSuperSecretKeyThatShouldBeLongAndRandom
JWT_EXPIRATION_TIME=1h
RABBITMQ_URL=amqp://rabbitmq:5672
RABBITMQ_QUEUE_MESSAGE=message_queue
RABBITMQ_EXCHANGE_NOTIFICATION=notification_exchange
```

> Ganti `JWT_SECRET` dengan nilai yang aman untuk produksi.

### 3. Jalankan Semua Layanan dengan Docker Compose

Pastikan Anda berada di direktori root proyek yang berisi `docker-compose.yml`.

```bash
docker-compose up --build
```

Ini akan membangun image Docker untuk aplikasi Nest.js Anda, serta menjalankan kontainer MongoDB dan RabbitMQ.

### 4. Jalankan Hanya MongoDB dan RabbitMQ dengan Docker (Opsional, untuk pengembangan lokal)

Jika Anda ingin menjalankan aplikasi Nest.js secara lokal di mesin Anda (bukan di dalam Docker), Anda dapat menjalankan hanya layanan database dan message broker dengan Docker:

```bash
docker-compose up -d mongodb rabbitmq
```

Kemudian, instal dependensi Node.js dan jalankan aplikasi Nest.js secara lokal:

```bash
npm install
npm run start:dev
```

Pastikan `.env` Anda berisi `RABBITMQ_URL` yang menunjuk ke `localhost` jika Anda menjalankan RabbitMQ di Docker dan aplikasi Nest.js secara lokal:

```
RABBITMQ_URL=amqp://localhost:5672
```

## Akses Aplikasi

- Aplikasi API: [http://localhost:3000/api](http://localhost:3000/api)
- Dokumentasi API (Swagger UI): [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- RabbitMQ UI: [http://localhost:15672](http://localhost:15672) (user/pass: guest/guest)

## Konfigurasi Variabel Lingkungan

- `MONGO_URI`: URI MongoDB
- `JWT_SECRET`: Rahasia JWT
- `JWT_EXPIRATION_TIME`: Durasi JWT
- `RABBITMQ_URL`: Alamat RabbitMQ
- `RABBITMQ_QUEUE_MESSAGE`: Queue pesan
- `RABBITMQ_EXCHANGE_NOTIFICATION`: Exchange notifikasi

## Cara Mengecek Fitur

Gunakan Postman/Insomnia atau alat serupa. Pastikan server aktif.

### Registrasi Pengguna

```
POST /api/auth/register
{
  "email": "testuser1@example.com",
  "password": "Password123!"
}
```

### Login Pengguna

```
POST /api/auth/login
{
  "email": "testuser1@example.com",
  "password": "Password123!"
}
```

Salin `accessToken` dari respons.

### Buat Profil

```
POST /api/profile/createProfile
Authorization: Bearer <accessToken>
{
  "name": "User Satu",
  "gender": "Male",
  "birthday": "1990-05-15",
  "height": 175,
  "weight": 70,
  "interests": ["coding", "membaca"]
}
```

### Dapatkan Profil

```
GET /api/profile/getProfile
Authorization: Bearer <accessToken>
```

### Perbarui Profil

```
PUT /api/profile/updateProfile
Authorization: Bearer <accessToken>
{
  "name": "User Satu Diperbarui",
  "interests": ["coding", "membaca", "gaming"],
  "height": 178
}
```

## Uji Fitur Chat (2 Pengguna)

### a. Registrasi & Login Pengguna Kedua

Ulangi langkah sebelumnya untuk user2.

### b. Buat Profil Pengguna Kedua

Sama seperti membuat profil pertama.

### c. Kirim Pesan dari User1 ke User2

```
POST /api/messages/sendMessage
Authorization: Bearer <ACCESS_TOKEN_USER1>
{
  "receiverId": "<ID_USER2>",
  "message": "Halo dari User1!"
}
```

### d. Kirim Pesan dari User2 ke User1

Sama seperti langkah c, tukar token dan ID.

### e. Lihat Pesan dari User1

```
GET /api/messages/viewMessages?participantId=<ID_USER2>
Authorization: Bearer <ACCESS_TOKEN_USER1>
```

### f. Lihat Pesan dari User2

Tukar token dan participantId.

## Monitoring RabbitMQ

- Buka: [http://localhost:15672](http://localhost:15672)
- Login: guest / guest
- Pantau aktivitas queue dan exchange di UI RabbitMQ

## Menjalankan Tes

Anda dapat menjalankan tes baik di dalam kontainer Docker atau secara lokal di mesin Anda.

### Menjalankan Tes di dalam Kontainer Docker

Pastikan kontainer `nest_youapp` sedang berjalan (`docker-compose up`). Kemudian, eksekusi perintah berikut untuk masuk ke shell kontainer dan menjalankan tes:

```bash
docker exec -it nest_youapp sh
```

Setelah masuk ke dalam kontainer, Anda bisa menjalankan perintah tes berikut:

- **Jalankan Semua Tes:**
  ```bash
  npm test
  ```

- **Jalankan Semua Tes dengan Laporan Cakupan (Coverage):**
  ```bash
  npm run test:cov
  ```

- **Jalankan e2e Test Saja:**
  ```bash
  npm run test:e2e
  ```

- **Jalankan Unit Test Spesifik:**
  ```bash
  npm test src/profiles/profile.service.spec.ts
  ```

### Menjalankan Tes Secara Lokal (di luar Docker)

Pastikan Anda telah menginstal semua dependensi Node.js (`npm install`).

- **Jalankan Semua Tes:**
  ```bash
  npm test
  ```

- **Jalankan Semua Tes dengan Laporan Cakupan (Coverage):**
  ```bash
  npm run test:cov
  ```

- **Jalankan e2e Test Saja:**
  ```bash
  npm run test:e2e
  ```

- **Jalankan Unit Test Spesifik:**
  ```bash
  npm test src/profiles/profile.service.spec.ts
  ```

---

Dokumentasi ini dapat Anda sesuaikan lebih lanjut jika terjadi perubahan struktur proyek atau tambahan fitur.
