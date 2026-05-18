import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    const { auth, url } = usePage().props;

    // Lógica para Modo Oscuro
    const [darkMode, setDarkMode] = useState(false);
    // Nuevo estado para el menú móvil
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        setIsSidebarOpen(false);
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
        <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex transition-colors duration-200">

            {/* Overlay para móvil: Fondo oscuro que cierra el menú al hacer clic */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Ahora deslizable en móvil y fijo en escritorio) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-800 border-r border-slate-200 dark:border-slate-700 flex flex-col
                transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                        Jaeger<span className="text-brand-600 dark:text-brand-500">System</span>
                    </span>
                    {/* Botón para cerrar el menú explícitamente en móvil */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {/* Accesible para Owner y Member */}
                    {['owner', 'member'].includes(auth?.user?.role) && (
                        <>
                            <Link href="/dashboard" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                <span className="mr-3 text-lg">📊</span> Panel Operativo
                            </Link>
                            <Link href="/activities/kanban" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                <span className="mr-3 text-lg">📋</span> Kanban Global
                            </Link>
                            <Link href="/agents" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                <span className="mr-3 text-lg">👥</span> Mi Flotilla (Agentes)
                            </Link>
                        </>
                    )}

                    {/* Accesible SOLO para el Owner */}
                    {auth?.user?.role === 'owner' && (
                        <Link href="/members" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                            <span className="mr-3 text-lg">🛡️</span> Equipo Directivo
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar Clean */}
                <header className="h-16 bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
                    <div className="flex items-center">
                        {/* Botón Hamburguesa (Solo Móvil) */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="mr-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors md:hidden"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="font-medium text-slate-800 dark:text-slate-200 hidden sm:block">
                            {/* Breadcrumbs futuros */}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {/* Botón Dark Mode */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                        {/* User Menu */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] sm:max-w-none truncate">
                                {auth?.user?.name}
                            </span>
                            <Link href="/logout" method="post" as="button" className="text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 transition-colors bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                                Salir
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
