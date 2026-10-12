import React, { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/UI/Card';
import Badge from '../../Components/UI/Badge';

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    role: 'member',
    is_active: true,
    position: '',
    manager_id: '',
    specialty: '',
    agent_status: 'active',
    notes: '',
};

export default function Index({ teamMembers, managers, filters }) {
    const { flash } = usePage().props;
    const [editingUser, setEditingUser] = useState(null);
    const { data, setData, post, put, reset, processing, errors } = useForm({
        ...emptyForm,
        search: filters.search || '',
        filter_role: filters.role || '',
    });

    const clearForm = () => {
        reset();
        setData({ ...emptyForm, search: data.search, filter_role: data.filter_role });
        setEditingUser(null);
    };

    const handleRoleChange = (role) => {
        setData({
            ...data,
            role,
            manager_id: role === 'agent' ? data.manager_id : '',
            position: role === 'member' ? (data.specialty || data.position) : data.position,
            specialty: role === 'agent' ? (data.specialty || data.position) : '',
            agent_status: role === 'agent' ? data.agent_status : 'active',
            notes: role === 'agent' ? data.notes : '',
        });
    };

    const submit = (event) => {
        event.preventDefault();

        if (editingUser) {
            put(`/team/${editingUser.id}`, { onSuccess: clearForm });
        } else {
            post('/team', { onSuccess: clearForm });
        }
    };

    const editUser = (member) => {
        setEditingUser(member);
        setData({
            ...emptyForm,
            name: member.name || '',
            email: member.email || '',
            phone: member.phone || '',
            role: member.role,
            is_active: Boolean(member.is_active),
            position: member.position || '',
            manager_id: member.manager_id || '',
            specialty: member.agent_profile?.specialty || '',
            agent_status: member.agent_profile?.status || 'active',
            notes: member.agent_profile?.notes || '',
            search: data.search,
            filter_role: data.filter_role,
        });
    };

    const resetPassword = (id) => {
        if (confirm('¿Generar una nueva contraseña temporal para este usuario?')) {
            router.post(`/team/${id}/reset-password`);
        }
    };

    const applyFilters = (event) => {
        event.preventDefault();
        router.get('/team', { search: data.search, role: data.filter_role }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestión del equipo</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Administra usuarios, roles y responsables desde un solo lugar.</p>
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-100 text-emerald-800 rounded-lg font-medium">
                        {flash.success}
                        {flash.temp_password && <span className="block mt-2 font-mono">Contraseña temporal: {flash.temp_password}</span>}
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Card title={editingUser ? 'Editar usuario' : 'Agregar usuario'} className="h-fit">
                        <form onSubmit={submit} className="space-y-4">
                            <label className="block text-sm font-medium dark:text-slate-200">
                                Nombre
                                <input className="mt-1 w-full rounded border-slate-300 dark:bg-surface-900" value={data.name} onChange={(event) => setData('name', event.target.value)} required />
                                {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                            </label>
                            <label className="block text-sm font-medium dark:text-slate-200">
                                Correo
                                <input type="email" className="mt-1 w-full rounded border-slate-300 dark:bg-surface-900" value={data.email} onChange={(event) => setData('email', event.target.value)} required />
                                {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                            </label>
                            <label className="block text-sm font-medium dark:text-slate-200">
                                Teléfono
                                <input className="mt-1 w-full rounded border-slate-300 dark:bg-surface-900" value={data.phone} onChange={(event) => setData('phone', event.target.value)} required />
                                {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
                            </label>
                            <label className="block text-sm font-medium dark:text-slate-200">
                                Rol
                                <select className="mt-1 w-full rounded border-slate-300 dark:bg-surface-900" value={data.role} onChange={(event) => handleRoleChange(event.target.value)}>
                                    <option value="member">Miembro</option>
                                    <option value="agent">Agente</option>
                                </select>
                                {errors.role && <span className="text-red-500 text-xs">{errors.role}</span>}
                            </label>

                            {data.role === 'member' && (
                                <label className="block text-sm font-medium dark:text-slate-200">
                                    Puesto
                                    <input className="mt-1 w-full rounded border-slate-300 dark:bg-surface-900" value={data.position} onChange={(event) => setData('position', event.target.value)} />
                                    {errors.position && <span className="text-red-500 text-xs">{errors.position}</span>}
                                </label>
                            )}

                            {data.role === 'agent' && (
                                <>
                                    <label className="block text-sm font-medium dark:text-slate-200">
                                        Encargado / supervisor
                                        <select className="mt-1 w-full rounded border-slate-300 dark:bg-surface-900" value={data.manager_id} onChange={(event) => setData('manager_id', event.target.value)}>
                                            <option value="">Sin encargado</option>
                                            {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}{manager.role === 'owner' ? ' (Owner)' : ''}</option>)}
                                        </select>
                                        {errors.manager_id && <span className="text-red-500 text-xs">{errors.manager_id}</span>}
                                    </label>
                                    <label className="block text-sm font-medium dark:text-slate-200">
                                        Especialidad / puesto
                                        <input className="mt-1 w-full rounded border-slate-300 dark:bg-surface-900" value={data.specialty} onChange={(event) => setData('specialty', event.target.value)} />
                                    </label>
                                    <label className="block text-sm font-medium dark:text-slate-200">
                                        Estado operativo
                                        <select className="mt-1 w-full rounded border-slate-300 dark:bg-surface-900" value={data.agent_status} onChange={(event) => setData('agent_status', event.target.value)}>
                                            <option value="active">Activo</option>
                                            <option value="inactive">Inactivo</option>
                                            <option value="on_leave">De permiso</option>
                                        </select>
                                        {errors.agent_status && <span className="text-red-500 text-xs">{errors.agent_status}</span>}
                                    </label>
                                    <label className="block text-sm font-medium dark:text-slate-200">
                                        Notas
                                        <textarea className="mt-1 w-full rounded border-slate-300 dark:bg-surface-900" rows="3" value={data.notes} onChange={(event) => setData('notes', event.target.value)} />
                                    </label>
                                </>
                            )}

                            {editingUser && (
                                <label className="flex items-center gap-2 text-sm dark:text-slate-200">
                                    <input type="checkbox" checked={data.is_active} onChange={(event) => setData('is_active', event.target.checked)} />
                                    Cuenta activa
                                </label>
                            )}

                            <div className="flex gap-2">
                                {editingUser && <button type="button" onClick={clearForm} className="w-full py-2 bg-slate-200 rounded">Cancelar</button>}
                                <button type="submit" disabled={processing} className="w-full py-2 bg-brand-600 text-white rounded disabled:opacity-50">
                                    {processing ? 'Guardando...' : editingUser ? 'Guardar cambios' : 'Crear usuario'}
                                </button>
                            </div>
                        </form>
                    </Card>

                    <Card className="xl:col-span-2 overflow-x-auto">
                        <form onSubmit={applyFilters} className="flex flex-col sm:flex-row gap-3 mb-5">
                            <input className="flex-1 rounded border-slate-300 dark:bg-surface-900" placeholder="Buscar nombre o correo" value={data.search} onChange={(event) => setData('search', event.target.value)} />
                            <select className="rounded border-slate-300 dark:bg-surface-900" value={data.filter_role} onChange={(event) => setData('filter_role', event.target.value)}>
                                <option value="">Todos los roles</option>
                                <option value="member">Miembros</option>
                                <option value="agent">Agentes</option>
                            </select>
                            <button className="px-4 py-2 bg-slate-800 text-white rounded">Filtrar</button>
                        </form>

                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b dark:border-slate-700">
                                    <th className="py-3 dark:text-white">Usuario</th>
                                    <th className="py-3 dark:text-white">Rol / estado</th>
                                    <th className="py-3 dark:text-white">Encargado</th>
                                    <th className="py-3 text-right dark:text-white">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.data.map((member) => (
                                    <tr key={member.id} className="border-b dark:border-slate-700">
                                        <td className="py-3">
                                            <div className="font-medium dark:text-white">{member.name}</div>
                                            <div className="text-sm text-slate-500">{member.email}</div>
                                            {member.role === 'agent' && member.agent_profile?.specialty && <div className="text-xs text-slate-500">{member.agent_profile.specialty}</div>}
                                        </td>
                                        <td className="py-3 space-y-1">
                                            <div><Badge color={member.role === 'agent' ? 'warning' : 'brand'}>{member.role === 'agent' ? 'Agente' : 'Miembro'}</Badge></div>
                                            <div className="text-xs text-slate-500">{member.is_active ? 'Cuenta activa' : 'Cuenta inactiva'}{member.agent_profile ? ` · ${member.agent_profile.status}` : ''}</div>
                                        </td>
                                        <td className="py-3 text-sm text-slate-500">{member.manager?.name || (member.role === 'agent' ? 'Sin encargado' : '—')}</td>
                                        <td className="py-3 text-right space-x-3 text-sm whitespace-nowrap">
                                            <button onClick={() => editUser(member)} className="text-brand-600 hover:underline">Editar</button>
                                            <button onClick={() => resetPassword(member.id)} className="text-amber-600 hover:underline">Restablecer contraseña</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {teamMembers.data.length === 0 && <p className="text-center py-6 text-slate-500">No hay usuarios para mostrar.</p>}
                        {teamMembers.links && <div className="flex flex-wrap gap-2 mt-5">{teamMembers.links.map((link, index) => <button key={index} disabled={!link.url} onClick={() => link.url && router.visit(link.url)} className={`px-3 py-1 rounded ${link.active ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-surface-800 dark:text-white'} ${!link.url ? 'opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</div>}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
