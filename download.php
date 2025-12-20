<?php
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="random.dat"');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');

// Generate a stream of random data
$chunkSize = 1024 * 1024; // 1MB chunks
while (true) {
    echo str_repeat(chr(mt_rand(0, 255)), $chunkSize);
    flush();
}
?>
