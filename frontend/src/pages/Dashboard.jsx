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
  ChevronRight
} from 'lucide-react';
import api from '../api/client';
import StatCard from '../components/common/StatCard';
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

  const handleApplyFilter = (e) => {
    e.preventDefault();
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
    setAppliedFilters({
      sa: 'ALL',
      fo: 'ALL',
      status: 'ALL',
      periode_mulai: '',
      periode_selesai: ''
    });
  };

  // Fetch summary stats
  const { data: summaryData } = useQuery({
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
    }
  });

  // Fetch chart / filter options
  const { data: chartData } = useQuery({
    queryKey: ['dashboard-chart-options'],
    queryFn: async () => {
      const res = await api.get('/dashboard/chart');
      return res.data.data;
    }
  });

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['rtj-list'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-chart-options'] });
  };

  const summary = summaryData || {
    total: 0,
    completed: { count: 0, percentage: 0 },
    scheduled: { count: 0, percentage: 0 },
    pending: { count: 0, percentage: 0 },
    rescheduled: { count: 0, percentage: 0 },
    latestRTJ: []
  };

  const filterOptions = chartData?.filterOptions || {
    saList: ['SUGIANTO', 'SP BATUBARA', 'RUDI', 'RONY', 'WAYAN', 'FAJAR'],
    foList: ['Sapruddin', 'Joko prasetyo', 'Muhammad', 'Fahrurrazi'],
    statusList: ['Scheduled', 'Completed', 'Pending', 'Rescheduled']
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-3xl text-white shadow-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-extrabold uppercase tracking-wider">
              Dashboard RTJ
            </span>
            <span className="text-xs text-slate-400">Wira Toyota Banjarmasin</span>
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
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all shadow-md"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
          </button>

          <Link
            to="/input-rtj"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-toyota-red hover:bg-toyota-darkRed text-white text-xs font-bold shadow-toyota transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input RTJ Baru</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total RTJ Terdata"
          value={summary.total}
          subtext="Semua unit terdaftar"
          icon={ClipboardList}
          color="toyota"
        />
        <StatCard
          title="Status Completed"
          value={summary.completed.count}
          percentage={summary.completed.percentage}
          subtext="Berhasil di-follow up"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Status Pending"
          value={summary.pending.count}
          percentage={summary.pending.percentage}
          subtext="Menunggu respon customer"
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Status Rescheduled"
          value={summary.rescheduled.count}
          percentage={summary.rescheduled.percentage}
          subtext="Dijadwalkan ulang"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
        <form onSubmit={handleApplyFilter} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-toyota-red" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Filter Data Dashboard
              </h4>
            </div>
            <button
              type="button"
              onClick={handleResetFilter}
              className="flex items-center space-x-1 text-xs text-slate-500 hover:text-toyota-red font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Filter SA */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Service Advisor (SA)
              </label>
              <select
                value={sa}
                onChange={(e) => setSa(e.target.value)}
                className="w-full text-xs rounded-xl border-slate-200 bg-slate-50/50 p-2.5 border focus:ring-1 focus:ring-toyota-red focus:border-toyota-red font-medium"
              >
                <option value="ALL">Semua Service Advisor</option>
                {filterOptions.saList.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Filter FO */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Front Officer (FO)
              </label>
              <select
                value={fo}
                onChange={(e) => setFo(e.target.value)}
                className="w-full text-xs rounded-xl border-slate-200 bg-slate-50/50 p-2.5 border focus:ring-1 focus:ring-toyota-red focus:border-toyota-red font-medium"
              >
                <option value="ALL">Semua Front Officer</option>
                {filterOptions.foList.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Status RTJ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs rounded-xl border-slate-200 bg-slate-50/50 p-2.5 border focus:ring-1 focus:ring-toyota-red focus:border-toyota-red font-medium"
              >
                <option value="ALL">Semua Status</option>
                {filterOptions.statusList.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Filter Periode */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Periode Tanggal Service
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  value={periodeMulai}
                  onChange={(e) => setPeriodeMulai(e.target.value)}
                  className="w-full text-[11px] rounded-xl border-slate-200 bg-slate-50/50 p-2 border focus:ring-1 focus:ring-toyota-red"
                  title="Dari Tanggal"
                />
                <input
                  type="date"
                  value={periodeSelesai}
                  onChange={(e) => setPeriodeSelesai(e.target.value)}
                  className="w-full text-[11px] rounded-xl border-slate-200 bg-slate-50/50 p-2 border focus:ring-1 focus:ring-toyota-red"
                  title="Sampai Tanggal"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              Terapkan Filter
            </button>
          </div>
        </form>
      </div>

      {/* Latest 5 RTJ Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-toyota-red" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Data RTJ Terbaru</h3>
              <p className="text-xs text-slate-500">Unit follow-up reminder service berkala terbaru</p>
            </div>
          </div>
          <Link
            to="/data-rtj"
            className="flex items-center space-x-1 text-xs font-bold text-toyota-red hover:text-toyota-darkRed transition-colors"
          >
            <span>Lihat Semua Data</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
            <thead className="bg-slate-50/80 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Kat</th>
                <th className="px-4 py-3">Nama Customer</th>
                <th className="px-4 py-3">No. Polisi & UNIT</th>
                <th className="px-4 py-3">Rincian SERVICE</th>
                <th className="px-4 py-3">SA / FO</th>
                <th className="px-4 py-3">Tgl RTJ</th>
                <th className="px-4 py-3">Status RTJ</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {summary.latestRTJ.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data RTJ yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                summary.latestRTJ.map((item, idx) => (
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

      {/* 5-Step Process Flow Diagram */}
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
