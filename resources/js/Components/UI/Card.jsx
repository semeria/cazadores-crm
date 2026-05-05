import React from 'react';

export default function Card({ children, className = '', title, action }) {
    return (
        <div className={`bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-subtle ${className}`}>
            {(title || action) && (
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    {title && <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
