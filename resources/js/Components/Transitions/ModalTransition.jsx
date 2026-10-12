import React from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';

export default function ModalTransition({ open, ariaLabel, backdropClassName, panelClassName, children }) {
    const shouldReduceMotion = useReducedMotion();
    const transition = { duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' };

    return (
        <AnimatePresence initial={false}>
            {open && (
                <m.div
                    key="modal-backdrop"
                    role="presentation"
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transition}
                    className={backdropClassName}
                >
                    <m.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={ariaLabel}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 5, scale: 0.99 }}
                        transition={transition}
                        className={panelClassName}
                    >
                        {children}
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
}
