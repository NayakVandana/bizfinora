<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <script>
            (function () {
                var doc = document.documentElement;
                var key = 'appearance';
                var stored = localStorage.getItem(key);
                var appearance =
                    stored === 'light' || stored === 'dark' || stored === 'system'
                        ? stored
                        : 'system';
                var prefersDark =
                    appearance === 'dark' ||
                    (appearance === 'system' &&
                        window.matchMedia('(prefers-color-scheme: dark)').matches);
                doc.classList.toggle('dark', prefersDark);
                doc.style.colorScheme = prefersDark ? 'dark' : 'light';
                doc.setAttribute('data-appearance', prefersDark ? 'dark' : 'light');
            })();
        </script>
        <style>
            html {
                background-color: var(--background);
            }
        </style>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
