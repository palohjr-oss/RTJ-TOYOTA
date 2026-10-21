-- ==========================================================
-- SKRIP MIGRASI SUPABASE: UPDATE KATEGORI & 4 FIELD FOLLOW-UP
-- WIRA TOYOTA BANJARMASIN (RTJ WEB)
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- ==========================================================

-- 1. Perbarui kolom kategori_q agar mendukung karakter lebih panjang (misal 'Tidak Terhubung')
--    dan hapus CHECK constraint lama yang membatasi hanya Q1-Q5.
ALTER TABLE rtj ALTER COLUMN kategori_q TYPE VARCHAR(50);
ALTER TABLE rtj DROP CONSTRAINT IF EXISTS rtj_kategori_q_check;

-- 2. Tambahkan 4 field baru Follow-Up 1 & 2:
--    - Tanggal Follow-Up 1
--    - Jam Follow-Up 1
--    - Tanggal Follow-Up 2
--    - Jam Follow-Up 2
ALTER TABLE rtj ADD COLUMN IF NOT EXISTS tanggal_fu_1 DATE;
ALTER TABLE rtj ADD COLUMN IF NOT EXISTS jam_fu_1 VARCHAR(10);
ALTER TABLE rtj ADD COLUMN IF NOT EXISTS tanggal_fu_2 DATE;
ALTER TABLE rtj ADD COLUMN IF NOT EXISTS jam_fu_2 VARCHAR(10);

-- 3. Tambahkan kolom pendukung lainnya jika belum ada di tabel rtj:
ALTER TABLE rtj ADD COLUMN IF NOT EXISTS cabang VARCHAR(50) DEFAULT 'BJM';
ALTER TABLE rtj ADD COLUMN IF NOT EXISTS hasil_idi TEXT;
ALTER TABLE rtj ADD COLUMN IF NOT EXISTS improvement TEXT;
ALTER TABLE rtj ADD COLUMN IF NOT EXISTS recovery_steps JSONB DEFAULT '{}'::jsonb;

-- 4. Buat index baru untuk performa query pencarian Follow-Up
CREATE INDEX IF NOT EXISTS idx_rtj_tanggal_fu_1 ON rtj(tanggal_fu_1);
CREATE INDEX IF NOT EXISTS idx_rtj_tanggal_fu_2 ON rtj(tanggal_fu_2);

-- 5. Tambahkan kolom Score dan Rekomendasi
ALTER TABLE rtj ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 1 AND score <= 10);
ALTER TABLE rtj ADD COLUMN IF NOT EXISTS rekomendasi VARCHAR(10) CHECK (rekomendasi IN ('Iya', 'Tidak'));
