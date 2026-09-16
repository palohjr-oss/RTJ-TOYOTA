import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  UploadCloud, 
  PlusCircle, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Trash2, 
  RefreshCw, 
  ArrowUpDown,
  FileSpreadsheet,
  Car,
  Wrench,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import ImportExcelModal from '../components/common/ImportExcelModal';
import ChangeStatusModal from '../components/common/ChangeStatusModal';

export default function DataRTJ() {
  const queryClient = useQueryClient();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [statusModalRtj, setStatusModalRtj] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');

  // Get current user from localStorage
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('rtj_user') || '{}'); } catch { return {}; } })();

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [sa, setSa] = useState('ALL');
  const [fo, setFo] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [kategoriQ, setKategoriQ] = useState('ALL');
  const [periodeMulai, setPeriodeMulai] = useState('');
  const [periodeSelesai, setPeriodeSelesai] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('tanggal_service');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch RTJ List
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['rtj-list', { search, sa, fo, status, kategoriQ, periodeMulai, periodeSelesai, page, limit, sortBy, sortOrder }],
    queryFn: async () => {
      const params = {
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      if (search) params.search = search;
      if (sa !== 'ALL') params.sa = sa;
      if (fo !== 'ALL') params.fo = fo;
      if (status !== 'ALL') params.status = status;
      if (kategoriQ !== 'ALL') params.kategori_q = kategoriQ;
      if (periodeMulai) params.periode_mulai = periodeMulai;
      if (periodeSelesai) params.periode_selesai = periodeSelesai;

      const res = await api.get('/rtj', { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  // Fetch chart options for filter dropdowns
  const { data: chartData } = useQuery({
    queryKey: ['dashboard-chart-options'],
    queryFn: async () => {
      const res = await api.get('/dashboard/chart');
      return res.data.data;
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/rtj/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtj-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Gagal menghapus data.');
    }
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/rtj');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rtj-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-chart-options'] });
      setShowDeleteAllModal(false);
      setDeleteAllConfirmText('');
      alert(`✅ ${data.message}`);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Gagal menghapus semua data.');
    }
  });

  const handleDelete = (id, customerName) => {
    if (window.confirm(`Yakin ingin menghapus data RTJ pelanggan "${customerName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteAll = () => {
    if (deleteAllConfirmText.trim() === 'HAPUS SEMUA') {
      deleteAllMutation.mutate();
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/rtj/export-template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_RTJ_Wira_Toyota_Banjarmasin.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Download template error:', error);
      alert('Gagal mengunduh template Excel.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSa('ALL');
    setFo('ALL');
    setStatus('ALL');
    setKategoriQ('ALL');
    setPeriodeMulai('');
    setPeriodeSelesai('');
    setPage(1);
  };

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const records = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const filterOptions = chartData?.filterOptions || {
    saList: ['SUGIANTO', 'SP BATUBARA', 'RUDI', 'RONY', 'WAYAN', 'FAJAR'],
    foList: ['Sapruddin', 'Joko prasetyo', 'Muhammad', 'Fahrurrazi'],
    kategoriList: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
    statusList: ['Scheduled', 'Completed', 'Pending', 'Rescheduled']
  };

  const startRecord = (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-5">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-toyota-red"></span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Data Remind Tracking Job (RTJ)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar monitoring follow-up reminder service berkala pelanggan Wira Toyota Banjarmasin
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            title="Download Template Format Excel Wira Toyota"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Format Excel</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-xs"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
          </button>

          {currentUser?.role === 'Admin' && (
            <button
              onClick={() => { setShowDeleteAllModal(true); setDeleteAllConfirmText(''); }}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all shadow-xs"
              title="Hapus Semua Data RTJ (Admin Only)"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Hapus Semua</span>
            </button>
          )}

          <Link
            to="/input-rtj"
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-toyota-red hover:bg-toyota-darkRed rounded-xl shadow-toyota transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input RTJ</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Cari Data (Customer / Nopol / Service / Teknisi)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Ketik nama, nopol, unit..."
                className="w-full text-xs rounded-xl border-slate-200 pl-9 pr-3 py-2 border bg-slate-50/50 focus:ring-1 focus:ring-toyota-red focus:border-toyota-red font-medium"
              />
            </div>
          </div>

          {/* Filter Kategori Q */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Kategori Q (Q1-Q5)
            </label>
            <select
              value={kategoriQ}
              onChange={(e) => { setKategoriQ(e.target.value); setPage(1); }}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50/50 py-2 px-3 border focus:ring-1 focus:ring-toyota-red focus:border-toyota-red font-medium"
            >
              <option value="ALL">Semua Kategori (Q1–Q5)</option>
              {filterOptions.kategoriList.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Status RTJ
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50/50 py-2 px-3 border focus:ring-1 focus:ring-toyota-red focus:border-toyota-red font-medium"
            >
              <option value="ALL">Semua Status</option>
              {filterOptions.statusList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Filter SA */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Service Advisor (SA)
            </label>
            <select
              value={sa}
              onChange={(e) => { setSa(e.target.value); setPage(1); }}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50/50 py-2 px-3 border focus:ring-1 focus:ring-toyota-red focus:border-toyota-red font-medium"
            >
              <option value="ALL">Semua SA</option>
              {filterOptions.saList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-slate-500">Periode:</span>
              <input
                type="date"
                value={periodeMulai}
                onChange={(e) => { setPeriodeMulai(e.target.value); setPage(1); }}
                className="text-[11px] rounded-lg border-slate-200 bg-slate-50 p-1.5 border"
              />
              <span className="text-slate-400 text-xs">s/d</span>
              <input
                type="date"
                value={periodeSelesai}
                onChange={(e) => { setPeriodeSelesai(e.target.value); setPage(1); }}
                className="text-[11px] rounded-lg border-slate-200 bg-slate-50 p-1.5 border"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-slate-500">FO:</span>
              <select
                value={fo}
                onChange={(e) => { setFo(e.target.value); setPage(1); }}
                className="text-[11px] rounded-lg border-slate-200 bg-slate-50 p-1.5 border"
              >
                <option value="ALL">Semua FO</option>
                {filterOptions.foList.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-toyota-red transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        {/* Table top info */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 text-xs text-slate-600">
          <div>
            {pagination.total > 0 ? (
              <span>
                Menampilkan <strong className="text-slate-900">{startRecord}–{endRecord}</strong> dari <strong className="text-slate-900">{pagination.total}</strong> data RTJ
              </span>
            ) : (
              <span>Tidak ada data</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Baris:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="text-xs rounded-lg border-slate-200 bg-white p-1 border font-semibold"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
            <thead className="bg-slate-100/70 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-3 w-10 text-center">No</th>
                <th className="px-2.5 py-3 w-12 text-center">Kat</th>
                <th 
                  onClick={() => toggleSort('tanggal_service')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200/60 transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>Tgl Service</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-3">No. Polisi & Unit</th>
                <th 
                  onClick={() => toggleSort('nama_customer')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/60 transition-colors select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Customer</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 max-w-xs">Service & Kendala</th>
                <th className="px-3 py-3">Petugas (SA/FO/Teknisi)</th>
                <th className="px-3 py-3 whitespace-nowrap">Tgl RTJ</th>
                <th className="px-3 py-3 text-center">Status RTJ</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-slate-400">
                    Memuat data RTJ...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">Tidak ada data yang ditemukan.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Coba sesuaikan filter pencarian atau import data baru.</p>
                  </td>
                </tr>
              ) : (
                records.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-3 text-center font-semibold text-slate-500">
                      {item.no_urut || startRecord + idx}
                    </td>
                    <td className="px-2.5 py-3 text-center">
                      <CategoryBadge category={item.kategori_q} />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-700 font-medium">
                      {item.tanggal_service}
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
                        {item.no_polisi}
                      </span>
                      <p className="text-[11px] text-slate-700 font-bold mt-0.5 uppercase">
                        {item.model}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 leading-snug">
                        {item.nama_customer}
                      </div>
                      {item.no_hp && (
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {item.no_hp}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {item.service && (
                        <p className="text-[11px] font-semibold text-slate-800 line-clamp-2 leading-tight">
                          {item.service}
                        </p>
                      )}
                      {item.detail_kendala && (
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 italic">
                          {item.detail_kendala}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-[11px]">
                      <div className="font-bold text-slate-800">SA: {item.sa}</div>
                      <div className="text-slate-500 text-[10px]">FO: {item.fo}</div>
                      {item.teknisi && item.teknisi !== '-' && (
                        <div className="text-slate-400 text-[10px]">Tek: {item.teknisi}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-600 font-medium">
                      <div>{item.tanggal_rtj || '-'}</div>
                      {item.keterangan && (
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 line-clamp-1">
                          {item.keterangan}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <StatusBadge status={item.status_rtj} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setStatusModalRtj(item)}
                          title="Ubah Status Follow-Up"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/data-rtj/${item.id}`}
                          title="Lihat Detail & Riwayat Status"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.nama_customer)}
                          title="Hapus Data"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-slate-100 gap-3">
          <div className="text-xs text-slate-500">
            Halaman <strong className="text-slate-800">{pagination.page}</strong> dari <strong className="text-slate-800">{pagination.totalPages}</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={pagination.page <= 1}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="text-xs font-bold text-slate-700 px-2">
              {pagination.page}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Excel Import Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['rtj-list'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-chart-options'] });
        }}
      />

      {/* Quick Change Status Modal */}
      <ChangeStatusModal
        isOpen={Boolean(statusModalRtj)}
        onClose={() => setStatusModalRtj(null)}
        rtj={statusModalRtj}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['rtj-list'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        }}
      />

      {/* Modal Konfirmasi Hapus Semua Data */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleteAllMutation.isPending && setShowDeleteAllModal(false)}
          />
          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 border border-red-100 animate-[fadeInScale_0.2s_ease-out]">
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-center text-lg font-extrabold text-slate-900 mb-1">
              Hapus Semua Data RTJ?
            </h3>
            <p className="text-center text-sm text-slate-500 mb-5">
              Tindakan ini akan menghapus <span className="font-bold text-red-600">SELURUH</span> data RTJ
              dan history secara permanen dan <span className="font-bold">tidak dapat dibatalkan</span>.
            </p>

            {/* Jumlah data */}
            <div className="flex items-center justify-center gap-2 mb-5 py-2.5 bg-red-50 rounded-xl border border-red-200">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-red-700">
                Total data yang akan dihapus: <span className="text-red-600">{pagination.total} record</span>
              </span>
            </div>

            {/* Konfirmasi ketik */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Ketik <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-red-700 font-extrabold">HAPUS SEMUA</span> untuk konfirmasi:
              </label>
              <input
                type="text"
                value={deleteAllConfirmText}
                onChange={(e) => setDeleteAllConfirmText(e.target.value)}
                placeholder="Ketik: HAPUS SEMUA"
                className="w-full text-sm font-mono rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none transition-all"
                autoFocus
                disabled={deleteAllMutation.isPending}
                onKeyDown={(e) => e.key === 'Enter' && handleDeleteAll()}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                disabled={deleteAllMutation.isPending}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleteAllConfirmText.trim() !== 'HAPUS SEMUA' || deleteAllMutation.isPending}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteAllMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Semua</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
