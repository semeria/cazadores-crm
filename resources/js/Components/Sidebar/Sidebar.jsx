import React, { useEffect, useRef } from 'react';
import SidebarBrand from './SidebarBrand';
import SidebarNavigation from './SidebarNavigation';
import SidebarUserMenu from './SidebarUserMenu';

export default function Sidebar({
    user,
    url,
    subscriptionAccess,
    collapsed,
    mobileOpen,
    darkMode,
    onSetCollapsed,
    onToggleTheme,
    onCloseMobile,
    mobileTriggerRef,
}) {
    const sidebarRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        if (!mobileOpen) {
            return undefined;
        }

        closeButtonRef.current?.focus();

        const keepFocusInDrawer = (event) => {
            if (event.key !== 'Tab') {
                return;
            }

            const focusable = sidebarRef.current?.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled)');
            if (!focusable?.length) {
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', keepFocusInDrawer);

        return () => {
            document.removeEventListener('keydown', keepFocusInDrawer);
            mobileTriggerRef?.current?.focus();
        };
    }, [mobileOpen, mobileTriggerRef]);

    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Cerrar menú de navegación"
                    onClick={onCloseMobile}
                    className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] md:hidden"
                />
            )}

            <aside
                ref={sidebarRef}
                tabIndex={-1}
                aria-label="Menú lateral"
                className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col overflow-visible border-r border-slate-200 bg-white shadow-xl transition-[width,transform] duration-300 ease-in-out dark:border-slate-700 dark:bg-surface-800 md:sticky md:top-3 md:my-3 md:ml-3 md:h-[calc(100vh-1.5rem)] md:translate-x-0 md:rounded-2xl md:border md:shadow-subtle ${collapsed ? 'md:w-[76px]' : 'md:w-72'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <SidebarBrand
                    collapsed={collapsed}
                    onToggleCollapsed={() => onSetCollapsed(!collapsed)}
                    onCloseMobile={onCloseMobile}
                    closeButtonRef={closeButtonRef}
                />

                <SidebarNavigation
                    role={user?.role}
                    isSuperAdmin={user?.is_super_admin}
                    subscriptionAccess={subscriptionAccess}
                    url={url}
                    collapsed={collapsed}
                    onExpand={() => onSetCollapsed(false)}
                    onNavigate={onCloseMobile}
                />

                <SidebarUserMenu
                    user={user}
                    collapsed={collapsed}
                    darkMode={darkMode}
                    onToggleTheme={onToggleTheme}
                    onNavigate={onCloseMobile}
                />
            </aside>
        </>
    );
}
