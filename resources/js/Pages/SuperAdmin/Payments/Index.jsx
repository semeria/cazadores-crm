import React from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Check, Clock3, X } from 'lucide-react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';

const statusLabels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    cancelled: 'Cancelado',
};

function PaymentReview({ payment }) {
    const form = useForm({ review_note: '' });
    const pending = payment.status === 'pending';

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-surface-800">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-900 dark:text-white">{payment.organization.name}</h2>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${payment.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : payment.status === 'approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{statusLabels[payment.status]}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{payment.organization.slug}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{payment.subscription.plan_name} · {payment.subscription.interval_unit === 'year' ? '1 año' : `${payment.subscription.interval_count} días`}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">${Number(payment.amount).toFixed(2)} {payment.currency} · Transferencia bancaria</p>
                    {payment.subscription.coupon_code && <p className="mt-1 text-xs text-slate-500">Cupón: {payment.subscription.coupon_code}</p>}
                    <p className="mt-2 text-xs text-slate-500">Solicitado {new Date(payment.created_at).toLocaleString('es-MX')}</p>
                    {payment.review_note && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Nota: {payment.review_note}</p>}
                    {payment.reviewer && <p className="mt-1 text-xs text-slate-500">Revisó {payment.reviewer.name}</p>}
                </div>

                {pending && (
                    <form className="w-full space-y-3 lg:max-w-md" onSubmit={(event) => event.preventDefault()}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nota interna / motivo de rechazo
                            <textarea rows="2" maxLength="1000" value={form.data.review_note} onChange={(event) => form.setData('review_note', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.review_note && <span className="mt-1 block text-xs text-red-600">{form.errors.review_note}</span>}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" disabled={form.processing} onClick={() => form.post(`/super-admin/payments/${payment.id}/approve`, { preserveScroll: true })} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><Check size={16} />Aprobar y activar</button>
                            <button type="button" disabled={form.processing || !form.data.review_note.trim()} onClick={() => form.post(`/super-admin/payments/${payment.id}/reject`, { preserveScroll: true })} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-900/20"><X size={16} />Rechazar</button>
                        </div>
                    </form>
                )}
            </div>
        </article>
    );
}

export default function Index({ payments, filters }) {
    const filter = (event) => {
        router.get('/super-admin/payments', { status: event.target.value }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Monetización SaaS</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Pagos y activaciones</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Verifica las transferencias y activa las suscripciones manualmente.</p>
                    </div>
                    <Link href="/super-admin/billing-settings" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-surface-800 dark:text-slate-200 dark:hover:bg-slate-700">Instrucciones de transferencia</Link>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-surface-800">
                    <Clock3 size={18} className="text-brand-600" />
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado
                        <select value={filters.status || ''} onChange={filter} className="ml-3 rounded-lg border-slate-300 text-sm dark:border-slate-600 dark:bg-surface-900 dark:text-white">
                            <option value="">Todos</option><option value="pending">Pendientes</option><option value="approved">Aprobados</option><option value="rejected">Rechazados</option><option value="cancelled">Cancelados</option>
                        </select>
                    </label>
                </div>

                <div className="space-y-3">
                    {payments.data.map((payment) => <PaymentReview key={payment.id} payment={payment} />)}
                    {payments.data.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-surface-800">No hay pagos para este filtro.</div>}
                </div>

                {payments.links.length > 3 && <div className="flex flex-wrap justify-end gap-1">{payments.links.map((link, index) => <Link key={`${link.label}-${index}`} href={link.url || '#'} preserveScroll className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</div>}
            </div>
        </AuthenticatedLayout>
    );
}
