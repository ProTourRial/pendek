# Pendek

> **Tautan panjang, keputusan singkat.**

Pendek adalah website pemendek URL full-stack untuk portfolio **Abia Nugrahanto**. Pengguna dapat memasukkan URL tujuan untuk mendapatkan kode acak enam karakter atau alias kustom. Saat tautan pendek dibuka, aplikasi menemukan tujuan, menaikkan penghitung kunjungan, menyimpan waktu kunjungan terakhir, lalu mengalihkan pengunjung ke URL asli.

| Area | Implementasi |
| --- | --- |
| Framework | Next.js 15 App Router, TypeScript, React 19 |
| Antarmuka | Tailwind CSS, dark/light mode, react-hot-toast, lucide-react |
| Data | PostgreSQL Supabase melalui Prisma ORM |
| Kode pendek | `nanoid` dengan alfabet aman, enam karakter secara default |
| Deployment | Vercel, Render via Docker, atau Docker mandiri |

## Fitur

Pendek memvalidasi URL tujuan agar hanya protokol `http` dan `https` yang diterima. Kode otomatis terdiri dari enam karakter aman dibaca; pengguna dapat memilih alias 3–32 karakter jika belum dipakai. Rute sistem seperti `api` dan `insight` tidak dapat dipakai sebagai alias. Kolom `shortCode` memiliki unique constraint sehingga duplikasi dicegah juga pada lapisan database.

Setiap request ke `/{shortCode}` memuat link dari PostgreSQL, meningkatkan `clicks` secara atomik, mengisi `lastVisitedAt`, lalu menjalankan redirect sementara. Catatan publik tersedia pada `/insight/{shortCode}` dan data JSON tersedia melalui `GET /api/links/{shortCode}`. Pembuatan link melalui `POST /api/links` diberi pembatasan in-memory dasar untuk mencegah lonjakan sederhana pada satu proses.

> Pembatasan in-memory ini bersifat **best-effort**. Untuk deployment multi-instance atau trafik tinggi, pasang rate limiting terdistribusi pada edge/proxy seperti Vercel Firewall, Upstash Redis, Cloudflare, atau layanan yang sesuai dengan platform hosting.

## Menjalankan secara lokal

### 1. Persiapkan lingkungan dan database

Buat berkas `.env.local`, lalu isi koneksi PostgreSQL Supabase berikut. Gunakan URL pooler pada `DATABASE_URL` untuk aplikasi dan koneksi langsung pada `DIRECT_URL` khusus migrasi Prisma.

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
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
| `pnpm test` | Menjalankan unit test validasi URL dan kode pendek. |
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

Impor repositori ini di Vercel. Tambahkan `DATABASE_URL`, `DIRECT_URL`, dan `NEXT_PUBLIC_APP_URL` pada **Project Settings → Environment Variables**. Gunakan connection pooling Supabase untuk `DATABASE_URL`, lalu jalankan `pnpm db:deploy` sekali terhadap production database sebelum atau melalui proses rilis pertama. Build command sudah ditentukan oleh script `pnpm build`.

### Render

Repositori menyertakan `render.yaml` dan `Dockerfile`. Buat Blueprint atau Web Service dari repositori, lalu isi ketiga environment variable rahasia di dashboard Render. Container otomatis menjalankan `prisma migrate deploy` sebelum `next start`. Setel `NEXT_PUBLIC_APP_URL` ke domain publik Render setelah layanan aktif.

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

Pengujian unit memverifikasi format dan normalisasi kode pendek serta menolak protokol berbahaya/non-web. Uji integrasi manual direkomendasikan setelah `DATABASE_URL` tersedia: buat link, buka short URL, lalu pastikan `clicks` dan `lastVisitedAt` berubah pada halaman insight.

## Catatan keamanan

Aplikasi tidak melakukan server-side fetch ke URL tujuan, sehingga proses pemendekan tidak mengeksekusi alamat yang dikirim pengguna. Validasi hanya mengizinkan URL `http(s)`, payload dibatasi melalui schema Zod, kode sistem dilindungi, alias di-backup oleh unique constraint PostgreSQL, dan header `X-Powered-By` dimatikan. Karena produk shortlink berpotensi disalahgunakan, pertimbangkan CAPTCHA, allow/block list, laporan abuse, dan rate limit berbasis edge untuk deployment publik berskala besar.

## Referensi

Implementasi dynamic segment menggunakan pola App Router dan parameter asinkron Next.js.[1] Redirect server menggunakan fungsi `redirect()` dengan respons redirect sementara secara default.[2] Data model dipusatkan dalam Prisma schema dengan unique constraint dan indeks untuk menjaga integritas serta performa pencarian.[3]

[1]: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes "Next.js — Dynamic Route Segments"
[2]: https://nextjs.org/docs/app/api-reference/functions/redirect "Next.js — redirect"
[3]: https://www.prisma.io/docs/orm/prisma-schema/overview "Prisma — Schema Overview"

