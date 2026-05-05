import React from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import KpiCard from '../Components/Dashboard/KpiCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard({ kpis, charts, upcoming, filters, role }) {
    const COLORS = ['#6366f1', '#10B981', '#F59E0B', '#EF4444'];

    return (
        <AuthenticatedLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold dark:text-white">
                        {role === 'owner' ? 'Panel Organizacional' : 'Mi Resumen de Actividades'}
                    </h2>
                </div>

                {/* KPIs: Siempre visibles, pero el valor depende de lo que mandó el controlador */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <KpiCard title="Total" value={kpis.total} colorClass="bg-brand-500" icon="📊" />
                    <KpiCard title="En Progreso" value={kpis.in_progress} colorClass="bg-amber-500" icon="⚙️" />
                    <KpiCard title="En Revisión" value={kpis.in_review} colorClass="bg-blue-500" icon="👁️" />
                    <KpiCard title="Completadas" value={kpis.completed} colorClass="bg-emerald-500" icon="✅" />
                    <KpiCard title="Vencidas" value={kpis.overdue} colorClass="bg-red-500" icon="⚠️" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gráficos: SOLO para el OWNER */}
                    {role === 'owner' && (
                        <div className="lg:col-span-2 bg-white dark:bg-surface-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold mb-4 dark:text-white">Distribución por Usuario</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.byUser}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} />
                                        <Tooltip />
                                        <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Lista de próximas actividades: Visible para ambos (pero filtrada) */}
                    <div className={`${role === 'owner' ? 'col-span-1' : 'col-span-3'} bg-white dark:bg-surface-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700`}>
                        <h3 className="font-bold mb-4 dark:text-white">Próximos Vencimientos</h3>
                        <div className="space-y-4">
                            {upcoming.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-surface-900 rounded-lg">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium dark:text-white truncate">{item.title}</p>
                                        <p className="text-xs text-slate-500">{item.due_date || 'Sin fecha'}</p>
                                    </div>
                                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 capitalize">
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                            {upcoming.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">No hay tareas urgentes.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
