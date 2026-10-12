import React from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Archive, Gift, Plus, Save } from 'lucide-react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';

const emptyCoupon = {
    id: null,
    code: '',
    name: '',
    description: '',
    benefit_type: 'percentage',
    benefit_value: '',
    is_trial: false,
    starts_at: '',
    expires_at: '',
    max_redemptions: '',
};

const localDateTime = (value) => value ? new Date(value).toISOString().slice(0, 16) : '';

const benefitLabel = (coupon) => {
    if (coupon.is_trial) return `${coupon.benefit_value} meses de prueba`;
    if (coupon.benefit_type === 'percentage') return `${coupon.benefit_value}% de descuento`;
    if (coupon.benefit_type === 'fixed') return `$${Number(coupon.benefit_value).toFixed(2)} MXN de descuento`;
    return `${coupon.benefit_value} meses gratis`;
};

export default function Index({ coupons }) {
    const form = useForm(emptyCoupon);
    const isFreeMonths = form.data.benefit_type === 'free_months';

    const submit = (event) => {
        event.preventDefault();
        if (form.data.id) {
            form.put(`/super-admin/coupons/${form.data.id}`, { preserveScroll: true });
        } else {
            form.post('/super-admin/coupons', {
                preserveScroll: true,
                onSuccess: () => form.reset(),
            });
        }
    };

    const edit = (coupon) => form.setData({
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || '',
        benefit_type: coupon.benefit_type,
        benefit_value: coupon.benefit_value,
        is_trial: coupon.is_trial,
        starts_at: localDateTime(coupon.starts_at),
        expires_at: localDateTime(coupon.expires_at),
        max_redemptions: coupon.max_redemptions || '',
    });

    const toggleActive = (coupon) => router.patch(`/super-admin/coupons/${coupon.id}/active`, {
        is_active: !coupon.is_active,
    }, { preserveScroll: true });

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Monetización SaaS</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Cupones</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Los códigos no se acumulan y cada organización puede canjear cada cupón una vez.</p>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-surface-800">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Plus size={19} />{form.data.id ? 'Editar cupón' : 'Crear cupón'}</h2>
                    <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Código
                            <input required maxLength="64" value={form.data.code} onChange={(event) => form.setData('code', event.target.value.toUpperCase())} className="mt-1.5 w-full rounded-xl border-slate-300 uppercase dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.code && <span className="mt-1 block text-xs text-red-600">{form.errors.code}</span>}
                        </label>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre interno
                            <input required maxLength="120" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.name && <span className="mt-1 block text-xs text-red-600">{form.errors.name}</span>}
                        </label>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Beneficio
                            <select value={form.data.benefit_type} onChange={(event) => form.setData({ ...form.data, benefit_type: event.target.value, is_trial: false })} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white">
                                <option value="percentage">Descuento porcentual</option>
                                <option value="fixed">Descuento fijo (MXN)</option>
                                <option value="free_months">Meses gratis</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{form.data.benefit_type === 'percentage' ? 'Porcentaje (máximo 100)' : form.data.benefit_type === 'fixed' ? 'Monto MXN' : 'Meses gratis (1 a 12)'}
                            <input required type="number" min={form.data.benefit_type === 'free_months' ? '1' : '0.01'} max={form.data.benefit_type === 'percentage' ? '100' : form.data.benefit_type === 'free_months' ? '12' : undefined} step={form.data.benefit_type === 'free_months' ? '1' : '0.01'} value={form.data.benefit_value} onChange={(event) => form.setData('benefit_value', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.benefit_value && <span className="mt-1 block text-xs text-red-600">{form.errors.benefit_value}</span>}
                        </label>
                        {isFreeMonths && (
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <input type="checkbox" checked={form.data.is_trial} onChange={(event) => form.setData('is_trial', event.target.checked)} className="rounded border-slate-300 text-brand-700 focus:ring-brand-500" />
                                Activar como prueba con acceso inmediato
                                <Gift size={16} className="text-brand-600" />
                            </label>
                        )}
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Válido desde
                            <input type="datetime-local" value={form.data.starts_at} onChange={(event) => form.setData('starts_at', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.starts_at && <span className="mt-1 block text-xs text-red-600">{form.errors.starts_at}</span>}
                        </label>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Válido hasta
                            <input type="datetime-local" value={form.data.expires_at} onChange={(event) => form.setData('expires_at', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.expires_at && <span className="mt-1 block text-xs text-red-600">{form.errors.expires_at}</span>}
                        </label>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Límite total de canjes (opcional)
                            <input type="number" min="1" value={form.data.max_redemptions} onChange={(event) => form.setData('max_redemptions', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.max_redemptions && <span className="mt-1 block text-xs text-red-600">{form.errors.max_redemptions}</span>}
                        </label>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2">Descripción
                            <textarea rows="2" maxLength="2000" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.description && <span className="mt-1 block text-xs text-red-600">{form.errors.description}</span>}
                        </label>
                        {form.errors.is_trial && <p className="text-xs text-red-600 md:col-span-2">{form.errors.is_trial}</p>}
                        <div className="flex gap-2 md:col-span-2">
                            <button type="submit" disabled={form.processing} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"><Save size={16} />{form.data.id ? 'Guardar cupón' : 'Crear cupón'}</button>
                            {form.data.id && <button type="button" onClick={() => form.reset()} className="min-h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">Cancelar edición</button>}
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-surface-800">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-surface-900 dark:text-slate-400"><tr><th className="px-5 py-3">Cupón</th><th className="px-5 py-3">Beneficio</th><th className="px-5 py-3">Canjes</th><th className="px-5 py-3">Vigencia</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3" /></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id}>
                                        <td className="px-5 py-4"><p className="font-bold text-slate-900 dark:text-white">{coupon.code}</p><p className="mt-1 text-xs text-slate-500">{coupon.name}</p></td>
                                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{benefitLabel(coupon)}</td>
                                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                            {Number(coupon.used_count) + Number(coupon.reserved_count) > 0 ? <Link href={`/super-admin/subscriptions?coupon_code=${encodeURIComponent(coupon.code)}`} className="font-semibold text-brand-700 hover:underline dark:text-brand-300">{Number(coupon.used_count) + Number(coupon.reserved_count)}{coupon.max_redemptions ? ` / ${coupon.max_redemptions}` : ''}</Link> : '0'}
                                            {coupon.reserved_count > 0 && <span className="mt-1 block text-xs text-slate-500">{coupon.reserved_count} pendiente(s)</span>}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">{coupon.starts_at ? new Date(coupon.starts_at).toLocaleDateString('es-MX') : 'Ahora'} — {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('es-MX') : 'Sin vencimiento'}</td>
                                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${coupon.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{coupon.is_active ? 'Activo' : 'Inactivo'}</span></td>
                                        <td className="px-5 py-4 text-right"><div className="inline-flex gap-3"><button type="button" onClick={() => edit(coupon)} className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Editar</button><button type="button" onClick={() => toggleActive(coupon)} className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><Archive size={15} />{coupon.is_active ? 'Desactivar' : 'Activar'}</button></div></td>
                                    </tr>
                                ))}
                                {coupons.length === 0 && <tr><td colSpan="6" className="px-5 py-10 text-center text-slate-500">Aún no hay cupones creados.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
