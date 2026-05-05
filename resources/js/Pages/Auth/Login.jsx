import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false, // Añadimos opción de recordar sesión
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 px-4 transition-colors duration-200">
            <Head title="Iniciar Sesión" />

            <div className="w-full max-w-md">
                {/* Logo o Nombre de la App (Opcional, igual que en el layout) */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Cazadores<span className="text-brand-600 dark:text-brand-500">CRM</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Bienvenido de nuevo, ingresa tus credenciales.</p>
                </div>

                <form onSubmit={submit} className="bg-white dark:bg-surface-800 p-8 rounded-xl shadow-subtle border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white text-center">Acceder al Sistema</h2>

                    {/* Error de credenciales */}
                    {errors.email && (
                        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium">
                            {errors.email}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email de Trabajo</label>
                            <input
                                type="email"
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-900 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-brand-500 transition-colors sm:text-sm"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="tu@empresa.com"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
                                {/* Opcional: Link de recuperación si lo tienes implementado */}
                                <Link href="#" className="text-xs text-brand-600 hover:underline">¿Olvidaste tu contraseña?</Link>
                            </div>
                            <input
                                type="password"
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-900 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-brand-500 transition-colors sm:text-sm"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:bg-surface-900 dark:border-slate-600"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                                Mantener sesión iniciada
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-lg hover:bg-brand-500 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-surface-800 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none"
                        >
                            {processing ? 'Verificando...' : 'Entrar al Panel'}
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            ¿Tu empresa no usa CazadoresCRM?{' '}
                            <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-500 hover:underline">
                                Crea una organización
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Footer simple fuera de la card */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    &copy; {new Date().getFullYear()} Proyecto Cazadores. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
