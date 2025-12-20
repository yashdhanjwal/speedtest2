<?php
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="random.dat"');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');

// Prevent buffering
if (function_exists('apache_setenv')) {
    apache_setenv('no-gzip', 1);
}
ini_set('zlib.output_compression', 0);
ini_set('implicit_flush', 1);
ob_implicit_flush(1);


// Generate a stream of random data
$chunkSize = 1024 * 1024; // 1MB chunks
while (true) {
    echo str_repeat(chr(mt_rand(0, 255)), $chunkSize);
    flush();
}
?>
