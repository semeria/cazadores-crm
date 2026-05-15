import React from 'react';
import { useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function Create({ supervisors }) {
    // 1. Extraemos los mensajes flash de Inertia
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        status: 'active',
        supervisor_id: '',
        notes: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post('/agents', {
            // Limpiamos el formulario si fue exitoso
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="bg-white dark:bg-surface-800 p-8 rounded-2xl shadow-subtle border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Registrar Nuevo Agente</h2>

                    {/* 2. Alerta Premium para mostrar la contraseña temporal */}
                    {flash?.temp_password && (
                        <div className="mb-8 p-5 bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-500 rounded-r-xl">
                            <div className="flex flex-col">
                                <h3 className="text-md font-bold text-brand-800 dark:text-brand-400">
                                    ✅ Credenciales Generadas
                                </h3>
                                <p className="mt-1 text-sm text-brand-700 dark:text-brand-300">
                                    Copia esta contraseña y entrégala al agente. Por seguridad, no se volverá a mostrar.
                                </p>
                                <div className="mt-4 inline-flex items-center">
                                    <span className="font-mono text-xl tracking-widest bg-white dark:bg-surface-900 px-4 py-2 rounded-lg border border-brand-200 dark:border-brand-700 text-slate-900 dark:text-white shadow-sm">
                                        {flash.temp_password}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo *</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email (Acceso al sistema) *</label>
                                <input
                                    type="email"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Puesto</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                    value={data.specialty}
                                    onChange={e => setData('specialty', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                                <select
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
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
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supervisor Directo (Manager)</label>
                            <select
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                value={data.supervisor_id}
                                onChange={e => setData('supervisor_id', e.target.value)}
                            >
                                <option value="">-- Asignar a mi cargo --</option>
                                {supervisors.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas Internas</label>
                            <textarea
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                rows="3"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                            <Link
                                href="/agents"
                                className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-brand-500 text-black font-bold px-6 py-2 rounded-lg shadow-lg shadow-brand-500/20 hover:bg-brand-400 disabled:opacity-50 transition-all"
                            >
                                {processing ? 'Generando...' : 'Crear Agente y Clave'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
