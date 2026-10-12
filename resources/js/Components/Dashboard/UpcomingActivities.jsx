import React from 'react';
import { CalendarClock } from 'lucide-react';

const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
};

const localDateString = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = String(value).slice(0, 10);

    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
        .format(new Date(`${date}T12:00:00`));
};

export default function UpcomingActivities({ activities }) {
    const today = localDateString();

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-700 dark:bg-surface-800 sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Fechas límite</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Actividades pendientes más cercanas</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"><CalendarClock size={20} /></span>
            </div>

            {activities.length > 0 ? (
                <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-700">
                    {activities.map((activity) => {
                        const dueDate = activity.due_date ? String(activity.due_date).slice(0, 10) : '';
                        const isOverdue = dueDate && dueDate < today;

                        return (
                            <div key={activity.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{activity.title}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activity.assignee?.name || 'Sin asignar'} · {formatDate(dueDate)}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    {isOverdue && <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 dark:bg-red-900/25 dark:text-red-300">Vencida</span>}
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">{statusLabels[activity.status] || activity.status}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="mt-8 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:bg-surface-900 dark:text-slate-400">No hay actividades pendientes con fecha límite.</p>
            )}
        </section>
    );
}
