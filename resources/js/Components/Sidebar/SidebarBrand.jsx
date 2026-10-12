import React from 'react';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

export default function SidebarBrand({ collapsed, onToggleCollapsed, onCloseMobile, closeButtonRef }) {
    return (
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-700/80 md:px-5">
            <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label="Expandir menú lateral"
                title="Expandir menú lateral"
                className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-lg font-black tracking-tight text-slate-900 ring-1 ring-inset ring-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-brand-900/40 dark:text-white dark:ring-brand-800 ${collapsed ? 'md:flex' : 'md:hidden'}`}
            >
                J<span className="text-brand-700 dark:text-brand-400">S</span>
            </button>

            <div className={`flex min-w-0 items-center gap-3 ${collapsed ? 'md:hidden' : ''}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-lg font-black tracking-tight text-slate-900 ring-1 ring-inset ring-brand-200 dark:bg-brand-900/40 dark:text-white dark:ring-brand-800">
                    J<span className="text-brand-700 dark:text-brand-400">S</span>
                </div>
                <div>
                    <div className="whitespace-nowrap text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
                        Jaeger<span className="text-brand-600 dark:text-brand-400">System</span>
                    </div>
                    <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        CRM operativo
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
                aria-expanded={!collapsed}
                title={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
                className={`hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-700 dark:hover:text-brand-300 ${collapsed ? '' : 'md:inline-flex'}`}
            >
                {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <button
                type="button"
                ref={closeButtonRef}
                onClick={onCloseMobile}
                aria-label="Cerrar menú de navegación"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand-300 md:hidden"
            >
                <X size={20} />
            </button>
        </div>
    );
}
