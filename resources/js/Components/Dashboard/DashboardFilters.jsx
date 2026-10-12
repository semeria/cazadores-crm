import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { CalendarDays, ChevronDown, Filter } from 'lucide-react';

const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export default function DashboardFilters({ filters }) {
    const [showCustom, setShowCustom] = useState(false);
    const [range, setRange] = useState(filters);
    const [rangeError, setRangeError] = useState('');

    useEffect(() => {
        setRange(filters);
    }, [filters.start_date, filters.end_date]);

    const applyRange = (startDate, endDate) => {
        setRangeError('');
        router.get('/dashboard', { start_date: startDate, end_date: endDate }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const today = new Date();
    const currentMonthStart = toLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
    const currentMonthEnd = toLocalDateString(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    const lastMonthStart = toLocalDateString(new Date(today.getFullYear(), today.getMonth() - 1, 1));
    const lastMonthEnd = toLocalDateString(new Date(today.getFullYear(), today.getMonth(), 0));
    const isCurrentMonth = range.start_date === currentMonthStart && range.end_date === currentMonthEnd;
    const isLastMonth = range.start_date === lastMonthStart && range.end_date === lastMonthEnd;

    const applyCustomRange = (event) => {
        event.preventDefault();
        if (!range.start_date || !range.end_date || range.start_date > range.end_date) {
            setRangeError('Selecciona un rango de fechas válido.');
            return;
        }

        applyRange(range.start_date, range.end_date);
    };

    const pillClass = (active) => `inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${active
        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-surface-800 dark:text-slate-200 dark:hover:bg-slate-700'}`;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"><Filter size={15} /> Periodo</span>
                <button type="button" aria-pressed={isCurrentMonth} onClick={() => applyRange(currentMonthStart, currentMonthEnd)} className={pillClass(isCurrentMonth)}>Este mes</button>
                <button type="button" aria-pressed={isLastMonth} onClick={() => applyRange(lastMonthStart, lastMonthEnd)} className={pillClass(isLastMonth)}>Mes anterior</button>
                <button type="button" aria-expanded={showCustom} onClick={() => setShowCustom((open) => !open)} className={pillClass(showCustom)}>
                    <CalendarDays size={16} /> Rango personalizado <ChevronDown size={14} className={`transition-transform ${showCustom ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {showCustom && (
                <form onSubmit={applyCustomRange} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-surface-800 sm:flex-row sm:items-end">
                    <label className="flex-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Desde
                        <input type="date" value={range.start_date || ''} onChange={(event) => setRange((current) => ({ ...current, start_date: event.target.value }))} className="mt-1 block w-full rounded-lg border-slate-300 text-sm text-slate-800 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                    </label>
                    <label className="flex-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Hasta
                        <input type="date" value={range.end_date || ''} onChange={(event) => setRange((current) => ({ ...current, end_date: event.target.value }))} className="mt-1 block w-full rounded-lg border-slate-300 text-sm text-slate-800 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                    </label>
                    <button type="submit" className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-500">Aplicar</button>
                    {rangeError && <p role="alert" className="basis-full text-xs text-red-600">{rangeError}</p>}
                </form>
            )}
        </div>
    );
}
