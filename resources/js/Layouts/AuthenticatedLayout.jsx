import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import Sidebar from '../Components/Sidebar/Sidebar';
import PlatformAdminHeader from '../Components/PlatformAdminHeader';

export default function AuthenticatedLayout({ children }) {
    const page = usePage();
    const { auth } = page.props;
    const { subscriptionAccess } = page.props;
    const { url } = page;
    const isSuperAdmin = Boolean(auth?.user?.is_super_admin);
    const mobileMenuButtonRef = useRef(null);

    // Lógica para Modo Oscuro
    const [darkMode, setDarkMode] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.localStorage.getItem('sidebar-collapsed') === 'true';
    });

    useEffect(() => {
        window.localStorage.setItem('sidebar-collapsed', String(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    useEffect(() => {
        if (!isMobileSidebarOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsMobileSidebarOpen(false);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMobileSidebarOpen]);

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Cierra el menú móvil automáticamente cuando la URL cambia (al navegar)
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [url]);

    const toggleDarkMode = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
        setDarkMode(!darkMode);
    };

    return (
        <div className={`min-h-screen bg-surface-50 transition-colors duration-200 dark:bg-surface-900 ${isSuperAdmin ? '' : 'flex'}`}>
            {isSuperAdmin ? (
                <>
                    <PlatformAdminHeader user={auth?.user} url={url} darkMode={darkMode} onToggleTheme={toggleDarkMode} />
                    <main className="mx-auto w-full max-w-screen-2xl p-4 sm:p-6 md:p-8">
                        {children}
                    </main>
                </>
            ) : (
                <>
                    <Sidebar
                        user={auth?.user}
                        url={url}
                        subscriptionAccess={subscriptionAccess}
                        collapsed={isSidebarCollapsed}
                        mobileOpen={isMobileSidebarOpen}
                        darkMode={darkMode}
                        onSetCollapsed={setIsSidebarCollapsed}
                        onToggleTheme={toggleDarkMode}
                        onCloseMobile={() => setIsMobileSidebarOpen(false)}
                        mobileTriggerRef={mobileMenuButtonRef}
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-700 dark:bg-surface-800/95 md:hidden">
                            <button
                                type="button"
                                ref={mobileMenuButtonRef}
                                onClick={() => setIsMobileSidebarOpen(true)}
                                aria-label="Abrir menú de navegación"
                                aria-expanded={isMobileSidebarOpen}
                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-400 dark:hover:bg-slate-700"
                            >
                                <Menu size={21} />
                            </button>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                Jaeger<span className="text-brand-600 dark:text-brand-400">System</span>
                            </span>
                        </header>

                        <main className="flex-1 p-4 sm:p-6 md:p-8">
                            {children}
                        </main>
                    </div>
                </>
            )}
        </div>
    );
}
