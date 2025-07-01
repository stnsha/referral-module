<?php

include 'vendor/phpqrcode/qrlib.php';

header('Content-Type: image/png');

$referral_id = $_GET['id'];

$local_host = 'http://localhost:8080/odb/';
$host = 'http://octopusdb.info:8080/odb/';
$param = 'referral/view.php?id=' . $referral_id;

$url = $local_host . $param;
$filename = '#REF' . str_pad($referral_id, 4, 0, STR_PAD_LEFT) . '.png';
$filepath = 'img/qr/' . $filename;

$ecc = 'H'; // High error correction
$size = 10; // Adjust this
$margin = 1;

QRcode::png($url, $filepath, $ecc, $size, $margin);
