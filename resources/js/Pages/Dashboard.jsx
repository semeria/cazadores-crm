import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, CircleCheck, Clock3, Eye, ListTodo, Plus, TriangleAlert } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ActivityStatusSummary from '../Components/Dashboard/ActivityStatusSummary';
import CompletionProgressCard from '../Components/Dashboard/CompletionProgressCard';
import DashboardFilters from '../Components/Dashboard/DashboardFilters';
import KpiCard from '../Components/Dashboard/KpiCard';
import UpcomingActivities from '../Components/Dashboard/UpcomingActivities';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';

export default function Dashboard({ kpis, charts, upcoming, filters, role }) {
    const { auth } = usePage().props;
    const name = auth?.user?.name?.trim().split(/\s+/)[0] || '';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

    return (
        <AuthenticatedLayout>
            <Head title="Panel operativo" />
            <div className="mx-auto max-w-[1500px] space-y-7">
                <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div>
                        <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">
                            {role === 'owner' ? 'Resumen de la organización' : 'Tu resumen operativo'}
                        </p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                            {greeting}{name ? `, ${name}` : ''}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Actividad y fechas límite del equipo, en un solo lugar.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link href={role === 'agent' ? '/agent/kanban' : '/activities/kanban'} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-surface-800 dark:text-slate-200 dark:hover:bg-slate-700">
                            Ver Kanban
                        </Link>
                        <Link href="/quotes/create" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-brand-500 dark:text-slate-950 dark:hover:bg-brand-400">
                            <Plus size={17} /> Nueva cotización
                        </Link>
                    </div>
                </section>

                <DashboardFilters filters={filters} />

                <section aria-label="Indicadores de actividades" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                    <KpiCard title="Total" value={kpis.total} icon={Activity} tone="brand" hint="Periodo" />
                    <KpiCard title="Pendientes" value={kpis.pending} icon={ListTodo} tone="amber" hint="Periodo" />
                    <KpiCard title="En progreso" value={kpis.in_progress} icon={Clock3} tone="blue" hint="Periodo" />
                    <KpiCard title="En revisión" value={kpis.in_review} icon={Eye} tone="blue" hint="Periodo" />
                    <KpiCard title="Completadas" value={kpis.completed} icon={CircleCheck} tone="green" hint="Periodo" />
                    <KpiCard title="Vencidas" value={kpis.overdue} icon={TriangleAlert} tone="red" hint="Abiertas" />
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                    <div className="xl:col-span-4">
                        <ActivityStatusSummary kpis={kpis} />
                    </div>

                    <div className="xl:col-span-5">
                        {role === 'owner' ? (
                            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-700 dark:bg-surface-800 sm:p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Distribución por usuario</h2>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Actividades asignadas en el periodo</p>
                                    </div>
                                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">Equipo</span>
                                </div>
                                {charts?.byUser?.length ? (
                                    <div className="mt-5 h-[270px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={charts.byUser} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                                                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} tickMargin={10} />
                                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                                                <Tooltip cursor={{ fill: 'rgba(217, 119, 6, 0.08)' }} />
                                                <Bar dataKey="total" name="Actividades" fill="#d97706" radius={[8, 8, 0, 0]} maxBarSize={48} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="mt-5 flex h-[270px] items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500 dark:bg-surface-900 dark:text-slate-400">Aún no hay actividades asignadas en este periodo.</div>
                                )}
                            </section>
                        ) : (
                            <UpcomingActivities activities={upcoming} />
                        )}
                    </div>

                    <div className="xl:col-span-3">
                        <CompletionProgressCard completed={kpis.completed} total={kpis.total} />
                    </div>

                    {role === 'owner' && (
                        <div className="xl:col-span-12">
                            <UpcomingActivities activities={upcoming} />
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
