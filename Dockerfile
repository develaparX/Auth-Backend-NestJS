# ----------------------------------------------------
# File: Dockerfile
# Deskripsi: Dockerfile untuk membangun image aplikasi Nest.js.
# ----------------------------------------------------
FROM node:18-alpine 

# Mengatur direktori kerja di dalam kontainer
WORKDIR /app

# Menyalin file package.json dan package-lock.json (jika ada)
# Ini memungkinkan instalasi dependensi di layer terpisah, memanfaatkan cache Docker
COPY package*.json ./

# Menginstal dependensi proyek
RUN npm install

# Menyalin sisa kode aplikasi dari direktori root ke dalam kontainer
COPY . .

# Membangun aplikasi Nest.js (mengkompilasi TypeScript ke JavaScript)
RUN npm run build

# Mengekspos port 3000 dari dalam kontainer
EXPOSE 3000

# Perintah default untuk menjalankan aplikasi saat kontainer dimulai
# (Ini akan ditimpa oleh `command` di docker-compose.yml untuk pengembangan)
CMD ["npm", "run", "start"]
