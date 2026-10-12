import React, { useEffect, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import Card from '../../../Components/UI/Card';

export default function Edit({ organization, settings }) {
    const { flash } = usePage().props;
    const { data, setData, post, transform, processing, errors } = useForm({
        quote_prefix: settings.quote_prefix,
        number_padding: settings.number_padding,
        logo: null,
        remove_logo: false,
    });
    const [localLogoPreview, setLocalLogoPreview] = useState(null);

    useEffect(() => {
        if (!data.logo) {
            setLocalLogoPreview(null);
            return undefined;
        }

        const preview = URL.createObjectURL(data.logo);
        setLocalLogoPreview(preview);

        return () => URL.revokeObjectURL(preview);
    }, [data.logo]);

    const submit = (event) => {
        event.preventDefault();
        transform((formData) => ({ ...formData, _method: 'put' }));
        post('/quotes/settings', { forceFormData: true });
    };

    const inputClass = 'mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-slate-600 dark:bg-surface-900 dark:text-white';
    const logoPreview = localLogoPreview || (!data.remove_logo ? settings.logo_url : null);

    return (
        <AuthenticatedLayout>
            <Head title="Configuración de cotizaciones" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <Link href="/quotes" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-300"><ArrowLeft size={17} /> Cotizaciones</Link>
                    <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">Configuración de cotizaciones</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Personaliza el logo vigente y el formato de los folios de {organization.name}.</p>
                </div>

                {flash?.success && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/25 dark:text-emerald-300">{flash.success}</div>}

                <form onSubmit={submit} className="space-y-6">
                    <Card title="Identidad de la organización">
                        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Logo
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(event) => {
                                            setData('logo', event.target.files?.[0] || null);
                                            setData('remove_logo', false);
                                        }}
                                        className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-800 dark:file:bg-brand-900/30 dark:file:text-brand-300`}
                                    />
                                    <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">PNG, JPG o WebP, máximo 4 MB. Las cotizaciones siempre muestran el logo vigente.</span>
                                    {errors.logo && <span className="mt-1 block text-xs text-red-600">{errors.logo}</span>}
                                </label>

                                {settings.has_logo && !data.logo && (
                                    <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <input type="checkbox" checked={data.remove_logo} onChange={(event) => setData('remove_logo', event.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                                        Quitar el logo actual
                                    </label>
                                )}
                            </div>

                            <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-surface-900">
                                {logoPreview ? (
                                    <img src={logoPreview} alt={`Logo de ${organization.name}`} className="max-h-28 max-w-full object-contain" />
                                ) : (
                                    <div className="text-center text-slate-400 dark:text-slate-500">
                                        <ImagePlus size={25} className="mx-auto" />
                                        <p className="mt-2 text-xs">Sin logo configurado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card title="Formato del folio">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Prefijo
                                <input value={data.quote_prefix} onChange={(event) => setData('quote_prefix', event.target.value)} className={inputClass} maxLength="20" required />
                                {errors.quote_prefix && <span className="mt-1 block text-xs text-red-600">{errors.quote_prefix}</span>}
                            </label>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Dígitos del consecutivo
                                <input type="number" min="1" max="12" step="1" value={data.number_padding} onChange={(event) => setData('number_padding', event.target.value)} className={inputClass} required />
                                {errors.number_padding && <span className="mt-1 block text-xs text-red-600">{errors.number_padding}</span>}
                            </label>
                        </div>
                        <div className="mt-5 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900 dark:bg-brand-900/20 dark:text-brand-200">
                            Ejemplo de formato: <strong>{data.quote_prefix || 'COT-'}{String(1).padStart(Number(data.number_padding) || 6, '0')}</strong>. El consecutivo avanza automáticamente por organización.
                        </div>
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Los folios existentes no cambian si actualizas el prefijo o la cantidad de dígitos.</p>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href="/quotes" className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</Link>
                        <button type="submit" disabled={processing} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-500 disabled:opacity-50">
                            {processing ? 'Guardando…' : 'Guardar configuración'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
