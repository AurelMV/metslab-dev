<?php
return [
    'paths' => ['api/*', 'storage/*', 'auth/*', 'sanctum/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
