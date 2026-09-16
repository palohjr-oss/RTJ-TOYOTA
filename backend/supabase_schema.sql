-- ==========================================================
-- SKEMA DATABASE SUPABASE / POSTGRESQL - RTJ WIRA TOYOTA BANJARMASIN
-- ==========================================================

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'SA', 'FO')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel RTJ (Remind Tracking Job)
CREATE TABLE IF NOT EXISTS rtj (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    no_urut INTEGER,
    kategori_q VARCHAR(10) NOT NULL CHECK (kategori_q IN ('Q1', 'Q2', 'Q3', 'Q4', 'Q5')),
    tanggal_service DATE NOT NULL,
    no_wo VARCHAR(50),
    no_polisi VARCHAR(20) NOT NULL,
    nama_customer VARCHAR(150) NOT NULL,
    no_hp VARCHAR(30),
    model VARCHAR(100) NOT NULL,
    service TEXT,
    sa VARCHAR(100) NOT NULL,
    fo VARCHAR(100) NOT NULL,
    teknisi VARCHAR(100),
    km_service INTEGER DEFAULT 0,
    tanggal_rtj DATE NOT NULL,
    batas_periode_rtj DATE,
    status_rtj VARCHAR(30) NOT NULL DEFAULT 'Scheduled' CHECK (status_rtj IN ('Scheduled', 'Completed', 'Pending', 'Rescheduled')),
    detail_kendala TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel RTJ Status History
CREATE TABLE IF NOT EXISTS rtj_status_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    rtj_id TEXT NOT NULL REFERENCES rtj(id) ON DELETE CASCADE,
    status_lama VARCHAR(30),
    status_baru VARCHAR(30) NOT NULL,
    keterangan TEXT,
    updated_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    updated_by_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing untuk pencarian cepat & filtering
CREATE INDEX IF NOT EXISTS idx_rtj_status ON rtj(status_rtj);
CREATE INDEX IF NOT EXISTS idx_rtj_kategori_q ON rtj(kategori_q);
CREATE INDEX IF NOT EXISTS idx_rtj_sa ON rtj(sa);
CREATE INDEX IF NOT EXISTS idx_rtj_fo ON rtj(fo);
CREATE INDEX IF NOT EXISTS idx_rtj_tgl_service ON rtj(tanggal_service);
CREATE INDEX IF NOT EXISTS idx_rtj_no_polisi ON rtj(no_polisi);
CREATE INDEX IF NOT EXISTS idx_rtj_nama_customer ON rtj(nama_customer);
CREATE INDEX IF NOT EXISTS idx_history_rtj_id ON rtj_status_history(rtj_id);
