import React from 'react';
import { UploadCloud, CheckCheck, RefreshCw, Eye, PieChart, ChevronRight } from 'lucide-react';

const steps = [
  {
    num: '1',
    title: 'Input / Import',
    subtitle: 'Database / Excel (.xlsx)',
    icon: UploadCloud,
    color: 'from-blue-600 to-indigo-600',
    border: 'border-blue-200'
  },
  {
    num: '2',
    title: 'Validasi Data',
    subtitle: 'Format, Nopol, & Jadwal',
    icon: CheckCheck,
    color: 'from-teal-600 to-emerald-600',
    border: 'border-teal-200'
  },
  {
    num: '3',
    title: 'Input Hasil RTJ',
    subtitle: 'Follow-up & Update Status',
    icon: RefreshCw,
    color: 'from-amber-600 to-orange-600',
    border: 'border-amber-200'
  },
  {
    num: '4',
    title: 'Monitoring',
    subtitle: 'Tracking Service Advisor',
    icon: Eye,
    color: 'from-rose-600 to-red-600',
    border: 'border-rose-200'
  },
  {
    num: '5',
    title: 'Dashboard & Statistik',
    subtitle: 'Laporan & Analisis Q1-Q5',
    icon: PieChart,
    color: 'from-purple-600 to-violet-600',
    border: 'border-purple-200'
  }
];

export default function ProcessFlowDiagram({ compact = false }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-toyota-red"></span>
          <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
            Diagram Alur Proses Remind Tracking Job (RTJ) Wira Toyota
          </h4>
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
          5 Tahap Standard Operating Procedure (SOP)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="relative group">
              <div className="flex md:flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 h-full">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-md shrink-0 mb-0 md:mb-2 mr-3 md:mr-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left md:text-center flex-1">
                  <div className="flex items-center space-x-1 justify-start md:justify-center">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      Step {step.num}
                    </span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 mt-1">{step.title}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{step.subtitle}</p>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-slate-300 pointer-events-none">
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
