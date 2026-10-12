import React from 'react';
import { Link } from '@inertiajs/react';
import { BadgePercent, Building2, ChevronDown, ClipboardList, CreditCard, LogOut, Moon, Settings2, ShieldCheck, Sun, Tags } from 'lucide-react';

const getInitials = (name = '') => name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('es'))
    .join('') || 'U';

export default function PlatformAdminHeader({ user, url, darkMode, onToggleTheme }) {
    const currentPath = typeof url === 'string' ? url.split('?')[0] : '';
    const navigation = [
        { label: 'Organizaciones', href: '/super-admin/organizations', icon: Building2 },
        { label: 'Planes', href: '/super-admin/plans', icon: Tags },
        { label: 'Cupones', href: '/super-admin/coupons', icon: BadgePercent },
        { label: 'Pagos', href: '/super-admin/payments', icon: CreditCard },
        { label: 'Suscripciones', href: '/super-admin/subscriptions', icon: ClipboardList },
        { label: 'Ajustes', href: '/super-admin/billing-settings', icon: Settings2 },
    ];

    return (
        <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 lg:px-8">
            <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 shadow-subtle backdrop-blur sm:gap-4 sm:px-5 dark:border-slate-700 dark:bg-surface-800/95">
                <Link href="/super-admin/organizations" className="flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="JaegerSystem, administración SaaS">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-lg font-black tracking-tight text-slate-900 ring-1 ring-inset ring-brand-200 dark:bg-brand-900/40 dark:text-white dark:ring-brand-800">
                        J<span className="text-brand-700 dark:text-brand-400">S</span>
                    </span>
                    <span className="hidden sm:block">
                        <span className="block whitespace-nowrap text-[16px] font-bold tracking-tight text-slate-900 dark:text-white">
                            Jaeger<span className="text-brand-600 dark:text-brand-400">System</span>
                        </span>
                        <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Administración SaaS</span>
                    </span>
                    <span className="text-xs font-bold text-slate-700 sm:hidden dark:text-slate-200">SaaS</span>
                </Link>

                <span aria-hidden="true" className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-700" />

                <nav aria-label="Navegación de plataforma" className="flex min-w-0 flex-1 items-center">
                    <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1">
                        {navigation.map(({ label, href, icon: Icon }) => {
                            const isActive = currentPath === href || currentPath.startsWith(`${href}/`);

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-label={label}
                                    aria-current={isActive ? 'page' : undefined}
                                    title={label}
                                    className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:px-3 ${isActive ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'}`}
                                >
                                    <Icon size={18} aria-hidden="true" />
                                    <span className="hidden md:inline">{label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-800 sm:inline-flex dark:bg-brand-900/30 dark:text-brand-200">
                        <ShieldCheck size={13} aria-hidden="true" />
                        Superadmin
                    </span>

                    <button
                        type="button"
                        onClick={onToggleTheme}
                        aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                        title={darkMode ? 'Modo claro' : 'Modo oscuro'}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-brand-300"
                    >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <details className="group relative">
                        <summary aria-label={`Cuenta de ${user?.name || 'administrador'}`} className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-700 [&::-webkit-details-marker]:hidden">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-800 ring-1 ring-inset ring-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:ring-brand-800">
                                {getInitials(user?.name)}
                            </span>
                            <span className="hidden max-w-36 text-left lg:block">
                                <span className="block truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{user?.name || 'Administrador'}</span>
                                <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">Superadministrador</span>
                            </span>
                            <ChevronDown size={15} aria-hidden="true" className="hidden text-slate-400 sm:block" />
                        </summary>
                        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-surface-800">
                            <div className="px-3 py-2.5">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Administrador'}</p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                                <span className="mt-2 inline-flex rounded-md bg-brand-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">Superadministrador</span>
                            </div>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <LogOut size={17} aria-hidden="true" />
                                Cerrar sesión
                            </Link>
                        </div>
                    </details>
                </div>
            </div>
        </header>
    );
}
