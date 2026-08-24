<?php
// Reduce memory limit since we're optimizing
ini_set('memory_limit', '512M');
include 'vendor/phpqrcode/qrlib.php';

$referral_id = $_GET['id'];

$local_host = 'http://localhost:8080/odb/';
$host = 'http://octopusdb.info:8080/odb/';
$param = 'referral/view.php?id=' . $referral_id;

$url = $local_host . $param;
$filename = 'REF' . str_pad($referral_id, 4, 0, STR_PAD_LEFT) . '.png';
$filepath = 'img/qr/' . $filename;

// Check if QR already exists and is recent (within 1 hour)
if (file_exists($filepath) && (time() - filemtime($filepath)) < 3600) {
    // QR code already exists and is recent, skip generation
} else {
    // Optimized settings for faster generation
    $size = 6;  // Reduced from 10 to 6
    $margin = 1; // Reduced from 2 to 1
    
    // Use medium error correction instead of high for better performance
    QRcode::png($url, $filepath, QR_ECLEVEL_M, $size, $margin);
    
    // Check if logo should be added (make it optional for performance)
    $addLogo = true; // Set to false to skip logo for maximum speed
    
    if ($addLogo) {
        // Load QR
        $QR = imagecreatefrompng($filepath);
        
        // Load and resize logo with optimization
        $logoPath = 'img/logo.png';
        if (file_exists($logoPath)) {
            // Check if we have a cached resized logo
            $cachedLogoPath = 'img/logo_small.png';
            
            if (!file_exists($cachedLogoPath) || (time() - filemtime($cachedLogoPath)) > 86400) {
                // Check logo file size first to prevent memory issues
                $logoFileSize = filesize($logoPath);
                $maxFileSize = 5 * 1024 * 1024; // 5MB limit
                
                if ($logoFileSize > $maxFileSize) {
                    error_log("Logo file too large: " . ($logoFileSize / 1024 / 1024) . "MB. Skipping logo.");
                } else {
                    // Get image dimensions without loading the full image
                    $imageInfo = getimagesize($logoPath);
                    if ($imageInfo === false) {
                        error_log("Invalid logo image file: " . $logoPath);
                    } else {
                        $logo_width = $imageInfo[0];
                        $logo_height = $imageInfo[1];
                        
                        // Check if dimensions are reasonable
                        if ($logo_width > 2000 || $logo_height > 2000) {
                            error_log("Logo dimensions too large: {$logo_width}x{$logo_height}. Skipping logo.");
                        } else {
                            // Increase memory limit temporarily for logo processing
                            ini_set('memory_limit', '1024M');
                            
                            $logo = imagecreatefrompng($logoPath);
                            if ($logo === false) {
                                error_log("Failed to create image from logo file: " . $logoPath);
                            } else {
                                // Create smaller cached logo (max 80px for safety)
                                $max_logo_size = 80;
                                $ratio = min($max_logo_size / $logo_width, $max_logo_size / $logo_height);
                                $new_width = (int)($logo_width * $ratio);
                                $new_height = (int)($logo_height * $ratio);
                                
                                $cached_logo = imagecreatetruecolor($new_width, $new_height);
                                if ($cached_logo !== false) {
                                    imagealphablending($cached_logo, false);
                                    imagesavealpha($cached_logo, true);
                                    imagecopyresampled($cached_logo, $logo, 0, 0, 0, 0, $new_width, $new_height, $logo_width, $logo_height);
                                    
                                    imagepng($cached_logo, $cachedLogoPath, 6); // Lower compression for speed
                                    imagedestroy($cached_logo);
                                }
                                imagedestroy($logo);
                            }
                            
                            // Reset memory limit
                            ini_set('memory_limit', '512M');
                        }
                    }
                }
            }
            
            // Use cached logo if it exists
            if (file_exists($cachedLogoPath)) {
                $logo = imagecreatefrompng($cachedLogoPath);
                if ($logo !== false) {
                    $QR_width = imagesx($QR);
                    $QR_height = imagesy($QR);
                    $logo_width = imagesx($logo);
                    $logo_height = imagesy($logo);
                    
                    // Smaller logo size for better QR readability
                    $new_logo_width = min($QR_width * 0.15, $logo_width); // Further reduced to 15%
                    $new_logo_height = $logo_height * ($new_logo_width / $logo_width);
                    
                    // Simplified single-step logo placement
                    $logo_final = imagecreatetruecolor($new_logo_width, $new_logo_height);
                    if ($logo_final !== false) {
                        $white = imagecolorallocate($logo_final, 255, 255, 255);
                        imagefill($logo_final, 0, 0, $white);
                        
                        // Single resample operation
                        imagecopyresampled($logo_final, $logo, 0, 0, 0, 0, $new_logo_width, $new_logo_height, $logo_width, $logo_height);
                        
                        // Center and place logo
                        $posX = ($QR_width - $new_logo_width) / 2;
                        $posY = ($QR_height - $new_logo_height) / 2;
                        imagecopy($QR, $logo_final, $posX, $posY, 0, 0, $new_logo_width, $new_logo_height);
                        
                        imagedestroy($logo_final);
                    }
                    imagedestroy($logo);
                }
            }
            
            // Save final image with lower compression for speed
            imagepng($QR, $filepath, 6); // Reduced from 9 to 6
            
            // Cleanup
            imagedestroy($QR);
        } else {
            // Logo not found, just use QR without logo
        }
    }
}
?>
<!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

    <link rel="stylesheet" media="screen" type="text/css" href="../common/css/layout.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css?v=<?php echo filemtime(__DIR__ . '/css/style.css'); ?>" />
</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <?php include('navbar.php'); ?>
    <div class="header" style="position: relative;">
        <b class="rtop"><b class="r1"></b><b class="r2"></b><b class="r3"></b><b class="r4"></b></b>
        <h1 class="headerH1"><img src='common/img/myreferral.png' width='20px'>Referral QR Code</h1>
        <b class="rbottom"><b class="r4"></b><b class="r3"></b><b class="r2"></b><b class="r1"></b></b>
    </div>
    <div class="text-center bg-white rounded p-2">
        <div class="col align-items-center">
            <span class="r-main-title">Referral #REF<?php echo str_pad($_GET['id'], 4, 0, STR_PAD_LEFT) ?></span>
        </div>
        <div class="my-4 d-flex flex-column align-items-center">
            <img src="img/qr/<?php echo $filename; ?>" alt="Referral QR Code" class="img-fluid"
                style="max-width: 300px;">

            <a href="img/qr/<?php echo $filename; ?>" download class="btn-new-referral mt-3">
                Download QR Code
            </a>
            <a href="index.php" class="btn-referral mt-2">
                Back to Home
            </a>
        </div>
    </div>
</body>