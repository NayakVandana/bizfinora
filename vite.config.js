import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            '@react-pdf/renderer': path.resolve(
                __dirname,
                'node_modules/@react-pdf/renderer/lib/react-pdf.browser.js',
            ),
        },
    },
    optimizeDeps: {
        include: ['@react-pdf/renderer'],
    },
});
