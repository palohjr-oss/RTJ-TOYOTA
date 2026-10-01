import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}
if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}
const DATA_DIR = path.join(__dirname, '../../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Check Supabase config
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const isSupabaseEnabled = Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'));

let supabase = null;
if (isSupabaseEnabled) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Database] Supabase client initialized:', supabaseUrl);
  } catch (err) {
    console.warn('[Database] Failed to init Supabase client, falling back to local persistent store.', err.message);
  }
} else {
  console.log('[Database] Running with Local Persistent Store (Supabase offline/standalone mode).');
}

// Initial Users
const initialUsers = [
  {
    id: 'u-1',
    username: 'HENDRI',
    password_hash: bcrypt.hashSync('BISMILLAH', 10),
    nama: 'Hendri (Kepala Bengkel / Admin)',
    role: 'Admin',
    avatar_url: null,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'u-2',
    username: 'DEBBY',
    password_hash: bcrypt.hashSync('1', 10),
    nama: 'Debby (Front Officer / CR)',
    role: 'FO',
    avatar_url: null,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'u-3',
    username: 'SUGIANTO',
    password_hash: bcrypt.hashSync('123456', 10),
    nama: 'Sugianto (Service Advisor)',
    role: 'SA',
    avatar_url: null,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'u-4',
    username: 'RUDI',
    password_hash: bcrypt.hashSync('123456', 10),
    nama: 'Rudi (Service Advisor)',
    role: 'SA',
    avatar_url: null,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'u-5',
    username: 'RONY',
    password_hash: bcrypt.hashSync('123456', 10),
    nama: 'Rony (Service Advisor)',
    role: 'SA',
    avatar_url: null,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'u-6',
    username: 'WAYAN',
    password_hash: bcrypt.hashSync('123456', 10),
    nama: 'Wayan (Service Advisor)',
    role: 'SA',
    avatar_url: null,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'u-7',
    username: 'FAJAR',
    password_hash: bcrypt.hashSync('123456', 10),
    nama: 'Fajar (Service Advisor)',
    role: 'SA',
    avatar_url: null,
    created_at: new Date('2026-01-01').toISOString(),
  }
];

// Exact Real RTJ Data from Wira Toyota Banjarmasin Sheet
const initialRTJ = [
  {
    id: 'rtj-1',
    no_urut: 1,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-01',
    no_wo: 'WO/2026/08/001',
    no_polisi: 'DA1871BM',
    nama_customer: 'WAHYUNI',
    no_hp: '',
    model: 'CALYA',
    service: 'SBE 30.000 KM (T-CARE LITE +) GT OIL M/F (TMO 10W30)',
    sa: 'SUGIANTO',
    fo: 'Sapruddin',
    teknisi: 'Mohamad',
    km_service: 30000,
    tanggal_rtj: '2026-08-04',
    batas_periode_rtj: '2026-08-11',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN AFTER SERVICE',
    keterangan: 'BOOKING 06 AGUSTUS',
    created_at: '2026-08-01T08:00:00.000Z',
    updated_at: '2026-08-04T10:00:00.000Z'
  },
  {
    id: 'rtj-2',
    no_urut: 2,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-03',
    no_wo: 'WO/2026/08/002',
    no_polisi: 'DA1300JU',
    nama_customer: 'TIENDRAWANI TANGAMUS',
    no_hp: '',
    model: 'NEW VELOZ',
    service: 'SBE 70.000 KM GT OLI M/F (5W30) REM KADANG BUNYI BUNYI KLUTUK2 BAGIAN BAWAH SAAT JLN KASAR',
    sa: 'SUGIANTO',
    fo: 'Muhammad',
    teknisi: 'FIRMAN A',
    km_service: 70000,
    tanggal_rtj: '2026-08-06',
    batas_periode_rtj: '2026-08-13',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: AFTERSERVICE',
    keterangan: 'BOOKING 4 AGUSTUS',
    created_at: '2026-08-03T09:00:00.000Z',
    updated_at: '2026-08-06T11:00:00.000Z'
  },
  {
    id: 'rtj-3',
    no_urut: 3,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-04',
    no_wo: 'WO/2026/08/003',
    no_polisi: 'DA1094ZAK',
    nama_customer: 'FAHRI DWI PRADITYA',
    no_hp: '',
    model: 'AVANZA DUAL VVTI',
    service: 'SBE 50.000 KM (TCARE) FULLSYNTETYC',
    sa: 'SP BATUBARA',
    fo: 'Joko prasetyo',
    teknisi: 'Muhamad',
    km_service: 50000,
    tanggal_rtj: '2026-08-07',
    batas_periode_rtj: '2026-08-14',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: UNTUK KENDARAAN SUDAH PRIMA',
    keterangan: 'BOOKING 10 AGUSTUS',
    created_at: '2026-08-04T08:30:00.000Z',
    updated_at: '2026-08-07T09:15:00.000Z'
  },
  {
    id: 'rtj-4',
    no_urut: 4,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-04',
    no_wo: 'WO/2026/08/004',
    no_polisi: 'DA1572TMC',
    nama_customer: 'AGUS SUTRISNO',
    no_hp: '',
    model: 'INNOVA REBORN GASOLINE',
    service: 'GR ANALISA KELUHAN REM TANGAN SAAT TANJKAN TIDAK',
    sa: 'RUDI',
    fo: 'Muhammad',
    teknisi: 'Fauzi',
    km_service: 45000,
    tanggal_rtj: '2026-08-07',
    batas_periode_rtj: '2026-08-14',
    status_rtj: 'Pending',
    detail_kendala: 'KELUHAN: MASIH ADA KELUHAN REM TANGAN',
    keterangan: 'BELUM TERKONFIRMASI',
    created_at: '2026-08-04T10:00:00.000Z',
    updated_at: '2026-08-07T14:20:00.000Z'
  },
  {
    id: 'rtj-5',
    no_urut: 5,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-05',
    no_wo: 'WO/2026/08/005',
    no_polisi: 'DA8650ZS',
    nama_customer: 'ARDIANSYAH',
    no_hp: '',
    model: 'HILUX D CABIN',
    service: 'SBE 30.000KM T-CARE',
    sa: 'SP BATUBARA',
    fo: 'Joko prasetyo',
    teknisi: 'AHMAD D',
    km_service: 30000,
    tanggal_rtj: '2026-08-08',
    batas_periode_rtj: '2026-08-15',
    status_rtj: 'Completed',
    detail_kendala: 'Keluhan: after-service unit prima',
    keterangan: 'BOOKING 10 AGUSTUS',
    created_at: '2026-08-05T11:00:00.000Z',
    updated_at: '2026-08-08T13:00:00.000Z'
  },
  {
    id: 'rtj-6',
    no_urut: 6,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-06',
    no_wo: 'WO/2026/08/006',
    no_polisi: 'DA1049JX',
    nama_customer: 'ANDI PAMUNGKAS WIDIARSIH',
    no_hp: '',
    model: 'INNOVA ZENIX',
    service: 'SBE 50.000KM T-CARE GANTI OLI MESIN + F OLI (TMO 5W) KELUHAN : 1. MESIN NGELITIK SAAT AKSELERASI 2. COLOKAN USB DEPAN DAN BELAKANG MASUK KEDALAM',
    sa: 'RONY',
    fo: 'Sapruddin',
    teknisi: 'AWALUDIN',
    km_service: 50000,
    tanggal_rtj: '2026-08-10',
    batas_periode_rtj: '2026-08-17',
    status_rtj: 'Pending',
    detail_kendala: 'KELUHAN: AFTER SERVICE COLOKAN USB',
    keterangan: 'BELUM TERKONFIRMASI',
    created_at: '2026-08-06T13:00:00.000Z',
    updated_at: '2026-08-10T10:30:00.000Z'
  },
  {
    id: 'rtj-7',
    no_urut: 7,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-06',
    no_wo: 'WO/2026/08/007',
    no_polisi: 'DA1307NE',
    nama_customer: 'FRISTANGGA',
    no_hp: '',
    model: 'NEW AGYA',
    service: 'SBE 20.000 KM T-CARE LITE+ GT OLI M/F ( TMO 10W30)',
    sa: 'SUGIANTO',
    fo: 'Sapruddin',
    teknisi: 'Lendi bagus',
    km_service: 20000,
    tanggal_rtj: '2026-08-10',
    batas_periode_rtj: '2026-08-17',
    status_rtj: 'Pending',
    detail_kendala: 'KELUHAN: MASIH ADA BUNYI HALUS',
    keterangan: 'BELUM TERKONFIRMASI',
    created_at: '2026-08-06T14:30:00.000Z',
    updated_at: '2026-08-10T11:00:00.000Z'
  },
  {
    id: 'rtj-8',
    no_urut: 8,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-10',
    no_wo: 'WO/2026/08/008',
    no_polisi: 'B9023JBA',
    nama_customer: 'NIZAM, HJ AHMAD SAUKANI',
    no_hp: '',
    model: 'HILUX DIESEL',
    service: 'SAAT DI GAS KDANG ASAP HITAM PEKAT',
    sa: 'RUDI',
    fo: 'Fahrurrazi',
    teknisi: 'Budi Hariyanto',
    km_service: 60000,
    tanggal_rtj: '2026-08-13',
    batas_periode_rtj: '2026-08-20',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: UNTUK KENDARAAN BERSIH',
    keterangan: 'BOOKING 08 AGUSTUS',
    created_at: '2026-08-10T09:00:00.000Z',
    updated_at: '2026-08-13T10:00:00.000Z'
  },
  {
    id: 'rtj-9',
    no_urut: 9,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-11',
    no_wo: 'WO/2026/08/009',
    no_polisi: 'DA1129LS',
    nama_customer: 'IMAN LASIMAN',
    no_hp: '',
    model: 'NEW VELOZ',
    service: 'SBE 50.000KM T-CARE GANTI OLI MESIN + F OLI (TMO 10W)',
    sa: 'RONY',
    fo: 'Muhammad',
    teknisi: 'Ramana',
    km_service: 50000,
    tanggal_rtj: '2026-08-14',
    batas_periode_rtj: '2026-08-21',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: STEER TIDAK LURUS (SUDAH SPOORING)',
    keterangan: 'BOOKING 12 AGUSTUS',
    created_at: '2026-08-11T10:00:00.000Z',
    updated_at: '2026-08-14T11:30:00.000Z'
  },
  {
    id: 'rtj-10',
    no_urut: 10,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-13',
    no_wo: 'WO/2026/08/010',
    no_polisi: 'DA1390BC',
    nama_customer: 'MUHAMMAD APDHAL',
    no_hp: '',
    model: 'AVANZA DUAL VVTI',
    service: 'SERVICE BERKALA 110.000 KM GANTI OLI L/F (TMO)',
    sa: 'FAJAR',
    fo: 'Muhammad',
    teknisi: 'Fauzi',
    km_service: 110000,
    tanggal_rtj: '2026-08-18',
    batas_periode_rtj: '2026-08-25',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: KOPLUNGNYA KERAS (SUDAH ADJUST)',
    keterangan: 'BOOKING 20 AGUSTUS',
    created_at: '2026-08-13T11:00:00.000Z',
    updated_at: '2026-08-18T10:00:00.000Z'
  },
  {
    id: 'rtj-11',
    no_urut: 11,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-14',
    no_wo: 'WO/2026/08/011',
    no_polisi: 'DA1416ZAL',
    nama_customer: 'RAHMADI',
    no_hp: '',
    model: 'CALYA',
    service: 'SBE 30.000 KM DI REM BUNYI GREK2',
    sa: 'SP BATUBARA',
    fo: 'Joko prasetyo',
    teknisi: '-',
    km_service: 30000,
    tanggal_rtj: '2026-08-19',
    batas_periode_rtj: '2026-08-26',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: AFTER SERVICE',
    keterangan: 'BOOKING 20 AGUSTUS',
    created_at: '2026-08-14T09:30:00.000Z',
    updated_at: '2026-08-19T14:00:00.000Z'
  },
  {
    id: 'rtj-12',
    no_urut: 12,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-15',
    no_wo: 'WO/2026/08/012',
    no_polisi: 'DA1642WJ',
    nama_customer: 'SISWONDO',
    no_hp: '',
    model: 'RUSH',
    service: 'SBE 100.000 KM GT OIL LENGKAP + FILTER (TMO FULL)',
    sa: 'WAYAN',
    fo: 'Muhammad',
    teknisi: 'Richard Ts',
    km_service: 100000,
    tanggal_rtj: '2026-08-19',
    batas_periode_rtj: '2026-08-26',
    status_rtj: 'Pending',
    detail_kendala: 'KELUHAN: UNTUK KARET WIPER',
    keterangan: 'BELUM ADA WAKTU',
    created_at: '2026-08-15T13:00:00.000Z',
    updated_at: '2026-08-19T15:00:00.000Z'
  },
  {
    id: 'rtj-13',
    no_urut: 13,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-18',
    no_wo: 'WO/2026/08/013',
    no_polisi: 'DA1617CU',
    nama_customer: 'M SULAIMAN ,SE',
    no_hp: '',
    model: 'RUSH NEW',
    service: 'SBE 80.000 KM GT OIL MESIN + FILTER + GARDAN',
    sa: 'WAYAN',
    fo: 'Sapruddin',
    teknisi: 'DAVA',
    km_service: 80000,
    tanggal_rtj: '2026-08-20',
    batas_periode_rtj: '2026-08-27',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: AFTER SERVICE',
    keterangan: 'BOOKING 27 AGUSTUS',
    created_at: '2026-08-18T10:00:00.000Z',
    updated_at: '2026-08-20T11:00:00.000Z'
  },
  {
    id: 'rtj-14',
    no_urut: 14,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-19',
    no_wo: 'WO/2026/08/014',
    no_polisi: 'DA1520JX',
    nama_customer: 'TREES MELIYAWATI',
    no_hp: '082354188814',
    model: 'NEW AGYA',
    service: 'SBE 60.000 KM T-CARE LITE+ (IBU HANA) GANTI OLI MESIN + F OLI (TMO LITE 3.5L) RESET NOTIF SERVICE HEAD UNIT',
    sa: 'RONY',
    fo: 'Sapruddin',
    teknisi: 'DAVA',
    km_service: 60000,
    tanggal_rtj: '2026-08-21',
    batas_periode_rtj: '2026-08-28',
    status_rtj: 'Pending',
    detail_kendala: 'KELUHAN: AFTER SERVICE NOTIF',
    keterangan: 'BELUM TERKONFIRMASI',
    created_at: '2026-08-19T14:00:00.000Z',
    updated_at: '2026-08-21T10:00:00.000Z'
  },
  {
    id: 'rtj-15',
    no_urut: 15,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-19',
    no_wo: 'WO/2026/08/015',
    no_polisi: 'DA1187LS',
    nama_customer: 'ARKANI',
    no_hp: '',
    model: 'RUSH NEW',
    service: 'SBE 30.000 KM TCARE GT OLI M/F (TMO 10W30) ANALISA KELUHAN..... - CENTRAL LOCK',
    sa: 'SUGIANTO',
    fo: 'Sapruddin',
    teknisi: 'AWALUDIN',
    km_service: 30000,
    tanggal_rtj: '2026-08-21',
    batas_periode_rtj: '2026-08-28',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: AFTER SERVICE',
    keterangan: 'BOOKING DI PLH 24 AGUSTUS',
    created_at: '2026-08-19T15:00:00.000Z',
    updated_at: '2026-08-21T12:00:00.000Z'
  },
  {
    id: 'rtj-16',
    no_urut: 16,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-20',
    no_wo: 'WO/2026/08/016',
    no_polisi: 'B1726YN',
    nama_customer: 'WILDANI NUGRAHA',
    no_hp: '',
    model: 'ALPHARD NON TAM',
    service: 'DISFUNGSI, ...INDIKATOR ENGINE MENYALA',
    sa: 'SUGIANTO',
    fo: 'Muhammad',
    teknisi: 'Budi Hariyanto',
    km_service: 85000,
    tanggal_rtj: '2026-08-21',
    batas_periode_rtj: '2026-08-28',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: UNTUK BAGIAN SENSOR',
    keterangan: 'BOOKING 21 AGUSTUS',
    created_at: '2026-08-20T08:30:00.000Z',
    updated_at: '2026-08-21T09:00:00.000Z'
  },
  {
    id: 'rtj-17',
    no_urut: 17,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-22',
    no_wo: 'WO/2026/08/017',
    no_polisi: 'B1144KOJ',
    nama_customer: 'LEONARDO DAVID YULIANDY JOHANNES',
    no_hp: '',
    model: 'AVANZA VVTI',
    service: 'CEK KAKI KAKI SAAT AWAL HIDUP PAGI AC DI ON AD BUNYI SEK SEK CHIIIT BALANCE SPOORING',
    sa: 'FAJAR',
    fo: 'Muhammad',
    teknisi: 'Syarif Hidayat',
    km_service: 95000,
    tanggal_rtj: '2026-08-27',
    batas_periode_rtj: '2026-09-03',
    status_rtj: 'Pending',
    detail_kendala: 'KELUHAN: BUNYI MUNCUL DI PAGI HARI',
    keterangan: 'BELUM TERKONFIRMASI',
    created_at: '2026-08-22T10:00:00.000Z',
    updated_at: '2026-08-27T10:00:00.000Z'
  },
  {
    id: 'rtj-18',
    no_urut: 18,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-22',
    no_wo: 'WO/2026/08/018',
    no_polisi: 'B1050DKS',
    nama_customer: 'MUHAMMAD SYAIFU YOSREZA',
    no_hp: '',
    model: 'RUSH NEW',
    service: 'SBE 70.000KM GT OIL MESIN + FILTER (TMO SEMI)',
    sa: 'WAYAN',
    fo: 'Muhammad',
    teknisi: 'FIRMAN A',
    km_service: 70000,
    tanggal_rtj: '2026-08-27',
    batas_periode_rtj: '2026-09-03',
    status_rtj: 'Pending',
    detail_kendala: 'KELUHAN: AFTER SERVICE',
    keterangan: 'BELUM TERKONFIRMASI',
    created_at: '2026-08-22T11:30:00.000Z',
    updated_at: '2026-08-27T11:00:00.000Z'
  },
  {
    id: 'rtj-19',
    no_urut: 19,
    kategori_q: 'Q4',
    tanggal_service: '2026-08-04',
    no_wo: 'WO/2026/08/019',
    no_polisi: 'DA1514GK',
    nama_customer: 'TRI WAHYUDI',
    no_hp: '',
    model: 'AVANZA NEW',
    service: 'SBE 100.000 KM (CP) OLI MESIN TMO 10W-30 + FILTER OLI + SBE 180.000 KM',
    sa: 'SP BATUBARA',
    fo: 'Joko prasetyo',
    teknisi: 'M Zeinel F',
    km_service: 100000,
    tanggal_rtj: '2026-08-07',
    batas_periode_rtj: '2026-08-14',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN UNTUK KANTOR',
    keterangan: 'KELUHAN FASILITAS',
    created_at: '2026-08-04T13:00:00.000Z',
    updated_at: '2026-08-07T16:00:00.000Z'
  },
  {
    id: 'rtj-20',
    no_urut: 20,
    kategori_q: 'Q5',
    tanggal_service: '2026-08-08',
    no_wo: 'WO/2026/08/020',
    no_polisi: 'DA1360AW',
    nama_customer: 'TRI SETIAWAN',
    no_hp: '',
    model: 'RUSH',
    service: 'GT OLI M/F + FLUSH ( TMO 10W30) SBE 70.000 KM',
    sa: 'SUGIANTO',
    fo: 'Sapruddin',
    teknisi: 'AWALUDIN',
    km_service: 70000,
    tanggal_rtj: '2026-08-12',
    batas_periode_rtj: '2026-08-19',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: BAGIAN ATAS',
    keterangan: 'KELUHAN KEBERSIHAN',
    created_at: '2026-08-08T10:00:00.000Z',
    updated_at: '2026-08-12T14:00:00.000Z'
  },
  {
    id: 'rtj-21',
    no_urut: 21,
    kategori_q: 'Q4',
    tanggal_service: '2026-08-11',
    no_wo: 'WO/2026/08/021',
    no_polisi: 'KH1266BK',
    nama_customer: 'MARSENI',
    no_hp: '',
    model: 'NEW VELOZ',
    service: 'GT OIL MESIN + FILTER (TMO FULL SYN 5W30) ADA BUNYI DECIT SAAT MUNDUR',
    sa: 'WAYAN',
    fo: 'Sapruddin',
    teknisi: 'AWALUDIN',
    km_service: 40000,
    tanggal_rtj: '2026-08-14',
    batas_periode_rtj: '2026-08-21',
    status_rtj: 'Completed',
    detail_kendala: 'SARAN: TIM BOOKING SERVICE',
    keterangan: 'KELUHAN LAYANAN',
    created_at: '2026-08-11T14:00:00.000Z',
    updated_at: '2026-08-14T16:00:00.000Z'
  },
  {
    id: 'rtj-22',
    no_urut: 22,
    kategori_q: 'Q3',
    tanggal_service: '2026-08-15',
    no_wo: 'WO/2026/08/022',
    no_polisi: 'DA1789TK',
    nama_customer: 'SAPTIADI',
    no_hp: '',
    model: 'AVANZA VVTI',
    service: 'SBE 130.000 KM GT OLI MESIN+FILTER (TMO)',
    sa: 'RUDI',
    fo: 'Muhammad',
    teknisi: 'FIRMAN A',
    km_service: 130000,
    tanggal_rtj: '2026-08-19',
    batas_periode_rtj: '2026-08-26',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: ADA KETERLAMBATAN',
    keterangan: 'KELUHAN KETERLAMBATAN',
    created_at: '2026-08-15T09:00:00.000Z',
    updated_at: '2026-08-19T10:00:00.000Z'
  },
  {
    id: 'rtj-23',
    no_urut: 23,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-20',
    no_wo: 'WO/2026/08/023',
    no_polisi: 'DA1111YSA',
    nama_customer: 'ENDAH PRIHATIN',
    no_hp: '',
    model: 'INNOVA ZENIX',
    service: 'SERVICE BERKALA 20.000 KM GANTI OLI M/F (TMO)',
    sa: 'FAJAR',
    fo: 'Muhammad',
    teknisi: '-',
    km_service: 20000,
    tanggal_rtj: '2026-08-24',
    batas_periode_rtj: '2026-08-31',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: TARIKAN MESIN SEDIKIT BERAT',
    keterangan: 'BOOKING 2 SEPTEMBER',
    created_at: '2026-08-20T10:00:00.000Z',
    updated_at: '2026-08-24T11:00:00.000Z'
  },
  {
    id: 'rtj-24',
    no_urut: 24,
    kategori_q: 'Q4',
    tanggal_service: '2026-08-22',
    no_wo: 'WO/2026/08/024',
    no_polisi: 'DA1121HP',
    nama_customer: 'ALUS SALIM',
    no_hp: '',
    model: 'RAIZE',
    service: 'SBE 60.000KM T-CARE GT OLI M/F (TMO 5W30)',
    sa: 'SUGIANTO',
    fo: 'Sapruddin',
    teknisi: 'DAVA',
    km_service: 60000,
    tanggal_rtj: '2026-08-28',
    batas_periode_rtj: '2026-09-04',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: TERJADI MISSKOMUNIKASI',
    keterangan: 'KELUHAN: KURANG PUAS',
    created_at: '2026-08-22T13:00:00.000Z',
    updated_at: '2026-08-28T10:00:00.000Z'
  },
  {
    id: 'rtj-25',
    no_urut: 26,
    kategori_q: 'Q1',
    tanggal_service: '2026-08-27',
    no_wo: 'WO/2026/08/026',
    no_polisi: 'L1833PI',
    nama_customer: 'CARINA ZIVA NYOSAPUTRA',
    no_hp: '',
    model: 'AGYA',
    service: 'SBE 110.000 KM GT OLI M/F (TMO 10W30) CHEK UNDER BODY..... CHEK DRIVE SHAFT',
    sa: 'SUGIANTO',
    fo: 'Muhammad',
    teknisi: 'Ramana',
    km_service: 110000,
    tanggal_rtj: '2026-08-31',
    batas_periode_rtj: '2026-09-07',
    status_rtj: 'Completed',
    detail_kendala: 'KELUHAN: SETIAP PENGECEKAN TELITI',
    keterangan: 'BOOKING TANGGAL 31',
    created_at: '2026-08-27T10:00:00.000Z',
    updated_at: '2026-08-31T11:00:00.000Z'
  }
];

const initialHistory = [
  {
    id: 'h-1',
    rtj_id: 'rtj-1',
    status_lama: 'Scheduled',
    status_baru: 'Completed',
    keterangan: 'Customer sudah booking service 06 Agustus.',
    updated_by_id: 'u-2',
    updated_by_name: 'Debby',
    created_at: '2026-08-04T10:00:00.000Z'
  },
  {
    id: 'h-2',
    rtj_id: 'rtj-4',
    status_lama: 'Scheduled',
    status_baru: 'Pending',
    keterangan: 'Belum terkonfirmasi oleh customer.',
    updated_by_id: 'u-2',
    updated_by_name: 'Debby',
    created_at: '2026-08-07T14:20:00.000Z'
  }
];

// Helper to load store
function loadStore() {
  if (!fs.existsSync(STORE_PATH)) {
    const defaultData = {
      users: initialUsers,
      rtj: initialRTJ,
      history: initialHistory,
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    
    let updated = false;

    // Ensure required accounts exist
    const hendri = parsed.users?.find(u => u.username.toUpperCase() === 'HENDRI');
    if (!hendri) {
      parsed.users.push(initialUsers[0]);
      updated = true;
    } else if (!bcrypt.compareSync('BISMILLAH', hendri.password_hash)) {
      hendri.password_hash = bcrypt.hashSync('BISMILLAH', 10);
      updated = true;
    }

    const debby = parsed.users?.find(u => u.username.toUpperCase() === 'DEBBY');
    if (!debby) {
      parsed.users.push(initialUsers[1]);
      updated = true;
    } else if (!bcrypt.compareSync('1', debby.password_hash)) {
      debby.password_hash = bcrypt.hashSync('1', 10);
      updated = true;
    }

    // Seed initial RTJ data hanya jika store belum pernah diinisialisasi
    // Flag 'rtj_initialized' mencegah data dimuat ulang setelah user menghapus semua
    if (!parsed.rtj_initialized) {
      parsed.rtj = parsed.rtj || initialRTJ;
      parsed.history = parsed.history || initialHistory;
      parsed.rtj_initialized = true;
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (err) {
    console.error('[Store] Corrupt store file, re-initializing...', err);
    const defaultData = {
      users: initialUsers,
      rtj: initialRTJ,
      history: initialHistory,
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
}

// Helper to save store
function saveStore(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  isSupabase: Boolean(supabase),
  supabaseClient: supabase,

  // User methods
  async findUserByUsername(username) {
    const cleanUsername = username ? username.trim().toUpperCase() : '';
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', cleanUsername)
        .maybeSingle();
      if (!error && data) return data;
    }
    const store = loadStore();
    return store.users.find(u => u.username.toUpperCase() === cleanUsername) || null;
  },

  async findUserById(id) {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return data;
    }
    const store = loadStore();
    return store.users.find(u => u.id === id) || null;
  },

  async getAllUsers() {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('id, username, nama, role, created_at');
      if (!error && data) return data;
    }
    const store = loadStore();
    return store.users.map(({ password_hash, ...rest }) => rest);
  },

  async createUser(userData) {
    const newUser = {
      id: uuidv4(),
      username: userData.username.trim().toUpperCase(),
      password_hash: bcrypt.hashSync(userData.password, 10),
      nama: userData.nama,
      role: userData.role || 'FO',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('users').insert([newUser]).select().single();
      if (!error && data) return data;
    }

    const store = loadStore();
    store.users.push(newUser);
    saveStore(store);
    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  },

  async updateUser(id, updateData) {
    const store = loadStore();
    const index = store.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    if (updateData.nama) store.users[index].nama = updateData.nama;
    if (updateData.role) store.users[index].role = updateData.role;
    if (updateData.password) {
      store.users[index].password_hash = bcrypt.hashSync(updateData.password, 10);
    }
    store.users[index].updated_at = new Date().toISOString();
    saveStore(store);

    if (supabase) {
      const updatePayload = { ...updateData };
      if (updatePayload.password) {
        updatePayload.password_hash = bcrypt.hashSync(updatePayload.password, 10);
        delete updatePayload.password;
      }
      await supabase.from('users').update(updatePayload).eq('id', id);
    }

    const { password_hash, ...safeUser } = store.users[index];
    return safeUser;
  },

  async deleteUser(id) {
    const store = loadStore();
    const beforeCount = store.users.length;
    store.users = store.users.filter(u => u.id !== id);
    saveStore(store);

    if (supabase) {
      await supabase.from('users').delete().eq('id', id);
    }
    return store.users.length < beforeCount;
  },

  // RTJ methods
  async getRTJList({ sa, fo, status, kategori_q, search, periode_mulai, periode_selesai, page = 1, limit = 10, sort_by = 'tanggal_service', sort_order = 'desc' }) {
    if (supabase) {
      try {
        let query = supabase.from('rtj').select('*', { count: 'exact' });

        if (sa && sa !== 'ALL') query = query.ilike('sa', sa);
        if (fo && fo !== 'ALL') query = query.ilike('fo', fo);
        if (status && status !== 'ALL') query = query.eq('status_rtj', status);
        if (kategori_q && kategori_q !== 'ALL') query = query.eq('kategori_q', kategori_q.toUpperCase());
        if (periode_mulai) query = query.gte('tanggal_service', periode_mulai);
        if (periode_selesai) query = query.lte('tanggal_service', periode_selesai);

        if (search) {
          const s = search.trim();
          query = query.or(`nama_customer.ilike.%${s}%,no_polisi.ilike.%${s}%,no_wo.ilike.%${s}%,model.ilike.%${s}%,teknisi.ilike.%${s}%,service.ilike.%${s}%,detail_kendala.ilike.%${s}%,keterangan.ilike.%${s}%`);
        }

        const validSortCols = ['tanggal_service', 'no_urut', 'status_rtj', 'kategori_q', 'nama_customer', 'no_polisi', 'tanggal_rtj', 'created_at'];
        const sortCol = validSortCols.includes(sort_by) ? sort_by : 'tanggal_service';
        query = query.order(sortCol, { ascending: sort_order === 'asc' });

        const p = Math.max(1, Number(page) || 1);
        const l = Math.max(1, Number(limit) || 10);
        const offset = (p - 1) * l;
        query = query.range(offset, offset + l - 1);

        const { data, count, error } = await query;
        if (!error && data) {
          return {
            data,
            pagination: {
              page: p,
              limit: l,
              total: count ?? data.length,
              totalPages: Math.ceil((count ?? data.length) / l) || 1
            }
          };
        }
      } catch (err) {
        console.warn('Supabase getRTJList error, falling back to local cache:', err.message);
      }
    }

    const store = loadStore();
    let records = [...store.rtj];

    // Filter SA
    if (sa && sa !== 'ALL') {
      records = records.filter(r => r.sa && r.sa.toLowerCase() === sa.toLowerCase());
    }

    // Filter FO
    if (fo && fo !== 'ALL') {
      records = records.filter(r => r.fo && r.fo.toLowerCase() === fo.toLowerCase());
    }

    // Filter Status
    if (status && status !== 'ALL') {
      records = records.filter(r => r.status_rtj && r.status_rtj.toLowerCase() === status.toLowerCase());
    }

    // Filter Kategori Q
    if (kategori_q && kategori_q !== 'ALL') {
      records = records.filter(r => r.kategori_q && r.kategori_q.toUpperCase() === kategori_q.toUpperCase());
    }

    // Search query
    if (search) {
      const q = search.toLowerCase().trim();
      records = records.filter(r => 
        (r.nama_customer && r.nama_customer.toLowerCase().includes(q)) ||
        (r.no_polisi && r.no_polisi.toLowerCase().includes(q)) ||
        (r.no_wo && r.no_wo.toLowerCase().includes(q)) ||
        (r.model && r.model.toLowerCase().includes(q)) ||
        (r.teknisi && r.teknisi.toLowerCase().includes(q)) ||
        (r.service && r.service.toLowerCase().includes(q)) ||
        (r.detail_kendala && r.detail_kendala.toLowerCase().includes(q)) ||
        (r.keterangan && r.keterangan.toLowerCase().includes(q))
      );
    }

    // Periode Filter
    if (periode_mulai) {
      records = records.filter(r => r.tanggal_service >= periode_mulai);
    }
    if (periode_selesai) {
      records = records.filter(r => r.tanggal_service <= periode_selesai);
    }

    // Sorting
    records.sort((a, b) => {
      let valA = a[sort_by] ?? '';
      let valB = b[sort_by] ?? '';
      if (typeof valA === 'string') {
        return sort_order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sort_order === 'asc' ? valA - valB : valB - valA;
    });

    const total = records.length;
    const offset = (Number(page) - 1) * Number(limit);
    const paginated = records.slice(offset, offset + Number(limit));

    return {
      data: paginated,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    };
  },

  async getRTJById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('rtj').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          const { data: history } = await supabase.from('rtj_status_history').select('*').eq('rtj_id', id).order('created_at', { ascending: false });
          return { ...data, history: history || [] };
        }
      } catch (err) {
        console.warn('Supabase getRTJById error:', err.message);
      }
    }

    const store = loadStore();
    const rtj = store.rtj.find(r => r.id === id);
    if (!rtj) return null;

    const history = store.history
      .filter(h => h.rtj_id === id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { ...rtj, history };
  },

  async createRTJ(data, user) {
    const store = loadStore();
    const newId = uuidv4();
    const newNo = (store.rtj.length > 0 ? Math.max(...store.rtj.map(r => r.no_urut || 0)) : 0) + 1;

    const newRTJ = {
      id: newId,
      no_urut: newNo,
      kategori_q: data.kategori_q || 'Q1',
      tanggal_service: data.tanggal_service,
      no_wo: data.no_wo || `WO/${new Date().getFullYear()}/${String(newNo).padStart(5, '0')}`,
      no_polisi: (data.no_polisi || '').toUpperCase().trim(),
      nama_customer: (data.nama_customer || '').trim(),
      no_hp: data.no_hp || '',
      model: data.model || data.unit || 'Toyota',
      service: data.service || '',
      sa: data.sa || 'Service Advisor',
      fo: data.fo || 'Front Officer',
      teknisi: data.teknisi || '-',
      km_service: Number(data.km_service) || 0,
      tanggal_rtj: data.tanggal_rtj || data.tanggal_service,
      batas_periode_rtj: data.batas_periode_rtj || null,
      status_rtj: data.status_rtj || 'Scheduled',
      detail_kendala: data.detail_kendala || '',
      keterangan: data.keterangan || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.rtj.unshift(newRTJ);

    store.history.push({
      id: uuidv4(),
      rtj_id: newId,
      status_lama: null,
      status_baru: newRTJ.status_rtj,
      keterangan: 'Data RTJ dibuat pertama kali',
      updated_by_id: user?.id || null,
      updated_by_name: user?.nama || 'System',
      created_at: new Date().toISOString()
    });

    saveStore(store);

    if (supabase) {
      try {
        await supabase.from('rtj').insert([newRTJ]);
      } catch (err) {
        console.warn('Supabase sync insert failed:', err.message);
      }
    }

    return newRTJ;
  },

  async updateRTJ(id, data, user) {
    const store = loadStore();
    const index = store.rtj.findIndex(r => r.id === id);
    if (index === -1) return null;

    const oldRecord = { ...store.rtj[index] };
    const oldStatus = oldRecord.status_rtj;
    const newStatus = data.status_rtj || oldStatus;

    const updatedRTJ = {
      ...oldRecord,
      ...data,
      id: oldRecord.id,
      no_urut: oldRecord.no_urut,
      no_polisi: data.no_polisi ? data.no_polisi.toUpperCase().trim() : oldRecord.no_polisi,
      model: data.model || data.unit || oldRecord.model,
      updated_at: new Date().toISOString()
    };

    store.rtj[index] = updatedRTJ;

    if (oldStatus !== newStatus || data.catatan_perubahan) {
      store.history.push({
        id: uuidv4(),
        rtj_id: id,
        status_lama: oldStatus,
        status_baru: newStatus,
        keterangan: data.catatan_perubahan || data.keterangan || `Status diubah dari ${oldStatus} menjadi ${newStatus}`,
        updated_by_id: user?.id || null,
        updated_by_name: user?.nama || 'System',
        created_at: new Date().toISOString()
      });
    }

    saveStore(store);

    if (supabase) {
      try {
        await supabase.from('rtj').update(updatedRTJ).eq('id', id);
      } catch (err) {
        console.warn('Supabase sync update failed:', err.message);
      }
    }

    return updatedRTJ;
  },

  async deleteRTJ(id) {
    const store = loadStore();
    const beforeCount = store.rtj.length;
    store.rtj = store.rtj.filter(r => r.id !== id);
    store.history = store.history.filter(h => h.rtj_id !== id);
    saveStore(store);

    if (supabase) {
      try {
        await supabase.from('rtj').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase sync delete failed:', err.message);
      }
    }

    return store.rtj.length < beforeCount;
  },

  async deleteAllRTJ() {
    const store = loadStore();
    const deletedCount = store.rtj.length;
    store.rtj = [];
    store.history = [];
    saveStore(store);

    if (supabase) {
      try {
        await supabase.from('history').delete().neq('id', '');
        await supabase.from('rtj').delete().neq('id', '');
      } catch (err) {
        console.warn('Supabase sync deleteAll failed:', err.message);
      }
    }

    return deletedCount;
  },

  async bulkCreateRTJ(recordsList, user) {
    const store = loadStore();
    let highestNo = store.rtj.length > 0 ? Math.max(...store.rtj.map(r => r.no_urut || 0)) : 0;
    const createdItems = [];

    for (const item of recordsList) {
      highestNo += 1;
      const newId = uuidv4();
      const record = {
        id: newId,
        no_urut: item.no_urut || highestNo,
        kategori_q: item.kategori_q || 'Q1',
        tanggal_service: item.tanggal_service,
        no_wo: item.no_wo || `WO/${new Date().getFullYear()}/${String(highestNo).padStart(5, '0')}`,
        no_polisi: (item.no_polisi || '').toUpperCase().trim(),
        nama_customer: (item.nama_customer || '').trim(),
        no_hp: item.no_hp || '',
        model: item.model || item.unit || 'Toyota',
        service: item.service || '',
        sa: item.sa || 'Service Advisor',
        fo: item.fo || 'Front Officer',
        teknisi: item.teknisi || '-',
        km_service: Number(item.km_service) || 0,
        tanggal_rtj: item.tanggal_rtj || item.tanggal_service,
        batas_periode_rtj: item.batas_periode_rtj || null,
        status_rtj: item.status_rtj || 'Scheduled',
        detail_kendala: item.detail_kendala || '',
        keterangan: item.keterangan || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      store.rtj.unshift(record);
      store.history.push({
        id: uuidv4(),
        rtj_id: newId,
        status_lama: null,
        status_baru: record.status_rtj,
        keterangan: 'Diimpor dari file Excel',
        updated_by_id: user?.id || null,
        updated_by_name: user?.nama || 'System (Excel Import)',
        created_at: new Date().toISOString()
      });

      createdItems.push(record);
    }

    saveStore(store);

    if (supabase) {
      try {
        await supabase.from('rtj').insert(createdItems);
      } catch (err) {
        console.warn('Supabase bulk insert failed:', err.message);
      }
    }

    return createdItems;
  },

  async getDashboardSummary({ sa, fo, status, periode_mulai, periode_selesai }) {
    const store = loadStore();
    let records = [...store.rtj];

    if (sa && sa !== 'ALL') records = records.filter(r => r.sa && r.sa.toLowerCase() === sa.toLowerCase());
    if (fo && fo !== 'ALL') records = records.filter(r => r.fo && r.fo.toLowerCase() === fo.toLowerCase());
    if (status && status !== 'ALL') records = records.filter(r => r.status_rtj && r.status_rtj.toLowerCase() === status.toLowerCase());
    if (periode_mulai) records = records.filter(r => r.tanggal_service >= periode_mulai);
    if (periode_selesai) records = records.filter(r => r.tanggal_service <= periode_selesai);

    const total = records.length;
    const completed = records.filter(r => r.status_rtj === 'Completed').length;
    const scheduled = records.filter(r => r.status_rtj === 'Scheduled').length;
    const pending = records.filter(r => r.status_rtj === 'Pending').length;
    const rescheduled = records.filter(r => r.status_rtj === 'Rescheduled').length;

    const calcPct = (count) => total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;

    const qBreakdown = {
      Q1: { count: records.filter(r => r.kategori_q === 'Q1').length, desc: 'Reminder Service Berkala 1 Bulan / 1.000 KM' },
      Q2: { count: records.filter(r => r.kategori_q === 'Q2').length, desc: 'Reminder Service Berkala 6 Bulan / 10.000 KM' },
      Q3: { count: records.filter(r => r.kategori_q === 'Q3').length, desc: 'Follow-up Keluhan / Pekerjaan Lanjutan (Job Pending)' },
      Q4: { count: records.filter(r => r.kategori_q === 'Q4').length, desc: 'Reminder Service Berkala 12 Bulan / 20.000 KM +' },
      Q5: { count: records.filter(r => r.kategori_q === 'Q5').length, desc: 'Customer Inactive / Long Overdue Service Follow-up' },
      Q6: { count: records.filter(r => r.kategori_q === 'Q6').length, desc: 'Special Campaign / Booking Follow-up' }
    };

    // Baseline stats matching official Toyota Banjarmasin report (Gambar 1 & Gambar 2)
    const baselineDashboard = {
      target: {
        firRate: '98%',
        successCallRate: '100%'
      },
      aktual: {
        firRate: '100%',
        successCallRate: '85%'
      },
      overview: {
        periodTitle: 'JULI 2025',
        unitEntryTotal: 1493,
        dataTidakTerFollowUp: '#REF!',
        tidakTerkumpul: '#REF!',
        twc: '#REF!',
        wip: '#REF!',
        others: '#REF!',
        totalUnitFollowUp: 1465,
        totalTerhubung: 1252,
        totalTidakTerhubung: 184,
        fir: 1247,
        nonFir: 5,
        nonFirBreakdown: {
          Q1: 4,
          Q2: 0,
          Q3: 1,
          Q4: 0,
          Q5: 0,
          Q6: 0
        },
        tidakTerhubungBreakdown: {
          tidakDiangkat: 171,
          tidakValid: 3,
          tidakAdaNada: 0,
          noTidakTerpasang: 0,
          noSalahSambung: 0,
          noTidakAktif: 10
        }
      },
      scrComposition: [
        { name: 'BANJARMASIN', firRate: '100%', komposisiScr: '45%', komposisiNoScr: '13%' },
        { name: 'SERVICE POINT', firRate: '100%', komposisiScr: '37%', komposisiNoScr: '8%' },
        { name: 'BKT 1, 2 & 3', firRate: '100%', komposisiScr: '3%', komposisiNoScr: '2%' }
      ],
      kpiTable: [
        { kpi: 'Total Unit Entry', bjm: 809, sp: 637, bkt: 47, total: 1493 },
        { kpi: 'Jumlah Unit Yang Harus di FU', bjm: 783, sp: 635, bkt: 47, total: 1465 },
        { kpi: 'Jumlah Unit Yang Berhasil di Hubungi', bjm: 666, sp: 540, bkt: 46, total: 1252 },
        { kpi: 'Jumlah Pelanggan Puas', bjm: 662, sp: 539, bkt: 46, total: 1247 },
        { kpi: 'Jawaban TIDAK Untuk Q1', bjm: 3, sp: 1, bkt: 0, total: 4, isNegative: true },
        { kpi: 'Jawaban TIDAK Untuk Q2', bjm: 0, sp: 0, bkt: 0, total: 0, isNegative: true },
        { kpi: 'Jawaban TIDAK Untuk Q3', bjm: 1, sp: 0, bkt: 0, total: 1, isNegative: true },
        { kpi: 'Jawaban TIDAK Untuk Q4', bjm: 0, sp: 0, bkt: 0, total: 0, isNegative: true },
        { kpi: 'Jawaban TIDAK Untuk Q5', bjm: 0, sp: 0, bkt: 0, total: 0, isNegative: true },
        { kpi: 'Jawaban TIDAK Untuk Q6', bjm: 0, sp: 0, bkt: 0, total: 0, isNegative: true },
        { kpi: 'TIDAK TERHUBUNG', bjm: 184, sp: 118, bkt: 25, total: 327 },
        { kpi: 'FIR Rate', bjm: '99%', sp: '100%', bkt: '100%', total: '99.6%', isRate: true },
        { kpi: 'Success Call Rate', bjm: '85%', sp: '85%', bkt: '100%', total: '85.5%', isRate: true }
      ]
    };

    return {
      total,
      completed: { count: completed, percentage: calcPct(completed) },
      scheduled: { count: scheduled, percentage: calcPct(scheduled) },
      pending: { count: pending, percentage: calcPct(pending) },
      rescheduled: { count: rescheduled, percentage: calcPct(rescheduled) },
      qBreakdown,
      baselineDashboard,
      latestRTJ: records.slice(0, 5)
    };
  },

  async getDashboardCharts({ sa, fo, periode_mulai, periode_selesai }) {
    const store = loadStore();
    let records = [...store.rtj];

    if (sa && sa !== 'ALL') records = records.filter(r => r.sa && r.sa.toLowerCase() === sa.toLowerCase());
    if (fo && fo !== 'ALL') records = records.filter(r => r.fo && r.fo.toLowerCase() === fo.toLowerCase());
    if (periode_mulai) records = records.filter(r => r.tanggal_service >= periode_mulai);
    if (periode_selesai) records = records.filter(r => r.tanggal_service <= periode_selesai);

    const statusCounts = {
      Completed: records.filter(r => r.status_rtj === 'Completed').length,
      Scheduled: records.filter(r => r.status_rtj === 'Scheduled').length,
      Pending: records.filter(r => r.status_rtj === 'Pending').length,
      Rescheduled: records.filter(r => r.status_rtj === 'Rescheduled').length,
    };

    const donutData = [
      { name: 'Completed', value: statusCounts.Completed, color: '#10B981' },
      { name: 'Scheduled', value: statusCounts.Scheduled, color: '#3B82F6' },
      { name: 'Pending', value: statusCounts.Pending, color: '#F59E0B' },
      { name: 'Rescheduled', value: statusCounts.Rescheduled, color: '#EF4444' },
    ];

    const saMap = {};
    for (const r of records) {
      const saName = r.sa || 'Unassigned';
      if (!saMap[saName]) {
        saMap[saName] = { sa: saName, Completed: 0, Scheduled: 0, Pending: 0, Rescheduled: 0, total: 0 };
      }
      if (saMap[saName][r.status_rtj] !== undefined) {
        saMap[saName][r.status_rtj] += 1;
      }
      saMap[saName].total += 1;
    }

    const saData = Object.values(saMap).sort((a, b) => b.total - a.total);

    const allSAs = [...new Set(store.rtj.map(r => r.sa).filter(Boolean))].sort();
    const allFOs = [...new Set(store.rtj.map(r => r.fo).filter(Boolean))].sort();

    // Baseline Branch Matrix Data matching Image 2
    const branchColumns = [
      { key: 'bjm_all', label: 'BJM ALL', isTotal: true },
      { key: 'bjm_saja', label: 'BJM SAJA' },
      { key: 'sp_km2', label: 'SP KM2' },
      { key: 'sp_plh', label: 'SP PLH' },
      { key: 'sp_btl', label: 'SP BTL' },
      { key: 'sp_ktb', label: 'SP KTB' },
      { key: 'sp_mrb', label: 'SP MRB' },
      { key: 'bkt_1', label: 'BKT 1' },
      { key: 'bkt_2', label: 'BKT 2' },
      { key: 'bkt_3', label: 'BKT 3' },
      { key: 'bkt_4', label: 'BKT 4' },
      { key: 'bkt_5', label: 'BKT 5' },
      { key: 'bkt_6', label: 'BKT 6' }
    ];

    const branchMatrixRows = [
      {
        id: 'unit_entry',
        label: 'UNIT ENTRY',
        type: 'blue_primary',
        values: {
          bjm_all: 1493, bjm_saja: 809, sp_km2: 107, sp_plh: 109, sp_btl: 290, sp_ktb: 92, sp_mrb: 39,
          bkt_1: 0, bkt_2: 1, bkt_3: 46, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'unit_follow_up',
        label: 'Unit Follow Up',
        type: 'soft_blue',
        values: {
          bjm_all: 1465, bjm_saja: 783, sp_km2: 106, sp_plh: 109, sp_btl: 289, sp_ktb: 92, sp_mrb: 39,
          bkt_1: 0, bkt_2: 1, bkt_3: 46, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'unit_sudah_call',
        label: 'Unit sudah di CALL',
        type: 'soft_blue',
        values: {
          bjm_all: 1443, bjm_saja: 772, sp_km2: 102, sp_plh: 106, sp_btl: 286, sp_ktb: 91, sp_mrb: 39,
          bkt_1: 0, bkt_2: 1, bkt_3: 46, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'unit_belum_call',
        label: 'Unit belum di CALL',
        type: 'soft_red',
        values: {
          bjm_all: 22, bjm_saja: 11, sp_km2: 4, sp_plh: 3, sp_btl: 3, sp_ktb: 1, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'fir',
        label: 'FIR',
        type: 'neutral',
        values: {
          bjm_all: 1247, bjm_saja: 662, sp_km2: 84, sp_plh: 95, sp_btl: 245, sp_ktb: 78, sp_mrb: 37,
          bkt_1: 0, bkt_2: 1, bkt_3: 45, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'non_fir_q1',
        label: 'NON-FIR ( Q1 )',
        type: 'red_danger',
        values: {
          bjm_all: 4, bjm_saja: 3, sp_km2: 0, sp_plh: 0, sp_btl: 0, sp_ktb: 1, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'non_fir_q2',
        label: 'NON-FIR ( Q2 )',
        type: 'red_danger',
        values: {
          bjm_all: 0, bjm_saja: 0, sp_km2: 0, sp_plh: 0, sp_btl: 0, sp_ktb: 0, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'non_fir_q3',
        label: 'NON-FIR ( Q3 )',
        type: 'red_danger',
        values: {
          bjm_all: 1, bjm_saja: 1, sp_km2: 0, sp_plh: 0, sp_btl: 0, sp_ktb: 0, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'non_fir_q4',
        label: 'NON-FIR ( Q4 )',
        type: 'red_danger',
        values: {
          bjm_all: 0, bjm_saja: 0, sp_km2: 0, sp_plh: 0, sp_btl: 0, sp_ktb: 0, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'non_fir_q5',
        label: 'NON-FIR ( Q5 )',
        type: 'red_danger',
        values: {
          bjm_all: 0, bjm_saja: 0, sp_km2: 0, sp_plh: 0, sp_btl: 0, sp_ktb: 0, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'non_fir_q6',
        label: 'NON-FIR ( Q6 )',
        type: 'red_danger',
        values: {
          bjm_all: 0, bjm_saja: 0, sp_km2: 0, sp_plh: 0, sp_btl: 0, sp_ktb: 0, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'td',
        label: 'Tidak diangkat(TD)',
        type: 'yellow_warning',
        values: {
          bjm_all: 171, bjm_saja: 89, sp_km2: 20, sp_plh: 8, sp_btl: 41, sp_ktb: 10, sp_mrb: 2,
          bkt_1: 0, bkt_2: 0, bkt_3: 1, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'tv',
        label: 'Tidak valid(TV)',
        type: 'yellow_warning',
        values: {
          bjm_all: 3, bjm_saja: 2, sp_km2: 0, sp_plh: 0, sp_btl: 0, sp_ktb: 1, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'tn',
        label: 'Tidak ada nada(TN)',
        type: 'yellow_warning',
        values: {
          bjm_all: 0, bjm_saja: 0, sp_km2: 0, sp_plh: 0, sp_btl: 0, sp_ktb: 0, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 't',
        label: 'No tidak terpasang(T)',
        type: 'yellow_warning',
        values: {
          bjm_all: 0, bjm_saja: 0, sp_km2: 0, sp_plh: 0, sp_btl: 0, sp_ktb: 0, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'ss',
        label: 'No salah sambung(SS)',
        type: 'yellow_warning',
        values: {
          bjm_all: 0, bjm_saja: 0, sp_km2: 0, sp_plh: 0, sp_btl: 0, sp_ktb: 0, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      },
      {
        id: 'ta',
        label: 'No tidak aktif(TA)',
        type: 'yellow_warning',
        values: {
          bjm_all: 10, bjm_saja: 4, sp_km2: 0, sp_plh: 4, sp_btl: 0, sp_ktb: 2, sp_mrb: 0,
          bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0, bkt_6: 0
        }
      }
    ];

    return {
      donutData,
      saData,
      branchColumns,
      branchMatrixRows,
      filterOptions: {
        saList: allSAs,
        foList: allFOs,
        kategoriList: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
        statusList: ['Scheduled', 'Completed', 'Pending', 'Rescheduled']
      }
    };
  }
};
