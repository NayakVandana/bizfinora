import '../css/app.css';
import './bootstrap';

import { AppearanceProvider } from '@/contexts/AppearanceContext';
import { ConfirmDialogProvider } from '@/contexts/ConfirmDialogContext';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <AppearanceProvider>
                <ConfirmDialogProvider>
                    <App {...props} />
                </ConfirmDialogProvider>
            </AppearanceProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
