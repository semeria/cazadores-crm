import React from 'react';
import { useForm, Link } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        organization_name: '', // Añadido al estado inicial
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <form onSubmit={submit} className="bg-white dark:bg-surface-800 p-8 rounded-xl shadow-subtle border border-slate-200 dark:border-slate-700 w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crea tu Espacio de Trabajo</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Configura tu cuenta de administrador y tu organización.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
                        <input type="text" className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-900 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-brand-500" value={data.name} onChange={e => setData('name', e.target.value)} required />
                        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email de Trabajo</label>
                        <input type="email" className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-900 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-brand-500" value={data.email} onChange={e => setData('email', e.target.value)} required />
                        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                        <input type="text" className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-900 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-brand-500" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                        {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                    </div>

                    {/* SECCIÓN ORGANIZACIÓN */}
                    <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-100 dark:border-brand-800/50">
                        <label className="block text-sm font-medium text-brand-800 dark:text-brand-300 mb-1">Nombre de la Empresa</label>
                        <input type="text" className="w-full rounded-lg border-brand-300 dark:border-brand-700 bg-white dark:bg-surface-900 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-brand-500 placeholder-slate-400" placeholder="Ej. Acme Corp" value={data.organization_name} onChange={e => setData('organization_name', e.target.value)} required />
                        {errors.organization_name && <div className="text-red-500 text-xs mt-1">{errors.organization_name}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                            <input type="password" className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-900 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-brand-500" value={data.password} onChange={e => setData('password', e.target.value)} required />
                            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar</label>
                            <input type="password" className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-900 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-brand-500" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required />
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={processing} className="w-full mt-6 bg-brand-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-brand-500 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors disabled:opacity-50">
                    {processing ? 'Creando cuenta...' : 'Crear mi cuenta'}
                </button>

                <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-brand-600 hover:text-brand-500 hover:underline">Inicia sesión</Link>
                </div>
            </form>
        </div>
    );
}
