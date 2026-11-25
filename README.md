# BLOWNERGY Smart Control Dashboard

Dashboard simulasi interaktif untuk konsep pemulihan energi aliran udara blower kandang.

## Fitur
- Kontrol ON/OFF enam blower simulasi
- Pengaturan kecepatan udara dan jam operasi
- Kalkulasi estimasi daya/energi berdasarkan asumsi naskah BLOWNERGY
- Animasi turbin dan aliran energi
- Simulasi baterai, sensor suhu/kelembapan, dan prioritas SEMS
- Mode SEMS otomatis/manual dan kontrol USB simulasi
- Grafik produksi energi dinamis
- Layout responsif

## Menjalankan secara lokal

Persyaratan: Node.js 20.19+ atau 22.12+ disarankan.

```bash
npm install
npm run dev
```

Buka URL lokal yang ditampilkan Vite.

## Build produksi

```bash
npm run build
npm run preview
```

Output produksi berada di folder `dist/`.

## Deploy ke GitHub dan Vercel

1. Buat repository GitHub baru, misalnya `blownenergy-dashboard`.
2. Upload seluruh isi folder project ini ke root repository.
3. Di Vercel pilih **Add New → Project**, lalu impor repository GitHub.
4. Framework preset: **Vite**.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Deploy.

Vercel akan menjalankan build dari Node.js. Tidak diperlukan server Express terpisah untuk versi dashboard simulasi ini.

## Model perhitungan

Model estimasi daya listrik:
`P_gen = 0.5 × rho × A × v^3 × Cp × eta_generator × eta_elektronik`

Parameter awal mengikuti naskah:
- rho = 1.2 kg/m³
- diameter = 0.5 m
- Cp = 0.15
- efisiensi generator = 0.60
- efisiensi elektronika = 0.80
- enam blower, sembilan jam/hari (nilai awal)
- efisiensi penyimpanan 85% (asumsi simulasi)
- beban sensor default 1 W total (dua node × 0.5 W)

Nilai yang ditampilkan merupakan estimasi/simulasi, bukan telemetri perangkat nyata. Perhitungan net energy benefit menggunakan selisih estimasi daya generator per blower dan tambahan daya blower berdasarkan persentase yang dapat diubah pengguna.

## Integrasi perangkat nyata (pekerjaan lanjutan)

Untuk mengendalikan blower fisik atau membaca ESP32, tambahkan backend/API yang aman dan autentikasi. Jangan hubungkan kontrol tegangan/arus atau relay daya langsung ke browser tanpa proteksi, interlock, otorisasi, dan desain keselamatan listrik/mekanis. Dashboard saat ini tidak mengirim perintah ke perangkat keras.
