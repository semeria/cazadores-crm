import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Building2, Search } from 'lucide-react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';

const statusLabels = {
    active: 'Activa',
    suspended: 'Suspendida',
};

export default function Index({ organizations, filters, summary }) {
    const handleSearch = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        router.get('/super-admin/organizations', Object.fromEntries(data.entries()), {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Administración SaaS</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Organizaciones</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Controla el acceso y los datos generales de cada organización.</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-surface-800 dark:text-slate-200">
                    <Building2 size={18} className="text-brand-600 dark:text-brand-400" />
                    {summary.total} organizaciones
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                {[
                    ['Total', summary.total],
                    ['Activas', summary.active],
                    ['Suspendidas', summary.suspended],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-surface-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row dark:border-slate-700 dark:bg-surface-800">
                <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 dark:border-slate-700">
                    <Search size={17} className="text-slate-400" />
                    <input name="search" defaultValue={filters.search || ''} placeholder="Buscar organización, slug u owner" className="w-full border-0 bg-transparent text-sm focus:ring-0 dark:text-white" />
                </label>
                <select name="status" defaultValue={filters.status || ''} aria-label="Filtrar por estado" className="min-h-11 rounded-xl border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-surface-900 dark:text-white">
                    <option value="">Todos los estados</option>
                    <option value="active">Activas</option>
                    <option value="suspended">Suspendidas</option>
                </select>
                <button type="submit" className="min-h-11 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800">Buscar</button>
            </form>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-surface-800">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-surface-900 dark:text-slate-400">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Organización</th>
                                <th className="px-5 py-3 font-semibold">Owner</th>
                                <th className="px-5 py-3 font-semibold">Usuarios</th>
                                <th className="px-5 py-3 font-semibold">Estado</th>
                                <th className="px-5 py-3 font-semibold">Alta</th>
                                <th className="px-5 py-3"><span className="sr-only">Acción</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {organizations.data.map((organization) => (
                                <tr key={organization.id} className="text-sm">
                                    <td className="px-5 py-4">
                                        <Link href={`/super-admin/organizations/${organization.id}`} className="font-semibold text-slate-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300">{organization.name}</Link>
                                        <p className="mt-1 text-xs text-slate-500">{organization.slug}</p>
                                    </td>
                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {organization.owner ? <><span className="block">{organization.owner.name}</span><span className="mt-1 block text-xs text-slate-500">{organization.owner.email}</span></> : 'Sin owner'}
                                    </td>
                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{organization.users_count}</td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${organization.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                            {statusLabels[organization.status] || organization.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{new Date(organization.created_at).toLocaleDateString('es-MX')}</td>
                                    <td className="px-5 py-4 text-right"><Link href={`/super-admin/organizations/${organization.id}`} className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Ver detalle</Link></td>
                                </tr>
                            ))}
                            {organizations.data.length === 0 && <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">No hay organizaciones que coincidan con la búsqueda.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {organizations.links.length > 3 && (
                    <div className="flex flex-wrap justify-end gap-1 border-t border-slate-100 p-4 dark:border-slate-700">
                        {organizations.links.map((link, index) => (
                            <Link key={`${link.label}-${index}`} href={link.url || '#'} preserveScroll className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
            </div>
        </AuthenticatedLayout>
    );
}
