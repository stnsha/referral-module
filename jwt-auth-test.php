<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
$connect = 1;
include('../common/index_adv.php');

if (!isset($conn)) {
    die(json_encode(array("status" => 500, "message" => "Database connection error")));
}

/**
 * Get JWT token from the referral API
 * @param int $staff_id Staff ID from database
 * @param int $staff_department_id Staff department ID
 * @param string $status_semasa Staff status
 * @return array Response containing token or error
 */
function getJWTToken($staff_id, $staff_department_id, $status_semasa) {
    $host = 'http://mytotalhealth.com.my/referral-api/api/';
    $url = $host . 'auth';
    
    $authData = array(
        'staff_id' => (int)$staff_id,
        'staff_department_id' => (int)$staff_department_id,
        'status_semasa' => $status_semasa
    );
    
    $headers = array(
        'Accept: application/json',
        'Content-Type: application/json'
    );
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($authData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($response === false) {
        return array(
            'success' => false,
            'error' => 'CURL Error: ' . $error,
            'http_code' => $httpCode
        );
    }
    
    $decoded = json_decode($response, true);
    
    if ($httpCode === 200) {
        return array(
            'success' => true,
            'token' => isset($decoded['token']) ? $decoded['token'] : null,
            'data' => $decoded,
            'http_code' => $httpCode
        );
    } else {
        return array(
            'success' => false,
            'error' => isset($decoded['message']) ? $decoded['message'] : 'Authentication failed',
            'data' => $decoded,
            'http_code' => $httpCode
        );
    }
}

/**
 * Get staff information from database for JWT authentication
 * @param int $staff_id Staff ID
 * @return array Staff data or null if not found
 */
function getStaffForAuth($staff_id) {
    global $conn;
    
    $staff_id = mysqli_real_escape_string($conn, $staff_id);
    
    $query = "SELECT id, department_id, status_semasa FROM staff WHERE id = $staff_id";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        return null;
    }
    
    $row = mysqli_fetch_assoc($result);
    return $row;
}

/**
 * Test API call with JWT token
 * @param string $token JWT token
 * @param string $endpoint API endpoint to test
 * @return array API response
 */
function testAPIWithJWT($token, $endpoint = 'business-units') {
    $host = 'http://mytotalhealth.com.my/referral-api/api/';
    $url = $host . $endpoint;
    
    $headers = array(
        'Authorization: Bearer ' . $token,
        'Accept: application/json',
        'Content-Type: application/json'
    );
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return array(
        'success' => $httpCode === 200,
        'response' => $response,
        'http_code' => $httpCode,
        'error' => $error
    );
}

// Handle different test scenarios
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : 'test-auth';
    $staff_id = isset($_GET['staff_id']) ? (int)$_GET['staff_id'] : null;
    
    switch ($action) {
        case 'test-auth':
            if (!$staff_id) {
                echo json_encode(array(
                    'success' => false, 
                    'message' => 'Please provide staff_id parameter'
                ));
                exit;
            }
            
            // Get staff data from database
            $staffData = getStaffForAuth($staff_id);
            if (!$staffData) {
                echo json_encode(array(
                    'success' => false, 
                    'message' => 'Staff not found',
                    'staff_id' => $staff_id
                ));
                exit;
            }
            
            // Get JWT token
            $authResult = getJWTToken(
                $staffData['id'], 
                $staffData['department_id'], 
                $staffData['status_semasa']
            );
            
            if ($authResult['success']) {
                // Test API call with token
                $testResult = testAPIWithJWT($authResult['token']);
                
                echo json_encode(array(
                    'success' => true,
                    'staff_data' => $staffData,
                    'auth_result' => $authResult,
                    'api_test' => $testResult,
                    'message' => 'JWT authentication test completed'
                ));
            } else {
                echo json_encode(array(
                    'success' => false,
                    'staff_data' => $staffData,
                    'auth_result' => $authResult,
                    'message' => 'JWT authentication failed'
                ));
            }
            break;
            
        case 'get-staff':
            if (!$staff_id) {
                echo json_encode(array(
                    'success' => false, 
                    'message' => 'Please provide staff_id parameter'
                ));
                exit;
            }
            
            $staffData = getStaffForAuth($staff_id);
            echo json_encode(array(
                'success' => $staffData !== null,
                'staff_data' => $staffData,
                'staff_id' => $staff_id
            ));
            break;
            
        case 'list-staff':
            // Get first 10 staff records for testing
            $query = "SELECT id, nama_staff, department_id, status_semasa FROM staff LIMIT 10";
            $result = mysqli_query($conn, $query);
            
            $staff_list = array();
            while ($row = mysqli_fetch_assoc($result)) {
                $staff_list[] = $row;
            }
            
            echo json_encode(array(
                'success' => true,
                'staff_list' => $staff_list,
                'message' => 'Available staff for testing'
            ));
            break;
            
        default:
            echo json_encode(array(
                'success' => false,
                'message' => 'Invalid action. Available actions: test-auth, get-staff, list-staff',
                'usage' => array(
                    'test-auth' => '?action=test-auth&staff_id=2222',
                    'get-staff' => '?action=get-staff&staff_id=2222',
                    'list-staff' => '?action=list-staff'
                )
            ));
    }
} else {
    echo json_encode(array(
        'success' => false,
        'message' => 'Use GET method with action parameter',
        'examples' => array(
            'test-auth' => 'GET ?action=test-auth&staff_id=2222',
            'get-staff' => 'GET ?action=get-staff&staff_id=2222',
            'list-staff' => 'GET ?action=list-staff'
        )
    ));
}
?>