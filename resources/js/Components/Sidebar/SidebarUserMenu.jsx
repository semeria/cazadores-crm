import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { LogOut, Moon, Sun, ChevronDown, ChevronUp } from 'lucide-react';

const roleLabels = {
    owner: 'Propietario',
    member: 'Miembro',
    agent: 'Agente',
    admin: 'Administrador',
};

const getInitials = (name = '') => name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('es'))
    .join('') || 'U';

export default function SidebarUserMenu({ user, collapsed, darkMode, onToggleTheme, onNavigate }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            menuRef.current?.querySelector('[role="menuitem"]')?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const closeOnPointerDown = (event) => {
            if (!menuRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('pointerdown', closeOnPointerDown);
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.removeEventListener('pointerdown', closeOnPointerDown);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [isOpen]);

    const closeMenu = () => {
        setIsOpen(false);
        onNavigate();
    };

    return (
        <div ref={menuRef} className="relative border-t border-slate-100 p-3 dark:border-slate-700/80">
            {isOpen && (
                <div
                    role="menu"
                    aria-label="Menú de usuario"
                    className={`absolute bottom-[calc(100%+0.5rem)] left-3 right-3 z-[60] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-surface-800 ${collapsed ? 'md:bottom-0 md:left-full md:ml-2 md:right-auto md:w-64' : ''}`}
                >
                    <div className="px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Usuario'}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                        <span className="mt-2 inline-flex rounded-md bg-brand-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                            {user?.is_super_admin ? 'Superadministrador' : roleLabels[user?.role] || 'Usuario'}
                        </span>
                    </div>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            onToggleTheme();
                            setIsOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                        {darkMode ? 'Modo claro' : 'Modo oscuro'}
                    </button>

                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        role="menuitem"
                        onClick={closeMenu}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        <LogOut size={17} />
                        Cerrar sesión
                    </Link>
                </div>
            )}

            <button
                type="button"
                ref={triggerRef}
                onClick={() => setIsOpen((open) => !open)}
                aria-label={isOpen ? 'Cerrar menú de usuario' : `Abrir menú de usuario: ${user?.name || 'Usuario'}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                title={collapsed ? (user?.name || 'Usuario') : undefined}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-700/70 ${collapsed ? 'md:justify-center' : ''}`}
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xs font-bold text-brand-800 ring-1 ring-inset ring-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:ring-brand-800">
                    {getInitials(user?.name)}
                </span>
                <span className={`min-w-0 flex-1 ${collapsed ? 'md:hidden' : ''}`}>
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Usuario'}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</span>
                </span>
                {isOpen ? <ChevronDown size={16} className={`shrink-0 text-slate-400 ${collapsed ? 'md:hidden' : ''}`} /> : <ChevronUp size={16} className={`shrink-0 text-slate-400 ${collapsed ? 'md:hidden' : ''}`} />}
            </button>
        </div>
    );
}
