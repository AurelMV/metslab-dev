<?php
return [
    'paths' => ['api/*', 'auth/*', 'sanctum/*', 'storage/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://www.metslab3d.com',
        'https://metslab3d.com',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'app://.',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
