<?php
return [
    'paths' => ['api/*', 'storage/*', '*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // o ['*'] para pruebas
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
