<?php
ini_set('memory_limit', '1024M');
include 'vendor/phpqrcode/qrlib.php';

$referral_id = $_GET['id'];

$local_host = 'http://localhost:8080/odb/';
$host = 'http://octopusdb.info:8080/odb/';
$param = 'referral/view.php?id=' . $referral_id;

$url = $local_host . $param;
$filename = 'REF' . str_pad($referral_id, 4, 0, STR_PAD_LEFT) . '.png';
$filepath = 'img/qr/' . $filename;

$size = 10;
$margin = 2;

QRcode::png($url, $filepath, QR_ECLEVEL_H, $size, $margin);

// Load QR
$QR = imagecreatefrompng($filepath);

// Load and resize logo
$logoPath = 'img/logo.png';
if (!file_exists($logoPath)) {
    die('Logo file not found.');
}

$logo = imagecreatefrompng($logoPath);

$QR_width = imagesx($QR);
$QR_height = imagesy($QR);

$logo_width = imagesx($logo);
$logo_height = imagesy($logo);

$new_logo_width = $QR_width * (1 / 3);
$new_logo_height = $logo_height * ($new_logo_width / $logo_width);

// Step 1: Resize logo with transparency
$logo_resized_transparent = imagecreatetruecolor($new_logo_width, $new_logo_height);
imagealphablending($logo_resized_transparent, false);
imagesavealpha($logo_resized_transparent, true);
imagecopyresampled($logo_resized_transparent, $logo, 0, 0, 0, 0, $new_logo_width, $new_logo_height, $logo_width, $logo_height);

// Step 2: Create white background behind logo
$logo_with_white_bg = imagecreatetruecolor($new_logo_width, $new_logo_height);
$white = imagecolorallocate($logo_with_white_bg, 255, 255, 255);
imagefill($logo_with_white_bg, 0, 0, $white);
imagecopy($logo_with_white_bg, $logo_resized_transparent, 0, 0, 0, 0, $new_logo_width, $new_logo_height);

// Step 3: Center the logo
$posX = ($QR_width - $new_logo_width) / 2;
$posY = ($QR_height - $new_logo_height) / 2;

imagecopy($QR, $logo_with_white_bg, $posX, $posY, 0, 0, $new_logo_width, $new_logo_height);

// Save final image
imagepng($QR, $filepath, 9);

// Cleanup
imagedestroy($QR);
imagedestroy($logo);
imagedestroy($logo_resized_transparent);
imagedestroy($logo_with_white_bg);
?>
<!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

    <link rel="stylesheet" media="screen" type="text/css" href="../common/css/layout.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css" />
</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <div class="text-center bg-white rounded p-2">
        <div class="col align-items-center">
            <span class="r-main-title">Referral #REF<?php echo str_pad($_GET['id'], 4, 0, STR_PAD_LEFT) ?></span>
        </div>
        <div class="my-4 d-flex flex-column align-items-center">
            <img src="img/qr/<?php echo $filename; ?>" alt="Referral QR Code" class="img-fluid" style="max-width: 300px;">

            <a href="img/qr/<?php echo $filename; ?>" download class="btn btn-primary mt-3">
                Download QR Code
            </a>
            <a href="index.php" class="btn btn-secondary mt-2">
                Back to Home
            </a>
        </div>
    </div>
</body>