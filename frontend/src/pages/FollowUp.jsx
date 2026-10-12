import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  RotateCcw, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  PhoneCall, 
  PhoneOff, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';

export default function FollowUp() {
  const [search, setSearch] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [cabang, setCabang] = useState('ALL');
  const [respon, setRespon] = useState('ALL');
  const [sa, setSa] = useState('ALL');
  const [fo, setFo] = useState('ALL');
  const [periodeMulai, setPeriodeMulai] = useState('');
  const [periodeSelesai, setPeriodeSelesai] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

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

  // Auto-select latest month initially
  React.useEffect(() => {
    if (availableMonths.length > 0 && selectedPeriod === 'ALL') {
      const latest = availableMonths[0];
      if (latest) {
        setSelectedPeriod(latest.key);
        setPeriodeMulai(latest.startDate);
        setPeriodeSelesai(latest.endDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData]);

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

  // Fetch summary and records from backend
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['dashboard-summary', { sa, fo, periode_mulai: periodeMulai, periode_selesai: periodeSelesai, cabang }],
    queryFn: async () => {
      const params = {};
      if (sa !== 'ALL') params.sa = sa;
      if (fo !== 'ALL') params.fo = fo;
      if (periodeMulai) params.periode_mulai = periodeMulai;
      if (periodeSelesai) params.periode_selesai = periodeSelesai;
      if (cabang !== 'ALL') params.cabang = cabang;

      const res = await api.get('/dashboard/summary', { params });
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });

  const allRecords = summaryData?.records || [];

  // Filter in-memory for immediate responsiveness with the Excel-aligned fields
  const filteredRecords = allRecords.filter((r) => {
    // Search match
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

    // Cabang match
    if (cabang !== 'ALL') {
      if (r.cabang !== cabang) return false;
    }

    // Respon match
    if (respon !== 'ALL') {
      const isTerhubung = r.status_rtj === 'Completed' || r.status_rtj === 'Rescheduled';
      if (respon === 'DIANGKAT' && !isTerhubung) return false;
      if (respon === 'TIDAK_DIANGKAT' && isTerhubung) return false;
    }

    return true;
  });

  // Pagination
  const totalCount = filteredRecords.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const paginatedRecords = filteredRecords.slice((page - 1) * limit, page * limit);

  // Core metrics calculated from active records
  const totalFU = filteredRecords.length;
  const totalTerhubung = filteredRecords.filter(r => r.status_rtj === 'Completed' || r.status_rtj === 'Rescheduled').length;
  const totalTidakTerhubung = filteredRecords.filter(r => r.status_rtj === 'Pending' || r.status_rtj === 'Scheduled').length;
  const totalFIR = filteredRecords.filter(r => r.status_rtj === 'Completed').length;
  const scrRate = totalFU > 0 ? ((totalTerhubung / totalFU) * 100).toFixed(0) + '%' : '100%';
  const firRate = totalTerhubung > 0 ? ((totalFIR / totalTerhubung) * 100).toFixed(0) + '%' : '100%';

  const handleResetFilter = () => {
    setSearch('');
    setCabang('ALL');
    setRespon('ALL');
    setSa('ALL');
    setFo('ALL');
    setPage(1);
    setSelectedPeriod('ALL');
    setPeriodeMulai('');
    setPeriodeSelesai('');
  };

  const handleExportExcel = () => {
    const exportRows = filteredRecords.map((r, idx) => ({
      'No': idx + 1,
      'No. WO': r.no_wo || '-',
      'TANGGAL': r.tanggal_service || '-',
      'NOPOL': r.no_polisi || '-',
      'NAMA': r.nama_customer || '-',
      'TYPE': r.model || '-',
      'TAHUN': r.tahun || '2021',
      'PEKERJAAN': r.service || '-',
      'PKB': 'V',
      'FU': r.status_rtj === 'Pending' ? 'TIDAK' : 'FU',
      'PSFU': r.status_rtj === 'Completed' ? 'PUAS' : 'TIDAK PUAS',
      'TABLET': 'PUAS',
      'PELAYANAN (PENGIRIMAN)': 'PUAS',
      'PELAYANAN (HASIL SERVICE)': r.status_rtj === 'Completed' ? 'PUAS' : 'KURANG PUAS',
      'KET': r.detail_kendala || r.keterangan || 'HASIL SERVICE OK',
      'SP/DEALER': r.cabang || 'BJM',
      'RESPON': (r.status_rtj === 'Completed' || r.status_rtj === 'Rescheduled') ? 'DIANGKAT' : 'TIDAK DIANGKAT',
      'TELEPON': r.no_hp || '-',
      'TGL FU': r.tanggal_rtj || '-',
      'SA': r.sa || '-',
      'FO': r.fo || '-',
      'TEKNISI': r.teknisi || '-',
      'KATEGORI Q': r.kategori_q || 'Q1',
      'STATUS': r.status_rtj || 'Completed'
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tabel Follow-Up');
    XLSX.writeFile(wb, `Data_FollowUp_Wira_Toyota_${selectedPeriod}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-3xl text-white shadow-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-toyota-red text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
              Tabel Follow-Up
            </span>
            <span className="text-xs text-slate-400 font-medium">Wira Toyota Banjarmasin</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Data Hasil Follow-Up Service Berkala
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Tabel rekapitulasi data hasil monitoring Follow-Up unit pelanggan, pemisahan cabang BJM & Service Point (SP), terhubung, dan respon pelanggan.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards (Consistent with Dashboard & Statistik) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Unit FU</span>
          <div className="text-2xl font-black mt-0.5">{totalFU}</div>
          <span className="text-[10px] text-slate-400">Total data aktif</span>
        </div>

        <div className="bg-blue-900/90 text-white p-3.5 rounded-2xl border border-blue-800 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Terhubung</span>
          <div className="text-2xl font-black mt-0.5 text-blue-200">{totalTerhubung}</div>
          <span className="text-[10px] text-blue-300">Respon diangkat</span>
        </div>

        <div className="bg-rose-950/90 text-white p-3.5 rounded-2xl border border-rose-900 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">Tidak Terhubung</span>
          <div className="text-2xl font-black mt-0.5 text-rose-400">{totalTidakTerhubung}</div>
          <span className="text-[10px] text-rose-300">Belum diangkat / tunda</span>
        </div>

        <div className="bg-emerald-950/90 text-white p-3.5 rounded-2xl border border-emerald-900 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">FIR (Fix It Right)</span>
          <div className="text-2xl font-black mt-0.5 text-emerald-300">{totalFIR}</div>
          <span className="text-[10px] text-emerald-300">Pelanggan puas</span>
        </div>

        <div className="bg-amber-950/90 text-white p-3.5 rounded-2xl border border-amber-900 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">Success Call Rate</span>
          <div className="text-2xl font-black mt-0.5 text-amber-300">{scrRate}</div>
          <span className="text-[10px] text-amber-300">Tingkat sambung</span>
        </div>

        <div className="bg-teal-950/90 text-white p-3.5 rounded-2xl border border-teal-900 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block">FIR Rate</span>
          <div className="text-2xl font-black mt-0.5 text-teal-300">{firRate}</div>
          <span className="text-[10px] text-teal-300">Aktual fix it right</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
              Pencarian
            </label>
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

          {/* Periode Bulan */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
              Periode Bulan
            </label>
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

          {/* Cabang Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
              Cabang / Unit
            </label>
            <select
              value={cabang}
              onChange={(e) => { setCabang(e.target.value); setPage(1); }}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border font-bold text-slate-800"
            >
              <option value="ALL">Semua Cabang (BJM & SP)</option>
              <option value="BJM">BJM ONLY (Banjarmasin)</option>
              <option value="SP">SERVICE POINT (SP)</option>
              <option value="BKT">BKT</option>
            </select>
          </div>

          {/* Respon Follow Up */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
              Respon Telepon
            </label>
            <select
              value={respon}
              onChange={(e) => { setRespon(e.target.value); setPage(1); }}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border font-semibold text-slate-800"
            >
              <option value="ALL">Semua Respon</option>
              <option value="DIANGKAT">DIANGKAT (Terhubung)</option>
              <option value="TIDAK_DIANGKAT">TIDAK DIANGKAT (Pending)</option>
            </select>
          </div>

          {/* Reset Button */}
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

      {/* Main Table Styled After Excel Sheet Gambar 5 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
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
                <th className="px-3 py-2.5 text-center">Tablet</th>
                <th className="px-3 py-2.5 text-center">Cabang</th>
                <th className="px-3 py-2.5 text-center">Respon</th>
                <th className="px-3 py-2.5">Service Advisor</th>
                <th className="px-3 py-2.5">Front Officer</th>
                <th className="px-3 py-2.5">Teknisi</th>
                <th className="px-3 py-2.5 text-center">Kat. Q</th>
                <th className="px-3 py-2.5">Keterangan / Kendala</th>
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
                  <td colSpan="18" className="text-center py-10 text-slate-400">
                    Tidak ada data follow-up yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, idx) => {
                  const isContacted = r.status_rtj === 'Completed' || r.status_rtj === 'Rescheduled';
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
                      <td className="px-3 py-2 text-center font-bold text-emerald-600">
                        V
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isContacted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isContacted ? 'FU' : 'PENDING'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status_rtj === 'Completed' ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.status_rtj === 'Completed' ? 'PUAS' : 'TIDAK'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-emerald-700">
                        PUAS
                      </td>
                      <td className="px-3 py-2 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          r.cabang === 'SP' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {r.cabang || 'BJM'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          isContacted 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {isContacted ? 'DIANGKAT' : 'TIDAK DIANGKAT'}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {r.sa || '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {r.fo || '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {r.teknisi || '-'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <CategoryBadge category={r.kategori_q || 'Q1'} />
                      </td>
                      <td className="px-3 py-2 text-slate-600 max-w-sm truncate" title={r.detail_kendala || r.keterangan}>
                        {r.detail_kendala || r.keterangan || 'HASIL SERVICE OK'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
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
            <span className="font-bold px-2">
              Halaman {page} dari {totalPages}
            </span>
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
  );
}
