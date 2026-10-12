import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { BadgeCheck, Clock3, CreditCard, Gift } from 'lucide-react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

const statusLabels = {
    legacy: 'Acceso heredado',
    no_subscription: 'Sin suscripción',
    pending_payment: 'Esperando aprobación',
    active: 'Activa',
    trialing: 'Prueba activa',
    grace_period: 'Periodo de gracia',
    expired: 'Vencida',
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('es-MX') : '—';

const subscriptionStatus = (subscription) => {
    if (!['active', 'trialing'].includes(subscription.status) || !subscription.ends_at) return subscription.status;
    const now = Date.now();
    if (new Date(subscription.ends_at).getTime() >= now) return subscription.status;
    if (subscription.grace_ends_at && new Date(subscription.grace_ends_at).getTime() >= now) return 'grace_period';

    return 'expired';
};

export default function Index({ plans, legacyAccess, access, subscriptions, transferInstructions, canRequest }) {
    const form = useForm({ plan_id: '', coupon_code: '' });

    const submit = (event) => {
        event.preventDefault();
        form.post('/subscription/request');
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Cuenta de organización</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Planes y suscripción</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Consulta el acceso de tu organización y solicita un plan.</p>
                </div>

                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-surface-800">
                    <div className="flex items-start gap-3">
                        {access.has_access ? <BadgeCheck size={21} className="mt-0.5 text-emerald-600" /> : <Clock3 size={21} className="mt-0.5 text-amber-600" />}
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{statusLabels[access.status] || access.status}</p>
                            {legacyAccess ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tu organización conserva el acceso anterior mientras no se le asigne una suscripción.</p> : access.subscription?.ends_at ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{access.status === 'grace_period' ? 'El acceso termina al finalizar la gracia el ' : 'Vigente hasta el '}{formatDate(access.status === 'grace_period' ? access.subscription.grace_ends_at : access.subscription.ends_at)}.</p> : <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Solicita un plan para activar el acceso a JaegerSystem.</p>}
                        </div>
                    </div>
                    {access.subscription && <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-surface-900"><p className="font-semibold text-slate-900 dark:text-white">{access.subscription.plan_name}</p><p className="mt-1 text-slate-500">${Number(access.subscription.plan_price).toFixed(2)} MXN</p></div>}
                </section>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Planes disponibles</h2>
                        {plans.map((plan) => <article key={plan.id} className={`rounded-2xl border bg-white p-5 dark:bg-surface-800 ${String(form.data.plan_id) === String(plan.id) ? 'border-brand-500 ring-2 ring-brand-100 dark:ring-brand-900/40' : 'border-slate-200 dark:border-slate-700'}`}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div><h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3>{plan.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>}<p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">{plan.interval_unit === 'year' ? '1 año' : `${plan.interval_count} días`}</p></div>
                                <div className="text-left sm:text-right"><p className="text-xl font-bold text-slate-900 dark:text-white">${Number(plan.price).toFixed(2)} <span className="text-sm font-semibold">MXN</span></p>{canRequest && <button type="button" onClick={() => form.setData('plan_id', String(plan.id))} className="mt-2 min-h-9 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800">{String(form.data.plan_id) === String(plan.id) ? 'Seleccionado' : 'Elegir plan'}</button>}</div>
                            </div>
                        </article>)}
                        {plans.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-surface-800">Aún no hay planes publicados. Contacta al administrador de la plataforma.</p>}
                    </section>

                    <aside className="space-y-4">
                        {canRequest && plans.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-surface-800">
                            <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><CreditCard size={18} />Solicitar suscripción</h2>
                            <form onSubmit={submit} className="mt-4 space-y-3">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plan
                                    <select required value={form.data.plan_id} onChange={(event) => form.setData('plan_id', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white">
                                        <option value="">Selecciona un plan</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} — ${Number(plan.price).toFixed(2)} MXN</option>)}
                                    </select>
                                    {form.errors.plan_id && <span className="mt-1 block text-xs text-red-600">{form.errors.plan_id}</span>}
                                </label>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cupón (opcional)
                                    <input value={form.data.coupon_code} onChange={(event) => form.setData('coupon_code', event.target.value.toUpperCase())} maxLength="64" className="mt-1.5 w-full rounded-xl border-slate-300 uppercase dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                                    {form.errors.coupon_code && <span className="mt-1 block text-xs text-red-600">{form.errors.coupon_code}</span>}
                                </label>
                                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Los pagos se realizan por transferencia y se activan al ser aprobados. Los cupones de prueba habilitan acceso inmediato.</p>
                                <button type="submit" disabled={form.processing || !form.data.plan_id} className="min-h-10 w-full rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">Continuar</button>
                            </form>
                        </section>}

                        {!canRequest && <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-surface-800 dark:text-slate-300">Solo el owner de la organización puede solicitar o renovar una suscripción.</section>}

                        {subscriptions.some((subscription) => subscription.status === 'pending_payment') && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-900/10">
                            <h2 className="font-bold text-amber-900 dark:text-amber-200">Transferencia pendiente</h2>
                            {Number(subscriptions.find((subscription) => subscription.status === 'pending_payment')?.amount_due) > 0 ? <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-amber-900 dark:text-amber-100">{transferInstructions || 'El Superadministrador aún no configuró las instrucciones de transferencia.'}</div> : <p className="mt-3 text-sm leading-relaxed text-amber-900 dark:text-amber-100">El importe pendiente es $0.00 MXN. No necesitas transferir; espera la activación manual.</p>}
                            <p className="mt-3 text-xs text-amber-800 dark:text-amber-300">No es necesario adjuntar comprobante. El acceso se habilitará cuando se apruebe la solicitud.</p>
                        </section>}
                    </aside>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-surface-800">
                    <h2 className="font-bold text-slate-900 dark:text-white">Historial de solicitudes</h2>
                    <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                        {subscriptions.map((subscription) => (
                            <article key={subscription.id} className="flex flex-col gap-3 py-4 first:pt-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{subscription.plan_name} · ${Number(subscription.amount_due).toFixed(2)} MXN</p>
                                    <p className="mt-1 text-xs text-slate-500">Solicitado {formatDate(subscription.requested_at)} · {statusLabels[subscriptionStatus(subscription)] || subscriptionStatus(subscription)}{subscription.is_trial ? ' · prueba' : ''}</p>
                                    {subscription.ends_at && <p className="mt-1 text-xs text-slate-500">Vigencia hasta {formatDate(subscription.ends_at)}</p>}
                                    {subscription.payment?.review_note && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Nota: {subscription.payment.review_note}</p>}
                                </div>
                                {canRequest && subscription.status === 'pending_payment' && <Link as="button" method="post" href={`/subscription/${subscription.id}/cancel`} className="min-h-9 self-start rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">Cancelar solicitud</Link>}
                            </article>
                        ))}
                        {subscriptions.length === 0 && <p className="py-4 text-sm text-slate-500">Aún no hay solicitudes.</p>}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
