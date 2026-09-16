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
  Q5: {
    bg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    title: 'Inactive Follow-up'
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
