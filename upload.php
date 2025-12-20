<?php
// A simple script to handle the upload and ping tests.
// It doesn't actually do anything with the uploaded data, but it's enough to make the frontend work.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Just accept the data and do nothing with it.
    // This is enough to simulate an upload.
}
?>
