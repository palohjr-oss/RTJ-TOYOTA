import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  RotateCcw, 
  PlusCircle, 
  UploadCloud, 
  Layers,
  ChevronRight,
  TrendingUp,
  PhoneCall,
  PhoneOff,
  Target,
  FileSpreadsheet,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import ProcessFlowDiagram from '../components/common/ProcessFlowDiagram';
import ImportExcelModal from '../components/common/ImportExcelModal';
import ChangeStatusModal from '../components/common/ChangeStatusModal';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [statusModalRtj, setStatusModalRtj] = useState(null);

  // Filter state
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [sa, setSa] = useState('ALL');
  const [fo, setFo] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [periodeMulai, setPeriodeMulai] = useState('');
  const [periodeSelesai, setPeriodeSelesai] = useState('');

  // Applied filters for query
  const [appliedFilters, setAppliedFilters] = useState({
    sa: 'ALL',
    fo: 'ALL',
    status: 'ALL',
    periode_mulai: '',
    periode_selesai: ''
  });

  // Fetch chart & filter options (Months, SAs, FOs)
  const { data: chartData } = useQuery({
    queryKey: ['dashboard-chart-options'],
    queryFn: async () => {
      const res = await api.get('/dashboard/chart');
      return res.data.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const filterOptions = chartData?.filterOptions || {
    saList: [],
    foList: [],
    availableMonths: [],
    statusList: ['Scheduled', 'Completed', 'Pending', 'Rescheduled']
  };

  const availableMonths = filterOptions.availableMonths || [];

  // Auto-select bulan terbaru dari data real saat pertama kali load
  React.useEffect(() => {
    if (availableMonths.length > 0 && selectedPeriod === 'ALL') {
      // Otomatis pilih bulan terbaru (index 0 karena sudah reverse-sorted)
      const latest = availableMonths[0];
      if (latest) {
        setSelectedPeriod(latest.key);
        setPeriodeMulai(latest.startDate);
        setPeriodeSelesai(latest.endDate);
        setAppliedFilters(prev => ({
          ...prev,
          periode_mulai: latest.startDate,
          periode_selesai: latest.endDate
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData]);

  const handleMonthChange = (monthKey) => {
    setSelectedPeriod(monthKey);
    if (monthKey === 'ALL') {
      setPeriodeMulai('');
      setPeriodeSelesai('');
      setAppliedFilters(prev => ({
        ...prev,
        periode_mulai: '',
        periode_selesai: ''
      }));
    } else {
      const found = availableMonths.find(m => m.key === monthKey);
      if (found) {
        setPeriodeMulai(found.startDate);
        setPeriodeSelesai(found.endDate);
        setAppliedFilters(prev => ({
          ...prev,
          periode_mulai: found.startDate,
          periode_selesai: found.endDate
        }));
      }
    }
  };

  const handleApplyFilter = (e) => {
    e?.preventDefault();
    setAppliedFilters({
      sa,
      fo,
      status,
      periode_mulai: periodeMulai,
      periode_selesai: periodeSelesai
    });
  };

  const handleResetFilter = () => {
    setSa('ALL');
    setFo('ALL');
    setStatus('ALL');
    setPeriodeMulai('');
    setPeriodeSelesai('');
    setSelectedPeriod('ALL');
    setAppliedFilters({
      sa: 'ALL',
      fo: 'ALL',
      status: 'ALL',
      periode_mulai: '',
      periode_selesai: ''
    });
  };

  // Fetch summary stats & official sheet baseline
  const { data: summaryData, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard-summary', appliedFilters],
    queryFn: async () => {
      const params = {};
      if (appliedFilters.sa !== 'ALL') params.sa = appliedFilters.sa;
      if (appliedFilters.fo !== 'ALL') params.fo = appliedFilters.fo;
      if (appliedFilters.status !== 'ALL') params.status = appliedFilters.status;
      if (appliedFilters.periode_mulai) params.periode_mulai = appliedFilters.periode_mulai;
      if (appliedFilters.periode_selesai) params.periode_selesai = appliedFilters.periode_selesai;

      const res = await api.get('/dashboard/summary', { params });
      return res.data.data;
    },
    // Keep previous data visible while fetching new data (no blinking/skeleton)
    placeholderData: (previousData) => previousData,
  });

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['rtj-list'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-chart-options'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-chart-analytics'] });
  };

  const currentPeriodLabel = (() => {
    if (selectedPeriod === 'ALL' || (!appliedFilters.periode_mulai && !appliedFilters.periode_selesai)) {
      return 'SEMUA PERIODE';
    }
    const found = availableMonths.find(m => m.key === selectedPeriod);
    if (found) return found.label;
    if (appliedFilters.periode_mulai && appliedFilters.periode_selesai) {
      return `${appliedFilters.periode_mulai} s/d ${appliedFilters.periode_selesai}`;
    }
    if (appliedFilters.periode_mulai) return `Mulai ${appliedFilters.periode_mulai}`;
    return `Sampai ${appliedFilters.periode_selesai}`;
  })();

  const baseline = summaryData?.baselineDashboard || {
    target: { firRate: '98%', successCallRate: '100%' },
    aktual: { firRate: '100%', successCallRate: '100%' },
    overview: {
      periodTitle: currentPeriodLabel,
      unitEntryTotal: 0,
      dataTidakTerFollowUp: 0,
      tidakTerkumpul: 0,
      twc: 0,
      wip: 0,
      others: 0,
      totalUnitFollowUp: 0,
      totalTerhubung: 0,
      totalTidakTerhubung: 0,
      fir: 0,
      nonFir: 0,
      nonFirBreakdown: { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0 },
      tidakTerhubungBreakdown: {
        tidakDiangkat: 0,
        tidakValid: 0,
        tidakAdaNada: 0,
        noTidakTerpasang: 0,
        noSalahSambung: 0,
        noTidakAktif: 0
      }
    },
    scrComposition: [
      { name: 'BANJARMASIN', firRate: '100%', komposisiScr: '0%', komposisiNoScr: '0%' },
      { name: 'SERVICE POINT', firRate: '100%', komposisiScr: '0%', komposisiNoScr: '0%' },
      { name: 'BKT 1, 2 & 3', firRate: '100%', komposisiScr: '0%', komposisiNoScr: '0%' }
    ],
    kpiTable: []
  };

  const latestRTJ = summaryData?.latestRTJ || [];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-3xl text-white shadow-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-toyota-red text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
              Dashboard RTJ
            </span>
            <span className="text-xs text-slate-400 font-medium">Wira Toyota Banjarmasin</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Monitoring RETURN JOB (RTJ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Hasil dan Monitoring Tindak Lanjut Progres Keluhan Dari Follow-Up Service Berkala Unit Pelanggan Secara Terstruktur.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all shadow-md active:scale-95"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
          </button>

          <Link
            to="/statistik"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all shadow-md active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>Matriks Cabang</span>
          </Link>

          <Link
            to="/input-rtj"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-toyota-red hover:bg-toyota-darkRed text-white text-xs font-bold shadow-toyota transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input RTJ Baru</span>
          </Link>
        </div>
      </div>

      {/* TARGET & AKTUAL TOP SUMMARY BOXES (Gambar 1 Header) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Box (Orange Tone) */}
        <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-4 text-white shadow-lg border border-amber-500/40 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-amber-200" />
              <span className="text-sm font-black italic tracking-wide">Target :</span>
            </div>
            <span className="text-[10px] uppercase font-bold bg-black/30 px-2 py-0.5 rounded-full">
              Standard KPI
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold italic text-amber-100 uppercase tracking-wider block">
                  Target FIR Rate
                </span>
                <span className="text-xs text-amber-200 font-medium">Fix It Right</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {baseline.target.firRate}
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold italic text-amber-100 uppercase tracking-wider block">
                  Target Success Call Rate
                </span>
                <span className="text-xs text-amber-200 font-medium">Tingkat Sambung</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {baseline.target.successCallRate}
              </div>
            </div>
          </div>
        </div>

        {/* Aktual Box (Yellow Tone) */}
        <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl p-4 text-slate-950 shadow-lg border border-yellow-300 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-900/15 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-slate-900" />
              <span className="text-sm font-black italic tracking-wide">Aktual :</span>
            </div>
            <span className="text-[10px] uppercase font-bold bg-white/60 px-2 py-0.5 rounded-full text-slate-900">
              Pencapaian Periode
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-slate-900/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black italic text-slate-900 uppercase tracking-wider block">
                  FIR Rate
                </span>
                <span className="text-xs text-slate-700 font-semibold">Aktual fix it right</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {baseline.aktual.firRate}
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-slate-900/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black italic text-slate-900 uppercase tracking-wider block">
                  Success Call Rate
                </span>
                <span className="text-xs text-slate-700 font-semibold">Aktual terhubung</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {baseline.aktual.successCallRate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card">
        <form onSubmit={handleApplyFilter} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                Periode Bulan
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border font-bold text-slate-800"
              >
                <option value="ALL">SEMUA PERIODE</option>
                {availableMonths.map((m) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                Service Advisor
              </label>
              <select
                value={sa}
                onChange={(e) => setSa(e.target.value)}
                className="text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border font-semibold text-slate-800"
              >
                <option value="ALL">Semua SA</option>
                {filterOptions.saList.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                Tanggal Service
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="date"
                  value={periodeMulai}
                  onChange={(e) => {
                    setPeriodeMulai(e.target.value);
                    setSelectedPeriod('CUSTOM');
                  }}
                  className="text-xs rounded-xl border-slate-200 bg-slate-50 p-1.5 border"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="date"
                  value={periodeSelesai}
                  onChange={(e) => {
                    setPeriodeSelesai(e.target.value);
                    setSelectedPeriod('CUSTOM');
                  }}
                  className="text-xs rounded-xl border-slate-200 bg-slate-50 p-1.5 border"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end">
            <button
              type="button"
              onClick={handleResetFilter}
              className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm active:scale-95"
            >
              Terapkan Filter
            </button>
          </div>
        </form>
      </div>

      {/* MAIN DASHBOARD MATRIX & KPI SECTION (GAMBAR 1 EXACT REPLICA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: UE ALL SUMMARY & REASON BREAKDOWN */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Main Blue Card: UE ALL [Bulan/Periode] & Follow Up Stats */}
          <div className="bg-slate-50 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-card">
            
            {/* Header: Dynamic UE ALL Periode */}
            <div className="bg-blue-600 text-white flex items-center justify-between p-3.5 font-black border-b-2 border-slate-800">
              <span className="text-sm tracking-wide uppercase">UE ALL {currentPeriodLabel}</span>
              <span className="text-xl bg-slate-900/40 px-3 py-0.5 rounded-lg border border-white/20">
                {baseline.overview.unitEntryTotal}
              </span>
            </div>

            {/* Unfollowed breakdown rows */}
            <div className="bg-slate-200/90 divide-y divide-slate-300/80 text-xs font-bold">
              <div className="flex items-center justify-between px-3 py-1.5 text-red-600 bg-red-50/60">
                <span>Data tidak terFollow Up</span>
                <span className="font-mono text-red-700 font-extrabold">{baseline.overview.dataTidakTerFollowUp}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 text-slate-700">
                <span>Tidak Terkumpul</span>
                <span className="font-mono text-emerald-700 font-extrabold">{baseline.overview.tidakTerkumpul}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 text-slate-700">
                <span>TWC</span>
                <span className="font-mono text-emerald-700 font-extrabold">{baseline.overview.twc}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 text-slate-700">
                <span>WIP</span>
                <span className="font-mono text-emerald-700 font-extrabold">{baseline.overview.wip}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 text-slate-700">
                <span>Others</span>
                <span className="font-mono text-emerald-700 font-extrabold">{baseline.overview.others}</span>
              </div>
            </div>

            {/* Core Metrics Summary */}
            <div className="divide-y divide-slate-300 text-xs">
              <div className="flex items-center justify-between px-3 py-2 bg-blue-100/80 font-bold text-slate-900">
                <span>Total Unit FollowUp</span>
                <span className="text-sm font-black">{baseline.overview.totalUnitFollowUp}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-blue-100/60 font-bold text-slate-900">
                <span>Total Terhubung</span>
                <span className="text-sm font-black">{baseline.overview.totalTerhubung}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-blue-100/60 font-bold text-red-600">
                <span>Tidak Terhubung</span>
                <span className="text-sm font-black text-red-600">{baseline.overview.totalTidakTerhubung}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-blue-100/40 font-bold text-slate-900">
                <span>FIR</span>
                <span className="text-sm font-black">{baseline.overview.fir}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-blue-100/40 font-bold text-red-600 border-b-2 border-slate-400">
                <span className="underline decoration-red-400 font-black">Non Fir</span>
                <span className="text-sm font-black text-red-600">{baseline.overview.nonFir}</span>
              </div>

              {/* Q1 - Q6 Breakdown */}
              <div className="bg-blue-50/70 divide-y divide-slate-200">
                {['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'].map((qKey) => {
                  const val = baseline.overview.nonFirBreakdown[qKey] || 0;
                  return (
                    <div key={qKey} className="flex items-center justify-between px-4 py-1.5 font-bold text-slate-800">
                      <span className="text-[11px]">{qKey}</span>
                      <span className={`text-xs ${val > 0 ? 'text-slate-950 font-black' : 'text-slate-600'}`}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Tidak Terhubung Header */}
            <div className="bg-blue-200 text-red-600 flex items-center justify-between px-3.5 py-2 font-black text-xs border-t-2 border-b-2 border-slate-800">
              <span>Total Tidak Terhubung :</span>
              <span className="text-sm">{baseline.overview.totalTidakTerhubung}</span>
            </div>

            {/* Detailed Reasons (Peach/Orange background) */}
            <div className="bg-orange-100/80 divide-y divide-orange-200 text-xs font-bold text-slate-900">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span>Tidak Diangkat</span>
                <span className="font-black text-slate-950">{baseline.overview.tidakTerhubungBreakdown.tidakDiangkat}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span>Tidak Valid</span>
                <span className="font-black text-slate-950">{baseline.overview.tidakTerhubungBreakdown.tidakValid}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span>Tidak Ada Nada</span>
                <span className="font-black text-slate-950">{baseline.overview.tidakTerhubungBreakdown.tidakAdaNada}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span>No Tidak Terpasang</span>
                <span className="font-black text-slate-950">{baseline.overview.tidakTerhubungBreakdown.noTidakTerpasang}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span>No Salah Sambung</span>
                <span className="font-black text-slate-950">{baseline.overview.tidakTerhubungBreakdown.noSalahSambung}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span>No Tidak Aktif</span>
                <span className="font-black text-slate-950">{baseline.overview.tidakTerhubungBreakdown.noTidakAktif}</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: SCR COMPOSITION & MAIN KPI MATRIX TABLE */}
        <div className="lg:col-span-8 space-y-6">

          {/* TOP RIGHT MINI TABLE: SCR / ALL UNIT ENTRY */}
          <div className="bg-white rounded-2xl border-2 border-slate-800 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-blue-800 text-white font-black italic tracking-wide text-center">
                    <th className="px-4 py-2.5 border-r border-slate-700 text-left">SCR / ALL UNIT ENTRY</th>
                    <th className="px-4 py-2.5 border-r border-slate-700">FIR Rate</th>
                    <th className="px-4 py-2.5 border-r border-slate-700">Komposisi SCR</th>
                    <th className="px-4 py-2.5">Komposisi No SCR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-bold text-slate-900 text-center">
                  {baseline.scrComposition.map((row, idx) => (
                    <tr key={idx} className="hover:bg-yellow-50/50">
                      <td className="px-4 py-2 text-left font-black bg-slate-100 border-r border-slate-800">
                        {row.name}
                      </td>
                      <td className="px-4 py-2 bg-yellow-200 font-black border-r border-slate-800 text-slate-950">
                        {row.firRate}
                      </td>
                      <td className="px-4 py-2 bg-yellow-100 font-black border-r border-slate-800 text-slate-950">
                        {row.komposisiScr}
                      </td>
                      <td className="px-4 py-2 bg-yellow-100 font-black text-slate-950">
                        {row.komposisiNoScr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MAIN KPI BREAKDOWN TABLE (BJM, SP, BKT, TOTAL) */}
          <div className="bg-white rounded-2xl border-2 border-slate-800 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-blue-200 font-black text-slate-950 text-center border-b-2 border-slate-800">
                    <th rowSpan="2" className="px-4 py-3 text-center text-sm border-r-2 border-slate-800 bg-blue-300">
                      KPI
                    </th>
                    <th className="px-3 py-1.5 border-r border-slate-600 bg-blue-200">BJM</th>
                    <th className="px-3 py-1.5 border-r border-slate-600 bg-blue-200">SP</th>
                    <th className="px-3 py-1.5 border-r-2 border-slate-800 bg-blue-200">BKT</th>
                    <th rowSpan="2" className="px-4 py-3 text-center text-sm bg-blue-300">
                      TOTAL
                    </th>
                  </tr>
                  <tr className="bg-blue-200 font-black text-slate-800 text-center border-b-2 border-slate-800">
                    <th colSpan="3" className="px-3 py-1 text-[11px] uppercase tracking-wider bg-blue-300/80 border-r-2 border-slate-800">
                      UNIT
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400 font-medium text-slate-900 text-center">
                  {baseline.kpiTable.map((row, idx) => {
                    const isTotalEntry = row.kpi === 'Total Unit Entry';
                    const isHarusFU = row.kpi === 'Jumlah Unit Yang Harus di FU';
                    const isBerhasil = row.kpi === 'Jumlah Unit Yang Berhasil di Hubungi';
                    const isPuas = row.kpi === 'Jumlah Pelanggan Puas';
                    const isRate = row.isRate;
                    const isTidakTerhubung = row.kpi === 'TIDAK TERHUBUNG';
                    const isNeg = row.isNegative;

                    let rowBg = 'bg-white';
                    if (isRate) rowBg = 'bg-blue-100/90 font-black italic';
                    else if (isTidakTerhubung) rowBg = 'bg-blue-100/70 font-bold';
                    else if (isNeg) rowBg = 'bg-red-50/60';

                    return (
                      <tr key={idx} className={`${rowBg} hover:bg-blue-50/80 transition-colors`}>
                        <td className={`px-4 py-2 text-left border-r-2 border-slate-800 ${isNeg ? 'text-slate-900 font-semibold' : 'font-bold'}`}>
                          {row.kpi}
                        </td>
                        <td className={`px-3 py-2 border-r border-slate-300 ${isNeg && row.bjm > 0 ? 'text-red-600 font-black' : ''}`}>
                          {row.bjm}
                        </td>
                        <td className={`px-3 py-2 border-r border-slate-300 ${isNeg && row.sp > 0 ? 'text-red-600 font-black' : ''}`}>
                          {row.sp}
                        </td>
                        <td className={`px-3 py-2 border-r-2 border-slate-800 ${isNeg && row.bkt > 0 ? 'text-red-600 font-black' : ''}`}>
                          {row.bkt}
                        </td>
                        <td className={`px-4 py-2 bg-blue-100/50 font-black text-slate-950 ${isNeg && row.total > 0 ? 'text-red-600' : ''}`}>
                          {row.total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* LATEST 5 RTJ RECORDS TABLE & ACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-toyota-red" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Data Transaksi RTJ Terkini</h3>
              <p className="text-xs text-slate-500">Unit follow-up reminder service berkala terbaru di sistem</p>
            </div>
          </div>
          <Link
            to="/data-rtj"
            className="flex items-center space-x-1 text-xs font-bold text-toyota-red hover:text-toyota-darkRed transition-colors"
          >
            <span>Lihat Semua Data RTJ</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
            <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Kat</th>
                <th className="px-4 py-3">Nama Customer</th>
                <th className="px-4 py-3">No. Polisi & Model</th>
                <th className="px-4 py-3">Rincian Keluhan / Service</th>
                <th className="px-4 py-3">SA / FO</th>
                <th className="px-4 py-3">Tgl RTJ</th>
                <th className="px-4 py-3">Status RTJ</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {latestRTJ.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data transaksi RTJ terbaru.
                  </td>
                </tr>
              ) : (
                latestRTJ.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-500">{item.no_urut || idx + 1}</td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={item.kategori_q} />
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {item.nama_customer}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {item.no_polisi}
                      </span>
                      <span className="block text-[11px] text-slate-700 font-bold mt-0.5 uppercase">{item.model}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-700">
                      <p className="line-clamp-2 leading-snug font-medium text-[11px]">
                        {item.service || item.detail_kendala || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="font-bold text-slate-800">SA: {item.sa}</span>
                      <span className="block text-[10px] text-slate-400">FO: {item.fo}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                      {item.tanggal_rtj}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={item.status_rtj} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setStatusModalRtj(item)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        >
                          Ubah Status
                        </button>
                        <Link
                          to={`/data-rtj/${item.id}`}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-toyota-red rounded-lg transition-colors"
                        >
                          Detail
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-Step RTJ Process Diagram */}
      <ProcessFlowDiagram />

      {/* Excel Import Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleRefreshAll}
      />

      {/* Change Status Modal */}
      <ChangeStatusModal
        isOpen={Boolean(statusModalRtj)}
        onClose={() => setStatusModalRtj(null)}
        rtj={statusModalRtj}
        onSuccess={handleRefreshAll}
      />
    </div>
  );
}
