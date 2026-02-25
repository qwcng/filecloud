<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | This is the primary key used for encrypting and decrypting files. The key
    | must be a base64-encoded 32-byte string for AES-256-GCM encryption. You
    | can generate a suitable key using the `php artisan file:key` command.
    |
    | IMPORTANT: Keep this key secure and never commit it to version control.
    |
    */

    'key' => env('FILE_ENCRYPTION_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Previous Encryption Keys
    |--------------------------------------------------------------------------
    |
    | When rotating encryption keys, you can specify previous keys here as a
    | comma-separated list. During decryption, if the primary key fails, the
    | system will attempt to decrypt using these previous keys in order.
    |
    | This allows for seamless key rotation without immediately re-encrypting
    | all existing files. Format: "base64key1,base64key2,base64key3"
    |
    */

    'previous_keys' => array_filter(
        array_map(
            'trim',
            explode(',', env('FILE_ENCRYPTION_PREVIOUS_KEYS', ''))
        )
    ),

    /*
    |--------------------------------------------------------------------------
    | Chunk Size
    |--------------------------------------------------------------------------
    |
    | The size in bytes of each chunk when processing files. Larger chunk sizes
    | may improve performance for large files but will use more memory. Smaller
    | chunk sizes reduce memory usage but may be slower.
    |
    | Default: 65536 bytes (64 KB)
    | Recommended range: 16384 (16 KB) to 1048576 (1 MB)
    |
    */

    'chunk_size' => (int) env('FILE_ENCRYPTION_CHUNK_SIZE', 65536),

];
