import React from 'react';
import { CircleCheck } from 'lucide-react';

export default function CompletionProgressCard({ completed, total }) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const radius = 68;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage / 100);

    return (
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-700 dark:bg-surface-800 sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Avance</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Actividades completadas</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><CircleCheck size={20} /></span>
            </div>

            <div className="relative mx-auto mt-5 flex h-48 w-48 items-center justify-center">
                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={`${percentage}% de actividades completadas`}>
                    <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-700" />
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="text-brand-500 transition-[stroke-dashoffset] duration-500"
                    />
                </svg>
                <div className="absolute text-center">
                    <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{percentage}%</p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Completadas</p>
                </div>
            </div>

            <p className="mt-auto text-center text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{completed}</span> de {total} actividades
            </p>
        </section>
    );
}
