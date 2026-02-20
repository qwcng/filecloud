<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">

        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#0d6efd">
        <meta name="theme-color" content="#135BEC">
        <link rel="apple-touch-icon" href="/logo-192.png">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        {{-- <title inertia>{{ config('app.name', 'Laravel') }}</title> --}}
        {{-- <title>Versec Drive - Keep your files safe and private</title> --}}
                        <meta name="description" content="Versec Drive – Bezpieczne i prywatne przechowywanie plików w chmurze. Wykorzystaj szyfrowanie SHA-256, aby chronić swoje dane. Zacznij za darmo z 10GB pojemności!" />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
                <title>Versec Drive - Keep your files safe and private</title>
                <meta name="title" content="Versec Drive - Keep your files safe and private" />
                    <meta name="description" content="Experience the ultimate cloud storage solution with Versec Drive. Store your files securely, share them effortlessly, and collaborate seamlessly with your team." />
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content="https://filecloud.ct8.pl" />
                    <meta property="og:title" content="Versec Drive - Keep your files safe and private" />
                    <meta property="og:description" content="Experience the ultimate cloud storage solution with Versec Drive. Store your files securely, share them effortlessly, and collaborate seamlessly with your team." />
                    <meta property="og:image" content="https://filecloud.ct8.pl/versec.jpg" />
                    <meta property="twitter:card" content="summary_large_image" />
                    <meta property="twitter:url" content="https://filecloud.ct8.pl" />
                    <meta property="twitter:title" content="Versec Drive - Keep your files safe and private" />
                    <meta property="twitter:description" content="Experience the ultimate cloud storage solution with Versec Drive. Store your files securely, share them effortlessly, and collaborate seamlessly with your team." />
                    <meta property="twitter:image" content="https://filecloud.ct8.pl/versec.jpg" />

        <link rel="icon" href="/icon.ico" sizes="any">
        {{-- <link rel="icon" href="/icon.svg" type="image/svg+xml"> --}}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
