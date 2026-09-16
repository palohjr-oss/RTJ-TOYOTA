import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = [
  { value: 'Scheduled', label: 'Scheduled (Terjadwal)', desc: 'Menunggu waktu target follow up' },
  { value: 'Completed', label: 'Completed (Selesai)', desc: 'Customer telah dikonfirmasi / booking' },
  { value: 'Pending', label: 'Pending (Menunggu)', desc: 'Belum terhubung / menunggu tanggapan customer' },
  { value: 'Rescheduled', label: 'Rescheduled (Dijadwalkan Ulang)', desc: 'Customer minta reschedule atau kendala part' },
];

export default function ChangeStatusModal({ isOpen, onClose, rtj, onSuccess }) {
  const [status, setStatus] = useState(rtj?.status_rtj || 'Scheduled');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset when rtj changes
  React.useEffect(() => {
    if (rtj) {
      setStatus(rtj.status_rtj);
      setNote('');
      setError('');
    }
  }, [rtj]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rtj) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.put(`/rtj/${rtj.id}`, {
        status_rtj: status,
        catatan_perubahan: note || `Status diperbarui ke ${status}`,
      });

      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Update status error:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui status RTJ.');
    } finally {
      setLoading(false);
    }
  };

  if (!rtj) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ubah Status Follow-Up RTJ" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-medium">Customer</p>
              <h4 className="text-sm font-bold text-slate-800">{rtj.nama_customer}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{rtj.no_polisi} • {rtj.model}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium mb-1">Status Saat Ini</p>
              <StatusBadge status={rtj.status_rtj} />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Status selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Pilih Status Baru
          </label>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  status === opt.value
                    ? 'border-toyota-red bg-red-50/30 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-toyota-red focus:ring-toyota-red"
                  />
                  <div>
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[11px] text-slate-500">{opt.desc}</p>
                  </div>
                </div>
                <StatusBadge status={opt.value} showIcon={false} />
              </label>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Catatan Follow-up / Alasan Perubahan
          </label>
          <textarea
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Sudah konfirmasi via WA, customer setuju booking hari Sabtu pagi..."
            className="w-full text-xs rounded-xl border-slate-200 focus:border-toyota-red focus:ring-1 focus:ring-toyota-red p-3 border"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-1.5 px-5 py-2 bg-toyota-red hover:bg-toyota-darkRed text-white rounded-xl text-xs font-bold shadow-toyota transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
