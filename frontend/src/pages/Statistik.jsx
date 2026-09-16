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
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import StatCard from '../components/common/StatCard';
import CategoryBadge from '../components/common/CategoryBadge';

const STATUS_COLORS = {
  Completed: '#10B981',
  Scheduled: '#3B82F6',
  Pending: '#F59E0B',
  Rescheduled: '#EF4444'
};

export default function Statistik() {
  const [sa, setSa] = useState('ALL');
  const [periodeMulai, setPeriodeMulai] = useState('');
  const [periodeSelesai, setPeriodeSelesai] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    sa: 'ALL',
    periode_mulai: '',
    periode_selesai: ''
  });

  const handleApplyFilter = (e) => {
    e.preventDefault();
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
    setAppliedFilters({
      sa: 'ALL',
      periode_mulai: '',
      periode_selesai: ''
    });
  };

  // Fetch summary
  const { data: summaryData } = useQuery({
    queryKey: ['dashboard-summary', appliedFilters],
    queryFn: async () => {
      const params = {};
      if (appliedFilters.sa !== 'ALL') params.sa = appliedFilters.sa;
      if (appliedFilters.periode_mulai) params.periode_mulai = appliedFilters.periode_mulai;
      if (appliedFilters.periode_selesai) params.periode_selesai = appliedFilters.periode_selesai;

      const res = await api.get('/dashboard/summary', { params });
      return res.data.data;
    }
  });

  // Fetch chart data
  const { data: chartData } = useQuery({
    queryKey: ['dashboard-chart-analytics', appliedFilters],
    queryFn: async () => {
      const params = {};
      if (appliedFilters.sa !== 'ALL') params.sa = appliedFilters.sa;
      if (appliedFilters.periode_mulai) params.periode_mulai = appliedFilters.periode_mulai;
      if (appliedFilters.periode_selesai) params.periode_selesai = appliedFilters.periode_selesai;

      const res = await api.get('/dashboard/chart', { params });
      return res.data.data;
    }
  });

  const summary = summaryData || {
    total: 0,
    completed: { count: 0, percentage: 0 },
    scheduled: { count: 0, percentage: 0 },
    pending: { count: 0, percentage: 0 },
    rescheduled: { count: 0, percentage: 0 },
    qBreakdown: {}
  };

  const donutData = chartData?.donutData || [];
  const saData = chartData?.saData || [];
  const saList = chartData?.filterOptions?.saList || ['Riza Anshari', 'Ahmad Fauzi'];

  const qBreakdown = summary.qBreakdown || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-toyota-red"></span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Statistik & Analisis RTJ
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik distribusi status follow-up dan produktivitas Service Advisor Wira Toyota
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card">
        <form onSubmit={handleApplyFilter} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <select
                value={sa}
                onChange={(e) => setSa(e.target.value)}
                className="text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 border font-semibold"
              >
                <option value="ALL">Semua Service Advisor</option>
                {saList.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Periode:</span>
              <input
                type="date"
                value={periodeMulai}
                onChange={(e) => setPeriodeMulai(e.target.value)}
                className="text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border"
              />
              <span className="text-slate-400 text-xs">s/d</span>
              <input
                type="date"
                value={periodeSelesai}
                onChange={(e) => setPeriodeSelesai(e.target.value)}
                className="text-xs rounded-xl border-slate-200 bg-slate-50 p-2 border"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
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
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
            >
              Terapkan Filter
            </button>
          </div>
        </form>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Follow-Up RTJ"
          value={summary.total}
          subtext="Semua kategori Q1–Q5"
          icon={ClipboardList}
          color="toyota"
        />
        <StatCard
          title="Tuntas (Completed)"
          value={summary.completed.count}
          percentage={summary.completed.percentage}
          subtext="Berhasil dikonfirmasi"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Tertunda (Pending)"
          value={summary.pending.count}
          percentage={summary.pending.percentage}
          subtext="Menunggu kabar customer"
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Jadwal Ulang"
          value={summary.rescheduled.count}
          percentage={summary.rescheduled.percentage}
          subtext="Rescheduled / Part pending"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Rekap Status RTJ */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-toyota-red" />
              <h3 className="text-sm font-bold text-slate-900">Rekap Proporsi Status RTJ</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Persentase keberhasilan tindak lanjut follow-up service
            </p>
          </div>

          <div className="h-64 my-4 flex items-center justify-center">
            {summary.total === 0 ? (
              <div className="text-xs text-slate-400">Tidak ada data untuk ditampilkan</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Unit (${summary.total > 0 ? ((val/summary.total)*100).toFixed(1) : 0}%)`, name]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend Details */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
            {donutData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2 text-xs">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">{item.name}:</span>
                <strong className="text-slate-900">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked Bar Chart: Perbandingan per SA */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-toyota-red" />
              <h3 className="text-sm font-bold text-slate-900">Perbandingan Beban & Status per SA</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Jumlah unit RTJ per Service Advisor dipecah berdasarkan status penanganan
            </p>
          </div>

          <div className="h-72 my-4">
            {saData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Tidak ada data perbandingan SA
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={saData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="sa" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Completed" stackId="a" fill={STATUS_COLORS.Completed} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Scheduled" stackId="a" fill={STATUS_COLORS.Scheduled} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Pending" stackId="a" fill={STATUS_COLORS.Pending} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Rescheduled" stackId="a" fill={STATUS_COLORS.Rescheduled} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Performa Tertinggi:</span>
            <strong className="text-slate-900">
              {saData[0] ? `${saData[0].sa} (${saData[0].total} Unit RTJ)` : '-'}
            </strong>
          </div>
        </div>
      </div>

      {/* Kategori Q1 - Q5 Breakdown Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Layers className="w-5 h-5 text-toyota-red" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Dashboard & Rekapitulasi Kategori Q1–Q5
            </h3>
            <p className="text-xs text-slate-500">
              Distribusi klasifikasi follow-up berdasarkan kategori periode service dan keluhan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {['Q1', 'Q2', 'Q3', 'Q4', 'Q5'].map((qKey) => {
            const item = qBreakdown[qKey] || { count: 0, desc: '-' };
            const pct = summary.total > 0 ? ((item.count / summary.total) * 100).toFixed(1) : 0;
            return (
              <div key={qKey} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <CategoryBadge category={qKey} />
                  <span className="text-xs font-bold text-slate-500">{pct}%</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 mt-2">{item.count} <span className="text-xs font-normal text-slate-400">Unit</span></h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2" title={item.desc}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
