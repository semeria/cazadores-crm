import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { domAnimation, LazyMotion } from 'motion/react';
import PageTransition from './Components/Transitions/PageTransition';

const pageModules = import.meta.glob('./Pages/**/*.jsx');

const pageTransitionLayout = (page) => <PageTransition>{page}</PageTransition>;

createInertiaApp({
    resolve: async (name) => {
        const page = await resolvePageComponent(`./Pages/${name}.jsx`, pageModules);
        page.default.layout ??= pageTransitionLayout;

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <LazyMotion features={domAnimation}>
                <App {...props} />
            </LazyMotion>,
        );
    },
});
