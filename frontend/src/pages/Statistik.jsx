import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Filter, 
  RotateCcw, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
  Download,
  Building2,
  PhoneCall,
  PhoneOff,
  CheckCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../api/client';
import StatCard from '../components/common/StatCard';
import CategoryBadge from '../components/common/CategoryBadge';

export default function Statistik() {
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [sa, setSa] = useState('ALL');
  const [periodeMulai, setPeriodeMulai] = useState('');
  const [periodeSelesai, setPeriodeSelesai] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    sa: 'ALL',
    periode_mulai: '',
    periode_selesai: ''
  });

  // Fetch chart & matrix data - gunakan queryKey yang sama dengan Dashboard agar memanfaatkan cache
  const { data: chartOptionsData } = useQuery({
    queryKey: ['dashboard-chart-options'],
    queryFn: async () => {
      const res = await api.get('/dashboard/chart');
      return res.data.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['dashboard-chart-analytics', appliedFilters],
    queryFn: async () => {
      const params = {};
      if (appliedFilters.sa !== 'ALL') params.sa = appliedFilters.sa;
      if (appliedFilters.periode_mulai) params.periode_mulai = appliedFilters.periode_mulai;
      if (appliedFilters.periode_selesai) params.periode_selesai = appliedFilters.periode_selesai;

      const res = await api.get('/dashboard/chart', { params });
      return res.data.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const availableMonths = chartOptionsData?.filterOptions?.availableMonths || chartData?.filterOptions?.availableMonths || [];
  const saList = chartOptionsData?.filterOptions?.saList || chartData?.filterOptions?.saList || [];

  // Auto-select bulan terbaru saat pertama load
  React.useEffect(() => {
    if (availableMonths.length > 0 && selectedPeriod === 'ALL') {
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
  }, [chartOptionsData]);


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
      periode_mulai: periodeMulai,
      periode_selesai: periodeSelesai
    });
  };

  const handleResetFilter = () => {
    setSa('ALL');
    setPeriodeMulai('');
    setPeriodeSelesai('');
    setSelectedPeriod('ALL');
    setAppliedFilters({
      sa: 'ALL',
      periode_mulai: '',
      periode_selesai: ''
    });
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

  const branchColumns = chartData?.branchColumns || [
    { key: 'bjm_all', label: 'BJM ALL', isTotal: true },
    { key: 'bjm_saja', label: 'BJM SAJA' },
    { key: 'sp_km2', label: 'SP KM2' },
    { key: 'sp_plh', label: 'SP PLH' },
    { key: 'sp_btl', label: 'SP BTL' },
    { key: 'sp_ktb', label: 'SP KTB' },
    { key: 'sp_mrb', label: 'SP MRB' },
    { key: 'bkt_1', label: 'BKT 1' },
    { key: 'bkt_2', label: 'BKT 2' },
    { key: 'bkt_3', label: 'BKT 3' },
    { key: 'bkt_4', label: 'BKT 4' },
    { key: 'bkt_5', label: 'BKT 5' },
    { key: 'bkt_6', label: 'BKT 6' }
  ];

  // Data real dari API - kosong jika belum ada data
  const branchMatrixRows = chartData?.branchMatrixRows || [];

  // Export Matrix Table to Excel
  const handleExportExcel = () => {
    const tableData = branchMatrixRows.map((row) => {
      const rowObj = { 'Kategori / Baris': row.label };
      branchColumns.forEach((col) => {
        rowObj[col.label] = row.values[col.key] !== undefined ? row.values[col.key] : 0;
      });
      return rowObj;
    });

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistik Cabang RTJ');
    XLSX.writeFile(wb, `Statistik_RTJ_Per_Cabang_${selectedPeriod.replace(/\s+/g, '_')}.xlsx`);
  };

  // Branch Chart Data
  const branchComparisonChartData = [
    { name: 'BJM SAJA', UnitEntry: 809, FollowUp: 783, FIR: 662 },
    { name: 'SP KM2', UnitEntry: 107, FollowUp: 106, FIR: 84 },
    { name: 'SP PLH', UnitEntry: 109, FollowUp: 109, FIR: 95 },
    { name: 'SP BTL', UnitEntry: 290, FollowUp: 289, FIR: 245 },
    { name: 'SP KTB', UnitEntry: 92, FollowUp: 92, FIR: 78 },
    { name: 'SP MRB', UnitEntry: 39, FollowUp: 39, FIR: 37 },
    { name: 'BKT 3', UnitEntry: 46, FollowUp: 46, FIR: 45 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-3xl text-white shadow-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-toyota-red"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Wira Toyota Banjarmasin
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            Statistik & Rekapitulasi RTJ Per Cabang
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Matriks lengkap perbandingan performa Follow-Up, FIR, Non-FIR, dan detail Tidak Terhubung per Bengkel / Service Point / BKT.
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

      {/* Filter Bar */}
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
                {saList.map((item) => (
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

      {/* Top 6 Quick Summary Badges (Real Dynamic from Active Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-blue-900 text-white p-3.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Unit Entry</span>
          <div className="text-2xl font-black mt-0.5">
            {(branchMatrixRows.find(r => r.id === 'unit_entry')?.values?.bjm_all || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-blue-200">Total unit masuk</span>
        </div>
        <div className="bg-indigo-900 text-white p-3.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 block">Follow Up</span>
          <div className="text-2xl font-black mt-0.5">
            {(branchMatrixRows.find(r => r.id === 'unit_follow_up')?.values?.bjm_all || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-indigo-200">Unit di-follow up</span>
        </div>
        <div className="bg-emerald-900 text-white p-3.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Sudah di CALL</span>
          <div className="text-2xl font-black mt-0.5">
            {(branchMatrixRows.find(r => r.id === 'unit_sudah_call')?.values?.bjm_all || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-200">Unit terhubung</span>
        </div>
        <div className="bg-teal-900 text-white p-3.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 block">FIR Total</span>
          <div className="text-2xl font-black mt-0.5">
            {(branchMatrixRows.find(r => r.id === 'fir')?.values?.bjm_all || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-teal-200">Fix It Right (Puas)</span>
        </div>
        <div className="bg-rose-950 text-white p-3.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">NON-FIR Total</span>
          <div className="text-2xl font-black mt-0.5 text-rose-400">
            {['non_fir_q1', 'non_fir_q2', 'non_fir_q3', 'non_fir_q4', 'non_fir_q5', 'non_fir_q6'].reduce((acc, k) => acc + (branchMatrixRows.find(r => r.id === k)?.values?.bjm_all || 0), 0)}
          </div>
          <span className="text-[10px] text-rose-300">Ada keluhan</span>
        </div>
        <div className="bg-amber-950 text-white p-3.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">Tidak Terhubung</span>
          <div className="text-2xl font-black mt-0.5 text-amber-400">
            {(branchMatrixRows.find(r => r.id === 'td')?.values?.bjm_all || 0) + (branchMatrixRows.find(r => r.id === 'ta')?.values?.bjm_all || 0) + (branchMatrixRows.find(r => r.id === 'tv')?.values?.bjm_all || 0)}
          </div>
          <span className="text-[10px] text-amber-300">TD, TA, TV</span>
        </div>
      </div>

      {/* FULL BRANCH BREAKDOWN MATRIX TABLE (GAMBAR 2 EXACT REPLICA) */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-center border-collapse">
            
            {/* Table Header: UNIT ENTRY in Blue, Branch names in RED */}
            <thead>
              <tr className="border-b-2 border-slate-900 font-black">
                <th className="px-4 py-3 text-white bg-blue-600 border-r-2 border-slate-900 text-left uppercase tracking-wider min-w-[180px]">
                  UNIT ENTRY
                </th>
                {branchColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-3 text-white border-r border-slate-800 uppercase tracking-wider whitespace-nowrap min-w-[70px] ${
                      col.isTotal ? 'bg-red-700 font-black text-sm' : 'bg-red-600 font-bold'
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body with Image 2 Styling */}
            <tbody className="divide-y divide-slate-800 font-medium text-slate-900">
              {branchMatrixRows.map((row) => {
                const isBluePrimary = row.type === 'blue_primary';
                const isSoftBlue = row.type === 'soft_blue';
                const isSoftRed = row.type === 'soft_red';
                const isNeutral = row.type === 'neutral';
                const isRedDanger = row.type === 'red_danger';
                const isYellowWarning = row.type === 'yellow_warning';

                // Background classes
                let labelBg = 'bg-white';
                let cellBg = 'bg-white';

                if (isBluePrimary) {
                  labelBg = 'bg-blue-500 text-white font-black';
                  cellBg = 'bg-blue-400/80 font-black text-slate-950';
                } else if (isSoftBlue) {
                  labelBg = 'bg-blue-100 text-slate-900 font-bold';
                  cellBg = 'bg-blue-50/70 font-semibold text-slate-900';
                } else if (isSoftRed) {
                  labelBg = 'bg-rose-200 text-rose-950 font-bold';
                  cellBg = 'bg-rose-100 font-semibold text-rose-950';
                } else if (isNeutral) {
                  labelBg = 'bg-slate-200 text-slate-900 font-black';
                  cellBg = 'bg-slate-50 font-bold text-slate-900';
                } else if (isRedDanger) {
                  labelBg = 'bg-red-600 text-white font-bold';
                  cellBg = 'bg-rose-200/90 font-bold text-slate-900';
                } else if (isYellowWarning) {
                  labelBg = 'bg-yellow-400 text-slate-950 font-bold';
                  cellBg = 'bg-amber-100/80 font-bold text-slate-900';
                }

                return (
                  <tr key={row.id} className="hover:opacity-95 transition-opacity">
                    {/* Row Header Cell */}
                    <td className={`px-4 py-2.5 text-left border-r-2 border-slate-900 whitespace-nowrap ${labelBg}`}>
                      {row.label}
                    </td>

                    {/* Column Data Cells */}
                    {branchColumns.map((col) => {
                      const val = row.values[col.key] !== undefined ? row.values[col.key] : 0;
                      const isHighlighted = val > 0 && (isRedDanger || isYellowWarning || isSoftRed);

                      return (
                        <td
                          key={col.key}
                          className={`px-3 py-2 border-r border-slate-400 ${cellBg} ${
                            col.isTotal ? 'font-black text-slate-950' : ''
                          } ${isHighlighted ? 'text-slate-950 font-bold' : ''}`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

      {/* VISUAL ANALYTICS & BAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Branch Performance Comparison Bar Chart (Real Dynamic) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-toyota-red" />
                <h3 className="text-sm font-bold text-slate-900">Performa Follow-Up & FIR Per Bengkel / SP</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan Real Unit Entry, Unit Follow-Up, dan Hasil Pelanggan Puas (FIR)
              </p>
            </div>
            <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
              {selectedPeriod}
            </span>
          </div>

          <div className="h-72 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={branchColumns.filter(c => !c.isTotal).map(col => {
                  const ue = branchMatrixRows.find(r => r.id === 'unit_entry')?.values[col.key] || 0;
                  const fu = branchMatrixRows.find(r => r.id === 'unit_follow_up')?.values[col.key] || 0;
                  const fir = branchMatrixRows.find(r => r.id === 'fir')?.values[col.key] || 0;
                  return {
                    name: col.label,
                    UnitEntry: ue,
                    FollowUp: fu,
                    FIR: fir
                  };
                })}
                margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="UnitEntry" name="Unit Entry" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="FollowUp" name="Follow Up" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="FIR" name="FIR (Puas)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reason Distribution Donut (Real Dynamic) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Distribusi Alasan Tidak Terhubung</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian unit yang belum/tidak berhasil dihubungi saat follow-up
            </p>
          </div>

          {(() => {
            const tdVal = branchMatrixRows.find(r => r.id === 'td')?.values?.bjm_all || 0;
            const taVal = branchMatrixRows.find(r => r.id === 'ta')?.values?.bjm_all || 0;
            const tvVal = branchMatrixRows.find(r => r.id === 'tv')?.values?.bjm_all || 0;
            const totalTidak = tdVal + taVal + tvVal || 1;

            return (
              <div className="my-4 flex flex-col items-center justify-center">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tidak Diangkat (TD)', value: tdVal, color: '#F59E0B' },
                          { name: 'No Tidak Aktif (TA)', value: taVal, color: '#EF4444' },
                          { name: 'Tidak Valid (TV)', value: tvVal, color: '#8B5CF6' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="#F59E0B" />
                        <Cell fill="#EF4444" />
                        <Cell fill="#8B5CF6" />
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [`${val} Unit (${((val/totalTidak)*100).toFixed(1)}%)`, name]}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>Tidak Diangkat (TD)</span>
                    </span>
                    <span className="font-bold text-slate-900">{tdVal} ({((tdVal/totalTidak)*100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span>No Tidak Aktif (TA)</span>
                    </span>
                    <span className="font-bold text-slate-900">{taVal} ({((taVal/totalTidak)*100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      <span>Tidak Valid (TV)</span>
                    </span>
                    <span className="font-bold text-slate-900">{tvVal} ({((tvVal/totalTidak)*100).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

      </div>

    </div>
  );
}
