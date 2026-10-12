import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';

const actionLabels = {
    updated: 'Datos actualizados',
    suspended: 'Organización suspendida',
    reactivated: 'Organización reactivada',
};

export default function Show({ organization }) {
    const editForm = useForm({ name: organization.name });
    const suspendForm = useForm({ reason: '' });
    const reactivateForm = useForm({});

    const updateOrganization = (event) => {
        event.preventDefault();
        editForm.put(`/super-admin/organizations/${organization.id}`);
    };

    const suspendOrganization = (event) => {
        event.preventDefault();
        suspendForm.post(`/super-admin/organizations/${organization.id}/suspend`, {
            onSuccess: () => suspendForm.reset('reason'),
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-5xl space-y-6">
            <Link href="/super-admin/organizations" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-300"><ArrowLeft size={17} /> Organizaciones</Link>

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-start sm:justify-between dark:border-slate-700 dark:bg-surface-800">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{organization.name}</h1>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${organization.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                            {organization.status === 'active' ? 'Activa' : 'Suspendida'}
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{organization.slug} · Creada {new Date(organization.created_at).toLocaleDateString('es-MX')}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-surface-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Usuarios</p>
                    <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{organization.users_count}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-surface-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos generales</h2>
                    <form onSubmit={updateOrganization} className="mt-5 space-y-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Nombre de la organización
                            <input value={editForm.data.name} onChange={(event) => editForm.setData('name', event.target.value)} required maxLength="255" className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {editForm.errors.name && <span className="mt-1 block text-xs text-red-600">{editForm.errors.name}</span>}
                        </label>
                        <button type="submit" disabled={editForm.processing} className="min-h-10 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">Guardar cambios</button>
                    </form>
                    <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Owner principal</h3>
                        {organization.owner ? (
                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                <p className="font-medium">{organization.owner.name} {!organization.owner.is_active && <span className="text-amber-600">(cuenta inactiva)</span>}</p>
                                <p className="mt-1">{organization.owner.email}</p>
                                {organization.owner.phone && <p className="mt-1">{organization.owner.phone}</p>}
                            </div>
                        ) : <p className="mt-2 text-sm text-slate-500">No se encontró una cuenta owner.</p>}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-surface-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Acceso a la plataforma</h2>
                    {organization.status === 'active' ? (
                        <form onSubmit={suspendOrganization} className="mt-5 space-y-4">
                            <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                                <ShieldAlert size={19} className="mt-0.5 shrink-0" />
                                <p>La suspensión bloqueará el acceso de todas las cuentas de esta organización, incluidas las sesiones abiertas. Sus datos se conservarán.</p>
                            </div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Motivo de suspensión
                                <textarea value={suspendForm.data.reason} onChange={(event) => suspendForm.setData('reason', event.target.value)} required maxLength="1000" rows="3" className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                                {suspendForm.errors.reason && <span className="mt-1 block text-xs text-red-600">{suspendForm.errors.reason}</span>}
                            </label>
                            <button type="submit" disabled={suspendForm.processing} className="min-h-10 rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50">Suspender organización</button>
                        </form>
                    ) : (
                        <div className="mt-5 space-y-4">
                            <div className="flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200">
                                <ShieldCheck size={19} className="mt-0.5 shrink-0" />
                                <p>La organización está suspendida. Sus datos se mantienen y el acceso puede restablecerse.</p>
                            </div>
                            <button type="button" onClick={() => reactivateForm.post(`/super-admin/organizations/${organization.id}/reactivate`)} disabled={reactivateForm.processing} className="min-h-10 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">Reactivar organización</button>
                        </div>
                    )}
                </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-surface-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Registro administrativo</h2>
                <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-700">
                    {organization.admin_audits.map((audit) => (
                        <article key={audit.id} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{actionLabels[audit.action] || audit.action}</p>
                                <time className="text-xs text-slate-500 dark:text-slate-400">{new Date(audit.created_at).toLocaleString('es-MX')}</time>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{audit.actor?.name || 'Administrador eliminado'}{audit.actor?.email ? ` · ${audit.actor.email}` : ''}</p>
                            {audit.reason && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Motivo: {audit.reason}</p>}
                            {audit.changes?.name && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Nombre: {audit.changes.name.from} → {audit.changes.name.to}</p>}
                        </article>
                    ))}
                    {organization.admin_audits.length === 0 && <p className="py-4 text-sm text-slate-500">No hay acciones administrativas registradas.</p>}
                </div>
            </section>
            </div>
        </AuthenticatedLayout>
    );
}
