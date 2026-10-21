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
  ClipboardList,
  PhoneCall,
  Truck,
  Search
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../api/client';

// ─── Konstanta Kategori Q ─────────────────────────────────────────────────────
const Q_CATEGORIES = [
  { key: 'Q1', label: 'Q1', desc: 'Kualitas Hasil Service', color: 'from-blue-600 to-blue-700', bg: 'bg-blue-600', light: 'bg-blue-50 border-blue-200', text: 'text-blue-700', badge: 'bg-blue-600' },
  { key: 'Q2', label: 'Q2', desc: 'Ketepatan Pengiriman Servis', color: 'from-violet-600 to-violet-700', bg: 'bg-violet-600', light: 'bg-violet-50 border-violet-200', text: 'text-violet-700', badge: 'bg-violet-600' },
  { key: 'Q3', label: 'Q3', desc: 'Lama Waktu Servis', color: 'from-teal-600 to-teal-700', bg: 'bg-teal-600', light: 'bg-teal-50 border-teal-200', text: 'text-teal-700', badge: 'bg-teal-600' },
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
  // Jika ada recovery_steps yang di-set manual, gunakan itu
  const rs = record.recovery_steps;
  if (rs && (rs.recovery || rs.step_intern || rs.list_confirm || rs.recovery_action || rs.tindak_lanjut)) {
    return {
      recovery: rs.recovery || 'Belum',
      stepIntern: rs.step_intern || 'Belum',
      listConfirm: rs.list_confirm || 'Belum',
      recoveryAction: rs.recovery_action || 'Belum',
      tindakLanjut: rs.tindak_lanjut || 'Belum',
    };
  }
  // Fallback: auto-derive dari status_rtj
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

          {/* Hasil IDI */}
          {record.hasil_idi && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Hasil IDI</p>
              <p className="text-xs font-semibold text-blue-900">{record.hasil_idi}</p>
            </div>
          )}

          {/* Improvement */}
          {record.improvement && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Improvement</p>
              <p className="text-xs font-semibold text-emerald-900">{record.improvement}</p>
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
function QDetailModal({ qKey, cardInfo, records, onClose }) {
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const limit = 10;
  const title = cardInfo?.title || cardInfo?.desc || qKey;
  const headerBg = cardInfo?.bg || 'bg-slate-900';
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
          <div className={`${headerBg} p-5 rounded-t-3xl text-white flex items-center justify-between shrink-0`}>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase">
                  {qKey}
                </span>
                <span className="text-sm font-bold opacity-90">{title}</span>
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
  const [activeQ, setActiveQ] = useState('Q1');        // default to Q1 or 'ALL'
  const [drilldownQ, setDrilldownQ] = useState(null);  // opens full modal
  const [inlineCustomer, setInlineCustomer] = useState(null); // opens customer detail modal

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
    setActiveQ('Q1');
  };

  // ── Compute per-Q counts from Follow-Up records (berdasarkan kategori_q) ──
  const qStats = useMemo(() => {
    return Q_CATEGORIES.map(cat => {
      const recs = allRecords.filter(r => r.kategori_q === cat.key);
      return { ...cat, count: recs.length, records: recs };
    });
  }, [allRecords]);

  // ── Top Summary & Ratio Calculations (Gambar 2 Concept) ───────────────────
  const totalUnits = allRecords.length;
  const totalFIR = allRecords.filter(r => r.status_rtj === 'Completed').length;
  const totalPending = allRecords.filter(r => r.status_rtj === 'Pending' || r.status_rtj === 'Scheduled' || !r.status_rtj).length;
  const totalTerhubung = allRecords.filter(r => r.status_rtj === 'Completed' || r.status_rtj === 'Rescheduled').length;

  const persentasePengisian = totalUnits > 0 ? Math.round((totalTerhubung / totalUnits) * 100) : 0;
  const firRatio = totalUnits > 0 ? Math.round((totalFIR / totalUnits) * 100) : 0;

  // ── 3 Questions Breakdown (Rincian Persentase Fix It Right - Gambar 2) ─────
  // Data per-Q sesuai field kategori_q dari Follow-Up
  const q1Recs = allRecords.filter(r => r.kategori_q === 'Q1');
  const q1TidakPuas = q1Recs.length;
  const q1Puas = Math.max(0, totalUnits - q1TidakPuas);
  const q1PuasPct = totalUnits > 0 ? Math.round((q1Puas / totalUnits) * 100) : 0;
  const q1TidakPuasPct = totalUnits > 0 ? Math.round((q1TidakPuas / totalUnits) * 100) : 0;

  const q2Recs = allRecords.filter(r => r.kategori_q === 'Q2');
  const q2Tidak = q2Recs.length;
  const q2Ya = Math.max(0, totalUnits - q2Tidak);
  const q2YaPct = totalUnits > 0 ? Math.round((q2Ya / totalUnits) * 100) : 0;
  const q2TidakPct = totalUnits > 0 ? Math.round((q2Tidak / totalUnits) * 100) : 0;

  const q3Recs = allRecords.filter(r => r.kategori_q === 'Q3');
  const q3TidakPuas = q3Recs.length;
  const q3Puas = Math.max(0, totalUnits - q3TidakPuas);
  const q3PuasPct = totalUnits > 0 ? Math.round((q3Puas / totalUnits) * 100) : 0;
  const q3TidakPuasPct = totalUnits > 0 ? Math.round((q3TidakPuas / totalUnits) * 100) : 0;

  // ── Dealer Question Cards — count & records SESUAI kategori_q keluhan ─────
  // Setiap kartu hanya menampilkan unit yang kategori_q-nya sesuai.
  // Tidak ada lagi "Total Unit Masuk" — angka mengikuti keluhan.
  const dealerCards = useMemo(() => [
    {
      key: 'Q1',
      label: 'Q1',
      title: 'Kualitas Hasil Service',
      desc: 'Kualitas Hasil Service',
      bg: 'bg-[#0b3c70]',
      icon: Truck,
      filterFn: (records) => records.filter(r => r.kategori_q === 'Q1'),
    },
    {
      key: 'Q2',
      label: 'Q2',
      title: 'Ketepatan Pengiriman Servis',
      desc: 'Ketepatan Pengiriman Servis',
      bg: 'bg-[#2f2762]',
      icon: Search,
      filterFn: (records) => records.filter(r => r.kategori_q === 'Q2'),
    },
    {
      key: 'Q3',
      label: 'Q3',
      title: 'Lama Waktu Servis',
      desc: 'Lama Waktu Servis',
      bg: 'bg-[#18532c]',
      icon: PhoneCall,
      filterFn: (records) => records.filter(r => r.kategori_q === 'Q3'),
    },
    {
      key: 'Q4',
      label: 'Q4',
      title: 'FIR Total',
      desc: 'FIR Total',
      bg: 'bg-[#0f4d45]',
      icon: CheckCircle2,
      filterFn: (records) => records.filter(r => r.kategori_q === 'Q4'),
    },
    {
      key: 'Q5',
      label: 'Q5',
      title: 'Jumlah PSFU',
      desc: 'Jumlah PSFU',
      bg: 'bg-[#964b15]',
      icon: ClipboardList,
      filterFn: (records) => records.filter(r => r.kategori_q === 'Q5'),
    },
    {
      key: 'Q6',
      label: 'Q6',
      title: 'Perlu Di-Follow Up',
      desc: 'Perlu Di-Follow Up',
      bg: 'bg-[#6b1d42]',
      icon: PhoneCall,
      filterFn: (records) => records.filter(r => r.kategori_q === 'Q6'),
    },
  ], []);

  // Tambahkan count dinamis berdasarkan allRecords
  const dealerCardsWithCount = useMemo(() =>
    dealerCards.map(c => ({ ...c, count: c.filterFn(allRecords).length }))
  , [dealerCards, allRecords]);

  const activeCard = dealerCardsWithCount.find(c => c.key === activeQ) || dealerCardsWithCount[0];

  // ── Displayed Records for Unit Table ──────────────────────────────────────
  const displayRecords = useMemo(() => {
    if (activeCard && activeCard.filterFn) {
      return activeCard.filterFn(allRecords);
    }
    return allRecords;
  }, [allRecords, activeCard]);

  // ── Export Excel ──────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    const rows = dealerCardsWithCount.map(c => ({
      'Kategori': c.label,
      'Deskripsi': c.title,
      'Jumlah Unit': c.count,
      'Persentase': totalUnits > 0 ? ((c.count / totalUnits) * 100).toFixed(1) + '%' : '0%',
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
          cardInfo={dealerCardsWithCount.find(c => c.key === drilldownQ) || Q_CATEGORIES.find(c => c.key === drilldownQ)}
          records={dealerCardsWithCount.find(c => c.key === drilldownQ)?.filterFn(allRecords) || allRecords}
          onClose={() => setDrilldownQ(null)}
        />
      )}

      {/* Inline Customer Detail Modal */}
      {inlineCustomer && (
        <CustomerDetailModal
          record={inlineCustomer}
          qCat={inlineCustomer.kategori_q || 'Q1'}
          onClose={() => setInlineCustomer(null)}
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

        {/* ── Top Summary Cards (Gambar 2 Concept) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. JUMLAH PSFU */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {isLoading ? '…' : totalUnits}
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span>JUMLAH PSFU</span>
                <span className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-400 text-[9px] font-bold inline-flex items-center justify-center">i</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          {/* 2. PERLU DIFOLLOW-UP */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {isLoading ? '…' : totalPending}
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span>PERLU DIFOLLOW-UP</span>
                <span className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-400 text-[9px] font-bold inline-flex items-center justify-center">i</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Phone className="w-6 h-6" />
            </div>
          </div>

          {/* 3. PERSENTASE PENGISIAN PSFU */}
          <div className="bg-[#c50000] text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="text-4xl font-black tracking-tight">{persentasePengisian}%</div>
              <span className="border border-white/60 text-[10px] font-black uppercase px-2 py-0.5 rounded text-white tracking-wider">
                {persentasePengisian >= 70 ? 'TERCAPAI' : 'WARNING'}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <span>PERSENTASE PENGISIAN PSFU</span>
                <span className="w-3.5 h-3.5 rounded-full border border-white/60 text-[9px] font-bold inline-flex items-center justify-center">i</span>
              </div>
              <p className="text-[11px] text-white/90 font-medium mt-0.5">
                {persentasePengisian >= 70 ? 'Mencapai target 70%' : 'Tidak mencapai target 70%'}
              </p>
            </div>
          </div>

          {/* 4. FIX IT RIGHT RATIO */}
          <div className="bg-[#c50000] text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="text-4xl font-black tracking-tight">{firRatio}%</div>
              <span className="border border-white/60 text-[10px] font-black uppercase px-2 py-0.5 rounded text-white tracking-wider">
                {firRatio >= 75 ? 'TERCAPAI' : 'WARNING'}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <span>FIX IT RIGHT RATIO</span>
                <span className="w-3.5 h-3.5 rounded-full border border-white/60 text-[9px] font-bold inline-flex items-center justify-center">i</span>
              </div>
              <p className="text-[11px] text-white/90 font-medium mt-0.5">
                {firRatio >= 75 ? 'Mencapai target 75%' : 'Tidak mencapai target 75%'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Rincian Persentase Fix It Right (Gambar 2 Concept) ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Rincian Persentase Fix It Right
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Klik kartu pertanyaan di bawah untuk memfilter daftar unit & alur recovery RTJ terkait
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* 1. Kualitas Servis (Q1) */}
            <div
              onClick={() => setActiveQ('Q1')}
              className={`p-6 cursor-pointer transition-all duration-200 hover:bg-slate-50 relative ${
                activeQ === 'Q1' ? 'bg-blue-50/60 ring-2 ring-blue-500 ring-inset' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Kualitas Servis</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Q1</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 min-h-[34px] leading-snug">
                Apakah Anda puas dengan kualitas hasil pengerjaan anda setelah servis?
              </p>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {q1PuasPct}%
                </div>
                <div className="space-y-1.5 text-right">
                  <div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                      <span className="text-xs font-bold text-slate-800">Puas — {q1PuasPct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{q1Puas} Pelanggan</div>
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      <span className="text-xs font-bold text-slate-800">Tidak Puas — {q1TidakPuasPct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{q1TidakPuas} Pelanggan</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Ketepatan Janji Pengiriman Servis (Q2) */}
            <div
              onClick={() => setActiveQ('Q2')}
              className={`p-6 cursor-pointer transition-all duration-200 hover:bg-slate-50 relative ${
                activeQ === 'Q2' ? 'bg-violet-50/60 ring-2 ring-violet-500 ring-inset' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Ketepatan Janji Pengiriman Servis</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-700">Q2</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 min-h-[34px] leading-snug">
                Apakah kendaraan Anda dikirim tepat waktu sesuai janji dari Service Advisor di cabang kami
              </p>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {q2YaPct}%
                </div>
                <div className="space-y-1.5 text-right">
                  <div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                      <span className="text-xs font-bold text-slate-800">Ya — {q2YaPct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{q2Ya} Pelanggan</div>
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      <span className="text-xs font-bold text-slate-800">Tidak — {q2TidakPct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{q2Tidak} Pelanggan</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Lama waktu servis (Q3) */}
            <div
              onClick={() => setActiveQ('Q3')}
              className={`p-6 cursor-pointer transition-all duration-200 hover:bg-slate-50 relative ${
                activeQ === 'Q3' ? 'bg-emerald-50/60 ring-2 ring-emerald-500 ring-inset' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Lama waktu servis</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Q3</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 min-h-[34px] leading-snug">
                Apakah Anda puas dengan durasi waktu yang dibutuhkan untuk servis
              </p>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {q3PuasPct}%
                </div>
                <div className="space-y-1.5 text-right">
                  <div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                      <span className="text-xs font-bold text-slate-800">Puas — {q3PuasPct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{q3Puas} Pelanggan</div>
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      <span className="text-xs font-bold text-slate-800">Tidak Puas — {q3TidakPuasPct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{q3TidakPuas} Pelanggan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 6 Kategori Q Cards (Gambar 2 Bottom Concept) ── */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {dealerCardsWithCount.map(card => {
              const isSelected = activeQ === card.key;
              const Icon = card.icon;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setActiveQ(card.key)}
                  className={`w-full ${card.bg} text-white p-5 rounded-2xl shadow-md text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                    isSelected
                      ? 'ring-4 ring-offset-2 ring-slate-900 shadow-2xl scale-[1.02]'
                      : 'hover:scale-[1.01] hover:shadow-lg opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-base font-black tracking-wider uppercase text-white/90">
                      {card.label}
                    </span>
                    <Icon className="w-8 h-8 text-white/90 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="mt-3">
                    <div className="text-4xl font-black text-white tracking-tight">
                      {isLoading ? '…' : card.count}
                    </div>
                    <div className="text-[10px] text-white/60 mt-1 font-medium">
                      Unit Follow-Up
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Unit List & 5-Step Recovery Process Flow ── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${activeCard.bg} text-white`}>
                    {activeCard.label}
                  </span>
                  <h2 className="text-sm font-black text-slate-900">
                    Alur Proses Recovery Unit RTJ — {activeCard.title}
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {displayRecords.length} Unit
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Menampilkan unit untuk kategori <b>{activeCard.label} ({activeCard.title})</b>. Klik baris unit untuk melihat detail profil customer & 5 tahapan recovery.
                </p>
              </div>

              <button
                onClick={() => setDrilldownQ(activeQ)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 self-start sm:self-auto"
              >
                <span>Buka di Modal Pop-up</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 5-Column Process Flow Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                    <th className="px-3 py-2.5 text-center font-black w-10">No</th>
                    <th className="px-3 py-2.5 font-black">No. Polisi / Unit</th>
                    <th className="px-3 py-2.5 font-black">Nama Customer</th>
                    <th className="px-3 py-2.5 font-black text-center">Status RTJ</th>
                    <th className="px-3 py-2.5 font-black text-center">1. Recovery</th>
                    <th className="px-3 py-2.5 font-black text-center">2. Step Intern Discuss</th>
                    <th className="px-3 py-2.5 font-black text-center">3. List Confirm</th>
                    <th className="px-3 py-2.5 font-black text-center">4. Recovery Action</th>
                    <th className="px-3 py-2.5 font-black text-center">5. Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {isLoading ? (
                    <tr><td colSpan="9" className="text-center py-12 text-slate-400">Memuat data unit...</td></tr>
                  ) : displayRecords.length === 0 ? (
                    <tr><td colSpan="9" className="text-center py-12 text-slate-400 font-semibold">
                      Tidak ada unit dalam kategori {activeCard.label} ({activeCard.title}).
                    </td></tr>
                  ) : displayRecords.slice(0, 15).map((r, idx) => {
                    const steps = deriveSteps(r);
                    return (
                      <tr
                        key={r.id || idx}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => setInlineCustomer(r)}
                      >
                        <td className="px-3 py-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="font-black text-blue-700">{r.no_polisi || '-'}</div>
                          <div className="text-[10px] text-slate-400">{r.model || ''}</div>
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-900 max-w-[170px] truncate">
                          {r.nama_customer || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status_rtj === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            r.status_rtj === 'Rescheduled' ? 'bg-violet-100 text-violet-800' :
                            r.status_rtj === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status_rtj || 'Pending'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center"><StepBadge status={steps.recovery} /></td>
                        <td className="px-3 py-2.5 text-center"><StepBadge status={steps.stepIntern} /></td>
                        <td className="px-3 py-2.5 text-center"><StepBadge status={steps.listConfirm} /></td>
                        <td className="px-3 py-2.5 text-center"><StepBadge status={steps.recoveryAction} /></td>
                        <td className="px-3 py-2.5 text-center"><StepBadge status={steps.tindakLanjut} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {displayRecords.length > 15 && (
              <div className="px-5 py-3 border-t border-slate-100 text-center bg-slate-50">
                <button
                  onClick={() => setDrilldownQ(activeQ)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Menampilkan 15 dari {displayRecords.length} unit. Klik di sini untuk melihat semua di modal pop-up →
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
