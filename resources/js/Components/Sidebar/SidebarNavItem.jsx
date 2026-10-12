import React from 'react';
import { Link } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';

export default function SidebarNavItem({ item, url, collapsed, locked, onNavigate }) {
    const currentUrl = typeof url === 'string' ? url.split('?')[0] : '';
    const isActive = currentUrl === item.href || currentUrl.startsWith(`${item.href}/`);
    const Icon = item.icon;
    const href = locked ? '/subscription' : item.href;
    const lockedLabel = `${item.label}: disponible al activar tu suscripción`;

    return (
        <Link
            href={href}
            aria-label={locked ? lockedLabel : item.label}
            aria-current={!locked && isActive ? 'page' : undefined}
            title={locked ? lockedLabel : collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${collapsed ? 'md:justify-center md:px-0' : ''} ${
                locked
                    ? 'text-slate-400 hover:bg-amber-50/70 hover:text-amber-800 dark:text-slate-500 dark:hover:bg-amber-900/20 dark:hover:text-amber-300'
                    : isActive
                    ? 'bg-brand-50/80 text-slate-900 dark:bg-brand-900/25 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white'
            }`}
        >
            {!locked && isActive && <span aria-hidden="true" className="absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-brand-500" />}
            <Icon
                size={19}
                strokeWidth={!locked && isActive ? 2.2 : 1.8}
                className={`shrink-0 ${locked ? 'text-amber-600 dark:text-amber-400' : isActive ? 'text-brand-700 dark:text-brand-400' : 'text-slate-500 group-hover:text-brand-700 dark:text-slate-400 dark:group-hover:text-brand-400'}`}
                aria-hidden="true"
            />
            <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
            {locked && <LockKeyhole size={15} aria-hidden="true" className={`shrink-0 text-amber-600 dark:text-amber-400 ${collapsed ? 'md:absolute md:right-1 md:top-1 md:h-4 md:w-4 md:rounded-full md:bg-white md:p-0.5 md:dark:bg-surface-800' : 'ml-auto'}`} />}
        </Link>
    );
}
