import React from 'react';

export default function Input({ label, error, className = '', ...props }) {
    return (
        <div className={className}>
            {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
            <input
                className={`w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-900 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-brand-500 sm:text-sm transition-colors ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
