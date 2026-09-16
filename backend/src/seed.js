import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

console.log('====================================================');
console.log('RTJ Wira Toyota Banjarmasin - Supabase Sync Tool');
console.log('====================================================');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi di backend/.env!');
  console.log('\nSilakan lengkapi file backend/.env terlebih dahulu:');
  console.log('SUPABASE_URL=https://orinatpofladixrdrwcv.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=<service_role atau anon key dari Supabase dashboard>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log(`\n📡 Menghubungkan ke Supabase: ${supabaseUrl}`);

  // Test connection to users table
  const { data: testData, error: testErr } = await supabase.from('users').select('id').limit(1);
  if (testErr) {
    console.error('\n❌ TABEL BELUM DIBUAT DI SUPABASE:');
    console.error(`Pesan Error: ${testErr.message}`);
    console.log('\n💡 LANGKAH TERAKHIR:');
    console.log('1. Buka dashboard Supabase (https://supabase.com/dashboard/project/orinatpofladixrdrwcv)');
    console.log('2. Klik menu "SQL Editor" di bilah sisi kiri (ikon >_)');
    console.log('3. Klik "+ New query" dan salin seluruh isi file: backend/supabase_schema.sql');
    console.log('4. Klik tombol "Run" (atau Ctrl+Enter).');
    console.log('5. Setelah berhasil, jalankan kembali: npm run seed');
    process.exitCode = 1;
    return;
  }

  console.log('✅ Koneksi Supabase berhasil & tabel terverifikasi!');

  if (!fs.existsSync(STORE_PATH)) {
    console.log('ℹ️ File local store.json tidak ditemukan. Tidak ada data awal yang perlu disinkronkan.');
    return;
  }

  const rawData = fs.readFileSync(STORE_PATH, 'utf-8');
  const store = JSON.parse(rawData);

  // 1. Sync Users
  if (store.users && store.users.length > 0) {
    console.log(`\n🔄 Menyinkronkan ${store.users.length} data users ke Supabase...`);
    const { error: userErr } = await supabase.from('users').upsert(store.users, { onConflict: 'id' });
    if (userErr) {
      console.warn('⚠️ Gagal upsert users:', userErr.message);
    } else {
      console.log(`✅ Berhasil menyinkronkan ${store.users.length} users.`);
    }
  }

  // 2. Sync RTJ Records
  if (store.rtj && store.rtj.length > 0) {
    console.log(`\n🔄 Menyinkronkan ${store.rtj.length} data RTJ ke Supabase...`);
    // Filter clean payload to match schema
    const cleanRTJ = store.rtj.map(r => ({
      id: r.id,
      no_urut: r.no_urut,
      kategori_q: r.kategori_q || 'Q1',
      tanggal_service: r.tanggal_service,
      no_wo: r.no_wo || '',
      no_polisi: r.no_polisi || '',
      nama_customer: r.nama_customer || '',
      no_hp: r.no_hp || '',
      model: r.model || '',
      service: r.service || '',
      sa: r.sa || '',
      fo: r.fo || '',
      teknisi: r.teknisi || '',
      km_service: r.km_service || 0,
      tanggal_rtj: r.tanggal_rtj || r.tanggal_service,
      batas_periode_rtj: r.batas_periode_rtj || null,
      status_rtj: r.status_rtj || 'Scheduled',
      detail_kendala: r.detail_kendala || '',
      keterangan: r.keterangan || '',
      created_at: r.created_at || new Date().toISOString(),
      updated_at: r.updated_at || new Date().toISOString()
    }));

    // Batch upsert in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < cleanRTJ.length; i += chunkSize) {
      const chunk = cleanRTJ.slice(i, i + chunkSize);
      const { error: rtjErr } = await supabase.from('rtj').upsert(chunk, { onConflict: 'id' });
      if (rtjErr) {
        console.warn(`⚠️ Gagal upsert RTJ chunk ${i}-${i + chunk.length}:`, rtjErr.message);
      }
    }
    console.log(`✅ Berhasil menyinkronkan ${store.rtj.length} data RTJ ke Supabase.`);
  }

  // 3. Sync History
  if (store.history && store.history.length > 0) {
    console.log(`\n🔄 Menyinkronkan ${store.history.length} riwayat status ke Supabase...`);
    const cleanHistory = store.history.map(h => ({
      id: h.id,
      rtj_id: h.rtj_id,
      status_lama: h.status_lama || null,
      status_baru: h.status_baru,
      keterangan: h.keterangan || '',
      updated_by_id: h.updated_by_id || null,
      updated_by_name: h.updated_by_name || 'System',
      created_at: h.created_at || new Date().toISOString()
    }));

    const { error: histErr } = await supabase.from('rtj_status_history').upsert(cleanHistory, { onConflict: 'id' });
    if (histErr) {
      console.warn('⚠️ Gagal upsert history:', histErr.message);
    } else {
      console.log(`✅ Berhasil menyinkronkan riwayat status ke Supabase.`);
    }
  }

  console.log('\n🎉 SINKRONISASI SUPABASE SELESAI!');
  console.log('Semua data RTJ lokal sekarang sudah aktif dan tersimpan di Cloud Supabase.');
}

runMigration().catch(err => {
  console.error('Terjadi kesalahan:', err);
  process.exit(1);
});
