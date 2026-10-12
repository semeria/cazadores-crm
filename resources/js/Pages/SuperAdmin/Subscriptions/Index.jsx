import React from 'react';
import { Link, router } from '@inertiajs/react';
import { ClipboardList, Download, Search } from 'lucide-react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';

const subscriptionStatusLabels = {
    pending_payment: 'Pendiente de pago',
    active: 'Activa',
    trialing: 'Prueba',
    grace_period: 'En gracia',
    expired: 'Vencida',
    rejected: 'Rechazada',
    cancelled: 'Cancelada',
};

const paymentStatusLabels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    cancelled: 'Cancelado',
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('es-MX') : '—';
const money = (value) => `$${Number(value || 0).toFixed(2)} MXN`;

export default function Index({ subscriptions, filters, summary }) {
    const submitFilters = (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget).entries());
        router.get('/super-admin/subscriptions', values, { preserveState: true, replace: true });
    };

    const exportQuery = new URLSearchParams(Object.entries(filters).filter(([, value]) => value)).toString();
    const exportHref = `/super-admin/subscriptions/export${exportQuery ? `?${exportQuery}` : ''}`;

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Monetización SaaS</p>
                        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white"><ClipboardList size={24} /> Suscripciones y canjes</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Consulta qué organizaciones pagaron, qué cupones utilizaron y el estado de su acceso.</p>
                    </div>
                    <a href={exportHref} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-surface-800 dark:text-slate-200 dark:hover:bg-slate-700"><Download size={16} />Exportar CSV</a>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {[
                        ['Registros', summary.subscriptions],
                        ['Pagos aprobados', summary.paid_count],
                        ['Importe aprobado', money(summary.paid_amount)],
                        ['Con cupón', summary.coupon_count],
                        ['Pruebas', summary.trial_count],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-surface-800">
                            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                        </div>
                    ))}
                </div>

                <form onSubmit={submitFilters} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6 dark:border-slate-700 dark:bg-surface-800">
                    <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 lg:col-span-2 dark:border-slate-700">
                        <Search size={16} className="shrink-0 text-slate-400" />
                        <input name="search" defaultValue={filters.search || ''} placeholder="Organización u owner" className="w-full border-0 bg-transparent text-sm focus:ring-0 dark:text-white" />
                    </label>
                    <select name="type" defaultValue={filters.type || ''} aria-label="Tipo de registro" className="min-h-10 rounded-xl border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-surface-900 dark:text-white">
                        <option value="">Todos los tipos</option><option value="paid">Con pago aprobado</option><option value="with_coupon">Con cupón</option><option value="trial">Pruebas</option>
                    </select>
                    <select name="status" defaultValue={filters.status || ''} aria-label="Estado de suscripción" className="min-h-10 rounded-xl border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-surface-900 dark:text-white">
                        <option value="">Todos los estados</option>
                        {Object.entries(subscriptionStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <select name="payment_status" defaultValue={filters.payment_status || ''} aria-label="Estado del pago" className="min-h-10 rounded-xl border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-surface-900 dark:text-white">
                        <option value="">Todos los pagos</option><option value="approved">Aprobado</option><option value="pending">Pendiente</option><option value="rejected">Rechazado</option><option value="cancelled">Cancelado</option><option value="none">Sin pago (prueba)</option>
                    </select>
                    <input name="coupon_code" defaultValue={filters.coupon_code || ''} placeholder="Código de cupón" aria-label="Filtrar por cupón" className="min-h-10 rounded-xl border-slate-200 text-sm uppercase dark:border-slate-700 dark:bg-surface-900 dark:text-white" />
                    <label className="text-xs font-medium text-slate-500">Solicitado desde<input type="date" name="from" defaultValue={filters.from || ''} className="mt-1 block min-h-10 w-full rounded-xl border-slate-200 text-sm dark:border-slate-700 dark:bg-surface-900 dark:text-white" /></label>
                    <label className="text-xs font-medium text-slate-500">Solicitado hasta<input type="date" name="to" defaultValue={filters.to || ''} className="mt-1 block min-h-10 w-full rounded-xl border-slate-200 text-sm dark:border-slate-700 dark:bg-surface-900 dark:text-white" /></label>
                    <button type="submit" className="min-h-10 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800">Filtrar</button>
                    <Link href="/super-admin/subscriptions" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Limpiar</Link>
                </form>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-surface-800">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1250px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-surface-900 dark:text-slate-400">
                                <tr><th className="px-4 py-3">Organización / owner</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Suscripción</th><th className="px-4 py-3">Importes</th><th className="px-4 py-3">Pago</th><th className="px-4 py-3">Cupón</th><th className="px-4 py-3">Fechas</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {subscriptions.data.map((subscription) => (
                                    <tr key={subscription.id} className="align-top">
                                        <td className="px-4 py-4"><p className="font-semibold text-slate-900 dark:text-white">{subscription.organization?.name || 'Organización'}</p><p className="mt-1 text-xs text-slate-500">{subscription.organization?.slug}</p><p className="mt-2 text-xs text-slate-700 dark:text-slate-300">{subscription.organization?.owner?.name || 'Sin owner'}</p><p className="text-xs text-slate-500">{subscription.organization?.owner?.email}</p></td>
                                        <td className="px-4 py-4"><p className="font-semibold text-slate-800 dark:text-slate-200">{subscription.plan_name}</p><p className="mt-1 text-xs text-slate-500">{subscription.interval_unit === 'year' ? '1 año' : `${subscription.interval_count} días`}</p></td>
                                        <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${['active', 'trialing'].includes(subscription.effective_status) ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : subscription.effective_status === 'grace_period' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{subscriptionStatusLabels[subscription.effective_status] || subscription.effective_status}</span>{subscription.is_trial && <p className="mt-2 text-xs text-brand-700 dark:text-brand-300">Prueba {subscription.free_months} meses</p>}</td>
                                        <td className="px-4 py-4 text-xs"><p>Lista: {money(subscription.plan_price)}</p><p className="mt-1 text-emerald-700 dark:text-emerald-300">Descuento: −{money(subscription.discount_amount)}</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">Solicitado: {money(subscription.amount_due)}</p></td>
                                        <td className="px-4 py-4"><p className="font-medium text-slate-800 dark:text-slate-200">{subscription.payment ? paymentStatusLabels[subscription.payment.status] || subscription.payment.status : 'Sin pago'}</p><p className="mt-1 text-xs text-slate-500">{subscription.payment?.provider === 'manual_transfer' ? 'Transferencia' : subscription.payment?.provider || (subscription.is_trial ? 'Prueba' : '—')}</p>{subscription.payment?.reviewed_at && <p className="mt-1 text-xs text-slate-500">Revisado {formatDate(subscription.payment.reviewed_at)}</p>}</td>
                                        <td className="px-4 py-4">{subscription.coupon_code ? <><p className="font-semibold text-brand-700 dark:text-brand-300">{subscription.coupon_code}</p><p className="mt-1 text-xs text-slate-500">{subscription.couponRedemption?.status === 'reserved' ? 'Reservado' : subscription.couponRedemption?.status === 'released' ? 'Liberado' : 'Canjeado'}</p>{subscription.free_months > 0 && <p className="mt-1 text-xs text-slate-500">{subscription.free_months} meses gratis</p>}</> : <span className="text-slate-400">—</span>}</td>
                                        <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300"><p>Solicitud: {formatDate(subscription.requested_at)}</p><p className="mt-1">Inicio: {formatDate(subscription.starts_at)}</p><p className="mt-1">Fin: {formatDate(subscription.ends_at)}</p>{subscription.effective_status === 'grace_period' && <p className="mt-1 text-amber-700 dark:text-amber-300">Gracia: {formatDate(subscription.grace_ends_at)}</p>}</td>
                                    </tr>
                                ))}
                                {subscriptions.data.length === 0 && <tr><td colSpan="7" className="px-5 py-12 text-center text-sm text-slate-500">No hay suscripciones que coincidan con los filtros.</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    {subscriptions.links.length > 3 && <div className="flex flex-wrap justify-end gap-1 border-t border-slate-100 p-4 dark:border-slate-700">{subscriptions.links.map((link, index) => <Link key={`${link.label}-${index}`} href={link.url || '#'} preserveScroll className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</div>}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
