import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';

export default function Edit({ settings }) {
    const form = useForm({
        transfer_instructions: settings.transfer_instructions || '',
        registrations_enabled: Boolean(settings.registrations_enabled),
    });

    const submit = (event) => {
        event.preventDefault();
        form.put('/super-admin/settings');
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-3xl space-y-6">
                <Link href="/super-admin/organizations" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-300"><ArrowLeft size={17} /> Administración</Link>
                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-surface-800">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Configuración de plataforma</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Ajustes de plataforma</h1>
                    <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                        <label className="flex cursor-pointer items-start gap-3">
                            <input type="checkbox" checked={form.data.registrations_enabled} onChange={(event) => form.setData('registrations_enabled', event.target.checked)} className="mt-1 rounded border-slate-300 text-brand-700 focus:ring-brand-500 dark:border-slate-600 dark:bg-surface-900" />
                            <span>
                                <span className="block text-sm font-semibold text-slate-900 dark:text-white">Permitir registro de organizaciones</span>
                                <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">Al desactivarlo, las nuevas organizaciones no podrán crear cuentas. Las organizaciones existentes no se ven afectadas.</span>
                            </span>
                        </label>
                    </div>
                    <h2 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">Instrucciones de transferencia</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Este texto se mostrará a los owners con una solicitud pendiente. Incluye únicamente los datos de pago que quieras compartir.</p>
                    <form onSubmit={submit} className="mt-5 space-y-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Instrucciones
                            <textarea rows="8" maxLength="10000" value={form.data.transfer_instructions} onChange={(event) => form.setData('transfer_instructions', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white" />
                            {form.errors.transfer_instructions && <span className="mt-1 block text-xs text-red-600">{form.errors.transfer_instructions}</span>}
                        </label>
                        <button type="submit" disabled={form.processing} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"><Save size={16} />Guardar ajustes</button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
