# PWUTS_A03_25123456789 - NyamCenter (Panel Pemilik Stan & Kitchen Display System)

> **Dokumentasi Implementasi Ujian Tengah Semester (UTS) Gasal 2026/2027**  
> - **Mata Kuliah:** Pemrograman Web (2 SKS)  
> - **Program Studi:** D4 Manajemen Informatika – Universitas Negeri Surabaya (UNESA)  
> - **Dosen Pengampu:** Ari Kurniawan, S.Kom, M.T.  
> - **Topik Sistem:** *NyamCenter* – Sistem Informasi Pemesanan Makanan Pujasera Sentra Wisata Kuliner (SWK) Multi-Tenant  
> - **Aktor / Porsi Tugas:** **Pemilik Stan (Tenant UMKM) – Manajemen Dapur & Katalog Makanan**  
> - **Ketentuan Khusus:** **100% MURNI CSS (Zero Bootstrap) – TIDAK MENGGUNAKAN FRAMEWORK CSS EKSTERNAL**

---

## 1. Ringkasan Pemenuhan Soal UTS

Aplikasi web ini dikembangkan secara khusus untuk memenuhi seluruh spesifikasi tugas Ujian Tengah Semester (UTS) Pemrograman Web pada porsi aktor **Pemilik Stan (Tenant UMKM)** sesuai dokumen SRS *NyamCenter*:

| Nomor Soal UTS | Deskripsi Kebutuhan & Mock Up Acuan | Berkas Implementasi | Fitur Utama yang Dikerjakan |
|---|---|---|---|
| **Item 2.a** | **Layout Utama, Responsive, & Hyperlink Navigasi Menggunakan Teknik Ajax** *(Mock Up - L9)* | `index.html`, `pages/dashboard.html`, `css/style.css`, `css/dashboard.css`, `css/responsive.css`, `js/app.js` | • Layout utama Panel Pemilik Stan yang bersih & elegan.<br>• Sidebar navigasi asynchronous via **Teknik AJAX (`fetch()`)** tanpa reload halaman.<br>• 4 Kartu Ringkasan Omset Harian (*Today's Turnover*, *Waiting*, *Cooking*, *Rating & Active Menus*).<br>• Daftar antrean dapur langsung di dashboard dengan tombol aksi cepat.<br>• Sistem status operasional stan variatif (Buka, Dapur Padat, Istirahat, Tutup).<br>• Desain responsif fleksibel (Desktop, Laptop, Tablet, hingga Smartphone drawer *off-canvas*). |
| **Item 2.b** | **Antarmuka Pesanan Dapur / Kitchen Display System (KDS) Interaktif** *(Mock Up - L10)* | `pages/kitchen.html`, `css/kitchen.css`, `js/kitchen.js` | • Implementasi siklus hidup pesanan sesuai *Sequence Diagram B*:<br>&nbsp;&nbsp;`Menunggu Konfirmasi` ➔ `Sedang Dimasak` ➔ `Siap Saji` ➔ `Selesai`.<br>• **Dua Mode Tampilan KDS**: *Grid View* (Mock Up L10) & *Kanban Board Drag & Drop*.<br>• Efek audio lonceng dapur sintetis (*Web Audio API* internal, 100% offline).<br>• Filter kategori pesanan instan.<br>• Fitur *Tolak Pesanan & Trigger Refund* otomatis (*Activity Diagram 5.b*).<br>• Tombol *Simulasi Pesanan Masuk 🔔* secara real-time.<br>• Tombol *Reset Data Demo ↺* untuk memulihkan antrean demo UTS. |
| **Item 2.c** | **Formulir Transaksi Manajemen Katalog & Validasi Sebelum Submit** *(Mock Up - L11)* | `pages/catalog.html`, `css/catalog.css`, `js/catalog.js` | • Form input menu baru sesuai skema Tabel Menu SRS.<br>• Drag & Drop upload foto produk dengan *FileReader API instant base64 preview*.<br>• **Sistem Validasi Client-Side Ketat** (pesan error inline merah sebelum simulasi POST HTTP).<br>• 1-Klik *Toggle Status Ketersediaan Stok* (*Tersedia* ⮂ *Habis/Sold Out*).<br>• Fitur CRUD menu (Tambah, Edit, Hapus) & Live Search filter kategori. |

---

## 2. Rincian Teknis & Implementasi Fitur

### A. Item 2.a: Layout Utama & Navigasi AJAX (Mock Up L9)

1. **Konsep "Hyperlink pada Menu/Navigasi Menggunakan Teknik Ajax":**
   - Sesuai dengan instruksi soal: *"Buatkan hyperlink pada menu/navigasi untuk pekerjaan item 2.b dan 2.c menggunakan teknik Ajax."*
   - Navigasi pada sidebar menu (`Pesanan Dapur` [2.b], `Katalog & Stok Menu` [2.c], `Dashboard`, `Ulasan`, dan `Profil`) maupun tombol pintasan di dashboard (`Buka Pesanan Dapur`, `Open Kitchen →`, `Manage Menu →`) **tidak me-refresh atau memuat ulang seluruh halaman peramban** layaknya hyperlink HTML konvensional (`<a href="page.html">`).
   - Sistem menggunakan teknik **AJAX Asynchronous (`fetch()`)** yang dikontrol oleh objek router pada `js/app.js`:
     ```javascript
     fetch(`pages/${route}.html`)
       .then(response => response.text())
       .then(html => {
         App.renderView(html, route);
       });
     ```
   - **Dual-Mode Fallback Engine:** Jika berkas dibuka langsung melalui protokol `file:///` di peramban yang memblokir CORS lokal, aplikasi otomatis beralih menggunakan *embedded template fallback* (`<template id="template-*">`) pada `index.html`, sehingga navigasi AJAX tetap bekerja 100% tanpa hambatan.

2. **Design System & Murni CSS (Zero Bootstrap):**
   - **100% Pure Custom CSS:** Seluruh styling dibuat dari awal menggunakan CSS3 murni (`css/style.css`, `css/dashboard.css`, `css/kitchen.css`, `css/catalog.css`, `css/responsive.css`). Tidak ada pemanggilan Bootstrap CDN, `bootstrap.min.css`, maupun `bootstrap.bundle.min.js`.
   - **Palette Warna Eksklusif NyamCenter:**
     - `--rose-primary: #e11d48` (Warna identitas stan & aksi utama)
     - `--rose-light: #f43f5e` (Gradasi aksen & highlight)
     - `--berry-dark: #9f496e` (Aksen sekunder, border, & teks pelengkap)
     - `--bg-app: #fcf9fb` dengan sapuan *radial-gradient* lembut putih bersih.
   - **Tipografi Ramping (Montserrat):** Menggunakan Google Font **Montserrat** dengan variasi bobot *regular (400)*, *medium (500)*, dan *semi-bold (600)*, sengaja menghindari tampilan tebal kaku (*ultra-bold chunky*) agar antarmuka terlihat modern, rapi, dan nyaman dibaca.

3. **Status Operasional Stan Variatif (Sesuai Class Diagram Stan):**
   - Stan mitra dapat mengatur 4 kondisi operasional:
     - 🟢 **STAN BUKA (OPEN):** Stan beroperasi normal dan menerima semua pesanan pelanggan.
     - 🟡 **DAPUR PADAT (BUSY):** Stan sedang sibuk, waktu estimasi memasak otomatis bertambah +15 menit.
     - ☕ **ISTIRAHAT (BREAK):** Jeda persiapan bahan/istirahat sholat, pesanan baru ditahan sementara.
     - 🔴 **STAN TUTUP (CLOSED):** Stan tutup di luar jam operasional.
   - Perubahan status dapat dilakukan melalui tombol pill di header atas maupun pada kartu status di menu profil. Saat stan tidak dalam status normal, banner visual informatif otomatis tampil di dashboard.

4. **4 Kartu Ringkasan Omset Harian (Mock Up L9):**
   - **Today's Turnover:** Menghitung total omset penjualan harian kotor stan secara dinamis dari pesanan non-reject (`Rp 238.000` + indikator pertumbuhan).
   - **Waiting for Confirmation:** Menampilkan total pesanan baru yang membutuhkan konfirmasi cepat.
   - **Cooking / In Process:** Menampilkan jumlah pesanan yang sedang diolah koki dapur.
   - **Rating Stan & Menu:** Menampilkan skor ulasan stan (`★ 4.9`) dan jumlah menu aktif.

5. **Responsivitas Multi-Perangkat:**
   - **Desktop & Laptop (> 1200px):** Layout grid 3 kolom pada KDS & Katalog, sidebar permanen.
   - **Tablet (768px - 1199px):** Layout grid 2 kolom, tata letak fluid.
   - **Smartphone (< 768px):** Sidebar beralih menjadi *sliding off-canvas drawer* yang dibuka melalui tombol hamburger (☰) dengan lapisan *backdrop overlay*.

---

### B. Item 2.b: Kitchen Display System (KDS) Interaktif (Mock Up L10)

1. **Implementasi Alur Sequence Diagram B & Siklus Hidup Pesanan:**
   - Status pesanan bergerak maju secara terstruktur:
     $$\text{WAITING\_ACCEPTANCE} \xrightarrow{\text{Terima \& Masak}} \text{IN\_PROCESS} \xrightarrow{\text{Siap Diambil}} \text{READY} \xrightarrow{\text{Konfirmasi Selesai}} \text{COMPLETED}$$
   - **Perubahan Warna & Aksen Interaktif:**
     - `Menunggu Konfirmasi` (Aksen Kuning/Amber #f59e0b)
     - `Sedang Dimasak` (Aksen Biru #3b82f6)
     - `Siap Diambil/Diantar` (Aksen Cyan #0891b2)
     - `Selesai` (Aksen Hijau #10b981)
     - `Ditolak / Refund` (Aksen Merah #e11d48)

2. **Dua Mode Tampilan Fleksibel:**
   - **Mode Grid (Mock Up L10):** Kartu pesanan tersusun rapi dengan nomor pesanan, jam masuk, nama pelanggan, lokasi meja, daftar item pesanan beserta catatan dapur (*order instructions*), dan total pendapatan stan.
   - **Mode Kanban Board:** Papan 4 kolom status dengan dukungan **Drag & Drop HTML5**. Kartu pesanan dapat digeser langsung dari kolom `Menunggu` ke `Sedang Dimasak`, `Siap Saji`, atau `Selesai`. Tombol aksi cepat dan tombol tolak tetap dapat diklik secara interaktif di kedua mode.

3. **Audio Synthesizer Dapur (Web Audio API):**
   - Menggunakan osilator internal peramban (`AudioContext`) tanpa memerlukan berkas audio eksternal MP3:
     - **Nada Lonceng Ganda (High Double-Chime):** Saat ada pesanan baru masuk (*new order*).
     - **Nada Melodi Naik (Ascending Tone):** Saat status pesanan dimajukan (*advance*).
     - **Nada Peringatan Rendah (Low Sawtooth Buzz):** Saat pesanan ditolak (*reject*).

4. **Tolak Pesanan & Pemicu Refund Otomatis (Activity Diagram 5.b):**
   - Tombol **Tolak** memunculkan modal dialog untuk memasukkan alasan penolakan (misal: *bahan baku habis / stan over-capacity*).
   - Setelah dikonfirmasi, status pesanan berubah menjadi `REJECTED`, notifikasi pengembalian dana (*refund*) diproses secara otomatis, dan saldo dikembalikan ke pelanggan.

5. **Simulasi Pesanan Masuk & Tombol Reset Demo:**
   - **+ Simulasi Pesanan Masuk 🔔:** Memasukkan pesanan baru acak dengan nomor pesanan, nama pembeli, meja, catatan dapur, serta memicu bunyi lonceng dan badge notifikasi merah pada sidebar.
   - **↺ Reset Data Demo:** Memulihkan seluruh data antrean pesanan dapur ke konfigurasi awal UTS jika penguji ingin mengulang demonstrasi.

---

### C. Item 2.c: Form Manajemen Katalog & Validasi Client-Side (Mock Up L11)

1. **Kesesuaian Skema Tabel Menu SRS:**
   - `nama_menu` (VARCHAR): Nama hidangan makanan/minuman.
   - `id_kategori` (INT FK): Pilihan kategori (*Makanan Berat, Jajanan & Dimsum, Minuman & Kopi, Camilan & Penutup*).
   - `harga` (DECIMAL): Harga jual dengan konversi pratinjau format Rupiah otomatis (`Rp XX.XXX`).
   - `stok` (INT): Kuantitas stok fisik porsi per hari.
   - `deskripsi` (TEXT): Rincian cita rasa dan bahan menu.
   - `foto_menu` (VARCHAR / Data URI): Unggah foto produk via berkas atau drag-and-drop.
   - `is_tersedia` (BOOLEAN): Status ketersediaan menu stan.

2. **Sistem Validasi Client-Side Ketat Sebelum Submit HTTP:**
   - Divalidasi secara langsung di peramban sebelum transaksi diteruskan ke simulasi server HTTP:
     - **Nama Menu:** Wajib diisi, minimal 3 karakter.
     - **Kategori:** Wajib dipilih dari daftar dropdown.
     - **Harga Jual:** Wajib angka numerik positif $\ge \text{Rp } 1.000$.
     - **Stok Fisik:** Wajib bilangan bulat $\ge 0$.
     - **Deskripsi:** Wajib diisi, minimal 10 karakter.
     - **Foto Menu:** Wajib diunggah untuk menu baru, dibatasi pada format gambar (`JPG`, `PNG`, `WebP`) dengan ukuran maksimal 2MB.
   - Jika ada kolom yang tidak memenuhi syarat, sistem secara otomatis menampilkan *inline error feedback* berwarna merah dan menolak proses submit.

3. **1-Klik Toggle Ketersediaan Stok (Fast Stock Management):**
   - Setiap kartu menu pada katalog memiliki tombol aksi instan `Set Habis` / `Set Tersedia` yang langsung memperbarui ketersediaan menu di aplikasi pemesanan pelanggan tanpa perlu membuka formulir edit.

4. **Pratinjau Foto Interaktif (FileReader API):**
   - Pengguna dapat memilih berkas atau menyeret foto ke dropzone. Foto akan langsung ditampilkan secara instan dengan opsi pembatalan/hapus foto (`✕`).

---

### D. Fitur Pelengkap: Ulasan & Pengaturan Rekening (Mock Up L12 & L13)

- **Rating & Ulasan Pembeli (`pages/reviews.html` - Mock Up L12):**
  Menampilkan skor rating rata-rata stan (`★ 4.9`), visualisasi bar distribusi bintang kepuasan 1-5, dan daftar riwayat testimoni ulasan pelanggan.
- **Profil Stan & Rekening Pencairan (`pages/profile.html` - Mock Up L13):**
  - Mengelola identitas stan (nama stan, nomor booth lokasi SWK, jam buka & tutup, deskripsi).
  - Pilihan saluran pembayaran yang diaktifkan (*QRIS Dinamis, Transfer Virtual Account, E-Wallet, dan Tunai di Kasir*).
  - Pendaftaran saluran rekening pencairan hasil omset (*Bank Mandiri, BCA, BRI, BNI, Bank Jatim, ShopeePay, GoPay, OVO, DANA*) lengkap dengan penetapan rekening utama (*UTAMA*).

---

## 3. Struktur Direktori Proyek

```
PWUTS_A03_25123456789/
├── index.html                 # Shell utama aplikasi (Sidebar, Header, Kontainer AJAX, Template Fallback)
├── README.md                  # Dokumentasi teknis pengerjaan UTS
├── css/
│   ├── style.css              # Master stylesheet (Variabel CSS :root, reset, tipografi, sidebar, modal, toast)
│   ├── dashboard.css          # Desain spesifik Mock Up L9 (4 kartu ringkasan omset, kitchen queue, booth info)
│   ├── kitchen.css            # Desain spesifik Mock Up L10 (KDS grid cards, kanban board, toolbar, dropzone)
│   ├── catalog.css            # Desain spesifik Mock Up L11 (Katalog menu grid, toggle stok, dropzone upload)
│   └── responsive.css         # Media queries responsif (Desktop, Laptop, Tablet, Mobile Off-canvas Drawer)
├── js/
│   ├── app.js                 # Router AJAX, jam digital real-time, drawer mobile, status stan, notifikasi toast
│   ├── data.js                # State management, master data bawaan, sanitasi & persistensi localStorage
│   ├── kitchen.js             # Logika KDS, transisi status B, synthesizer Web Audio API, drag-and-drop Kanban, refund
│   └── catalog.js             # Logika katalog menu, FileReader preview foto produk, validasi ketat client-side
└── pages/
    ├── dashboard.html         # Parsial tampilan AJAX: Dashboard Operasional Stan (Item 2.a / Mock Up L9)
    ├── kitchen.html           # Parsial tampilan AJAX: Antarmuka Pesanan Dapur / KDS (Item 2.b / Mock Up L10)
    ├── catalog.html           # Parsial tampilan AJAX: Formulir Manajemen Menu & Stok (Item 2.c / Mock Up L11)
    ├── reviews.html           # Parsial tampilan AJAX: Rating & Ulasan Kepuasan Pembeli (Mock Up L12)
    └── profile.html           # Parsial tampilan AJAX: Profil Stan, Saluran Bayar & Rekening (Mock Up L13)
```

---

## 4. Panduan Menjalankan Aplikasi

Aplikasi web ini mendukung dua cara pengujian:

### Cara 1: Menggunakan Local Web Server (Sangat Direkomendasikan untuk Pengujian AJAX Penuh)
Jalankan server HTTP lokal di dalam folder proyek `PWUTS_A03_25123456789`:

- **Menggunakan VS Code Live Server Extension:**
  Buka folder proyek di VS Code, klik kanan pada file `index.html`, lalu pilih **"Open with Live Server"** (biasanya di `http://127.0.0.1:5500/index.html`).
- **Menggunakan Python 3:**
  ```bash
  cd PWUTS_A03_25123456789
  python -m http.server 8000
  ```
  Lalu buka peramban di `http://localhost:8000`.
- **Menggunakan Node.js:**
  ```bash
  npx serve .
  ```
- **Menggunakan XAMPP (Apache):**
  Pindahkan folder `PWUTS_A03_25123456789` ke direktori `htdocs`, lalu akses via `http://localhost/PWUTS_A03_25123456789/`.

### Cara 2: Membuka Langsung Berkas HTML (Tanpa Server / Offline Mode)
- Cukup klik dua kali berkas `index.html` di File Explorer peramban Anda.
- Aplikasi secara cerdas mengaktifkan **Embedded Template Engine Fallback**, sehingga fungsi navigasi AJAX, peralihan tab, manajemen dapur, penambahan menu, validasi, dan drag-and-drop tetap dapat berjalan 100% tanpa kendala pembatasan CORS lokal.

---

## 5. Hubungan dengan Diagram Perancangan SRS NyamCenter

1. **Use Case Diagram - Aktor Pemilik Stan:**
   - *Kelola Pesanan Stan:* Terpenuhi pada antarmuka KDS (`pages/kitchen.html` & `js/kitchen.js`).
   - *Kelola Menu & Stok:* Terpenuhi pada katalog menu (`pages/catalog.html` & `js/catalog.js`).
2. **Activity Diagram 5.a (Kelola Pesanan):**
   - Transisi status pemrosesan hidangan dari `Menunggu Konfirmasi` ➔ `Sedang Dimasak` ➔ `Siap Diambil` ➔ `Selesai`.
3. **Activity Diagram 5.b (Penolakan Pesanan):**
   - Penolakan sub-pesanan oleh pemilik stan disertai input alasan penolakan dan eksekusi pencatatan refund otomatis ke pelanggan.
4. **Sequence Diagram B (Pemrosesan Pesanan oleh Pemilik Stan):**
   - Penerimaan pesanan, pemrosesan memasak (`IN_PROCESS`), konfirmasi matang (`READY`), hingga serah terima selesai (`COMPLETED`).
5. **Sequence Diagram C (Manajemen Menu):**
   - Penambahan menu baru dengan upload foto produk, validasi atribut, dan pengubahan status ketersediaan porsi (`is_available`).

---
*Dikembangkan dengan standar kode bersih, modular, dan mematuhi seluruh kriteria penilaian Ujian Tengah Semester (UTS) Pemrograman Web D4 Manajemen Informatika UNESA 2026/2027.*
