import React from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function Index({ agents, filters }) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        status: filters.status || '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        get('/agents', { preserveState: true });
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este agente?')) {
            router.delete(`/agents/${id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="bg-white p-6 rounded shadow mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">Gestión de Agentes</h2>
                <Link href="/agents/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Nuevo Agente
                </Link>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <form onSubmit={handleFilter} className="flex gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o puesto..."
                        className="border p-2 rounded flex-1"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                    />
                    <select
                        className="border p-2 rounded"
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="on_leave">De Permiso</option>
                    </select>
                    <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
                        Filtrar
                    </button>
                </form>

                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b">
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Puesto</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Supervisor</th>
                        <th className="p-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {agents.data.map(agent => (
                        <tr key={agent.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                                <div className="font-semibold">{agent.name}</div>
                                <div className="text-sm text-gray-500">{agent.email}</div>
                            </td>
                            <td className="p-3">{agent.specialty || '-'}</td>
                            <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs text-white ${agent.status === 'active' ? 'bg-green-500' : (agent.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500')}`}>
                                        {agent.status}
                                    </span>
                            </td>
                            <td className="p-3">{agent.supervisor?.name || 'Sin asignar'}</td>
                            <td className="p-3 text-right space-x-2">
                                <Link href={`/agents/${agent.id}/edit`} className="text-blue-600 hover:underline">Editar</Link>
                                <button onClick={() => handleDelete(agent.id)} className="text-red-600 hover:underline">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {agents.data.length === 0 && (
                    <div className="text-center py-6 text-gray-500">No se encontraron agentes.</div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
