/**
 * data.js - Master Data & State Management for NyamCenter Tenant Panel
 * Sesuai Perancangan Basis Data SRS Nyam Center:
 * Tabel Stan, User, PemilikStan, Kategori, Menu, Pesanan, SubPesanan, DetailPesanan, Rating
 */

const STORAGE_KEY_MENU = 'nyamcenter_tenant_menus';
const STORAGE_KEY_ORDERS = 'nyamcenter_tenant_orders';
const STORAGE_KEY_BOOTH = 'nyamcenter_tenant_booth';
const STORAGE_KEY_REVIEWS = 'nyamcenter_tenant_reviews';
const STORAGE_KEY_VERSION = 'nyamcenter_tenant_data_version';
const DATA_VERSION = 'v2_ayam_geprek_teh_kopi_2026';

// Default SVG food illustrations as reliable data URIs
const SAMPLE_IMAGES = {
  ayamGeprekBawang: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Cdefs%3E%3ClinearGradient id='bgGeprekB' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%237c2d12'/%3E%3Cstop offset='100%25' stop-color='%23431407'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bgGeprekB)'/%3E%3Ccircle cx='200' cy='125' r='85' fill='%239a3412' opacity='0.7'/%3E%3Cellipse cx='200' cy='125' rx='72' ry='48' fill='%23ea580c'/%3E%3Cpath d='M145,115 Q200,75 255,115 Q265,145 200,160 Q135,145 145,115' fill='%23c2410c'/%3E%3Ccircle cx='185' cy='120' r='10' fill='%23ef4444'/%3E%3Ccircle cx='215' cy='130' r='9' fill='%23dc2626'/%3E%3Ccircle cx='200' cy='112' r='7' fill='%23fef08a'/%3E%3Ccircle cx='230' cy='118' r='6' fill='%23fef08a'/%3E%3Cpath d='M160,135 Q180,150 210,140' stroke='%23fef08a' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Ctext x='200' y='215' fill='%23ffedd5' font-family='sans-serif' font-size='15' font-weight='bold' text-anchor='middle'%3EAyam Geprek Sambal Bawang%3C/text%3E%3C/svg%3E",
  ayamGeprekMatah: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Cdefs%3E%3ClinearGradient id='bgGeprekM' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23831843'/%3E%3Cstop offset='100%25' stop-color='%23500724'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bgGeprekM)'/%3E%3Ccircle cx='200' cy='125' r='85' fill='%239d174d' opacity='0.7'/%3E%3Cpath d='M140,135 Q170,85 230,100 Q260,130 220,160 Q160,165 140,135 Z' fill='%23e11d48'/%3E%3Ccircle cx='175' cy='120' r='8' fill='%2310b981'/%3E%3Ccircle cx='200' cy='130' r='9' fill='%23ef4444'/%3E%3Ccircle cx='220' cy='115' r='7' fill='%23f59e0b'/%3E%3Ccircle cx='190' cy='140' r='6' fill='%23a7f3d0'/%3E%3Ctext x='200' y='215' fill='%23ffe4e6' font-family='sans-serif' font-size='15' font-weight='bold' text-anchor='middle'%3EAyam Geprek Sambal Matah%3C/text%3E%3C/svg%3E",
  ayamGeprek: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Cdefs%3E%3ClinearGradient id='bg2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23831843'/%3E%3Cstop offset='100%25' stop-color='%23500724'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg2)'/%3E%3Ccircle cx='200' cy='130' r='90' fill='%239d174d' opacity='0.7'/%3E%3Cpath d='M140,140 Q170,90 230,105 Q260,135 220,165 Q160,170 140,140 Z' fill='%23e11d48'/%3E%3Ccircle cx='180' cy='125' r='8' fill='%2310b981'/%3E%3Ccircle cx='200' cy='135' r='9' fill='%23ef4444'/%3E%3Ccircle cx='215' cy='120' r='7' fill='%23f59e0b'/%3E%3Ctext x='200' y='215' fill='%23ffe4e6' font-family='sans-serif' font-size='15' font-weight='bold' text-anchor='middle'%3EAyam Geprek Sambal Matah%3C/text%3E%3C/svg%3E",
  tahuBacem: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Cdefs%3E%3ClinearGradient id='bg3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2314532d'/%3E%3Cstop offset='100%25' stop-color='%23052e16'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg3)'/%3E%3Crect x='130' y='90' width='65' height='60' rx='8' fill='%2378350f' stroke='%2392400e' stroke-width='4'/%3E%3Crect x='205' y='95' width='65' height='60' rx='8' fill='%23a16207' stroke='%23ca8a04' stroke-width='4'/%3E%3Ccircle cx='165' cy='120' r='14' fill='%23451a03' opacity='0.3'/%3E%3Ccircle cx='235' cy='125' r='14' fill='%23713f12' opacity='0.3'/%3E%3Ctext x='200' y='215' fill='%23dcfce7' font-family='sans-serif' font-size='15' font-weight='bold' text-anchor='middle'%3ETahu %26 Tempe Bacem%3C/text%3E%3C/svg%3E",
  esTeh: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Cdefs%3E%3ClinearGradient id='bgEsTeh' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e3a8a'/%3E%3Cstop offset='100%25' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bgEsTeh)'/%3E%3Cpath d='M160,75 L240,75 L225,185 L175,185 Z' fill='%23b45309' stroke='%23e0f2fe' stroke-width='6' rx='4'/%3E%3Crect x='180' y='95' width='22' height='22' rx='3' fill='%23e0f2fe' opacity='0.75'/%3E%3Crect x='200' y='125' width='18' height='18' rx='3' fill='%23e0f2fe' opacity='0.75'/%3E%3Cline x1='215' y1='55' x2='188' y2='155' stroke='%2310b981' stroke-width='6' stroke-linecap='round'/%3E%3Ctext x='200' y='220' fill='%23e0f2fe' font-family='sans-serif' font-size='15' font-weight='bold' text-anchor='middle'%3EEs Teh Manis Jumbo%3C/text%3E%3C/svg%3E",
  kopiSusu: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Cdefs%3E%3ClinearGradient id='bgKopi' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%233f2110'/%3E%3Cstop offset='100%25' stop-color='%231a0c06'/%3E%3C/linearGradient%3E%3ClinearGradient id='gradKopi' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fef3c7'/%3E%3Cstop offset='35%25' stop-color='%23d97706'/%3E%3Cstop offset='70%25' stop-color='%2378350f'/%3E%3Cstop offset='100%25' stop-color='%23451a03'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bgKopi)'/%3E%3Cpath d='M160,75 L240,75 L225,185 L175,185 Z' fill='url(%23gradKopi)' stroke='%23fef3c7' stroke-width='5' rx='4'/%3E%3Crect x='182' y='95' width='20' height='20' rx='3' fill='%23ffffff' opacity='0.6'/%3E%3Crect x='202' y='125' width='18' height='18' rx='3' fill='%23ffffff' opacity='0.6'/%3E%3Cline x1='215' y1='55' x2='190' y2='155' stroke='%23f59e0b' stroke-width='5' stroke-linecap='round'/%3E%3Ctext x='200' y='220' fill='%23fef3c7' font-family='sans-serif' font-size='15' font-weight='bold' text-anchor='middle'%3EEs Kopi Susu Gula Aren%3C/text%3E%3C/svg%3E",
  boothCover: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300' viewBox='0 0 600 300'%3E%3Cdefs%3E%3ClinearGradient id='bgBooth' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fff1f5'/%3E%3Cstop offset='100%25' stop-color='%23ffffff'/%3E%3C/linearGradient%3E%3ClinearGradient id='gradRose' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23e11d48'/%3E%3Cstop offset='50%25' stop-color='%23f43f5e'/%3E%3Cstop offset='100%25' stop-color='%239f496e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bgBooth)'/%3E%3Crect x='30' y='30' width='540' height='240' rx='16' fill='%23ffffff' stroke='%23fce7ed' stroke-width='2' filter='drop-shadow(0 4px 12px rgba(159,73,110,0.08))'/%3E%3Cpath d='M30,95 L570,95' stroke='url(%23gradRose)' stroke-width='4'/%3E%3Ccircle cx='105' cy='160' r='36' fill='url(%23gradRose)'/%3E%3Ctext x='105' y='170' fill='%23ffffff' font-family='Montserrat,sans-serif' font-size='22' font-weight='800' text-anchor='middle'%3E01%3C/text%3E%3Ctext x='165' y='150' fill='%231f1424' font-family='Montserrat,sans-serif' font-size='20' font-weight='800'%3EStand 01 • Mbok Sri Nusantara%3C/text%3E%3Ctext x='165' y='178' fill='%2379667e' font-family='Montserrat,sans-serif' font-size='13' font-weight='500'%3ESentral Wisata Kuliner (SWK) Surabaya - Booth A-01 (Zona Barat)%3C/text%3E%3Crect x='455' y='138' width='95' height='32' rx='16' fill='url(%23gradRose)'/%3E%3Ctext x='502' y='159' fill='%23ffffff' font-family='Montserrat,sans-serif' font-size='12' font-weight='800' text-anchor='middle'%3EAKTIF%3C/text%3E%3C/svg%3E"
};

// Initial Booth Data (Mock Up - L9 & L13)
const DEFAULT_BOOTH = {
  id_stan: 1,
  nama_stan: "Stand 01 • Mbok Sri Nusantara",
  nama_pemilik: "Ibu Sri Rahayu",
  email: "mboksri@nyamcenter.id",
  no_hp: "081398765432",
  nomor_lokasi: "Booth A-01 (Zona Barat)",
  jam_operasional: "09:00 - 21:30 WIB",
  jam_buka: "09:00",
  jam_tutup: "21:30",
  status: "AKTIF",
  status_operasional: "OPEN", // 'OPEN' (Buka), 'BUSY' (Sibuk), 'BREAK' (Istirahat), 'CLOSED' (Tutup)
  status_note: "Stan buka normal dan siap menerima pesanan dari aplikasi meja.",
  is_open: true,
  rating_rata_rata: 4.9,
  total_ulasan: 2,
  deskripsi: "Spesialis aneka penyetan ayam geprek sambal ulek segar dan lalapan khas Jawa Timur dengan bumbu rempah warisan nusantara.",
  foto_stan: SAMPLE_IMAGES.boothCover,
  payment_methods: {
    qris: true,
    va: true,
    ewallet: true,
    cash: true
  },
  disbursement_accounts: [
    { id: 1, bank: "Bank Mandiri", no_rek: "1400019283741", atas_nama: "Sri Rahayu", is_utama: true },
    { id: 2, bank: "BCA (Bank Central Asia)", no_rek: "8290192831", atas_nama: "Sri Rahayu", is_utama: false },
    { id: 3, bank: "ShopeePay Merchant", no_rek: "081398765432", atas_nama: "Mbok Sri Nusantara", is_utama: false }
  ],
  nama_bank: "Bank Mandiri",
  no_rekening: "1400019283741",
  atas_nama: "Sri Rahayu"
};

// Initial Menu Catalog (Mock Up - L11 & SRS Table Menu)
const DEFAULT_MENUS = [
  {
    id_menu: 1,
    nama_menu: "Ayam Geprek Sambal Bawang",
    id_kategori: 1,
    nama_kategori: "Makanan Berat",
    harga: 28000,
    stok: 25,
    is_tersedia: true,
    deskripsi: "Ayam krispi renyah digeprek dengan sambal bawang gurih pedas nampol, disajikan hangat dengan lalapan timun dan kubis.",
    foto_menu: SAMPLE_IMAGES.ayamGeprekBawang
  },
  {
    id_menu: 2,
    nama_menu: "Ayam Geprek Sambal Matah",
    id_kategori: 1,
    nama_kategori: "Makanan Berat",
    harga: 30000,
    stok: 20,
    is_tersedia: true,
    deskripsi: "Ayam krispi renyah di luar juicy di dalam, digeprek dengan siraman sambal matah khas Bali segar beraroma serai dan jeruk limau.",
    foto_menu: SAMPLE_IMAGES.ayamGeprekMatah
  },
  {
    id_menu: 3,
    nama_menu: "Tahu & Tempe Bacem Goreng",
    id_kategori: 2,
    nama_kategori: "Jajanan & Dimsum",
    harga: 12000,
    stok: 15,
    is_tersedia: true,
    deskripsi: "Tahu sutra dan tempe kedelai bumbu bacem legit manis gurih pas untuk pendamping hidangan utama.",
    foto_menu: SAMPLE_IMAGES.tahuBacem
  },
  {
    id_menu: 4,
    nama_menu: "Es Teh Manis Jumbo",
    id_kategori: 3,
    nama_kategori: "Minuman & Kopi",
    harga: 7000,
    stok: 50,
    is_tersedia: true,
    deskripsi: "Teh seduh melati wangi menyegarkan porsi jumbo dengan gula tebu asli dan es batu kristal higienis.",
    foto_menu: SAMPLE_IMAGES.esTeh
  },
  {
    id_menu: 5,
    nama_menu: "Es Kopi Susu Gula Aren",
    id_kategori: 3,
    nama_kategori: "Minuman & Kopi",
    harga: 15000,
    stok: 30,
    is_tersedia: true,
    deskripsi: "Espresso kopi robusta pilihan berpadu susu segar gurih dan manis lembut alami saus gula aren nusantara.",
    foto_menu: SAMPLE_IMAGES.kopiSusu
  }
];

// Initial Kitchen Orders (Mock Up - L9 & L10)
// Lifecycle: WAITING_ACCEPTANCE -> IN_PROCESS -> READY -> COMPLETED (or REJECTED)
const DEFAULT_ORDERS = [
  {
    id_subpesanan: "SUB-001",
    id_pesanan: "ORD-20261008-001",
    waktu: "09:15 WIB",
    tanggal: "2026-10-08",
    nama_pelanggan: "Kristina Ina Helan",
    no_meja: "Meja 14, Lantai 1 Food Court",
    items: [
      { nama: "Ayam Geprek Sambal Matah", qty: 1, harga: 30000, note: "Sambal dipisah" },
      { nama: "Es Teh Manis Jumbo", qty: 1, harga: 7000, note: "Sedikit es batu" }
    ],
    catatan_dapur: "Sambal dipisah, es teh manis minta sedikit es batu.",
    subtotal: 37000,
    total_booth_revenue: 37000,
    status: "WAITING_ACCEPTANCE", // Status awal saat pesanan masuk
    metode_bayar: "QRIS Dinamis"
  },
  {
    id_subpesanan: "SUB-002",
    id_pesanan: "ORD-20261008-002",
    waktu: "09:30 WIB",
    tanggal: "2026-10-08",
    nama_pelanggan: "Budi Santoso",
    no_meja: "Meja 08, Area Terbuka (Outdoor)",
    items: [
      { nama: "Ayam Geprek Sambal Bawang", qty: 1, harga: 28000, note: "Ayam digoreng garing, level pedas 3" },
      { nama: "Es Kopi Susu Gula Aren", qty: 1, harga: 15000, note: "Manis sedang (less sugar)" }
    ],
    catatan_dapur: "Ayam digoreng garing renyah, es kopi susu manis sedang.",
    subtotal: 43000,
    total_booth_revenue: 43000,
    status: "IN_PROCESS", // Sedang dimasak
    metode_bayar: "Virtual Account"
  },
  {
    id_subpesanan: "SUB-003",
    id_pesanan: "ORD-20261008-003",
    waktu: "08:45 WIB",
    tanggal: "2026-10-08",
    nama_pelanggan: "Kristina Ina Helan",
    no_meja: "Meja 14, Lantai 1 Food Court",
    items: [
      { nama: "Ayam Geprek Sambal Bawang", qty: 2, harga: 56000, note: "Pedas sedang" },
      { nama: "Tahu & Tempe Bacem Goreng", qty: 1, harga: 12000, note: "Disajikan hangat" },
      { nama: "Es Teh Manis Jumbo", qty: 2, harga: 14000, note: "Segar manis pas" }
    ],
    catatan_dapur: "Makan di meja 14. Sambal pedas sedang.",
    subtotal: 82000,
    total_booth_revenue: 82000,
    status: "READY", // Siap Diambil / Diantar
    metode_bayar: "QRIS Dinamis"
  },
  {
    id_subpesanan: "SUB-004",
    id_pesanan: "ORD-20261008-004",
    waktu: "08:00 WIB",
    tanggal: "2026-10-08",
    nama_pelanggan: "Budi Santoso",
    no_meja: "Meja 08, Area Terbuka (Outdoor)",
    items: [
      { nama: "Ayam Geprek Sambal Matah", qty: 1, harga: 30000, note: "Potongan paha atas, lalapan timun" },
      { nama: "Es Kopi Susu Gula Aren", qty: 1, harga: 15000, note: "Dingin segar" }
    ],
    catatan_dapur: "Terima kasih, pelayanan cepat dan mantap.",
    subtotal: 45000,
    total_booth_revenue: 45000,
    status: "COMPLETED", // Selesai
    metode_bayar: "E-Wallet"
  },
  {
    id_subpesanan: "SUB-005",
    id_pesanan: "ORD-20261007-006",
    waktu: "18:30 WIB",
    tanggal: "2026-10-07",
    nama_pelanggan: "Budi Santoso",
    no_meja: "Meja 05, Ruang Santai Dalam (Indoor)",
    items: [
      { nama: "Ayam Geprek Sambal Bawang", qty: 1, harga: 28000, note: "Ekstra lalapan kubis segar" },
      { nama: "Es Teh Manis Jumbo", qty: 1, harga: 7000, note: "Manis segar" }
    ],
    catatan_dapur: "Minta tambahan porsi nasi hangat.",
    subtotal: 35000,
    total_booth_revenue: 35000,
    status: "COMPLETED", // Selesai
    metode_bayar: "Tunai / Kasir"
  }
];

// Initial Reviews (Mock Up - L12)
const DEFAULT_REVIEWS = [
  {
    id_review: 1,
    nama_pelanggan: "Kristina Ina Helan",
    initial: "KR",
    bintang: 4.0,
    tanggal: "2026-10-06 14:10:00",
    komentar: "Ayam geprek sambal matahnya harum serai, porsi nasinya pas mengenyangkan. Es teh manis jumbonya beneran segar dan mantap!",
    menu_dipesan: "Ayam Geprek Sambal Matah & Es Teh Manis Jumbo"
  },
  {
    id_review: 2,
    nama_pelanggan: "Budi Santoso",
    initial: "BU",
    bintang: 5.0,
    tanggal: "2026-10-08 08:35:00",
    komentar: "Ayam geprek sambal bawangnya juara, kriuk garing di luar tapi dagingnya juicy! Es kopi susu gula arennya juga pas legit tidak terlalu manis. Rekomen banget!",
    menu_dipesan: "Ayam Geprek Sambal Bawang & Es Kopi Susu"
  }
];

// Helper to sanitize & normalize order data structure
function normalizeOrder(o, index) {
  if (!o || typeof o !== 'object') {
    o = {};
  }
  const id_sub = o.id_subpesanan || `SUB-${String(index + 1).padStart(3, '0')}`;
  const id_pes = o.id_pesanan || `ORD-20261008-00${index + 1}`;
  const items = Array.isArray(o.items) && o.items.length > 0 ? o.items : [
    { nama: "Menu Spesial Stan", qty: 1, harga: 25000, note: "" }
  ];
  const subtotal = Number(o.subtotal || o.total_booth_revenue || items.reduce((s, it) => s + ((Number(it.harga) || 0) * (Number(it.qty) || 1)), 0)) || 0;
  const total_booth_revenue = Number(o.total_booth_revenue || subtotal) || 0;

  return {
    id_subpesanan: id_sub,
    id_pesanan: id_pes,
    waktu: o.waktu || "09:00 WIB",
    tanggal: o.tanggal || "2026-10-08",
    nama_pelanggan: o.nama_pelanggan || "Pelanggan Stan",
    no_meja: o.no_meja || "Meja 01, Food Court",
    items: items.map(it => ({
      nama: it.nama || "Menu",
      qty: Number(it.qty) || 1,
      harga: Number(it.harga) || 0,
      note: it.note || ""
    })),
    catatan_dapur: o.catatan_dapur || "",
    subtotal: subtotal,
    total_booth_revenue: total_booth_revenue,
    status: o.status || "WAITING_ACCEPTANCE",
    metode_bayar: o.metode_bayar || "QRIS Dinamis",
    alasan_penolakan: o.alasan_penolakan || ""
  };
}

// State Accessor & Local Storage Initializer
const NyamStore = {
  getBooth() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BOOTH);
      if (!raw) {
        this.saveBooth(DEFAULT_BOOTH);
        return DEFAULT_BOOTH;
      }
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? Object.assign({}, DEFAULT_BOOTH, parsed) : DEFAULT_BOOTH;
    } catch (e) {
      console.warn('Error reading booth from localStorage:', e);
      this.saveBooth(DEFAULT_BOOTH);
      return DEFAULT_BOOTH;
    }
  },
  saveBooth(data) {
    localStorage.setItem(STORAGE_KEY_BOOTH, JSON.stringify(data));
  },
  getMenus() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MENU);
      if (!raw) {
        this.saveMenus(DEFAULT_MENUS);
        return DEFAULT_MENUS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveMenus(DEFAULT_MENUS);
        return DEFAULT_MENUS;
      }
      return parsed;
    } catch (e) {
      console.warn('Error reading menus from localStorage:', e);
      this.saveMenus(DEFAULT_MENUS);
      return DEFAULT_MENUS;
    }
  },
  saveMenus(data) {
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(data));
  },
  getOrders() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (!raw) {
        this.saveOrders(DEFAULT_ORDERS);
        return DEFAULT_ORDERS.map((o, i) => normalizeOrder(o, i));
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveOrders(DEFAULT_ORDERS);
        return DEFAULT_ORDERS.map((o, i) => normalizeOrder(o, i));
      }
      return parsed.map((o, i) => normalizeOrder(o, i));
    } catch (e) {
      console.warn('Error reading orders from localStorage:', e);
      this.saveOrders(DEFAULT_ORDERS);
      return DEFAULT_ORDERS.map((o, i) => normalizeOrder(o, i));
    }
  },
  saveOrders(data) {
    const list = Array.isArray(data) ? data.map((o, i) => normalizeOrder(o, i)) : DEFAULT_ORDERS;
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(list));
  },
  getReviews() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (!raw) {
        this.saveReviews(DEFAULT_REVIEWS);
        return DEFAULT_REVIEWS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveReviews(DEFAULT_REVIEWS);
        return DEFAULT_REVIEWS;
      }
      return parsed;
    } catch (e) {
      console.warn('Error reading reviews from localStorage:', e);
      this.saveReviews(DEFAULT_REVIEWS);
      return DEFAULT_REVIEWS;
    }
  },
  saveReviews(data) {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(data));
  },
  resetOrders() {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(DEFAULT_ORDERS));
    return this.getOrders();
  },
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEY_BOOTH, JSON.stringify(DEFAULT_BOOTH));
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENUS));
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(DEFAULT_ORDERS));
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
    localStorage.setItem(STORAGE_KEY_VERSION, DATA_VERSION);
  },
  init() {
    const currentVersion = localStorage.getItem(STORAGE_KEY_VERSION);
    if (currentVersion !== DATA_VERSION) {
      // Auto-migrate to current master data version so client sees new Indonesian dishes & drinks
      this.resetToDefaults();
      return;
    }
    if (!localStorage.getItem(STORAGE_KEY_BOOTH)) {
      this.saveBooth(DEFAULT_BOOTH);
    }
    if (!localStorage.getItem(STORAGE_KEY_MENU)) {
      this.saveMenus(DEFAULT_MENUS);
    }
    if (!localStorage.getItem(STORAGE_KEY_ORDERS)) {
      this.saveOrders(DEFAULT_ORDERS);
    }
    if (!localStorage.getItem(STORAGE_KEY_REVIEWS)) {
      this.saveReviews(DEFAULT_REVIEWS);
    }
  }
};

// Initialize immediately
NyamStore.init();
