# Pendek

> **Tautan panjang, keputusan singkat.**

Pendek adalah website pemendek URL full-stack untuk portfolio **Abia Nugrahanto**. Pengguna dapat memasukkan URL tujuan untuk mendapatkan kode acak enam karakter atau alias kustom. Saat tautan pendek dibuka, aplikasi menemukan tujuan, menaikkan penghitung kunjungan, menyimpan waktu kunjungan terakhir, lalu mengalihkan pengunjung ke URL asli.

| Area | Implementasi |
| --- | --- |
| Framework | Next.js 15 App Router, TypeScript, React 19 |
| Antarmuka | Tailwind CSS, dark/light mode, react-hot-toast, lucide-react |
| Data | PostgreSQL Supabase melalui Prisma ORM |
| Kode pendek | `nanoid` dengan alfabet aman, enam karakter secara default |
| QR code | QR PNG 512 × 512 px yang dibuat di browser dan dapat langsung diunduh |
| Proteksi API | Sliding-window rate limit Redis Upstash per alamat IP, dengan fallback lokal untuk development |
| Deployment | Vercel, Render via Docker, atau Docker mandiri |

## Fitur

Pendek memvalidasi URL tujuan agar hanya protokol `http` dan `https` yang diterima. Kode otomatis terdiri dari enam karakter aman dibaca; pengguna dapat memilih alias 3–32 karakter jika belum dipakai. Rute sistem seperti `api` dan `insight` tidak dapat dipakai sebagai alias. Kolom `shortCode` memiliki unique constraint sehingga duplikasi dicegah juga pada lapisan database.

Setiap request ke `/{shortCode}` memuat link dari PostgreSQL, meningkatkan `clicks` secara atomik, mengisi `lastVisitedAt`, lalu menjalankan redirect sementara. Catatan publik tersedia pada `/insight/{shortCode}` dan data JSON tersedia melalui `GET /api/links/{shortCode}`. Sesudah link dibuat, Pendek menghasilkan QR code PNG berukuran 512 × 512 px di browser dan menyediakan tombol unduh dengan nama `pendek-{kode}-qr.png`.[4]

Pembuatan link melalui `POST /api/links` dilindungi oleh sliding-window limit sebanyak **12 request per IP per 60 detik** menggunakan Redis HTTP Upstash. Respons memuat header `X-RateLimit-Limit`, `X-RateLimit-Remaining`, dan `X-RateLimit-Reset`; respons yang diblokir memakai status `429` serta `Retry-After`. Apabila konfigurasi atau koneksi Redis tidak tersedia, aplikasi mempertahankan ketersediaan dengan fallback in-memory khusus development yang tidak boleh dijadikan perlindungan utama untuk deployment multi-instance.[5]

## Menjalankan secara lokal

### 1. Persiapkan lingkungan dan database

Buat berkas `.env.local`, lalu isi koneksi PostgreSQL Supabase berikut. Gunakan URL pooler pada `DATABASE_URL` untuk aplikasi dan koneksi langsung pada `DIRECT_URL` khusus migrasi Prisma.

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
UPSTASH_REDIS_REST_URL="https://[INSTANCE].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[UPSTASH_REDIS_REST_TOKEN]"
```

Kemudian instal dan jalankan aplikasi.

```bash
pnpm install
pnpm db:generate
pnpm db:deploy
pnpm dev
```

Aplikasi akan tersedia di `http://localhost:3000`.

### 2. Perintah yang tersedia

| Perintah | Fungsi |
| --- | --- |
| `pnpm dev` | Menjalankan server development Next.js. |
| `pnpm build` | Menghasilkan Prisma Client dan build produksi. |
| `pnpm check` | Memeriksa tipe TypeScript tanpa membuat output. |
| `pnpm lint` | Memeriksa kualitas kode dengan ESLint. |
| `pnpm test` | Menjalankan unit test validasi URL, kode pendek, QR PNG, dan fallback rate limiter. |
| `pnpm db:deploy` | Menjalankan migrasi Prisma yang sudah ada ke database target. |
| `pnpm db:migrate` | Membuat dan menjalankan migrasi baru saat pengembangan. |

## Skema data

Tabel `Link` menyimpan URL tujuan, kode pendek unik, jumlah klik, waktu pembuatan, perubahan terakhir, dan kunjungan terakhir. Indeks dibuat untuk `shortCode`, `createdAt`, serta `clicks` agar pencarian redirect dan pembacaan catatan tetap efisien.

```text
Link
├── id: cuid
├── originalUrl: text
├── shortCode: unique varchar(32)
├── clicks: integer
├── createdAt: timestamp
├── updatedAt: timestamp
└── lastVisitedAt: timestamp?
```

## Kontrak API

### Membuat tautan

`POST /api/links`

```json
{
  "originalUrl": "https://example.com/article/very-long-path",
  "customCode": "artikel"
}
```

Nilai `customCode` opsional. Jika dihilangkan, Pendek membuat kode unik enam karakter. Response sukses menggunakan status `201` dan memuat `shortUrl`, `shortCode`, `originalUrl`, `clicks`, dan `createdAt`.

### Membaca catatan tautan

`GET /api/links/{shortCode}` menyediakan URL tujuan, jumlah klik, waktu pembuatan, dan waktu kunjungan terakhir. Endpoint ini mengembalikan `404` jika kode tidak ditemukan.

## Deployment

### Vercel

Impor repositori ini di Vercel. Tambahkan `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_APP_URL`, `UPSTASH_REDIS_REST_URL`, dan `UPSTASH_REDIS_REST_TOKEN` pada **Project Settings → Environment Variables**. Gunakan connection pooling Supabase untuk `DATABASE_URL`, lalu jalankan `pnpm db:deploy` sekali terhadap production database sebelum atau melalui proses rilis pertama. Build command sudah ditentukan oleh script `pnpm build`.

### Render

Repositori menyertakan `render.yaml` dan `Dockerfile`. Buat Blueprint atau Web Service dari repositori, lalu isi seluruh lima environment variable rahasia di dashboard Render. Container otomatis menjalankan `prisma migrate deploy` sebelum `next start`. Setel `NEXT_PUBLIC_APP_URL` ke domain publik Render setelah layanan aktif.

### Docker

Simpan environment variable pada `.env.local`, lalu jalankan:

```bash
docker compose up --build
```

Container membuka port `3000`. Jangan commit `.env.local` atau password Supabase ke repositori.

## Verifikasi

Sebelum rilis, jalankan berikut di lokal atau CI:

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
```

Pengujian unit memverifikasi format dan normalisasi kode pendek, menolak protokol berbahaya/non-web, membuat QR PNG valid, serta membatasi request fallback per identitas. Uji integrasi manual direkomendasikan setelah `DATABASE_URL` tersedia: buat link, unduh dan pindai QR code, buka short URL, lalu pastikan `clicks` dan `lastVisitedAt` berubah pada halaman insight.

## Catatan keamanan

Aplikasi tidak melakukan server-side fetch ke URL tujuan, sehingga proses pemendekan tidak mengeksekusi alamat yang dikirim pengguna. Validasi hanya mengizinkan URL `http(s)`, payload dibatasi melalui schema Zod, kode sistem dilindungi, alias di-backup oleh unique constraint PostgreSQL, header `X-Powered-By` dimatikan, dan `POST /api/links` memakai counter Redis yang dibagikan lintas instance. Karena produk shortlink berpotensi disalahgunakan, tambahkan CAPTCHA, allow/block list, laporan abuse, serta kebijakan rate limit terpisah bagi pengguna terautentikasi jika kebutuhan produk berkembang.

## Referensi

Implementasi dynamic segment menggunakan pola App Router dan parameter asinkron Next.js.[1] Redirect server menggunakan fungsi `redirect()` dengan respons redirect sementara secara default.[2] Data model dipusatkan dalam Prisma schema dengan unique constraint dan indeks untuk menjaga integritas serta performa pencarian.[3] QR generator menghasilkan data URI gambar PNG yang dapat digunakan langsung sebagai file unduhan.[4] Redis Upstash membaca URL/token dari environment dan mendukung pola sliding-window untuk pembatasan endpoint.[5]

[1]: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes "Next.js — Dynamic Route Segments"
[2]: https://nextjs.org/docs/app/api-reference/functions/redirect "Next.js — redirect"
[3]: https://www.prisma.io/docs/orm/prisma-schema/overview "Prisma — Schema Overview"
[4]: https://www.npmjs.com/package/qrcode "qrcode — npm package documentation"
[5]: https://upstash.com/docs/redis/sdks/ratelimit-ts/gettingstarted "Upstash Ratelimit — Getting Started"
