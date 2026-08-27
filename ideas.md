# Arah Desain Pendek

## Tiga Pendekatan

### 1. Signal Ledger
**Very Brief Intro:** Antarmuka utilitarian bernuansa editorial yang memperlakukan setiap tautan sebagai catatan presisi. Hangat, cepat dibaca, dan terasa seperti alat kerja yang matang, bukan formulir generik.

**Probability:** 0.037

### 2. Soft Orbit
**Very Brief Intro:** Ruang digital ringan dengan bentuk-bentuk orbital lembut dan warna langit pagi. Cocok untuk memberi kesan optimistis serta ramah bagi pengguna kasual.

**Probability:** 0.082

### 3. Midnight Relay
**Very Brief Intro:** Komposisi gelap dengan garis sinyal kontras dan aksen metalik. Menekankan kecepatan transfer alamat serta energi produk developer-focused.

**Probability:** 0.054

## Pendekatan Terpilih: Signal Ledger

### Design Movement
Editorial utility dan Swiss-inspired information design, dipadukan dengan materialitas kartu arsip modern.

### Core Principles
1. **Kecepatan terbaca:** informasi penting, input URL, dan hasil selalu mendapat prioritas visual paling tinggi.
2. **Presisi yang ramah:** garis tipis, tipografi yang tegas, serta detail mikro memberi kesan sistematis tanpa terasa dingin.
3. **Ritme editorial:** headline besar, label huruf kapital kecil, dan blok konten asimetris menghindari pola landing page yang terlalu generik.
4. **Nilai fungsional:** dekorasi hanya dipakai jika memperjelas alur URL, identitas, atau keadaan interaktif.

### Color Philosophy
Latar menggunakan warna tulang kertas (*paper bone*) untuk membuat produk terasa terbuka dan percaya diri. Tinta hijau gelap memberi ketenangan dan legitimasi, sementara **Signal Tangerine** menjadi penanda satu tindakan penting: membuat tautan pendek. Mode gelap tidak hanya membalik warna, tetapi beralih ke tinta malam dengan permukaan arang agar kontras tetap nyaman.

### Layout Paradigm
Halaman dibangun sebagai *editorial rail*: kolom informasi vertikal sempit di kiri dan area kerja luas di kanan pada desktop. Di perangkat kecil, rel ini berubah menjadi urutan narasi vertikal tanpa kehilangan hierarki. Area pembuat tautan berbentuk lembar kerja utama, bukan kartu yang mengambang di tengah halaman.

### Signature Elements
1. **Routing line:** garis bertitik dengan titik sambung yang menjelaskan perjalanan URL dan muncul sebagai motif berulang.
2. **Index tabs:** label angka dua digit dan garis pengindeksan editorial pada pembuka tiap bagian.
3. **Kartu arsip:** blok permukaan sedikit bertekstur dengan sudut kecil, bayangan sangat halus, dan metadata monospaced.

### Interaction Philosophy
Setiap interaksi terasa langsung dan terukur: fokus input mengaktifkan routing line, penyalinan tautan memberikan konfirmasi ringkas, dan tombol memiliki tekanan visual saat ditekan. Pengguna selalu melihat konsekuensi dari aksi tanpa menunggu atau mencari-cari status.

### Animation
Gunakan transisi transform dan opacity dengan `cubic-bezier(0.23, 1, 0.32, 1)`. Routing line dapat bergerak sangat pelan hanya ketika pengguna tidak meminta reduced motion; hasil shortlink masuk dari bawah 8px dengan opacity rendah selama 220ms. Hover singkat maksimal 180ms, active scale 0.97, dan tidak ada animasi yang menghambat keyboard atau perubahan tema.

### Typography System
`DM Mono` dipakai untuk URL, kode, angka, label metadata, dan keluaran; `Manrope` dipakai untuk teks antarmuka; `DM Serif Display` dipakai terbatas pada headline kampanye atau kata kunci penting. Headline memakai rasio besar dan rapat, teks isi leluasa dengan line-height 1.6. Tidak menggunakan Inter.

### Brand Essence
**Pendek adalah pemendek URL yang tenang dan presisi untuk orang yang ingin membagikan tautan tanpa membuatnya bertele-tele.** Kepribadian: presisi, tenang, tajam.

### Brand Voice
Nada bicara ringkas, meyakinkan, dan sedikit editorial; tidak memakai jargon promosi yang berlebihan. Headline berbicara tentang hasil konkret dan CTA memakai kata kerja lugas.

> Contoh headline: “Tautan panjang, keputusan singkat.”

> Contoh CTA: “Ringkas tautan ini”

### Wordmark & Logo
Wordmark memakai bentuk huruf kecil geometris dengan titik sambung pada huruf `e` yang mengarah ke garis routing. Mark mandiri berupa dua mata rantai tak simetris yang bertemu pada satu titik Signal Tangerine, membentuk huruf `p` abstrak tanpa teks.

### Signature Brand Color
**Signal Tangerine — `#F06A35`**.

## Style Decisions

1. Routing line adalah sistem visual utama: setiap section besar menampilkan rel indeks atau jalur dengan node/arah yang menjelaskan perpindahan URL, bukan ornamen semata.
2. Wordmark memakai bentuk lowercase geometris dengan titik sambung Signal Tangerine yang terlihat jelas; mark rantai asimetris selalu mendukung, bukan menggantikan, wordmark.
3. Signal Tangerine `#F06A35` dipakai secara disiplin untuk CTA utama, titik sambung identitas, nomor indeks penting, dan kata editorial kunci; tidak digunakan sebagai dekorasi umum.
