import React from 'react';
import { Link, useForm, usePage, Head } from '@inertiajs/react'; // Importamos usePage y Head
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function Index({ activities, filters, users, agents }) {
    // Obtenemos los datos del usuario logueado
    const { auth } = usePage().props;

    const { data, setData, get } = useForm({
        status: filters.status || '',
        priority: filters.priority || '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        get('/activities', { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Lista de Actividades" />

            <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Listado de Actividades</h2>

                    {/* Botón condicionado según el rol del usuario */}
                    <Link
                        href={auth?.user?.role === 'agent' ? '/agent/kanban' : '/activities/kanban'}
                        className="bg-brand-500 text-black font-bold px-4 py-2 rounded-lg shadow-lg shadow-brand-500/20 hover:bg-brand-400 transition-all"
                    >
                        Ver en Kanban
                    </Link>
                </div>

                {/* Filtros Actualizados al Dark Mode */}
                <form onSubmit={handleFilter} className="bg-white dark:bg-surface-800 p-4 rounded-xl shadow-subtle border border-slate-200 dark:border-slate-700 mb-6 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Estado</label>
                        <select
                            className="w-full border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-900 text-slate-900 dark:text-white rounded-lg focus:ring-brand-500 focus:border-brand-500"
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            <option value="pending">Pendiente</option>
                            <option value="in_progress">En Progreso</option>
                            <option value="in_review">En Revisión</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Prioridad</label>
                        <select
                            className="w-full border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-900 text-slate-900 dark:text-white rounded-lg focus:ring-brand-500 focus:border-brand-500"
                            value={data.priority}
                            onChange={e => setData('priority', e.target.value)}
                        >
                            <option value="">Todas las prioridades</option>
                            <option value="low">Baja</option>
                            <option value="medium">Media</option>
                            <option value="high">Alta</option>
                            <option value="urgent">Urgente</option>
                        </select>
                    </div>

                    <button type="submit" className="bg-slate-800 dark:bg-surface-900 text-white dark:text-slate-200 border border-transparent dark:border-slate-700 font-bold px-6 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-800 transition-colors h-[42px]">
                        Filtrar
                    </button>
                </form>

                {/* Tabla Estilizada */}
                <div className="bg-white dark:bg-surface-800 rounded-xl shadow-subtle border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-surface-900/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Título</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prioridad</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responsable</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {activities.data.map(act => (
                                <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-surface-700/30 transition-colors">
                                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{act.title}</td>
                                    <td className="p-4">
                                            <span className="bg-slate-100 dark:bg-surface-900 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold uppercase">
                                                {act.status.replace('_', ' ')}
                                            </span>
                                    </td>
                                    <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                ${act.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400'}`}>
                                                {act.priority}
                                            </span>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{act.assignee?.name || '-'}</td>
                                </tr>
                            ))}
                            {activities.data.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        No se encontraron actividades.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
