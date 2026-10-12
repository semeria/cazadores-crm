import React from 'react';

const tones = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function KpiCard({ title, value, icon: Icon, tone = 'brand', hint }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle dark:border-slate-700 dark:bg-surface-800 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone] || tones.brand}`}>
                    <Icon size={19} strokeWidth={2} aria-hidden="true" />
                </div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{hint}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}
