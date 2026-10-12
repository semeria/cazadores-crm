import React, { useMemo, useState } from 'react';
import { Building2, Columns3, CreditCard, FileText, LayoutDashboard, PanelLeftOpen, Search, UsersRound } from 'lucide-react';
import SidebarNavItem from './SidebarNavItem';

const sectionsByRole = {
    owner: [
        {
            label: 'Principal',
            items: [
                { label: 'Panel Operativo', href: '/dashboard', icon: LayoutDashboard },
                { label: 'Kanban Global', href: '/activities/kanban', icon: Columns3 },
                { label: 'Cotizaciones', href: '/quotes', icon: FileText },
            ],
        },
        {
            label: 'Administración',
            items: [
                { label: 'Equipo', href: '/team', icon: UsersRound },
                { label: 'Suscripción', href: '/subscription', icon: CreditCard },
            ],
        },
    ],
    member: [
        {
            label: 'Principal',
            items: [
                { label: 'Panel Operativo', href: '/dashboard', icon: LayoutDashboard },
                { label: 'Kanban Global', href: '/activities/kanban', icon: Columns3 },
                { label: 'Cotizaciones', href: '/quotes', icon: FileText },
                { label: 'Suscripción', href: '/subscription', icon: CreditCard },
            ],
        },
    ],
    agent: [
        {
            label: 'Principal',
            items: [
                { label: 'Mi Kanban', href: '/agent/kanban', icon: Columns3 },
                { label: 'Cotizaciones', href: '/quotes', icon: FileText },
                { label: 'Suscripción', href: '/subscription', icon: CreditCard },
            ],
        },
    ],
    superAdmin: [
        {
            label: 'Plataforma',
            items: [
                { label: 'Organizaciones', href: '/super-admin/organizations', icon: Building2 },
            ],
        },
    ],
};

export default function SidebarNavigation({ role, isSuperAdmin, subscriptionAccess, url, collapsed, onExpand, onNavigate }) {
    const [search, setSearch] = useState('');
    const sections = useMemo(() => {
        const term = search.trim().toLocaleLowerCase('es');

        return (isSuperAdmin ? sectionsByRole.superAdmin : sectionsByRole[role] || [])
            .map((section) => ({
                ...section,
                items: section.items.filter((item) => item.label.toLocaleLowerCase('es').includes(term)),
            }))
            .filter((section) => section.items.length > 0);
    }, [role, isSuperAdmin, search]);

    return (
        <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-5">
            {collapsed && (
                <div className="mb-4 hidden space-y-1 md:grid">
                    <button
                        type="button"
                        onClick={onExpand}
                        aria-label="Expandir menú lateral"
                        title="Expandir menú lateral"
                        className="flex h-10 w-full items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-400 dark:hover:bg-brand-900/30 dark:hover:text-brand-300"
                    >
                        <PanelLeftOpen size={19} />
                    </button>
                    <button
                        type="button"
                        onClick={onExpand}
                        aria-label="Expandir menú para buscar"
                        title="Buscar en el menú"
                        className="flex h-10 w-full items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand-300"
                    >
                        <Search size={19} />
                    </button>
                </div>
            )}

            <label className={`mb-6 flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 transition-colors focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 dark:border-slate-700 dark:bg-surface-900 dark:focus-within:border-brand-700 dark:focus-within:ring-brand-900/40 ${collapsed ? 'md:hidden' : ''}`}>
                <Search size={17} aria-hidden="true" />
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar en el menú"
                    aria-label="Buscar en la navegación"
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
            </label>

            {sections.length > 0 ? sections.map((section) => (
                <section key={section.label} className="mb-6 last:mb-0">
                    <h2 className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 ${collapsed ? 'md:hidden' : ''}`}>
                        {section.label}
                    </h2>
                    <div className="space-y-1">
                        {section.items.map((item) => (
                            <SidebarNavItem
                                key={item.href}
                                item={item}
                                url={url}
                                collapsed={collapsed}
                                locked={subscriptionAccess?.has_access === false && item.href !== '/subscription'}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </div>
                </section>
            )) : (
                !collapsed && <p className="px-3 text-sm text-slate-500 dark:text-slate-400">No hay coincidencias.</p>
            )}
        </nav>
    );
}
