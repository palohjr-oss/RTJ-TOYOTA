import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  User, 
  Car, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  History, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  Wrench
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import ChangeStatusModal from '../components/common/ChangeStatusModal';
import Modal from '../components/common/Modal';

export default function DetailRTJ() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Fetch RTJ Detail
  const { data, isLoading, isError } = useQuery({
    queryKey: ['rtj-detail', id],
    queryFn: async () => {
      const res = await api.get(`/rtj/${id}`);
      return res.data.data;
    }
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/rtj/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtj-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['rtj-list'] });
      setIsEditModalOpen(false);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/rtj/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtj-list'] });
      navigate('/data-rtj');
    }
  });

  const handleOpenEdit = () => {
    if (data) {
      setEditFormData({
        nama_customer: data.nama_customer,
        no_polisi: data.no_polisi,
        no_hp: data.no_hp || '',
        model: data.model,
        service: data.service || '',
        sa: data.sa,
        fo: data.fo,
        teknisi: data.teknisi || '',
        km_service: data.km_service || 0,
        kategori_q: data.kategori_q,
        tanggal_service: data.tanggal_service,
        tanggal_rtj: data.tanggal_rtj,
        batas_periode_rtj: data.batas_periode_rtj || '',
        status_rtj: data.status_rtj,
        detail_kendala: data.detail_kendala || '',
        keterangan: data.keterangan || '',
      });
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    editMutation.mutate(editFormData);
  };

  const handleDelete = () => {
    if (window.confirm(`Yakin ingin menghapus data RTJ pelanggan "${data?.nama_customer}"?`)) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Memuat detail data RTJ...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700">
        <p className="font-bold">Data RTJ tidak ditemukan.</p>
        <Link to="/data-rtj" className="mt-3 inline-block text-xs font-bold text-slate-800 underline">
          Kembali ke Data RTJ
        </Link>
      </div>
    );
  }

  const cleanPhone = data.no_hp ? data.no_hp.replace(/[^0-9]/g, '') : '';
  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/data-rtj"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar RTJ</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsChangeStatusOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update Status</span>
          </button>

          <button
            onClick={handleOpenEdit}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Data</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
            title="Hapus RTJ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CategoryBadge category={data.kategori_q} />
            <span className="text-xs text-slate-400 font-mono">
              WO: {data.no_wo || 'N/A'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {data.nama_customer}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="px-2 py-0.5 rounded bg-slate-800 font-bold text-white border border-slate-700">
              {data.no_polisi}
            </span>
            <span>•</span>
            <span className="font-bold text-red-400">{data.model}</span>
            <span>•</span>
            <span>{data.km_service > 0 ? `${data.km_service.toLocaleString('id-ID')} KM` : '- KM'}</span>
          </div>
        </div>

        {/* Big Status Badge Panel */}
        <div className="bg-slate-800/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-700/80 flex flex-col items-center md:items-end justify-center shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Status RTJ Saat Ini
          </span>
          <StatusBadge status={data.status_rtj} size="lg" />
          <p className="text-[10px] text-slate-400 mt-2">
            Target RTJ: <strong className="text-white">{data.tanggal_rtj}</strong>
          </p>
        </div>
      </div>

      {/* 3 Informative Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Panel 1: Customer Information */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-red-50 text-toyota-red rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Customer & Petugas
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Nama Pelanggan</span>
              <p className="font-bold text-slate-900 mt-0.5">{data.nama_customer}</p>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Kontak WhatsApp / Telepon</span>
              <div className="flex items-center justify-between mt-0.5">
                <p className="font-semibold text-slate-800">{data.no_hp || '-'}</p>
                {waPhone && (
                  <a
                    href={`https://wa.me/${waPhone}?text=Halo%20Bpk/Ibu%20${encodeURIComponent(data.nama_customer)},%20kami%20dari%20Wira%20Toyota%20Banjarmasin...`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat WA</span>
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 font-medium">Service Advisor</span>
                <p className="font-bold text-slate-800 mt-0.5">{data.sa}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Front Officer</span>
                <p className="font-bold text-slate-800 mt-0.5">{data.fo}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Teknisi Penanggung Jawab</span>
              <p className="font-bold text-slate-800 mt-0.5">{data.teknisi || '-'}</p>
            </div>
          </div>
        </div>

        {/* Panel 2: Vehicle & Service Details */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Car className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Data Unit & Pekerjaan
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 font-medium">UNIT (Model)</span>
                <p className="font-bold text-slate-900 mt-0.5">{data.model}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">No. Polisi</span>
                <p className="font-bold text-slate-900 mt-0.5">{data.no_polisi}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Rincian SERVICE (Pekerjaan)</span>
              <p className="text-slate-800 bg-slate-50 p-2.5 rounded-xl mt-1 border border-slate-100 font-semibold leading-relaxed">
                {data.service || 'Service Berkala Standar'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 font-medium">Tanggal Service</span>
                <p className="font-semibold text-slate-800 mt-0.5">{data.tanggal_service}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">KM Service</span>
                <p className="font-semibold text-slate-800 mt-0.5">{data.km_service ? `${data.km_service.toLocaleString('id-ID')} KM` : '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Follow-Up Details & Remarks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Jadwal & Keluhan RTJ
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 font-medium">Tanggal RTJ</span>
                <p className="font-bold text-slate-900 mt-0.5">{data.tanggal_rtj}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Batas Periode</span>
                <p className="font-semibold text-slate-800 mt-0.5">{data.batas_periode_rtj || '-'}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Detail Kendala</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl mt-1 border border-slate-100 leading-relaxed">
                {data.detail_kendala || 'Tidak ada keluhan khusus.'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Keterangan / Hasil Follow-Up</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl mt-1 border border-slate-100 leading-relaxed font-semibold">
                {data.keterangan || 'Belum ada keterangan follow-up.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table: Riwayat Perubahan Status RTJ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-toyota-red" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat Perubahan Status</h3>
              <p className="text-xs text-slate-500">Log audit riwayat tindak lanjut follow-up reminder kendaraan ini</p>
            </div>
          </div>

          <button
            onClick={() => setIsChangeStatusOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-toyota-red bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tambah Catatan Status</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
            <thead className="bg-slate-50/80 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Waktu Perubahan</th>
                <th className="px-4 py-3">Perubahan Status</th>
                <th className="px-4 py-3">Catatan / Keterangan</th>
                <th className="px-4 py-3 text-right">Diperbarui Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {!data.history || data.history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                    Belum ada riwayat perubahan status tercatat.
                  </td>
                </tr>
              ) : (
                data.history.map((hist) => (
                  <tr key={hist.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                      {new Date(hist.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {hist.status_lama && (
                          <>
                            <StatusBadge status={hist.status_lama} showIcon={false} />
                            <span className="text-slate-400">→</span>
                          </>
                        )}
                        <StatusBadge status={hist.status_baru} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-md font-medium">
                      {hist.keterangan || '-'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {hist.updated_by_name || 'System'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Status Modal */}
      <ChangeStatusModal
        isOpen={isChangeStatusOpen}
        onClose={() => setIsChangeStatusOpen(false)}
        rtj={data}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['rtj-detail', id] });
          queryClient.invalidateQueries({ queryKey: ['rtj-list'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        }}
      />

      {/* Full Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Data RTJ" maxWidth="max-w-3xl">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Customer</label>
              <input
                type="text"
                required
                value={editFormData.nama_customer || ''}
                onChange={(e) => setEditFormData({ ...editFormData, nama_customer: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. Polisi</label>
              <input
                type="text"
                required
                value={editFormData.no_polisi || ''}
                onChange={(e) => setEditFormData({ ...editFormData, no_polisi: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">UNIT (Model)</label>
              <input
                type="text"
                value={editFormData.model || ''}
                onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SERVICE (Pekerjaan)</label>
              <input
                type="text"
                value={editFormData.service || ''}
                onChange={(e) => setEditFormData({ ...editFormData, service: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Advisor (SA)</label>
              <input
                type="text"
                value={editFormData.sa || ''}
                onChange={(e) => setEditFormData({ ...editFormData, sa: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Front Officer (FO)</label>
              <input
                type="text"
                value={editFormData.fo || ''}
                onChange={(e) => setEditFormData({ ...editFormData, fo: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teknisi</label>
              <input
                type="text"
                value={editFormData.teknisi || ''}
                onChange={(e) => setEditFormData({ ...editFormData, teknisi: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Service</label>
              <input
                type="date"
                value={editFormData.tanggal_service || ''}
                onChange={(e) => setEditFormData({ ...editFormData, tanggal_service: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Target RTJ</label>
              <input
                type="date"
                value={editFormData.tanggal_rtj || ''}
                onChange={(e) => setEditFormData({ ...editFormData, tanggal_rtj: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
              <input
                type="text"
                value={editFormData.no_hp || ''}
                onChange={(e) => setEditFormData({ ...editFormData, no_hp: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detail Kendala</label>
            <textarea
              rows="2"
              value={editFormData.detail_kendala || ''}
              onChange={(e) => setEditFormData({ ...editFormData, detail_kendala: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan</label>
            <textarea
              rows="2"
              value={editFormData.keterangan || ''}
              onChange={(e) => setEditFormData({ ...editFormData, keterangan: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={editMutation.isLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-toyota-red hover:bg-toyota-darkRed rounded-xl shadow-toyota transition-all"
            >
              {editMutation.isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
