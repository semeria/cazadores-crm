import React from 'react';
import { usePage } from '@inertiajs/react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';

export default function PageTransition({ children }) {
    const { url } = usePage();
    const shouldReduceMotion = useReducedMotion();
    const pageKey = typeof url === 'string' ? url.split('?')[0] : 'current-page';

    return (
        <AnimatePresence initial={false} mode="wait">
            <m.div
                key={pageKey}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: 'easeOut' }}
                className="min-h-full"
            >
                {children}
            </m.div>
        </AnimatePresence>
    );
}
