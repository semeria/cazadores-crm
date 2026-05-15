import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/UI/Card';
import Badge from '../../Components/UI/Badge';

export default function Index({ members }) {
    const { flash } = usePage().props;
    const { data, setData, post, put, reset, processing } = useForm({
        name: '', email: '', phone: '', is_active: true, position: ''
    });
    const [editingId, setEditingId] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(`/members/${editingId}`, { onSuccess: () => { reset(); setEditingId(null); }});
        } else {
            post('/members', { onSuccess: () => reset() });
        }
    };

    const handleResetPassword = (id) => {
        if (confirm('¿Generar nueva contraseña temporal?')) {
            post(`/members/${id}/reset-password`);
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestión de Equipo</h2>
                </div>

                {/* Mostrar la contraseña temporal generada desde el controlador */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-100 text-emerald-800 rounded-lg font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Formulario */}
                    <Card title={editingId ? "Editar Miembro" : "Nuevo Miembro"} className="col-span-1 h-fit">
                        <form onSubmit={submit} className="space-y-4">
                            <input type="text" placeholder="Nombre" className="w-full rounded border-slate-300 dark:bg-surface-900" value={data.name} onChange={e => setData('name', e.target.value)} required />
                            <input type="email" placeholder="Email" className="w-full rounded border-slate-300 dark:bg-surface-900" value={data.email} onChange={e => setData('email', e.target.value)} required />
                            <input type="text" placeholder="Posición" className="w-full rounded border-slate-300 dark:bg-surface-900" value={data.position} onChange={e => setData('position', e.target.value)} required />
                            <input type="text" placeholder="Teléfono" className="w-full rounded border-slate-300 dark:bg-surface-900" value={data.phone} onChange={e => setData('phone', e.target.value)} />

                            {editingId && (
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                    <span className="text-sm dark:text-white">Usuario Activo</span>
                                </label>
                            )}

                            <div className="flex gap-2">
                                {editingId && <button type="button" onClick={() => { reset(); setEditingId(null); }} className="w-full py-2 bg-slate-200 rounded">Cancelar</button>}
                                <button type="submit" disabled={processing} className="w-full py-2 bg-brand-600 text-white rounded hover:bg-brand-500">
                                    {editingId ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </Card>

                    {/* Tabla */}
                    <Card className="col-span-1 md:col-span-2 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                            <tr className="border-b dark:border-slate-700">
                                <th className="py-3 dark:text-white">Usuario</th>
                                <th className="py-3 dark:text-white">Estado</th>
                                <th className="py-3 dark:text-white">Posición</th>
                                <th className="py-3 text-right dark:text-white">Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {members.data.map(member => (
                                <tr key={member.id} className="border-b dark:border-slate-700 last:border-0">
                                    <td className="py-3">
                                        <div className="font-medium dark:text-white">{member.name}</div>
                                        <div className="text-sm text-slate-500">{member.email}</div>
                                    </td>
                                    <td className="py-3">
                                        <Badge color={member.is_active ? 'success' : 'gray'}>
                                            {member.is_active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </td>
                                    <td><div className="text-sm text-slate-500">{member.position}</div></td>
                                    <td className="py-3 text-right space-x-3 text-sm">
                                        <button onClick={() => { setEditingId(member.id); setData({name: member.name, email: member.email, phone: member.phone, is_active: member.is_active, position: member.position}); }} className="text-brand-600 hover:underline">Editar</button>
                                        <button onClick={() => handleResetPassword(member.id)} className="text-amber-600 hover:underline">Reset Pass</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
