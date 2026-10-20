import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  RotateCcw,
  ChevronRight,
  X,
  User,
  Car,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Minus,
  Building2,
  Filter,
  ClipboardList
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../api/client';

// ─── Konstanta Kategori Q ─────────────────────────────────────────────────────
const Q_CATEGORIES = [
  { key: 'Q1', label: 'Q1', desc: 'Kualitas Hasil Service', color: 'from-blue-600 to-blue-700', bg: 'bg-blue-600', light: 'bg-blue-50 border-blue-200', text: 'text-blue-700', badge: 'bg-blue-600' },
  { key: 'Q2', label: 'Q2', desc: 'Ketepatan Pengiriman Servis', color: 'from-violet-600 to-violet-700', bg: 'bg-violet-600', light: 'bg-violet-50 border-violet-200', text: 'text-violet-700', badge: 'bg-violet-600' },
  { key: 'Q3', label: 'Q3', desc: 'Lama Waktu Servis', color: 'from-emerald-600 to-emerald-700', bg: 'bg-emerald-600', light: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-600' },
  { key: 'Q4', label: 'Q4', desc: 'FIR Total', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500', light: 'bg-amber-50 border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500' },
  { key: 'Q5', label: 'Q5', desc: 'Jumlah PSFU', color: 'from-rose-600 to-rose-700', bg: 'bg-rose-600', light: 'bg-rose-50 border-rose-200', text: 'text-rose-700', badge: 'bg-rose-600' },
  { key: 'Q6', label: 'Q6', desc: 'Perlu Di-Call', color: 'from-slate-600 to-slate-700', bg: 'bg-slate-600', light: 'bg-slate-50 border-slate-200', text: 'text-slate-700', badge: 'bg-slate-600' },
];

// ─── Status Proses Badge ───────────────────────────────────────────────────────
function StepBadge({ status }) {
  const map = {
    'Selesai':       { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Selesai' },
    'Dalam Proses':  { bg: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Dalam Proses' },
    'Menunggu':      { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Menunggu' },
    'Belum':         { bg: 'bg-slate-100 text-slate-600 border-slate-300', label: 'Belum' },
    'Completed':     { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Selesai' },
    'Pending':       { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Menunggu' },
    'Scheduled':     { bg: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Dalam Proses' },
    'Rescheduled':   { bg: 'bg-violet-100 text-violet-800 border-violet-300', label: 'Menunggu' },
  };
  const cfg = map[status] || map['Belum'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.bg}`}>
      {status === 'Completed' || status === 'Selesai' ? <CheckCircle2 className="w-3 h-3 mr-1" /> :
       status === 'Dalam Proses' || status === 'Scheduled' ? <Clock className="w-3 h-3 mr-1" /> :
       status === 'Menunggu' || status === 'Pending' || status === 'Rescheduled' ? <AlertCircle className="w-3 h-3 mr-1" /> :
       <Minus className="w-3 h-3 mr-1" />}
      {cfg.label}
    </span>
  );
}

// ─── Derive step status from RTJ record ───────────────────────────────────────
function deriveSteps(record) {
  const s = record.status_rtj;
  if (s === 'Completed') {
    return { recovery: 'Selesai', stepIntern: 'Selesai', listConfirm: 'Selesai', recoveryAction: 'Selesai', tindakLanjut: 'Selesai' };
  } else if (s === 'Rescheduled') {
    return { recovery: 'Selesai', stepIntern: 'Selesai', listConfirm: 'Selesai', recoveryAction: 'Menunggu', tindakLanjut: 'Belum' };
  } else if (s === 'Scheduled') {
    return { recovery: 'Dalam Proses', stepIntern: 'Dalam Proses', listConfirm: 'Dalam Proses', recoveryAction: 'Belum', tindakLanjut: 'Belum' };
  } else {
    // Pending
    return { recovery: 'Menunggu', stepIntern: 'Menunggu', listConfirm: 'Menunggu', recoveryAction: 'Belum', tindakLanjut: 'Belum' };
  }
}

// ─── Detail Customer Modal ─────────────────────────────────────────────────────
function CustomerDetailModal({ record, onClose, qCat }) {
  if (!record) return null;
  const steps = deriveSteps(record);
  const cat = Q_CATEGORIES.find(c => c.key === qCat) || Q_CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className={`bg-gradient-to-r ${cat.color} p-6 rounded-t-3xl text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {cat.key} — {cat.desc}
              </span>
              <h2 className="text-xl font-black mt-2">{record.nama_customer || '-'}</h2>
              <p className="text-sm opacity-80 font-medium mt-0.5">{record.no_polisi || '-'} • {record.model || '-'}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Info Customer */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Informasi Customer</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: User, label: 'Nama Customer', value: record.nama_customer },
                { icon: Car, label: 'No. Polisi', value: record.no_polisi },
                { icon: Car, label: 'Tipe Unit', value: record.model },
                { icon: Phone, label: 'No. HP', value: record.no_hp },
                { icon: Calendar, label: 'Tgl Service', value: record.tanggal_service },
                { icon: ClipboardList, label: 'No. WO', value: record.no_wo },
                { icon: Building2, label: 'Cabang', value: record.cabang },
                { icon: User, label: 'Service Advisor', value: record.sa },
                { icon: User, label: 'Front Officer', value: record.fo },
                { icon: User, label: 'Teknisi', value: record.teknisi },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start space-x-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{value || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pekerjaan / Service */}
          {record.service && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pekerjaan / Service</p>
              <p className="text-xs font-semibold text-slate-800">{record.service}</p>
            </div>
          )}

          {/* Kendala */}
          {(record.detail_kendala || record.keterangan) && (
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
              <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">Kendala / Keluhan</p>
              <p className="text-xs font-semibold text-rose-800">{record.detail_kendala || record.keterangan}</p>
            </div>
          )}

          {/* Progres Recovery — 5 Tahapan */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Progres Recovery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {[
                { label: 'Recovery', value: steps.recovery },
                { label: 'Step Intern Discuss', value: steps.stepIntern },
                { label: 'List Confirm', value: steps.listConfirm },
                { label: 'Recovery Action', value: steps.recoveryAction },
                { label: 'Tindak Lanjut', value: steps.tindakLanjut },
              ].map((step, idx) => (
                <div key={step.label} className="flex flex-col items-center space-y-1 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-[10px] font-bold text-slate-500">{step.label}</p>
                  <StepBadge status={step.value} />
                </div>
              ))}
            </div>
          </div>

          {/* Status Follow Up */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Status Follow-Up</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">{record.status_rtj || '-'}</p>
            </div>
            <StepBadge status={record.status_rtj} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Q Detail Table Modal ──────────────────────────────────────────────────────
function QDetailModal({ qKey, records, onClose }) {
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const limit = 10;
  const cat = Q_CATEGORIES.find(c => c.key === qKey) || Q_CATEGORIES[0];
  const totalPages = Math.ceil(records.length / limit) || 1;
  const paginated = records.slice((page - 1) * limit, page * limit);

  return (
    <>
      {selectedRecord && (
        <CustomerDetailModal
          record={selectedRecord}
          qCat={qKey}
          onClose={() => setSelectedRecord(null)}
        />
      )}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-slate-200">
          {/* Header */}
          <div className={`bg-gradient-to-r ${cat.color} p-5 rounded-t-3xl text-white flex items-center justify-between shrink-0`}>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase">
                  {cat.key}
                </span>
                <span className="text-sm font-bold opacity-90">{cat.desc}</span>
              </div>
              <p className="text-2xl font-black mt-1">{records.length} Unit</p>
              <p className="text-xs opacity-75 mt-0.5">Klik unit untuk melihat detail customer & progres recovery</p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1">
            <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-2.5 text-center font-black">No</th>
                  <th className="px-3 py-2.5 font-black">No. Polisi / Unit</th>
                  <th className="px-3 py-2.5 font-black">Nama Customer</th>
                  <th className="px-3 py-2.5 font-black">Tipe</th>
                  <th className="px-3 py-2.5 font-black text-center">Recovery</th>
                  <th className="px-3 py-2.5 font-black text-center">Step Intern</th>
                  <th className="px-3 py-2.5 font-black text-center">List Confirm</th>
                  <th className="px-3 py-2.5 font-black text-center">Recovery Action</th>
                  <th className="px-3 py-2.5 font-black text-center">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-slate-400 font-semibold">
                      Tidak ada data untuk kategori {qKey}
                    </td>
                  </tr>
                ) : paginated.map((r, idx) => {
                  const steps = deriveSteps(r);
                  return (
                    <tr
                      key={r.id || idx}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedRecord(r)}
                    >
                      <td className="px-3 py-2 text-center font-bold text-slate-400">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-black text-blue-700">{r.no_polisi || '-'}</div>
                        <div className="text-[10px] text-slate-500">{r.no_wo || ''}</div>
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900 max-w-[180px] truncate">
                        {r.nama_customer || '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {r.model || '-'}
                      </td>
                      <td className="px-3 py-2 text-center"><StepBadge status={steps.recovery} /></td>
                      <td className="px-3 py-2 text-center"><StepBadge status={steps.stepIntern} /></td>
                      <td className="px-3 py-2 text-center"><StepBadge status={steps.listConfirm} /></td>
                      <td className="px-3 py-2 text-center"><StepBadge status={steps.recoveryAction} /></td>
                      <td className="px-3 py-2 text-center"><StepBadge status={steps.tindakLanjut} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 text-xs text-slate-500 shrink-0 bg-white rounded-b-3xl">
            <span>Menampilkan <b>{records.length > 0 ? (page-1)*limit+1 : 0}</b>–<b>{Math.min(page*limit, records.length)}</b> dari <b>{records.length}</b> unit</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p-1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 font-bold text-slate-600"
              >‹</button>
              <span className="font-bold px-1">{page} / {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p+1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 font-bold text-slate-600"
              >›</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Statistik Page ───────────────────────────────────────────────────────
export default function Statistik() {
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [periodeMulai, setPeriodeMulai] = useState('');
  const [periodeSelesai, setPeriodeSelesai] = useState('');
  const [sa, setSa] = useState('ALL');
  const [appliedFilters, setAppliedFilters] = useState({ sa: 'ALL', periode_mulai: '', periode_selesai: '' });
  const [activeQ, setActiveQ] = useState(null);   // currently selected Q card (for sidebar highlight)
  const [drilldownQ, setDrilldownQ] = useState(null); // opens full modal

  // ── Fetch filter options ──────────────────────────────────────────────────
  const { data: chartOptionsData } = useQuery({
    queryKey: ['dashboard-chart-options'],
    queryFn: async () => {
      const res = await api.get('/dashboard/chart');
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });

  // ── Fetch summary (contains records with kategori_q) ─────────────────────
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['dashboard-summary', appliedFilters],
    queryFn: async () => {
      const params = {};
      if (appliedFilters.sa !== 'ALL') params.sa = appliedFilters.sa;
      if (appliedFilters.periode_mulai) params.periode_mulai = appliedFilters.periode_mulai;
      if (appliedFilters.periode_selesai) params.periode_selesai = appliedFilters.periode_selesai;
      const res = await api.get('/dashboard/summary', { params });
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });

  const availableMonths = chartOptionsData?.filterOptions?.availableMonths || [];
  const saList = chartOptionsData?.filterOptions?.saList || [];
  const allRecords = summaryData?.records || [];

  // Auto-select latest month
  React.useEffect(() => {
    if (availableMonths.length > 0 && selectedPeriod === 'ALL') {
      const latest = availableMonths[0];
      if (latest) {
        setSelectedPeriod(latest.key);
        setPeriodeMulai(latest.startDate);
        setPeriodeSelesai(latest.endDate);
        setAppliedFilters(prev => ({ ...prev, periode_mulai: latest.startDate, periode_selesai: latest.endDate }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartOptionsData]);

  const handleMonthChange = (key) => {
    setSelectedPeriod(key);
    if (key === 'ALL') {
      setPeriodeMulai(''); setPeriodeSelesai('');
      setAppliedFilters(prev => ({ ...prev, periode_mulai: '', periode_selesai: '' }));
    } else {
      const found = availableMonths.find(m => m.key === key);
      if (found) {
        setPeriodeMulai(found.startDate); setPeriodeSelesai(found.endDate);
        setAppliedFilters(prev => ({ ...prev, periode_mulai: found.startDate, periode_selesai: found.endDate }));
      }
    }
  };

  const handleApply = (e) => {
    e?.preventDefault();
    setAppliedFilters({ sa, periode_mulai: periodeMulai, periode_selesai: periodeSelesai });
  };

  const handleReset = () => {
    setSa('ALL'); setPeriodeMulai(''); setPeriodeSelesai(''); setSelectedPeriod('ALL');
    setAppliedFilters({ sa: 'ALL', periode_mulai: '', periode_selesai: '' });
    setActiveQ(null);
  };

  // ── Compute per-Q counts from Follow-Up records ───────────────────────────
  const qStats = useMemo(() => {
    return Q_CATEGORIES.map(cat => {
      const recs = allRecords.filter(r => (r.kategori_q || 'Q1') === cat.key);
      return { ...cat, count: recs.length, records: recs };
    });
  }, [allRecords]);

  const totalUnits = allRecords.length;
  const totalFIR = allRecords.filter(r => r.status_rtj === 'Completed').length;
  const totalPending = allRecords.filter(r => r.status_rtj === 'Pending').length;
  const totalTerhubung = allRecords.filter(r => r.status_rtj === 'Completed' || r.status_rtj === 'Rescheduled').length;
  const totalNonFIR = Q_CATEGORIES.slice(0, 6).reduce((acc, c) => acc + qStats.find(q => q.key === c.key)?.count || 0, 0);

  const selectedQData = activeQ ? qStats.find(q => q.key === activeQ) : null;

  // ── Export Excel ──────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    const rows = qStats.map(q => ({
      'Kategori Q': q.key,
      'Deskripsi': q.desc,
      'Jumlah Unit': q.count,
      'Persentase': totalUnits > 0 ? ((q.count / totalUnits) * 100).toFixed(1) + '%' : '0%',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistik RTJ');
    XLSX.writeFile(wb, `Statistik_RTJ_BJM_${selectedPeriod}.xlsx`);
  };

  return (
    <>
      {/* Q Detail Drill-down Modal */}
      {drilldownQ && (
        <QDetailModal
          qKey={drilldownQ}
          records={qStats.find(q => q.key === drilldownQ)?.records || []}
          onClose={() => setDrilldownQ(null)}
        />
      )}

      <div className="space-y-6">
        {/* ── Header Banner ── */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-3xl text-white shadow-2xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-toyota-red animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Wira Toyota Banjarmasin
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
                Statistik RTJ GR BJM ONLY, SERVICE POINT & TMS
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Alur proses RTJ sesuai dengan kendala/keluhan. Seluruh data bersumber dari Data Follow-Up.
              </p>
            </div>
            <button
              onClick={handleExportExcel}
              className="shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel</span>
            </button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <form onSubmit={handleApply} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Periode Bulan</label>
              <select
                value={selectedPeriod}
                onChange={e => handleMonthChange(e.target.value)}
                className="text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border font-bold text-slate-800"
              >
                <option value="ALL">SEMUA PERIODE</option>
                {availableMonths.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Service Advisor</label>
              <select
                value={sa}
                onChange={e => setSa(e.target.value)}
                className="text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border font-semibold text-slate-800"
              >
                <option value="ALL">Semua SA</option>
                {saList.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Tanggal Service</label>
              <div className="flex items-center space-x-1">
                <input type="date" value={periodeMulai}
                  onChange={e => { setPeriodeMulai(e.target.value); setSelectedPeriod('CUSTOM'); }}
                  className="text-xs rounded-xl border-slate-200 bg-slate-50 p-1.5 border"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input type="date" value={periodeSelesai}
                  onChange={e => { setPeriodeSelesai(e.target.value); setSelectedPeriod('CUSTOM'); }}
                  className="text-xs rounded-xl border-slate-200 bg-slate-50 p-1.5 border"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button type="button" onClick={handleReset}
                className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /><span>Reset</span>
              </button>
              <button type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm active:scale-95">
                Terapkan Filter
              </button>
            </div>
          </form>
        </div>

        {/* ── Top Summary Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Unit Masuk', value: totalUnits, color: 'bg-blue-900', sub: 'Semua kategori Q' },
            { label: 'Sudah di CALL', value: totalTerhubung, color: 'bg-emerald-900', sub: 'Terhubung' },
            { label: 'FIR Total', value: totalFIR, color: 'bg-teal-900', sub: 'Fix It Right (Puas)' },
            { label: 'Perlu Di-Follow Up', value: totalPending, color: 'bg-rose-950', sub: 'Belum terhubung' },
          ].map(c => (
            <div key={c.label} className={`${c.color} text-white p-4 rounded-2xl shadow-md`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">{c.label}</span>
              <div className="text-3xl font-black mt-1">{isLoading ? '…' : c.value}</div>
              <span className="text-[10px] opacity-60">{c.sub}</span>
            </div>
          ))}
        </div>

        {/* ── Q1-Q6 Grid + Detail Table ── */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left: Q Cards */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-black text-slate-900">Kategori Non FIR</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Klik kategori untuk melihat detail unit</p>
              </div>
              <div className="p-3 space-y-2">
                {qStats.map(q => {
                  const isActive = activeQ === q.key;
                  return (
                    <button
                      key={q.key}
                      onClick={() => {
                        setActiveQ(isActive ? null : q.key);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 text-left ${
                        isActive
                          ? `${q.bg} border-transparent text-white shadow-lg scale-[1.01]`
                          : `bg-white ${q.light} hover:scale-[1.01] hover:shadow-md ${q.text}`
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${
                          isActive ? 'bg-white/20 text-white' : `${q.bg} text-white`
                        }`}>
                          {q.key}
                        </div>
                        <div>
                          <div className={`text-xs font-black ${isActive ? 'text-white' : q.text}`}>{q.desc}</div>
                          <div className={`text-[10px] mt-0.5 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                            {q.count} Unit
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xl font-black ${isActive ? 'text-white' : q.text}`}>{q.count}</span>
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Detail Table or Placeholder */}
          <div className="flex-1 min-w-0">
            {!activeQ ? (
              <div className="h-full min-h-[400px] bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center p-10 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Filter className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-base font-black text-slate-700">Pilih Kategori Q</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-sm">
                  Klik salah satu kategori Q1–Q6 di sebelah kiri untuk melihat daftar unit beserta alur proses recovery-nya.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Table Header */}
                {(() => {
                  const q = qStats.find(q => q.key === activeQ);
                  return (
                    <>
                      <div className={`bg-gradient-to-r ${q.color} px-5 py-4 text-white flex items-center justify-between`}>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase">{q.key}</span>
                            <span className="text-sm font-bold opacity-90">{q.desc}</span>
                          </div>
                          <p className="text-2xl font-black mt-1">{q.count} Unit</p>
                          <p className="text-xs opacity-70 mt-0.5">Klik baris untuk detail customer & progres recovery</p>
                        </div>
                        <button
                          onClick={() => setDrilldownQ(activeQ)}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors"
                        >
                          <span>Tampilkan Semua</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 5-column process header */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className={`${q.bg} text-white text-[10px] uppercase tracking-wider`}>
                              <th className="px-3 py-2.5 text-center font-black w-10">No</th>
                              <th className="px-3 py-2.5 font-black">No. Polisi / Unit</th>
                              <th className="px-3 py-2.5 font-black">Nama Customer</th>
                              <th className="px-3 py-2.5 font-black text-center">Recovery</th>
                              <th className="px-3 py-2.5 font-black text-center">Step Intern Discuss</th>
                              <th className="px-3 py-2.5 font-black text-center">List Confirm</th>
                              <th className="px-3 py-2.5 font-black text-center">Recovery Action</th>
                              <th className="px-3 py-2.5 font-black text-center">Tindak Lanjut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                            {isLoading ? (
                              <tr><td colSpan="8" className="text-center py-10 text-slate-400">Memuat data...</td></tr>
                            ) : q.records.length === 0 ? (
                              <tr><td colSpan="8" className="text-center py-10 text-slate-400 font-semibold">
                                Tidak ada unit dalam kategori {q.key}
                              </td></tr>
                            ) : q.records.slice(0, 10).map((r, idx) => {
                              const steps = deriveSteps(r);
                              return (
                                <tr
                                  key={r.id || idx}
                                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                                  onClick={() => setDrilldownQ(activeQ)}
                                >
                                  <td className="px-3 py-2 text-center font-bold text-slate-400">{idx + 1}</td>
                                  <td className="px-3 py-2">
                                    <div className="font-black text-blue-700">{r.no_polisi || '-'}</div>
                                    <div className="text-[10px] text-slate-400">{r.model || ''}</div>
                                  </td>
                                  <td className="px-3 py-2 font-semibold text-slate-900 max-w-[160px] truncate">
                                    {r.nama_customer || '-'}
                                  </td>
                                  <td className="px-3 py-2 text-center"><StepBadge status={steps.recovery} /></td>
                                  <td className="px-3 py-2 text-center"><StepBadge status={steps.stepIntern} /></td>
                                  <td className="px-3 py-2 text-center"><StepBadge status={steps.listConfirm} /></td>
                                  <td className="px-3 py-2 text-center"><StepBadge status={steps.recoveryAction} /></td>
                                  <td className="px-3 py-2 text-center"><StepBadge status={steps.tindakLanjut} /></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {q.records.length > 10 && (
                        <div className="px-5 py-3 border-t border-slate-100 text-center">
                          <button
                            onClick={() => setDrilldownQ(activeQ)}
                            className={`text-xs font-bold ${q.text} hover:underline`}
                          >
                            Tampilkan semua {q.records.length} unit →
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* ── Q Summary Grid (Bottom) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {qStats.map(q => (
            <button
              key={q.key}
              onClick={() => { setActiveQ(q.key); setDrilldownQ(q.key); }}
              className={`group relative bg-gradient-to-br ${q.color} text-white p-4 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 active:scale-100 text-left`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">{q.key}</span>
              <div className="text-3xl font-black mt-1">{q.count}</div>
              <span className="text-[10px] opacity-70 leading-tight mt-1 block">{q.desc}</span>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>

      </div>
    </>
  );
}
