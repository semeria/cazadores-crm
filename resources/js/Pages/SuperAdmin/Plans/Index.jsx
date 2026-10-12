import React from 'react';
import { router, useForm } from '@inertiajs/react';
import { Archive, BadgeDollarSign, Plus, Save } from 'lucide-react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';

const emptyPlan = { id: null, name: '', description: '', price: '', interval_count: 30, interval_unit: 'day' };

const planPeriod = (plan) => plan.interval_unit === 'year' ? '1 año' : `${plan.interval_count} días`;

export default function Index({ plans }) {
    const form = useForm(emptyPlan);

    const submit = (event) => {
        event.preventDefault();
        if (form.data.id) {
            form.put(`/super-admin/plans/${form.data.id}`, { preserveScroll: true });
        } else {
            form.post('/super-admin/plans', {
                preserveScroll: true,
                onSuccess: () => form.reset(),
            });
        }
    };

    const edit = (plan) => form.setData({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        interval_count: plan.interval_count,
        interval_unit: plan.interval_unit,
    });

    const toggleActive = (plan) => router.patch(`/super-admin/plans/${plan.id}/active`, {
        is_active: !plan.is_active,
    }, { preserveScroll: true });

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Monetización SaaS</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Planes</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Define precios en MXN y periodos de 30 días o 1 año. Los cambios no alteran suscripciones anteriores.</p>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-surface-800">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Plus size={19} />{form.data.id ? 'Editar plan' : 'Crear plan'}</h2>
                    <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre
                            <input required maxLength="120" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.name && <span className="mt-1 block text-xs text-red-600">{form.errors.name}</span>}
                        </label>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Precio (MXN)
                            <div className="relative mt-1.5"><BadgeDollarSign size={17} className="absolute left-3 top-3 text-slate-400" /><input required type="number" min="0.01" step="0.01" value={form.data.price} onChange={(event) => form.setData('price', event.target.value)} className="w-full rounded-xl border-slate-300 pl-10 dark:border-slate-600 dark:bg-surface-900 dark:text-white" /></div>
                            {form.errors.price && <span className="mt-1 block text-xs text-red-600">{form.errors.price}</span>}
                        </label>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Periodo
                            <select value={form.data.interval_unit} onChange={(event) => form.setData({ ...form.data, interval_unit: event.target.value, interval_count: event.target.value === 'year' ? 1 : 30 })} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white">
                                <option value="day">Cada 30 días</option>
                                <option value="year">Cada 1 año</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2">Descripción
                            <textarea rows="3" maxLength="2000" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.description && <span className="mt-1 block text-xs text-red-600">{form.errors.description}</span>}
                        </label>
                        <div className="flex gap-2 md:col-span-2">
                            <button type="submit" disabled={form.processing} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"><Save size={16} />{form.data.id ? 'Guardar plan' : 'Crear plan'}</button>
                            {form.data.id && <button type="button" onClick={() => form.reset()} className="min-h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">Cancelar edición</button>}
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-surface-800">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-surface-900 dark:text-slate-400"><tr><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Precio</th><th className="px-5 py-3">Periodo</th><th className="px-5 py-3">Suscripciones</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3" /></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {plans.map((plan) => (
                                    <tr key={plan.id}>
                                        <td className="px-5 py-4"><p className="font-semibold text-slate-900 dark:text-white">{plan.name}</p>{plan.description && <p className="mt-1 max-w-lg text-xs text-slate-500">{plan.description}</p>}</td>
                                        <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">${Number(plan.price).toFixed(2)} MXN</td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{planPeriod(plan)}</td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{plan.subscriptions_count}</td>
                                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${plan.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{plan.is_active ? 'Publicado' : 'Archivado'}</span></td>
                                        <td className="px-5 py-4 text-right"><div className="inline-flex gap-3"><button type="button" onClick={() => edit(plan)} className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Editar</button><button type="button" onClick={() => toggleActive(plan)} className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><Archive size={15} />{plan.is_active ? 'Archivar' : 'Publicar'}</button></div></td>
                                    </tr>
                                ))}
                                {plans.length === 0 && <tr><td colSpan="6" className="px-5 py-10 text-center text-slate-500">Aún no hay planes creados.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
