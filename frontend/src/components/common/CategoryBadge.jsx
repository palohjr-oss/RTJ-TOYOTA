import React from 'react';

const categoryConfig = {
  Q1: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    title: 'Reminder 1 Bulan / 1.000 KM'
  },
  Q2: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    title: 'Reminder 6 Bulan / 10.000 KM'
  },
  Q3: {
    bg: 'bg-violet-50 text-violet-700 border-violet-200',
    title: 'Follow-up Keluhan / Job Pending'
  },
  Q4: {
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    title: 'Reminder 12 Bulan / 20.000 KM'
  },
  FIR: {
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    title: 'Fix It Right (FIR)'
  },
  Q5: {
    bg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    title: 'Inactive Follow-up'
  },
  Q6: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    title: 'Perlu Follow-up'
  },
  'Tidak Diangkat': {
    bg: 'bg-amber-100 text-amber-900 border-amber-300',
    title: 'Telepon Tidak Diangkat'
  },
  'Tidak Aktif': {
    bg: 'bg-red-100 text-red-900 border-red-300',
    title: 'Nomor Tidak Aktif'
  },
  'Tidak ada Nada': {
    bg: 'bg-orange-100 text-orange-900 border-orange-300',
    title: 'Tidak Ada Nada Sambung'
  },
  'Tidak Terhubung': {
    bg: 'bg-rose-100 text-rose-900 border-rose-300',
    title: 'Panggilan Tidak Terhubung'
  },
  'Tidak Valid': {
    bg: 'bg-purple-100 text-purple-900 border-purple-300',
    title: 'Nomor Tidak Valid / Salah'
  },
  'Salah Sambung': {
    bg: 'bg-pink-100 text-pink-900 border-pink-300',
    title: 'Salah Sambung / Bukan Pemilik'
  }
};

export default function CategoryBadge({ category }) {
  const config = categoryConfig[category] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    title: 'Kategori RTJ'
  };

  return (
    <span
      title={config.title}
      className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-xs tracking-wider border shadow-xs ${config.bg}`}
    >
      {category || 'Q-'}
    </span>
  );
}
