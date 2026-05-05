import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function Index({ activities, filters, users, agents }) {
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
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Listado de Actividades</h2>
                    <Link href="/activities/kanban" className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-900">
                        Ver en Kanban
                    </Link>
                </div>

                <form onSubmit={handleFilter} className="bg-white p-4 rounded shadow mb-6 flex gap-4">
                    <select className="border p-2 rounded" value={data.status} onChange={e => setData('status', e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completada</option>
                    </select>

                    <select className="border p-2 rounded" value={data.priority} onChange={e => setData('priority', e.target.value)}>
                        <option value="">Todas las prioridades</option>
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                    </select>

                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Filtrar</button>
                </form>

                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Título</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4">Prioridad</th>
                            <th className="p-4">Responsable</th>
                        </tr>
                        </thead>
                        <tbody>
                        {activities.data.map(act => (
                            <tr key={act.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{act.title}</td>
                                <td className="p-4 capitalize">{act.status.replace('_', ' ')}</td>
                                <td className="p-4 capitalize">{act.priority}</td>
                                <td className="p-4">{act.assignee?.name || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
