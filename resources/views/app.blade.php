<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @if(config('app.env') === 'production')
            @routes(null, null) 
            <script>
                // Memaksa Ziggy menggunakan HTTPS di sisi browser secara global
                if (typeof Ziggy !== 'undefined') {
                    Ziggy.url = Ziggy.url.replace('http://', 'https://');
                }
            </script>
        @else
            @routes
        @endif

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
