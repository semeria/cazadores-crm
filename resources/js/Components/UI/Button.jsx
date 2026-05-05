import React from 'react';

export default function Button({ children, variant = 'primary', type = 'button', className = '', ...props }) {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-surface-900";

    const variants = {
        primary: "bg-brand-600 text-white hover:bg-brand-500 focus:ring-brand-500",
        secondary: "bg-white dark:bg-surface-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-brand-500",
        danger: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
    };

    return (
        <button type={type} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}
