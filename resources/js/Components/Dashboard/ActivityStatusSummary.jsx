import React from 'react';
import { Check, CircleDot, Clock3, Eye, ListTodo, X } from 'lucide-react';

const statuses = [
    { key: 'pending', label: 'Pendientes', icon: ListTodo, color: 'bg-brand-500' },
    { key: 'in_progress', label: 'En progreso', icon: Clock3, color: 'bg-amber-500' },
    { key: 'in_review', label: 'En revisión', icon: Eye, color: 'bg-blue-500' },
    { key: 'completed', label: 'Completadas', icon: Check, color: 'bg-emerald-500' },
    { key: 'cancelled', label: 'Canceladas', icon: X, color: 'bg-slate-400' },
];

export default function ActivityStatusSummary({ kpis }) {
    const cancelled = Math.max(0, kpis.total - kpis.pending - kpis.in_progress - kpis.in_review - kpis.completed);
    const counts = { ...kpis, cancelled };
    const divisor = Math.max(kpis.total, 1);

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-700 dark:bg-surface-800 sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Actividad por estado</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Distribución del periodo</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"><CircleDot size={20} /></span>
            </div>

            <div className="mt-7 space-y-5">
                {statuses.map(({ key, label, icon: Icon, color }) => {
                    const count = counts[key] || 0;
                    const percentage = kpis.total ? (count / divisor) * 100 : 0;

                    return (
                        <div key={key}>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"><Icon size={16} className="text-slate-400 dark:text-slate-500" />{label}</span>
                                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{count}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                <div className={`h-full rounded-full transition-[width] duration-300 ${color}`} style={{ width: `${percentage}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
