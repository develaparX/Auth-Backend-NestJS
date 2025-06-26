// Utilitas untuk menghitung tanda Zodiak Cina berdasarkan tahun lahir.
export class ZodiacCalculator {
    /**
     * Mengembalikan tanda Zodiak Cina berdasarkan tahun yang diberikan.
     * @param year Tahun lahir.
     * @returns Nama tanda zodiak (misalnya, 'Rat', 'Ox').
     */
    static getZodiac(year: number): string {
        // Zodiak Cina berputar setiap 12 tahun. Siklus dimulai dengan Tikus (Rat).
        // Tahun awal untuk siklus dapat disesuaikan. 1900 adalah Tahun Tikus.
        // Daftar Zodiak Cina dalam urutan siklus
        const zodiacs = [
            'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
            'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
        ];

        // Menggunakan tahun 1900 sebagai tahun referensi (Tahun Tikus).
        // (tahun - 1900) % 12 akan memberikan indeks untuk hewan zodiak.
        // Menambahkan 12 dan kemudian mengambil modulo 12 untuk menangani hasil negatif dengan benar
        // untuk tahun-tahun sebelum 1900.
        const index = (year - 4) % 12; // Sesuaikan dengan tahun mulai yang umum (e.g., 1900 untuk Tikus)
        // (tahun - 1900) % 12 untuk 1900 adalah 0 (Tikus).
        // (tahun - 1900) % 12 untuk 1901 adalah 1 (Kerbau).
        // Jika Anda ingin tahun 1924 sebagai Tikus, Anda bisa menggunakan (year - 1924) % 12
        const adjustedIndex = (index + 12) % 12; // Pastikan indeks positif

        return zodiacs[adjustedIndex]; // Mengembalikan nama zodiak
    }
}
