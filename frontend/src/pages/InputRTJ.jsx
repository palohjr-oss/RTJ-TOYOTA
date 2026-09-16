import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Car, 
  ClipboardCheck, 
  Loader2,
  Wrench
} from 'lucide-react';
import api from '../api/client';

const rtjSchema = z.object({
  nama_customer: z.string().min(2, 'Nama Customer wajib diisi (minimal 2 karakter)'),
  no_polisi: z.string().min(3, 'No. Polisi wajib diisi (contoh: DA1871BM)'),
  no_hp: z.string().optional(),
  model: z.string().min(1, 'UNIT (Model) wajib dipilih / diisi'),
  service: z.string().optional(),
  sa: z.string().min(1, 'Service Advisor (SA) wajib diisi'),
  fo: z.string().min(1, 'Front Officer (FO) wajib diisi'),
  teknisi: z.string().optional(),
  kategori_q: z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'Q5']),
  tanggal_service: z.string().min(1, 'Tanggal Service wajib diisi'),
  km_service: z.coerce.number().min(0, 'KM Service tidak boleh negatif').optional(),
  tanggal_rtj: z.string().min(1, 'Tanggal Mulai Target RTJ wajib diisi'),
  batas_periode_rtj: z.string().optional(),
  status_rtj: z.enum(['Scheduled', 'Completed', 'Pending', 'Rescheduled']),
  detail_kendala: z.string().optional(),
  keterangan: z.string().optional(),
});

export default function InputRTJ() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(rtjSchema),
    defaultValues: {
      nama_customer: '',
      no_polisi: '',
      no_hp: '',
      model: 'CALYA',
      service: 'SBE 30.000 KM (T-CARE LITE +) GT OIL M/F (TMO 10W30)',
      sa: 'SUGIANTO',
      fo: 'Sapruddin',
      teknisi: 'Mohamad',
      kategori_q: 'Q1',
      tanggal_service: todayStr,
      km_service: 30000,
      tanggal_rtj: todayStr,
      batas_periode_rtj: '',
      status_rtj: 'Scheduled',
      detail_kendala: 'KELUHAN AFTER SERVICE',
      keterangan: ''
    }
  });

  const onSubmit = async (formData) => {
    setSubmitting(true);
    setServerError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/rtj', formData);
      if (res.data.success) {
        setSuccessMsg('Data RTJ berhasil disimpan ke database!');
        setTimeout(() => {
          navigate(`/data-rtj/${res.data.data.id}`);
        }, 1200);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setServerError(err.response?.data?.message || 'Gagal menyimpan data RTJ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/data-rtj"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Data RTJ</span>
        </Link>

        <span className="text-xs text-slate-400 font-medium">
          Wira Toyota Banjarmasin • Form Input RTJ
        </span>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Manual Entry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
              Input Data RETURN JOB (RTJ)
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Data Follow UP RTJ Wira Toyota Banjarmasin
            </p>
          </div>
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 items-center justify-center text-red-400">
            <PlusCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Server status alert */}
        {serverError && (
          <div className="m-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg} Mengalihkan ke halaman detail...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8">
          {/* SECTION 1: DATA CUSTOMER */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-toyota-red" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Data Pelanggan / Customer
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Customer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('nama_customer')}
                  placeholder="Contoh: WAHYUNI"
                  className={`w-full text-xs rounded-xl border p-3 bg-slate-50/50 font-medium focus:bg-white transition-all ${
                    errors.nama_customer ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-toyota-red focus:border-toyota-red'
                  }`}
                />
                {errors.nama_customer && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.nama_customer.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. Polisi (Plat Kendaraan) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('no_polisi')}
                  placeholder="Contoh: DA1871BM"
                  className={`w-full text-xs rounded-xl border p-3 bg-slate-50/50 font-medium uppercase focus:bg-white transition-all ${
                    errors.no_polisi ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-toyota-red focus:border-toyota-red'
                  }`}
                />
                {errors.no_polisi && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.no_polisi.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. HP / WhatsApp
                </label>
                <input
                  type="text"
                  {...register('no_hp')}
                  placeholder="Contoh: 081250112233"
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DATA KENDARAAN & SERVICE */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Car className="w-4 h-4 text-toyota-red" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Data Unit & Rincian Service
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UNIT (Model) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('model')}
                  placeholder="Contoh: CALYA, INNOVA ZENIX, NEW VELOZ"
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all uppercase"
                />
                {errors.model && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.model.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori RTJ (Q1–Q5) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('kategori_q')}
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                >
                  <option value="Q1">Q1 - Reminder 1 Bulan / 1.000 KM</option>
                  <option value="Q2">Q2 - Reminder 6 Bulan / 10.000 KM</option>
                  <option value="Q3">Q3 - Follow-up Keluhan / Job Pending</option>
                  <option value="Q4">Q4 - Reminder 12 Bulan / 20.000 KM +</option>
                  <option value="Q5">Q5 - Inactive Customer Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Service Terakhir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('tanggal_service')}
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rincian SERVICE (Pekerjaan / Paket SBE)
                </label>
                <input
                  type="text"
                  {...register('service')}
                  placeholder="Contoh: SBE 30.000 KM (T-CARE LITE +) GT OIL M/F (TMO 10W30)"
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Advisor (SA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('sa')}
                  placeholder="Contoh: SUGIANTO"
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Front Officer (FO) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('fo')}
                  placeholder="Contoh: Sapruddin"
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teknisi
                </label>
                <input
                  type="text"
                  {...register('teknisi')}
                  placeholder="Contoh: Mohamad"
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: TARGET RTJ & STATUS */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <ClipboardCheck className="w-4 h-4 text-toyota-red" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Target Follow-Up RTJ & Status
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Target RTJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('tanggal_rtj')}
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batas Periode RTJ
                </label>
                <input
                  type="date"
                  {...register('batas_periode_rtj')}
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status RTJ Awal <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('status_rtj')}
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                >
                  <option value="Scheduled">Scheduled (Terjadwal)</option>
                  <option value="Completed">Completed (Selesai)</option>
                  <option value="Pending">Pending (Menunggu)</option>
                  <option value="Rescheduled">Rescheduled (Dijadwalkan Ulang)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detail Kendala
                </label>
                <textarea
                  rows="3"
                  {...register('detail_kendala')}
                  placeholder="Contoh: KELUHAN AFTER SERVICE, BUNYI DECIT..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Hasil Follow-Up
                </label>
                <textarea
                  rows="3"
                  {...register('keterangan')}
                  placeholder="Contoh: BOOKING 06 AGUSTUS, BELUM TERKONFIRMASI..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 font-medium focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => reset()}
              className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2.5 bg-toyota-red hover:bg-toyota-darkRed text-white text-xs font-bold rounded-xl shadow-toyota transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Data RTJ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
