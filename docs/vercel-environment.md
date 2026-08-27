# Konfigurasi Environment Vercel

Dokumen ini memandu pengisian **Project Settings → Environment Variables** untuk Pendek. Gunakan template [`.env.vercel.example`](../.env.vercel.example) hanya sebagai referensi; jangan pernah mengunggah nilai nyata ke GitHub.

| Variabel | Target | Sensitif | Nilai yang diisi | Catatan |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Preview, Production | Ya | Supabase Pooler connection string | Wajib saat runtime Prisma. Gunakan proyek/database Supabase terpisah untuk Preview bila memungkinkan. |
| `DIRECT_URL` | Production atau CI migrasi | Ya | Supabase direct connection string | Dibutuhkan oleh Prisma untuk perintah migrasi; Pendek tidak menjalankan migrasi pada build Vercel. |
| `UPSTASH_REDIS_REST_URL` | Preview, Production | Ya | REST URL dari database Upstash | Wajib agar rate limiting dibagikan antar-serverless instance. |
| `UPSTASH_REDIS_REST_TOKEN` | Preview, Production | Ya | REST token dari database Upstash | Simpan sebagai secret terenkripsi. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Preview, Production | Tidak | Site key reCAPTCHA v2 Checkbox | Variabel ini dikirim ke browser dan memang boleh bersifat publik. |
| `RECAPTCHA_SECRET_KEY` | Preview, Production | Ya | Secret key reCAPTCHA v2 Checkbox | Hanya diverifikasi pada endpoint server; jangan memakai awalan `NEXT_PUBLIC_`. |

> `NEXT_PUBLIC_APP_URL` tidak diperlukan oleh versi Pendek saat ini. Endpoint pembuatan link menyusun short URL dari origin request aktif, sehingga URL preview Vercel otomatis digunakan tanpa hard-code domain.

## Preview

Pilih target **Preview** saat menambahkan `DATABASE_URL`, dua variabel Upstash, dan dua variabel reCAPTCHA. Untuk menghindari data percobaan memengaruhi produksi, gunakan Supabase dan Upstash yang khusus untuk preview apabila aplikasi akan sering diuji oleh banyak orang. Jika memakai sumber daya yang sama, preview tetap berjalan tetapi data link dan kuota limiter akan ikut dibagikan.

Daftarkan hostname preview yang dipakai pada konfigurasi Google reCAPTCHA. Karena URL preview Vercel dapat berubah per branch, gunakan branch URL yang stabil atau custom preview domain sebelum mendaftarkannya. Setelah environment tersimpan, lakukan redeploy agar nilai tersedia pada build dan runtime.[1]

## Production

Tambahkan semua variabel yang sama ke target **Production**. Sebelum production deployment pertama, jalankan `pnpm db:deploy` dari komputer developer atau CI dengan `DIRECT_URL` yang mengarah ke database production. Setelah skema tersedia, Vercel cukup memakai `DATABASE_URL` untuk request aplikasi sehari-hari.

## Urutan aktivasi

Pertama, impor `ProTourRial/pendek` ke Vercel dan pastikan framework terdeteksi sebagai **Next.js**. Kedua, isi environment variables menurut tabel, beri label **Sensitive** pada semua password, token, dan secret. Ketiga, daftarkan hostname yang digunakan pada reCAPTCHA. Keempat, jalankan migrasi Prisma sekali terhadap database target, lalu lakukan deploy baru dari branch utama atau branch preview.

## Pemeriksaan cepat

| Pemeriksaan | Hasil yang diharapkan |
| --- | --- |
| Build Vercel | `prisma generate` dan `next build` selesai tanpa error. |
| Form | Widget reCAPTCHA muncul; tombol submit aktif setelah verifikasi. |
| API pembuatan link | Respons berhasil memuat `shortUrl` dengan hostname deployment. |
| Rate limit | Respons API memuat header `X-RateLimit-*`; request ke-13 dalam satu menit memperoleh `429`. |

## Referensi

Vercel menyediakan environment variables per target deployment dan mendukung nilai khusus branch preview.[1] Dokumentasi Prisma membedakan connection URL untuk runtime dan migrasi pada konfigurasi datasource.[2] Google reCAPTCHA mengharuskan secret token diverifikasi di server.[3]

[1]: https://vercel.com/docs/environment-variables/manage-across-environments "Vercel — Managing environment variables"
[2]: https://www.prisma.io/docs/orm/prisma-schema/overview/data-sources "Prisma — Datasources"
[3]: https://developers.google.com/recaptcha/docs/verify "Google reCAPTCHA — Verifying the user’s response"
