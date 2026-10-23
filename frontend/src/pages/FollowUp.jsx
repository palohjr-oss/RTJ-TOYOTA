import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  RotateCcw, 
  Download, 
  Upload,
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  Filter,
  Pencil,
  Trash2,
  X,
  Save,
  Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../api/client';
import ImportExcelModal from '../components/common/ImportExcelModal';
import CategoryBadge from '../components/common/CategoryBadge';
import { useNotifications } from '../context/NotificationContext';

// ─── Kategori Options ────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  'FIR',
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'Q5',
  'Q6',
  'Tidak Diangkat',
  'Tidak Aktif',
  'Tidak ada Nada',
  'Tidak Terhubung',
  'Tidak Valid',
  'Salah Sambung'
];

// ─── Edit Row Modal ────────────────────────────────────────────────────────────
function EditRowModal({ record, onClose, onSave }) {
  const [form, setForm] = useState({
    no_wo: record.no_wo || '',
    tanggal_service: record.tanggal_service || '',
    no_polisi: record.no_polisi || '',
    nama_customer: record.nama_customer || '',
    model: record.model || '',
    service: record.service || '',
    sa: record.sa || '',
    fo: record.fo || '',
    teknisi: record.teknisi || '',
    no_hp: record.no_hp || '',
    cabang: record.cabang || 'BJM',
    kategori_q: record.kategori_q || 'Q1',
    status_rtj: record.status_rtj || 'Scheduled',
    detail_kendala: record.detail_kendala || '',
    keterangan: record.keterangan || '',
    hasil_idi: record.hasil_idi || '',
    improvement: record.improvement || '',
    tanggal_rtj: record.tanggal_rtj || '',
    tanggal_fu_1: record.tanggal_fu_1 || '',
    jam_fu_1: record.jam_fu_1 || '',
    tanggal_fu_2: record.tanggal_fu_2 || '',
    jam_fu_2: record.jam_fu_2 || '',
    score: record.score || '',
    rekomendasi: record.rekomendasi || '',
    recovery: record.recovery_steps?.recovery || '',
    step_intern: record.recovery_steps?.step_intern || '',
    list_confirm: record.recovery_steps?.list_confirm || '',
    recovery_action: record.recovery_steps?.recovery_action || '',
    tindak_lanjut: record.recovery_steps?.tindak_lanjut || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        recovery_steps: {
          recovery: form.recovery,
          step_intern: form.step_intern,
          list_confirm: form.list_confirm,
          recovery_action: form.recovery_action,
          tindak_lanjut: form.tindak_lanjut,
        }
      };
      const res = await api.put(`/rtj/${record.id}`, payload);
      if (onSave) onSave(res.data?.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = "w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase mb-0.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 rounded-t-3xl text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-black">Edit Data Follow-Up</h2>
            <p className="text-xs opacity-70 mt-0.5">{record.no_polisi} — {record.nama_customer}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>No. WO</label>
              <input className={fieldClass} value={form.no_wo} onChange={e => setForm(f => ({...f, no_wo: e.target.value}))} />
            </div>
            <div>
              <label className={labelClass}>Tanggal Service</label>
              <input type="date" className={fieldClass} value={form.tanggal_service} onChange={e => setForm(f => ({...f, tanggal_service: e.target.value}))} />
            </div>
            <div>
              <label className={labelClass}>No. Polisi</label>
              <input className={fieldClass} value={form.no_polisi} onChange={e => setForm(f => ({...f, no_polisi: e.target.value}))} required />
            </div>
            <div>
              <label className={labelClass}>Nama Customer</label>
              <input className={fieldClass} value={form.nama_customer} onChange={e => setForm(f => ({...f, nama_customer: e.target.value}))} required />
            </div>
            <div>
              <label className={labelClass}>Tipe Unit</label>
              <input className={fieldClass} value={form.model} onChange={e => setForm(f => ({...f, model: e.target.value}))} />
            </div>
            <div>
              <label className={labelClass}>No. HP</label>
              <input className={fieldClass} value={form.no_hp} onChange={e => setForm(f => ({...f, no_hp: e.target.value}))} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Pekerjaan / Service</label>
              <input className={fieldClass} value={form.service} onChange={e => setForm(f => ({...f, service: e.target.value}))} />
            </div>
            <div>
              <label className={labelClass}>Service Advisor</label>
              <input className={fieldClass} value={form.sa} onChange={e => setForm(f => ({...f, sa: e.target.value}))} />
            </div>
            <div>
              <label className={labelClass}>Front Officer</label>
              <input className={fieldClass} value={form.fo} onChange={e => setForm(f => ({...f, fo: e.target.value}))} />
            </div>
            <div>
              <label className={labelClass}>Teknisi</label>
              <input className={fieldClass} value={form.teknisi} onChange={e => setForm(f => ({...f, teknisi: e.target.value}))} />
            </div>
            <div>
              <label className={labelClass}>Cabang</label>
              <select className={fieldClass} value={form.cabang} onChange={e => setForm(f => ({...f, cabang: e.target.value}))}>
                <option value="BJM">BJM (Banjarmasin)</option>
                <option value="SP">SERVICE POINT (SP)</option>
                <option value="TMS">TMS (Toyota Mobile Service)</option>
                <option value="BKT">BKT</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Kategori</label>
              <select className={fieldClass} value={form.kategori_q} onChange={e => setForm(f => ({...f, kategori_q: e.target.value}))}>
                {CATEGORY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status Follow-Up</label>
              <select className={fieldClass} value={form.status_rtj} onChange={e => setForm(f => ({...f, status_rtj: e.target.value}))}>
                <option value="Scheduled">Scheduled (Dalam Proses)</option>
                <option value="Completed">Completed (Selesai/FIR)</option>
                <option value="Pending">Pending (Menunggu)</option>
                <option value="Rescheduled">Rescheduled (Jadwal Ulang)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Tanggal RTJ</label>
              <input type="date" className={fieldClass} value={form.tanggal_rtj} onChange={e => setForm(f => ({...f, tanggal_rtj: e.target.value}))} />
            </div>
            <div></div>

            {/* 4 Field Baru: Tanggal Follow-Up 1, Jam Follow-Up 1, Tanggal Follow-Up 2, Jam Follow-Up 2 */}
            <div>
              <label className={labelClass}>Tanggal Follow-Up 1</label>
              <input
                type="date"
                className={fieldClass}
                value={form.tanggal_fu_1}
                onChange={e => setForm(f => ({...f, tanggal_fu_1: e.target.value}))}
              />
            </div>
            <div>
              <label className={labelClass}>Jam Follow-Up 1</label>
              <input
                type="time"
                className={fieldClass}
                value={form.jam_fu_1}
                onChange={e => setForm(f => ({...f, jam_fu_1: e.target.value}))}
              />
            </div>
            <div>
              <label className={labelClass}>Tanggal Follow-Up 2</label>
              <input
                type="date"
                className={fieldClass}
                value={form.tanggal_fu_2}
                onChange={e => setForm(f => ({...f, tanggal_fu_2: e.target.value}))}
              />
            </div>
            <div>
              <label className={labelClass}>Jam Follow-Up 2</label>
              <input
                type="time"
                className={fieldClass}
                value={form.jam_fu_2}
                onChange={e => setForm(f => ({...f, jam_fu_2: e.target.value}))}
              />
            </div>

            {/* Score & Rekomendasi */}
            <div>
              <label className={labelClass}>Score (1–10)</label>
              <select
                className={fieldClass}
                value={form.score}
                onChange={e => setForm(f => ({...f, score: e.target.value}))}
              >
                <option value="">— Pilih Score —</option>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Rekomendasi</label>
              <select
                className={fieldClass}
                value={form.rekomendasi}
                onChange={e => setForm(f => ({...f, rekomendasi: e.target.value}))}
              >
                <option value="">— Pilih —</option>
                <option value="Iya">Iya</option>
                <option value="Tidak">Tidak</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Detail Kendala / Keluhan</label>
              <textarea rows={2} className={fieldClass} value={form.detail_kendala} onChange={e => setForm(f => ({...f, detail_kendala: e.target.value}))} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Keterangan / Catatan</label>
              <textarea rows={2} className={fieldClass} value={form.keterangan} onChange={e => setForm(f => ({...f, keterangan: e.target.value}))} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Hasil IDI</label>
              <textarea
                rows={2}
                placeholder="Isi hasil IDI (In-Depth Interview) jika ada..."
                className={fieldClass}
                value={form.hasil_idi}
                onChange={e => setForm(f => ({...f, hasil_idi: e.target.value}))}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Improvement</label>
              <textarea
                rows={2}
                placeholder="Isi catatan improvement / tindakan perbaikan..."
                className={fieldClass}
                value={form.improvement}
                onChange={e => setForm(f => ({...f, improvement: e.target.value}))}
              />
            </div>
          </div>

          {/* ── Progres Tahapan Tindak Lanjut (4 Tahapan) ── */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Progres Tahapan Tindak Lanjut (4 Tahapan)</p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {[
                { key: 'step_intern', label: '1. Step Intern Discuss' },
                { key: 'list_confirm', label: '2. List Confirm' },
                { key: 'recovery_action', label: '3. Recovery Action' },
                { key: 'tindak_lanjut', label: '4. Tindak Lanjut' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <select
                    className={fieldClass}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  >
                    <option value="">— Pilih —</option>
                    <option value="Selesai">✅ Selesai</option>
                    <option value="Dalam Proses">🔄 Dalam Proses</option>
                    <option value="Menunggu">⏳ Menunggu</option>
                    <option value="Belum">⬜ Belum</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main FollowUp Page ────────────────────────────────────────────────────────
export default function FollowUp() {
  const queryClient = useQueryClient();
  const { fetchNotifications } = useNotifications();
  const [search, setSearch] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [cabang, setCabang] = useState('ALL');
  const [respon, setRespon] = useState('ALL');
  const [kategoriQ, setKategoriQ] = useState('ALL');
  const [periodeMulai, setPeriodeMulai] = useState('');
  const [periodeSelesai, setPeriodeSelesai] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const [showImport, setShowImport] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  // Fetch filter options
  const { data: chartData } = useQuery({
    queryKey: ['dashboard-chart-options'],
    queryFn: async () => {
      const res = await api.get('/dashboard/chart');
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });

  const availableMonths = chartData?.filterOptions?.availableMonths || [];
  const saList = chartData?.filterOptions?.saList || [];
  const foList = chartData?.filterOptions?.foList || [];



  const handleMonthChange = (monthKey) => {
    setSelectedPeriod(monthKey);
    setPage(1);
    if (monthKey === 'ALL') {
      setPeriodeMulai('');
      setPeriodeSelesai('');
    } else {
      const found = availableMonths.find(m => m.key === monthKey);
      if (found) {
        setPeriodeMulai(found.startDate);
        setPeriodeSelesai(found.endDate);
      }
    }
  };

  // Fetch summary and records
  const { data: summaryData, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-summary', { periode_mulai: periodeMulai, periode_selesai: periodeSelesai, cabang }],
    queryFn: async () => {
      const params = {};
      if (periodeMulai) params.periode_mulai = periodeMulai;
      if (periodeSelesai) params.periode_selesai = periodeSelesai;
      if (cabang !== 'ALL') params.cabang = cabang;
      const res = await api.get('/dashboard/summary', { params });
      return res.data.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const allRecords = summaryData?.records || [];

  // Filter in-memory
  const filteredRecords = allRecords.filter((r) => {
    if (search.trim()) {
      const s = search.toLowerCase();
      const match = 
        String(r.no_wo || '').toLowerCase().includes(s) ||
        String(r.no_polisi || '').toLowerCase().includes(s) ||
        String(r.nama_customer || '').toLowerCase().includes(s) ||
        String(r.sa || '').toLowerCase().includes(s) ||
        String(r.fo || '').toLowerCase().includes(s) ||
        String(r.model || '').toLowerCase().includes(s);
      if (!match) return false;
    }
    if (cabang !== 'ALL' && r.cabang !== cabang) return false;
    if (respon !== 'ALL') {
      const isTerhubung = r.status_rtj === 'Completed' || r.status_rtj === 'Rescheduled';
      if (respon === 'DIANGKAT' && !isTerhubung) return false;
      if (respon === 'TIDAK_DIANGKAT' && isTerhubung) return false;
    }
    if (kategoriQ !== 'ALL' && r.kategori_q !== kategoriQ) return false;
    return true;
  });

  // Pagination
  const totalCount = filteredRecords.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const paginatedRecords = filteredRecords.slice((page - 1) * limit, page * limit);

  // Summary metrics
  const totalFU = filteredRecords.length;
  const totalTerhubung = filteredRecords.filter(r => r.status_rtj === 'Completed' || r.status_rtj === 'Rescheduled').length;
  const totalTidakTerhubung = filteredRecords.filter(r => r.status_rtj === 'Pending' || r.status_rtj === 'Scheduled').length;
  const totalFIR = filteredRecords.filter(r => r.status_rtj === 'Completed').length;
  const scrRate = totalFU > 0 ? ((totalTerhubung / totalFU) * 100).toFixed(0) + '%' : '0%';
  const firRate = totalTerhubung > 0 ? ((totalFIR / totalTerhubung) * 100).toFixed(0) + '%' : '0%';

  const handleResetFilter = () => {
    setSearch(''); setCabang('ALL'); setRespon('ALL'); setKategoriQ('ALL'); setPage(1);
    setSelectedPeriod('ALL'); setPeriodeMulai(''); setPeriodeSelesai('');
  };

  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-chart-options'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-chart-analytics'] });
    refetch();
    fetchNotifications(true);
  };

  const handleEditSave = (updatedRecord) => {
    if (updatedRecord && updatedRecord.id) {
      queryClient.setQueriesData({ queryKey: ['dashboard-summary'] }, (old) => {
        if (!old || !Array.isArray(old.records)) return old;
        return {
          ...old,
          records: old.records.map(r => r.id === updatedRecord.id ? { ...r, ...updatedRecord } : r)
        };
      });
    }
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-chart-options'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-chart-analytics'] });
    refetch();
    fetchNotifications(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus data Follow-Up untuk "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.delete(`/rtj/${id}`);
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-chart-options'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-chart-analytics'] });
      refetch();
      fetchNotifications(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  const handleExportExcel = () => {
    const exportRows = filteredRecords.map((r, idx) => ({
      'No': idx + 1,
      'No. WO': r.no_wo || '-',
      'TANGGAL DE': r.tanggal_service || '-',
      'NOPOL': r.no_polisi || '-',
      'NAMA CUSTOMER': r.nama_customer || '-',
      'NAMA PERUSAHAAN': '-',
      'TYPE': r.model || '-',
      'TAHUN': r.tahun || '-',
      'PEKERJAAN': r.service || '-',
      'SERVICE': r.service || '-',
      'PKB': 'V',
      'FU': r.status_rtj === 'Pending' ? 'PENDING' : 'FIR',
      'FASILITAS': 'PUAS',
      'PELAYANAN PENERIMAAN': 'PUAS',
      'PELAYANAN KANTIN': 'PUAS',
      'KET HASIL SERVICE': r.detail_kendala || r.keterangan || 'HASIL SERVICE OK',
      'SPESIFIK PUAS': 'QUALITY',
      'TELPON': r.no_hp || '-',
      'TANGGAL FU': r.tanggal_rtj || '-',
      'TGL FOLLOW-UP 1': r.tanggal_fu_1 || '-',
      'JAM FOLLOW-UP 1': r.jam_fu_1 || '-',
      'TGL FOLLOW-UP 2': r.tanggal_fu_2 || '-',
      'JAM FOLLOW-UP 2': r.jam_fu_2 || '-',
      'WAKTU': 'PAGI',
      'JAM': '-',
      'SCORE': '-',
      'DEALER REKOMENDASI': '-',
      'JOB SUGGEST': '-',
      'RESPON REMINDER': '-',
      'Tgl': '-',
      'NO.RANGKA': '-',
      'FO': r.fo || '-',
      'TEKNISI': r.teknisi || '-',
      'Ket Program': '-',
      'Tgl Next Service': '-',
      'Tgl Booking': '-',
      'Permintaan': '-',
      'Kategori': r.kategori_q || 'Q1',
      'Cabang': r.cabang || 'BJM',
      'SA': r.sa || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Follow-Up');
    XLSX.writeFile(wb, `Data_FollowUp_Wira_Toyota_${selectedPeriod}.xlsx`);
  };

  return (
    <>
      {showImport && (
        <ImportExcelModal
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onSuccess={handleImportSuccess}
        />
      )}
      {editRecord && (
        <EditRowModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSave={handleEditSave}
        />
      )}

      <div className="space-y-6">
        {/* ── Header Banner ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-3xl text-white shadow-2xl border border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-toyota-red text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                Data Follow-Up
              </span>
              <span className="text-xs text-slate-400 font-medium">Wira Toyota Banjarmasin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              ALL UNIT SERVICE WIRA BANJARMASIN
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Sumber data utama seluruh Dashboard & Statistik RTJ. Data dapat di-import dari Excel atau di-export.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Unit FU', value: totalFU, color: 'bg-slate-900 border-slate-800', sub: 'Total data aktif' },
            { label: 'Terhubung', value: totalTerhubung, color: 'bg-blue-900 border-blue-800', sub: 'Respon diangkat' },
            { label: 'Tidak Terhubung', value: totalTidakTerhubung, color: 'bg-rose-950 border-rose-900', sub: 'Belum/pending' },
            { label: 'FIR (Fix It Right)', value: totalFIR, color: 'bg-emerald-950 border-emerald-900', sub: 'Pelanggan puas' },
            { label: 'Success Call Rate', value: scrRate, color: 'bg-amber-950 border-amber-900', sub: 'Tingkat sambung' },
            { label: 'FIR Rate', value: firRate, color: 'bg-teal-950 border-teal-900', sub: 'Aktual fix it right' },
          ].map(c => (
            <div key={c.label} className={`${c.color} text-white p-3.5 rounded-2xl border shadow-md`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">{c.label}</span>
              <div className="text-2xl font-black mt-0.5">{isLoading ? '…' : c.value}</div>
              <span className="text-[10px] opacity-50">{c.sub}</span>
            </div>
          ))}
        </div>

        {/* ── Filter Toolbar ── */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Pencarian</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Cari WO, Nopol, Customer, SA..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Periode */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Periode Bulan</label>
              <select
                value={selectedPeriod}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border font-bold text-slate-800"
              >
                <option value="ALL">SEMUA PERIODE</option>
                {availableMonths.map((m) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Cabang */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Cabang</label>
              <select
                value={cabang}
                onChange={(e) => { setCabang(e.target.value); setPage(1); }}
                className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border font-bold text-slate-800"
              >
                <option value="ALL">Semua Cabang</option>
                <option value="BJM">BJM ONLY</option>
                <option value="SP">SERVICE POINT (SP)</option>
                <option value="TMS">TMS</option>
                <option value="BKT">BKT</option>
              </select>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Kategori</label>
              <select
                value={kategoriQ}
                onChange={(e) => { setKategoriQ(e.target.value); setPage(1); }}
                className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border font-bold text-slate-800"
              >
                <option value="ALL">Semua Kategori</option>
                {CATEGORY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilter}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900 text-white font-bold border-b border-slate-700 uppercase tracking-wider text-[10px]">
                  <th className="px-3 py-2.5 text-center">No</th>
                  <th className="px-3 py-2.5">No. WO</th>
                  <th className="px-3 py-2.5">Tanggal</th>
                  <th className="px-3 py-2.5">No. Polisi</th>
                  <th className="px-3 py-2.5">Nama Customer</th>
                  <th className="px-3 py-2.5">Tipe Unit</th>
                  <th className="px-3 py-2.5">Pekerjaan</th>
                  <th className="px-3 py-2.5 text-center">PKB</th>
                  <th className="px-3 py-2.5 text-center">FU</th>
                  <th className="px-3 py-2.5 text-center">PSFU</th>
                  <th className="px-3 py-2.5 text-center">Cabang</th>
                  <th className="px-3 py-2.5 text-center">Respon</th>
                  <th className="px-3 py-2.5">SA</th>
                  <th className="px-3 py-2.5">FO</th>
                  <th className="px-3 py-2.5">Teknisi</th>
                  <th className="px-3 py-2.5 text-center">Kat. Q</th>
                  <th className="px-3 py-2.5">Kendala</th>
                  <th className="px-3 py-2.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan="18" className="text-center py-10 text-slate-400">
                      Memuat data follow-up...
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan="18" className="text-center py-12 text-slate-400">
                      <div className="flex flex-col items-center">
                        <Filter className="w-8 h-8 mb-2 text-slate-300" />
                        <p className="font-semibold">Tidak ada data follow-up sesuai filter</p>
                        <p className="text-[10px] mt-1">Import data dari Excel atau ubah filter</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((r, idx) => {
                    const isContacted = r.status_rtj === 'Completed' || r.status_rtj === 'Rescheduled';
                    const isFIR = r.status_rtj === 'Completed';
                    const rowBg = !isContacted ? 'bg-rose-50/40 hover:bg-rose-50/80' : 'hover:bg-slate-50';

                    return (
                      <tr key={r.id || idx} className={`${rowBg} transition-colors`}>
                        <td className="px-3 py-2 text-center font-bold text-slate-500">
                          {(page - 1) * limit + idx + 1}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">
                          {r.no_wo || '-'}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-600">
                          {r.tanggal_service || '-'}
                        </td>
                        <td className="px-3 py-2 font-bold text-blue-700">
                          {r.no_polisi || '-'}
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-900 max-w-xs truncate">
                          {r.nama_customer || '-'}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-700">
                          {r.model || '-'}
                        </td>
                        <td className="px-3 py-2 text-slate-600 max-w-xs truncate" title={r.service}>
                          {r.service || '-'}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-emerald-600">V</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isContacted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isContacted ? 'FIR' : 'PENDING'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isFIR ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isFIR ? 'PUAS' : 'TIDAK'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            r.cabang === 'SP' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {r.cabang || 'BJM'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isContacted ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {isContacted ? 'DIANGKAT' : 'TIDAK DIANGKAT'}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-800">{r.sa || '-'}</td>
                        <td className="px-3 py-2 text-slate-700">{r.fo || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{r.teknisi || '-'}</td>
                        <td className="px-3 py-2 text-center">
                          <CategoryBadge category={r.kategori_q || 'Q1'} />
                        </td>
                        <td className="px-3 py-2 text-slate-600 max-w-sm truncate" title={r.detail_kendala || r.keterangan}>
                          {r.detail_kendala || r.keterangan || 'HASIL SERVICE OK'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => setEditRecord(r)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id, r.nama_customer)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 text-xs text-slate-600 gap-3">
            <div>
              Menampilkan <span className="font-bold">{totalCount > 0 ? (page - 1) * limit + 1 : 0}</span> sampai{' '}
              <span className="font-bold">{Math.min(page * limit, totalCount)}</span> dari{' '}
              <span className="font-bold">{totalCount}</span> data
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold px-2">Halaman {page} dari {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
