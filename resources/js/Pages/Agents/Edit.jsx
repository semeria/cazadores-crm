import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function Edit({ agent, supervisors }) {
    // Inicializamos el formulario con los datos actuales del agente
    const { data, setData, put, processing, errors } = useForm({
        name: agent.name || '',
        email: agent.email || '',
        phone: agent.phone || '',
        specialty: agent.specialty || '',
        status: agent.status || 'active',
        supervisor_id: agent.supervisor_id || '',
        notes: agent.notes || ''
    });

    const submit = (e) => {
        e.preventDefault();
        // Usamos PUT indicando el ID del agente a actualizar
        put(`/agents/${agent.id}`);
    };

    return (
        <AuthenticatedLayout>
            <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-6">Editar Agente: {agent.name}</h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nombre *</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                            />
                            {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Teléfono</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Especialidad</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                                value={data.specialty}
                                onChange={e => setData('specialty', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Estado</label>
                            <select
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                            >
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                                <option value="on_leave">De Permiso</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Supervisor (Opcional)</label>
                        <select
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                            value={data.supervisor_id}
                            onChange={e => setData('supervisor_id', e.target.value)}
                        >
                            <option value="">-- Sin Supervisor --</option>
                            {supervisors.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Notas</label>
                        <textarea
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Link href="/agents" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
