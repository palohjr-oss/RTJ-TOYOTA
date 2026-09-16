import XLSX from 'xlsx';
import { db } from '../models/db.js';

// Valid enum values
const VALID_STATUSES = ['Scheduled', 'Completed', 'Pending', 'Rescheduled'];
const VALID_CATEGORIES = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];

// Normalize column header keys
function normalizeKey(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Helper to parse dates gracefully (handles Excel serial numbers, DD/MM/YYYY, MM/DD/YYYY, text dates, etc.)
function parseExcelDate(val) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val)) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    // Excel date serial number (origin: Dec 30 1899)
    const date = new Date((val - 25569) * 86400 * 1000);
    if (!isNaN(date)) return date.toISOString().split('T')[0];
  }
  const s = String(val).trim();
  if (!s) return null;
  
  // Standard ISO YYYY-MM-DD
  const isoMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = String(isoMatch[2]).padStart(2, '0');
    const d = String(isoMatch[3]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Indonesian / standard format: DD/MM/YYYY or DD/MM/YY or DD-MM-YYYY
  const slashMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (slashMatch) {
    let day = parseInt(slashMatch[1], 10);
    let month = parseInt(slashMatch[2], 10);
    let year = slashMatch[3];
    if (year.length === 2) {
      year = '20' + year;
    }
    
    // In case MM/DD/YYYY was provided where day > 12
    if (month > 12 && day <= 12) {
      const temp = day;
      day = month;
      month = temp;
    }
    
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  // Indonesian month names (e.g. 15 Agustus 2024 or 15-Agu-2024)
  const indoMonths = {
    jan: '01', januari: '01', january: '01',
    feb: '02', februari: '02', february: '02',
    mar: '03', maret: '03', march: '03',
    apr: '04', april: '04',
    mei: '05', may: '05',
    jun: '06', juni: '06', june: '06',
    jul: '07', juli: '07', july: '07',
    agu: '08', agust: '08', agustus: '08', aug: '08', august: '08',
    sep: '09', september: '09',
    okt: '10', oktober: '10', oct: '10', october: '10',
    nov: '11', november: '11',
    des: '12', desember: '12', dec: '12', december: '12'
  };

  const textDateMatch = s.match(/^(\d{1,2})\s*[\s\-\/]\s*([a-zA-Z]+)\s*[\s\-\/]\s*(\d{2,4})/);
  if (textDateMatch) {
    const day = String(textDateMatch[1]).padStart(2, '0');
    const mStr = textDateMatch[2].toLowerCase();
    let year = textDateMatch[3];
    if (year.length === 2) year = '20' + year;
    
    const mm = indoMonths[mStr];
    if (mm) {
      return `${year}-${mm}-${day}`;
    }
  }

  // Native Date fallback
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

export const getRTJList = async (req, res) => {
  try {
    const {
      sa,
      fo,
      status,
      kategori_q,
      search,
      periode_mulai,
      periode_selesai,
      page = 1,
      limit = 10,
      sort_by = 'tanggal_service',
      sort_order = 'desc'
    } = req.query;

    const result = await db.getRTJList({
      sa,
      fo,
      status,
      kategori_q,
      search,
      periode_mulai,
      periode_selesai,
      page,
      limit,
      sort_by,
      sort_order
    });

    return res.json({
      success: true,
      message: 'Data RTJ berhasil diambil.',
      ...result
    });
  } catch (error) {
    console.error('getRTJList error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data RTJ.'
    });
  }
};

export const getRTJById = async (req, res) => {
  try {
    const { id } = req.params;
    const rtj = await db.getRTJById(id);

    if (!rtj) {
      return res.status(404).json({
        success: false,
        message: 'Data RTJ tidak ditemukan.'
      });
    }

    return res.json({
      success: true,
      data: rtj
    });
  } catch (error) {
    console.error('getRTJById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail data RTJ.'
    });
  }
};

export const createRTJ = async (req, res) => {
  try {
    const {
      nama_customer,
      no_polisi,
      tanggal_service,
      status_rtj,
      kategori_q,
      no_hp,
      model,
      unit,
      service,
      sa,
      fo,
      teknisi,
      km_service,
      tanggal_rtj,
      batas_periode_rtj,
      detail_kendala,
      keterangan
    } = req.body;

    if (!nama_customer || !no_polisi || !tanggal_service) {
      return res.status(400).json({
        success: false,
        message: 'Nama Customer, No. Polisi, dan Tanggal Service wajib diisi.'
      });
    }

    const created = await db.createRTJ(
      {
        nama_customer,
        no_polisi,
        tanggal_service,
        status_rtj: status_rtj || 'Scheduled',
        kategori_q: kategori_q || 'Q1',
        no_hp,
        model: model || unit || 'Toyota',
        service: service || '',
        sa,
        fo,
        teknisi: teknisi || '-',
        km_service,
        tanggal_rtj,
        batas_periode_rtj,
        detail_kendala,
        keterangan
      },
      req.user
    );

    return res.status(201).json({
      success: true,
      message: 'Data RTJ baru berhasil disimpan.',
      data: created
    });
  } catch (error) {
    console.error('createRTJ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data RTJ.'
    });
  }
};

export const updateRTJ = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await db.getRTJById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Data RTJ tidak ditemukan.'
      });
    }

    const updated = await db.updateRTJ(id, updateData, req.user);

    return res.json({
      success: true,
      message: 'Data RTJ berhasil diperbarui.',
      data: updated
    });
  } catch (error) {
    console.error('updateRTJ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data RTJ.'
    });
  }
};

export const deleteRTJ = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteRTJ(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Data RTJ tidak ditemukan.'
      });
    }

    return res.json({
      success: true,
      message: 'Data RTJ berhasil dihapus.'
    });
  } catch (error) {
    console.error('deleteRTJ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data RTJ.'
    });
  }
};

export const deleteAllRTJ = async (req, res) => {
  try {
    const deletedCount = await db.deleteAllRTJ();

    return res.json({
      success: true,
      message: `Berhasil menghapus ${deletedCount} data RTJ dan seluruh history terkait.`,
      deleted_count: deletedCount
    });
  } catch (error) {
    console.error('deleteAllRTJ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus semua data RTJ.'
    });
  }
};

export const importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File Excel (.xlsx/.xls) belum diunggah.'
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    
    // Find target sheet: nama sheet yang mengandung "rtj", "return job", "data", atau sheet pertama
    let sheetName = workbook.SheetNames.find(n => {
      const ln = n.toLowerCase();
      return ln.includes('data rtj') || ln.includes('return job') || ln.includes('rtj');
    }) || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return res.status(400).json({
        success: false,
        message: 'Lembar kerja (sheet) Excel tidak valid atau kosong.'
      });
    }

    // === AUTO-DETECT HEADER ROW ===
    // Banyak file Wira Toyota punya baris judul di atas (RETURN JOB RTJ, AGUSTUS, dll)
    // sebelum baris header kolom sebenarnya.
    // Strategi: baca sebagai array of arrays, scan 20 baris pertama, cari baris yang
    // paling banyak mengandung kata kunci kolom RTJ.
    const HEADER_KEYWORDS = [
      'no', 'polisi', 'nopol', 'customer', 'nama', 'tanggal', 'tgl',
      'service', 'sa', 'fo', 'teknisi', 'status', 'kategori', 'q1', 'keterangan',
      'kendala', 'hp', 'unit', 'model', 'km', 'rtj', 'wo'
    ];

    const rawArrays = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    let headerRowIndex = 0; // default: baris pertama
    let bestScore = 0;

    for (let i = 0; i < Math.min(20, rawArrays.length); i++) {
      const row = rawArrays[i];
      const score = row.filter(cell => {
        const cellStr = String(cell || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return HEADER_KEYWORDS.some(kw => cellStr.includes(kw));
      }).length;

      if (score > bestScore) {
        bestScore = score;
        headerRowIndex = i;
      }
    }

    // Ambil baris header dan baris data setelahnya
    const headers = rawArrays[headerRowIndex];
    const dataRows = rawArrays.slice(headerRowIndex + 1).filter(row =>
      row.some(cell => cell !== '' && cell !== null && cell !== undefined)
    );

    // Konversi ke format object seperti sheet_to_json normal
    const rawRows = dataRows.map(row => {
      const obj = {};
      headers.forEach((h, idx) => {
        if (h !== '' && h !== null && h !== undefined) {
          obj[String(h)] = row[idx] !== undefined ? row[idx] : '';
        }
      });
      return obj;
    });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File Excel tidak memiliki baris data.'
      });
    }

    const validRows = [];
    const errors = [];

    rawRows.forEach((row, index) => {
      const rowNum = index + 2;

      // Map dynamic column names (tolerant to user variations)
      const mapped = {};
      Object.keys(row).forEach(key => {
        const norm = normalizeKey(key);
        const val = row[key];

        if (norm === 'no' || norm === 'nourut') mapped.no_urut = val;
        else if (norm.includes('q1q5') || norm.includes('kategori') || norm === 'q' || norm === 'kategoriq') mapped.kategori_q = val;
        else if (norm.includes('tanggalservice') || norm.includes('tglservice')) mapped.tanggal_service = val;
        else if (norm.includes('nowo') || norm === 'wo') mapped.no_wo = val;
        else if (norm.includes('nopolisi') || norm.includes('nopol') || norm.includes('plat')) mapped.no_polisi = val;
        else if (norm.includes('namacustomer') || norm.includes('customer') || norm.includes('nama')) mapped.nama_customer = val;
        else if (norm.includes('nohp') || norm.includes('telp') || norm.includes('hp') || norm.includes('kontak') || norm.includes('telepon')) mapped.no_hp = val;
        else if (norm === 'unit' || norm.includes('model') || norm.includes('kendaraan') || norm.includes('tipe')) mapped.model = val;
        else if (norm === 'service' || norm.includes('jenisservice') || norm.includes('detailservice')) mapped.service = val;
        else if (norm === 'sa' || norm.includes('serviceadvisor')) mapped.sa = val;
        else if (norm === 'fo' || norm.includes('frontofficer')) mapped.fo = val;
        else if (norm === 'teknisi' || norm.includes('mekanik')) mapped.teknisi = val;
        else if (norm.includes('kmservice') || norm === 'km') mapped.km_service = val;
        else if (norm.includes('tanggalrtj') || norm.includes('tglrtj')) mapped.tanggal_rtj = val;
        else if (norm.includes('batasperiodertj') || norm.includes('batasrtj')) mapped.batas_periode_rtj = val;
        else if (norm.includes('statusrtj') || norm === 'status') mapped.status_rtj = val;
        else if (norm.includes('detailkendala') || norm.includes('kendala') || norm.includes('keluhan')) mapped.detail_kendala = val;
        else if (norm.includes('keterangan') || norm.includes('catatan') || norm.includes('ket')) mapped.keterangan = val;
      });

      const rowErrors = [];

      // 1. Nama Customer
      if (!mapped.nama_customer || String(mapped.nama_customer).trim() === '') {
        rowErrors.push('Nama Customer kosong');
      }

      // 2. No. Polisi
      if (!mapped.no_polisi || String(mapped.no_polisi).trim() === '') {
        rowErrors.push('No. Polisi kosong');
      }

      // 3. Tanggal Service
      const parsedTglService = parseExcelDate(mapped.tanggal_service);
      if (!parsedTglService) {
        rowErrors.push(`Format Tanggal Service ("${mapped.tanggal_service}") tidak valid`);
      }

      // 4. Status RTJ Enum Validation
      let statusRtj = 'Scheduled';
      if (mapped.status_rtj && String(mapped.status_rtj).trim() !== '') {
        const found = VALID_STATUSES.find(s => s.toLowerCase() === String(mapped.status_rtj).trim().toLowerCase());
        if (found) {
          statusRtj = found;
        } else {
          // Check common Indonesian variants
          const strLower = String(mapped.status_rtj).toLowerCase();
          if (strLower.includes('selesai') || strLower.includes('complete') || strLower.includes('sukses')) statusRtj = 'Completed';
          else if (strLower.includes('pending') || strLower.includes('tunda') || strLower.includes('belum')) statusRtj = 'Pending';
          else if (strLower.includes('jadwal ulang') || strLower.includes('reschedule')) statusRtj = 'Rescheduled';
          else if (strLower.includes('jadwal') || strLower.includes('schedule')) statusRtj = 'Scheduled';
          else {
            rowErrors.push(`Status RTJ "${mapped.status_rtj}" tidak valid`);
          }
        }
      }

      // 5. Kategori Q (Q1-Q5)
      let kategoriQ = 'Q1';
      if (mapped.kategori_q) {
        const upper = String(mapped.kategori_q).trim().toUpperCase();
        if (VALID_CATEGORIES.includes(upper)) {
          kategoriQ = upper;
        } else if (upper.includes('1')) kategoriQ = 'Q1';
        else if (upper.includes('2')) kategoriQ = 'Q2';
        else if (upper.includes('3')) kategoriQ = 'Q3';
        else if (upper.includes('4')) kategoriQ = 'Q4';
        else if (upper.includes('5')) kategoriQ = 'Q5';
      }

      if (rowErrors.length > 0) {
        errors.push({
          row: rowNum,
          customer: mapped.nama_customer || '-',
          nopol: mapped.no_polisi || '-',
          reasons: rowErrors
        });
      } else {
        const parsedTglRtj = parseExcelDate(mapped.tanggal_rtj) || parsedTglService;
        const parsedBatasRtj = parseExcelDate(mapped.batas_periode_rtj);

        // Try extracting KM if in SERVICE string
        let km = Number(mapped.km_service) || 0;
        if (!km && mapped.service) {
          const kmMatch = String(mapped.service).match(/(\d{1,3}(?:\.\d{3})*)\s*KM/i);
          if (kmMatch) {
            km = parseInt(kmMatch[1].replace(/\./g, ''), 10) || 0;
          }
        }

        validRows.push({
          no_urut: Number(mapped.no_urut) || null,
          kategori_q: kategoriQ,
          tanggal_service: parsedTglService,
          no_wo: mapped.no_wo ? String(mapped.no_wo).trim() : null,
          no_polisi: String(mapped.no_polisi).toUpperCase().replace(/\s+/g, ''),
          nama_customer: String(mapped.nama_customer).trim(),
          no_hp: mapped.no_hp ? String(mapped.no_hp).trim() : '',
          model: mapped.model ? String(mapped.model).trim() : 'Toyota',
          service: mapped.service ? String(mapped.service).trim() : '',
          sa: mapped.sa ? String(mapped.sa).trim() : 'Service Advisor',
          fo: mapped.fo ? String(mapped.fo).trim() : 'Front Officer',
          teknisi: mapped.teknisi ? String(mapped.teknisi).trim() : '-',
          km_service: km,
          tanggal_rtj: parsedTglRtj,
          batas_periode_rtj: parsedBatasRtj,
          status_rtj: statusRtj,
          detail_kendala: mapped.detail_kendala ? String(mapped.detail_kendala).trim() : '',
          keterangan: mapped.keterangan ? String(mapped.keterangan).trim() : ''
        });
      }
    });

    let importedItems = [];
    if (validRows.length > 0) {
      importedItems = await db.bulkCreateRTJ(validRows, req.user);
    }

    return res.json({
      success: true,
      message: `Proses impor selesai. Berhasil mengimpor ${validRows.length} baris.${errors.length > 0 ? ` (${errors.length} baris gagal).` : ''}`,
      imported: validRows.length,
      failed: errors.length,
      errors: errors,
      data: importedItems
    });
  } catch (error) {
    console.error('importExcel error:', error);
    return res.status(500).json({
      success: false,
      message: `Gagal memproses file Excel: ${error.message}`
    });
  }
};

export const exportTemplate = async (req, res) => {
  try {
    const templateData = [
      {
        'No': 1,
        'Q1-Q5': 'Q1',
        'Tanggal Service': '8/1/2026',
        'No. Polisi': 'DA1871BM',
        'Nama Customer': 'WAHYUNI',
        'No. HP': '081250112233',
        'UNIT': 'CALYA',
        'SERVICE': 'SBE 30.000 KM (T-CARE LITE +) GT OIL M/F (TMO 10W30)',
        'SA': 'SUGIANTO',
        'FO': 'Sapruddin',
        'TEKNISI': 'Mohamad',
        'Detail Kendala': 'KELUHAN AFTER SERVICE',
        'Tanggal RTJ': '8/4/2026',
        'Keterangan': 'BOOKING 06 AGUSTUS',
        'Status RTJ': 'Completed'
      },
      {
        'No': 2,
        'Q1-Q5': 'Q1',
        'Tanggal Service': '8/3/2026',
        'No. Polisi': 'DA1300JU',
        'Nama Customer': 'TIENDRAWANI TANGAMUS',
        'No. HP': '',
        'UNIT': 'NEW VELOZ',
        'SERVICE': 'SBE 70.000 KM GT OLI M/F (5W30) REM KADANG BUNYI BUNYI KLUTUK2 BAGIAN BAWAH SAAT JLN KASAR',
        'SA': 'SUGIANTO',
        'FO': 'Muhammad',
        'TEKNISI': 'FIRMAN A',
        'Detail Kendala': 'KELUHAN: AFTERSERVICE',
        'Tanggal RTJ': '8/6/2026',
        'Keterangan': 'BOOKING 4 AGUSTUS',
        'Status RTJ': 'Completed'
      },
      {
        'No': 3,
        'Q1-Q5': 'Q1',
        'Tanggal Service': '8/4/2026',
        'No. Polisi': 'DA1572TMC',
        'Nama Customer': 'AGUS SUTRISNO',
        'No. HP': '',
        'UNIT': 'INNOVA REBORN GASOLINE',
        'SERVICE': 'GR ANALISA KELUHAN REM TANGAN SAAT TANJKAN TIDAK',
        'SA': 'RUDI',
        'FO': 'Muhammad',
        'TEKNISI': 'Fauzi',
        'Detail Kendala': 'KELUHAN: MASIH ADA KELUHAN REM TANGAN',
        'Tanggal RTJ': '8/7/2026',
        'Keterangan': 'BELUM TERKONFIRMASI',
        'Status RTJ': 'Pending'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data RTJ');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Template_RTJ_Wira_Toyota_Banjarmasin.xlsx"');
    return res.send(buffer);
  } catch (error) {
    console.error('exportTemplate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat template Excel.'
    });
  }
};
