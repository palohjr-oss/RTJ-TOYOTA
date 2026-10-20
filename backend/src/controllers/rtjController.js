import XLSX from 'xlsx';
import { db } from '../models/db.js';

// Valid enum values
const VALID_STATUSES = ['Scheduled', 'Completed', 'Pending', 'Rescheduled'];
const VALID_CATEGORIES = ['FIR', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'];

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
    const date = new Date((val - 25569) * 86400 * 1000);
    if (!isNaN(date)) return date.toISOString().split('T')[0];
  }
  const s = String(val).trim();
  if (!s) return null;

  const isoMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = String(isoMatch[2]).padStart(2, '0');
    const d = String(isoMatch[3]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const slashMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (slashMatch) {
    let day = parseInt(slashMatch[1], 10);
    let month = parseInt(slashMatch[2], 10);
    let year = slashMatch[3];
    if (year.length === 2) year = '20' + year;
    if (month > 12 && day <= 12) { const t = day; day = month; month = t; }
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

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
    if (mm) return `${year}-${mm}-${day}`;
  }

  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
}

export const getRTJList = async (req, res) => {
  try {
    const {
      sa, fo, status, kategori_q, search, periode_mulai, periode_selesai,
      page = 1, limit = 10, sort_by = 'tanggal_service', sort_order = 'desc'
    } = req.query;

    const result = await db.getRTJList({ sa, fo, status, kategori_q, search, periode_mulai, periode_selesai, page, limit, sort_by, sort_order });
    return res.json({ success: true, message: 'Data RTJ berhasil diambil.', ...result });
  } catch (error) {
    console.error('getRTJList error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data RTJ.' });
  }
};

export const getRTJById = async (req, res) => {
  try {
    const { id } = req.params;
    const rtj = await db.getRTJById(id);
    if (!rtj) return res.status(404).json({ success: false, message: 'Data RTJ tidak ditemukan.' });
    return res.json({ success: true, data: rtj });
  } catch (error) {
    console.error('getRTJById error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail data RTJ.' });
  }
};

export const createRTJ = async (req, res) => {
  try {
    const { nama_customer, no_polisi, tanggal_service, status_rtj, kategori_q, no_hp, model, unit, service, sa, fo, teknisi, km_service, tanggal_rtj, batas_periode_rtj, detail_kendala, keterangan } = req.body;
    if (!nama_customer || !no_polisi || !tanggal_service) {
      return res.status(400).json({ success: false, message: 'Nama Customer, No. Polisi, dan Tanggal Service wajib diisi.' });
    }
    const created = await db.createRTJ({ nama_customer, no_polisi, tanggal_service, status_rtj: status_rtj || 'Scheduled', kategori_q: kategori_q || 'Q1', no_hp, model: model || unit || 'Toyota', service: service || '', sa, fo, teknisi: teknisi || '-', km_service, tanggal_rtj, batas_periode_rtj, detail_kendala, keterangan }, req.user);
    return res.status(201).json({ success: true, message: 'Data RTJ baru berhasil disimpan.', data: created });
  } catch (error) {
    console.error('createRTJ error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan data RTJ.' });
  }
};

export const updateRTJ = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const existing = await db.getRTJById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Data RTJ tidak ditemukan.' });
    const updated = await db.updateRTJ(id, updateData, req.user);
    return res.json({ success: true, message: 'Data RTJ berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error('updateRTJ error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data RTJ.' });
  }
};

export const deleteRTJ = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteRTJ(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Data RTJ tidak ditemukan.' });
    return res.json({ success: true, message: 'Data RTJ berhasil dihapus.' });
  } catch (error) {
    console.error('deleteRTJ error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus data RTJ.' });
  }
};

export const deleteAllRTJ = async (req, res) => {
  try {
    const deletedCount = await db.deleteAllRTJ();
    return res.json({ success: true, message: `Berhasil menghapus ${deletedCount} data RTJ dan seluruh history terkait.`, deleted_count: deletedCount });
  } catch (error) {
    console.error('deleteAllRTJ error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus semua data RTJ.' });
  }
};

// ─── Import Excel ─────────────────────────────────────────────────────────────
// Mendukung DUA format:
// 1. Format JULII / Wira Toyota GW (tanpa header, berdasarkan posisi kolom)
//    Ciri: baris pertama langsung data, col0 = kode WO (GW-BKM-...), col10 = FIR/TD/Q1-Q6
// 2. Format header-based lama (template RTJ standar dengan baris header)
export const importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File Excel (.xlsx/.xls) belum diunggah.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true, raw: false });

    let sheetName = workbook.SheetNames.find(n => {
      const ln = n.toLowerCase();
      return ln.includes('data rtj') || ln.includes('return job') || ln.includes('rtj');
    }) || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return res.status(400).json({ success: false, message: 'Lembar kerja (sheet) Excel tidak valid atau kosong.' });
    }

    const rawArrays = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
    const nonEmptyRows = rawArrays.filter(row =>
      Array.isArray(row) && row.some(cell => cell !== '' && cell !== null && cell !== undefined)
    );

    if (!nonEmptyRows.length) {
      return res.status(400).json({ success: false, message: 'File Excel tidak memiliki baris data.' });
    }

    // ── Deteksi format: julii (positional) vs header-based ──
    const HEADER_KEYWORDS = [
      'no', 'polisi', 'nopol', 'customer', 'nama', 'tanggal', 'tgl',
      'service', 'sa', 'fo', 'teknisi', 'status', 'kategori', 'keterangan',
      'kendala', 'hp', 'unit', 'model', 'km', 'rtj', 'wo', 'q1', 'q2', 'q3'
    ];

    let headerRowIndex = -1;
    let bestScore = 0;
    for (let i = 0; i < Math.min(20, nonEmptyRows.length); i++) {
      const row = nonEmptyRows[i];
      const score = row.filter(cell => {
        const s = String(cell || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return HEADER_KEYWORDS.some(kw => s.includes(kw));
      }).length;
      if (score > bestScore) { bestScore = score; headerRowIndex = i; }
    }

    const firstRow = nonEmptyRows[0] || [];
    // Julii: col0 = kode WO seperti "GW-BKM-26070011" atau "WO/2026/..."
    // col10 = FIR / TD / Q1-Q6 (nilai status follow-up)
    const col0str = String(firstRow[0] || '');
    const col10str = String(firstRow[10] || '').toUpperCase().trim();
    const isWOCode = /^(GW|WO)[\-\/]/i.test(col0str);
    const isFUVal = ['FIR', 'TD', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'PSFU'].includes(col10str);
    const isJuliiFormat = isWOCode || (isFUVal && bestScore < 4);

    const validRows = [];
    const errors = [];

    if (isJuliiFormat) {
      // ── Format JULII / Wira Toyota GW ──
      // Col layout (sesuai file julii):
      // 0=NoWO, 1=TglService, 2=NoPolisi, 3=NamaCustomer, 4=NamaPerusahaan,
      // 5=Model, 6=Tahun, 7=Service/Pekerjaan, 8=SA, 9=PKB(V/-),
      // 10=StatusFU (FIR/TD/Q1-Q6), 11=PuasFasilitas, 12=PuasPelayanan,
      // 13=PuasKantin, 14=DetailKeluhan/KetHasil, 15=SpesifikPuas,
      // 16=NoHP, 17=TglRTJ, 18=Waktu, 19=Jam, 20=Score,
      // ..., 26=FO, 27=Teknisi
      nonEmptyRows.forEach((row, index) => {
        const rowNum = index + 1;
        const c = (i) => String(row[i] ?? '').trim();

        const no_wo       = c(0);
        const tgl_service = c(1);
        const no_polisi   = c(2);
        const nama_cust   = c(3);
        const model       = c(5) || c(4);
        const service     = c(7);
        const sa          = c(8);
        const status_raw  = c(10).toUpperCase();
        const detail      = c(14);
        const no_hp       = c(16);
        const tgl_rtj     = c(17);
        const fo          = row.length > 26 ? c(26) : '';
        const teknisi     = row.length > 27 ? c(27) : '';

        const rowErrList = [];
        if (!nama_cust) rowErrList.push('Nama Customer kosong');
        if (!no_polisi) rowErrList.push('No. Polisi kosong');
        const parsedTglService = parseExcelDate(tgl_service);
        if (!parsedTglService) rowErrList.push(`Tanggal Service tidak valid: "${tgl_service}"`);

        if (rowErrList.length > 0) {
          errors.push({ row: rowNum, customer: nama_cust || '-', nopol: no_polisi || '-', reasons: rowErrList });
          return;
        }

        // Tentukan kategoriQ dan statusRtj dari status_raw
        let kategoriQ = 'Q1';
        let statusRtj = 'Scheduled';

        if (status_raw === 'FIR') {
          kategoriQ = 'FIR'; statusRtj = 'Completed';
        } else if (VALID_CATEGORIES.includes(status_raw)) {
          kategoriQ = status_raw; statusRtj = 'Scheduled';
        } else if (status_raw === 'TD' || status_raw === '' || status_raw === '-') {
          statusRtj = 'Pending';
        } else if (status_raw.includes('FIR')) {
          kategoriQ = 'FIR'; statusRtj = 'Completed';
        } else if (status_raw.includes('PSFU')) {
          kategoriQ = 'Q5';
        }

        let km = 0;
        const kmMatch = service.match(/(\d{1,3}(?:[.,]\d{3})*)\s*KM/i);
        if (kmMatch) km = parseInt(kmMatch[1].replace(/[.,]/g, ''), 10) || 0;

        validRows.push({
          no_urut: null,
          kategori_q: kategoriQ,
          tanggal_service: parsedTglService,
          no_wo: no_wo || null,
          no_polisi: no_polisi.toUpperCase().replace(/\s+/g, ''),
          nama_customer: nama_cust,
          no_hp: no_hp || '',
          model: model || 'Toyota',
          service: service || '',
          sa: sa || 'Service Advisor',
          fo: fo || 'Front Officer',
          teknisi: teknisi || '-',
          km_service: km,
          tanggal_rtj: parseExcelDate(tgl_rtj) || parsedTglService,
          batas_periode_rtj: null,
          status_rtj: statusRtj,
          detail_kendala: detail || '',
          keterangan: ''
        });
      });

    } else {
      // ── Format LAMA: header-based ──
      const headers = nonEmptyRows[headerRowIndex >= 0 ? headerRowIndex : 0] || [];
      const dataRows = nonEmptyRows.slice((headerRowIndex >= 0 ? headerRowIndex : 0) + 1).filter(row =>
        row.some(cell => cell !== '' && cell !== null && cell !== undefined)
      );

      const rawRows = dataRows.map(row => {
        const obj = {};
        headers.forEach((h, idx) => {
          if (h !== '' && h !== null && h !== undefined) {
            obj[String(h)] = row[idx] !== undefined ? row[idx] : '';
          }
        });
        return obj;
      });

      rawRows.forEach((row, index) => {
        const rowNum = index + 2;
        const mapped = {};
        Object.keys(row).forEach(key => {
          const norm = normalizeKey(key);
          const val = row[key];
          if (norm === 'no' || norm === 'nourut') mapped.no_urut = val;
          else if (norm.includes('q1q5') || norm.includes('q1q6') || norm.includes('kategori') || norm === 'q' || norm === 'kategoriq') mapped.kategori_q = val;
          else if (norm.includes('tanggalservice') || norm.includes('tglservice') || norm === 'tanggalde' || norm === 'tglde') mapped.tanggal_service = val;
          else if (norm.includes('nowo') || norm === 'wo') mapped.no_wo = val;
          else if (norm.includes('nopolisi') || norm.includes('nopol') || norm.includes('plat') || norm === 'nopol') mapped.no_polisi = val;
          else if (norm.includes('namacustomer') || norm.includes('customer') || (norm.includes('nama') && !mapped.nama_customer)) mapped.nama_customer = val;
          else if (norm.includes('nohp') || norm.includes('telp') || norm === 'hp' || norm === 'telpon' || norm === 'telepon') mapped.no_hp = val;
          else if (norm === 'unit' || norm === 'type' || norm.includes('model') || norm.includes('kendaraan') || norm.includes('tipe')) mapped.model = val;
          else if (norm === 'service' || norm === 'pekerjaan' || norm.includes('jenisservice')) mapped.service = val;
          else if (norm === 'sa' || norm.includes('serviceadvisor')) mapped.sa = val;
          else if (norm === 'fo' || norm.includes('frontofficer')) mapped.fo = val;
          else if (norm === 'teknisi' || norm.includes('mekanik')) mapped.teknisi = val;
          else if (norm.includes('kmservice') || norm === 'km') mapped.km_service = val;
          else if (norm.includes('tanggalrtj') || norm.includes('tglrtj') || norm === 'tglfu' || norm === 'tanggalfu') mapped.tanggal_rtj = val;
          else if (norm.includes('batasperiodertj') || norm.includes('batasrtj')) mapped.batas_periode_rtj = val;
          else if (norm.includes('statusrtj') || norm === 'status' || norm === 'fu') mapped.status_rtj = val;
          else if (norm.includes('detailkendala') || norm.includes('kendala') || norm.includes('keluhan') || norm.includes('kethasilservice')) mapped.detail_kendala = val;
          else if (norm.includes('keterangan') || norm.includes('catatan')) mapped.keterangan = val;
          else if (norm === 'cabang') mapped.cabang = val;
        });

        const rowErrList = [];
        if (!mapped.nama_customer || String(mapped.nama_customer).trim() === '') rowErrList.push('Nama Customer kosong');
        if (!mapped.no_polisi || String(mapped.no_polisi).trim() === '') rowErrList.push('No. Polisi kosong');
        const parsedTglService = parseExcelDate(mapped.tanggal_service);
        if (!parsedTglService) rowErrList.push(`Format Tanggal Service ("${mapped.tanggal_service}") tidak valid`);

        let statusRtj = 'Scheduled';
        if (mapped.status_rtj && String(mapped.status_rtj).trim() !== '') {
          const found = VALID_STATUSES.find(s => s.toLowerCase() === String(mapped.status_rtj).trim().toLowerCase());
          if (found) { statusRtj = found; } else {
            const sl = String(mapped.status_rtj).toLowerCase();
            if (sl.includes('selesai') || sl.includes('complete') || sl === 'fir') statusRtj = 'Completed';
            else if (sl.includes('pending') || sl.includes('tunda') || sl === 'td') statusRtj = 'Pending';
            else if (sl.includes('reschedule') || sl.includes('jadwal ulang')) statusRtj = 'Rescheduled';
            else if (sl.includes('jadwal') || sl.includes('schedule')) statusRtj = 'Scheduled';
          }
        }

        let kategoriQ = 'Q1';
        if (mapped.kategori_q) {
          const upper = String(mapped.kategori_q).trim().toUpperCase();
          if (VALID_CATEGORIES.includes(upper)) kategoriQ = upper;
          else if (upper.includes('6')) kategoriQ = 'Q6';
          else if (upper.includes('5')) kategoriQ = 'Q5';
          else if (upper.includes('4')) kategoriQ = 'Q4';
          else if (upper.includes('3')) kategoriQ = 'Q3';
          else if (upper.includes('2')) kategoriQ = 'Q2';
        }

        if (rowErrList.length > 0) {
          errors.push({ row: rowNum, customer: mapped.nama_customer || '-', nopol: mapped.no_polisi || '-', reasons: rowErrList });
          return;
        }

        let km = Number(mapped.km_service) || 0;
        if (!km && mapped.service) {
          const kmMatch = String(mapped.service).match(/(\d{1,3}(?:\.\d{3})*)\s*KM/i);
          if (kmMatch) km = parseInt(kmMatch[1].replace(/\./g, ''), 10) || 0;
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
          tanggal_rtj: parseExcelDate(mapped.tanggal_rtj) || parsedTglService,
          batas_periode_rtj: parseExcelDate(mapped.batas_periode_rtj),
          status_rtj: statusRtj,
          detail_kendala: mapped.detail_kendala ? String(mapped.detail_kendala).trim() : '',
          keterangan: mapped.keterangan ? String(mapped.keterangan).trim() : '',
          cabang: mapped.cabang ? String(mapped.cabang).trim() : undefined
        });
      });
    }

    if (validRows.length === 0 && errors.length === 0) {
      return res.status(400).json({ success: false, message: 'File Excel tidak memiliki baris data yang bisa diproses.' });
    }

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
      data: importedItems,
      format_detected: isJuliiFormat ? 'julii-positional' : 'header-based'
    });
  } catch (error) {
    console.error('importExcel error:', error);
    return res.status(500).json({ success: false, message: `Gagal memproses file Excel: ${error.message}` });
  }
};

export const exportTemplate = async (req, res) => {
  try {
    const templateData = [
      {
        'No. WO': 'GW-BKM-26070001',
        'Tanggal Service': '7/1/2026',
        'No. Polisi': 'DA1871BM',
        'Nama Customer': 'WAHYUNI',
        'Nama Perusahaan': '-',
        'Tipe Unit': 'CALYA',
        'Tahun': '2020',
        'Pekerjaan / Service': 'SBE 30.000 KM (T-CARE LITE +) GT OIL M/F (TMO 10W30)',
        'SA': 'SUGIANTO',
        'PKB': 'V',
        'Status FU (FIR/TD/Q1-Q6)': 'FIR',
        'Puas Fasilitas': 'PUAS',
        'Puas Pelayanan': 'PUAS',
        'Puas Kantin': 'PUAS',
        'Detail Keluhan / Hasil Service': 'KELUHAN AFTER SERVICE OK',
        'Spesifik Puas': 'QUALITY',
        'No. HP': '081250112233',
        'Tanggal RTJ': '7/4/2026',
        'Waktu': 'PAGI',
        'Jam': '08:30',
        'Score': '9',
        'Dealer Rekomendasi': 'IYA',
        'Col23': '',
        'Col24': '',
        'Col25': '',
        'Col26': '',
        'FO': 'Sapruddin',
        'Teknisi': 'Mohamad',
      },
      {
        'No. WO': 'GW-BKM-26070002',
        'Tanggal Service': '7/1/2026',
        'No. Polisi': 'DA1300JU',
        'Nama Customer': 'TIENDRAWANI TANGAMUS',
        'Nama Perusahaan': '-',
        'Tipe Unit': 'GRAND NEW VELOZ',
        'Tahun': '2019',
        'Pekerjaan / Service': 'SBE 70.000 KM GT OLI M/F (5W30)',
        'SA': 'SUGIANTO',
        'PKB': 'V',
        'Status FU (FIR/TD/Q1-Q6)': 'TD',
        'Puas Fasilitas': '',
        'Puas Pelayanan': '',
        'Puas Kantin': '',
        'Detail Keluhan / Hasil Service': 'WA',
        'Spesifik Puas': '',
        'No. HP': '085251901288',
        'Tanggal RTJ': '7/4/2026',
        'Waktu': 'PAGI',
        'Jam': '08:33',
        'Score': '',
        'Dealer Rekomendasi': '',
        'Col23': '',
        'Col24': '',
        'Col25': '',
        'Col26': '',
        'FO': 'Muhammad',
        'Teknisi': 'FIRMAN A',
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Template_RTJ_Wira_Toyota_Banjarmasin.xlsx"');
    return res.send(buffer);
  } catch (error) {
    console.error('exportTemplate error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat template Excel.' });
  }
};
