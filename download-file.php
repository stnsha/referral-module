<?php
/**
 * Optional server-side file download handler
 * This provides an alternative to the client-side base64 download
 * Files are temporarily stored in the 'files' directory
 */

header('Content-Type: application/json');

// Start session if not already started
if (session_id() == '') {
    session_start();
}

// Check if user is authenticated (reuse existing auth logic)
$connect = 1;
include('../common/index_adv.php');

if (!isset($_SESSION["myusername"])) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required']);
    exit;
}

// Create files directory if it doesn't exist
$filesDir = __DIR__ . '/files';
if (!is_dir($filesDir)) {
    if (!mkdir($filesDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create files directory']);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['base64']) || !isset($data['filename'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required data (base64, filename)']);
        exit;
    }
    
    try {
        // Decode base64 data
        $base64Data = $data['base64'];
        $filename = $data['filename'];
        $mimeType = $data['type'] ?? 'application/octet-stream';
        
        // Remove data URL prefix if present
        if (strpos($base64Data, ',') !== false) {
            $base64Data = explode(',', $base64Data)[1];
        }
        
        // Decode base64
        $fileContent = base64_decode($base64Data);
        if ($fileContent === false) {
            throw new Exception('Invalid base64 data');
        }
        
        // Generate unique filename to prevent conflicts
        $pathInfo = pathinfo($filename);
        $uniqueFilename = $pathInfo['filename'] . '_' . time() . '_' . uniqid();
        if (isset($pathInfo['extension'])) {
            $uniqueFilename .= '.' . $pathInfo['extension'];
        }
        
        // Save file
        $filePath = $filesDir . '/' . $uniqueFilename;
        if (file_put_contents($filePath, $fileContent) === false) {
            throw new Exception('Failed to save file');
        }
        
        // Return download URL
        $downloadUrl = 'download-file.php?file=' . urlencode($uniqueFilename);
        
        echo json_encode([
            'success' => true,
            'download_url' => $downloadUrl,
            'filename' => $filename,
            'size' => strlen($fileContent)
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'File processing failed: ' . $e->getMessage()]);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['file'])) {
    // Handle file download
    $filename = $_GET['file'];
    $filePath = $filesDir . '/' . basename($filename); // basename for security
    
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
        exit;
    }
    
    // Get original filename (remove timestamp and unique ID)
    $originalFilename = preg_replace('/_\d+_[a-f0-9]+/', '', $filename);
    
    // Determine MIME type based on file extension
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $mimeTypes = [
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xls' => 'application/vnd.ms-excel',
        'pdf' => 'application/pdf',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc' => 'application/msword',
        'csv' => 'text/csv'
    ];
    
    $mimeType = $mimeTypes[$ext] ?? 'application/octet-stream';
    
    // Set headers for file download
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . $originalFilename . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: 0');
    
    // Output file content
    readfile($filePath);
    
    // Optional: Delete file after download (uncomment if desired)
    // unlink($filePath);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

// Optional: Clean up old files (run this periodically)
function cleanupOldFiles($directory, $maxAge = 3600) {
    $files = glob($directory . '/*');
    $now = time();
    
    foreach ($files as $file) {
        if (is_file($file) && ($now - filemtime($file)) > $maxAge) {
            unlink($file);
        }
    }
}

// Cleanup files older than 1 hour
cleanupOldFiles($filesDir, 3600);
?>