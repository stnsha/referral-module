<?php
header('Content-Type: application/json');

// Start session if not already started (PHP 5.3 compatible)
if (session_id() == '') {
    session_start();
}

// Include database connection
$connect = 1;
include('../common/index_adv.php');

if (!isset($conn)) {
    die(json_encode(array("status" => 500, "message" => "Database connection error")));
}

// Get staff information from session
$staff_id = null;
$department = null;
$status_semasa = null;

if (isset($_SESSION["myusername"])) {
    $username = $_SESSION["myusername"];
    $query = "select * from staff where username = '$username' and recycle!=1";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        while ($rows = $result->fetch_assoc()) {
            $staff_id = stripslashes($rows['id']);
            $department = stripslashes($rows['department']);
            $status_semasa = stripslashes($rows['status_semasa']);
        }
    }
}

/**
 * Get staff information for JWT authentication
 * @param int $staff_id Staff ID from session
 * @return array Staff data or null if not found
 */
function getStaffAuthData($staff_id)
{
    global $conn;

    $staff_id = mysqli_real_escape_string($conn, $staff_id);

    $query = "SELECT id, department, status_semasa FROM staff WHERE id = $staff_id";
    $result = mysqli_query($conn, $query);

    if (!$result) {
        return null;
    }

    $row = mysqli_fetch_assoc($result);
    if (!$row) {
        return null;
    }

    // Return in the format expected by JWT API
    return array(
        'staff_id' => (int)$row['id'],
        'staff_department_id' => (int)$row['department'],
        'status_semasa' => $row['status_semasa']
    );
}

/**
 * Get JWT token from the referral API
 * @param int $staff_id Staff ID
 * @param int $staff_department_id Staff department ID  
 * @param string $status_semasa Staff status
 * @return string|null JWT token or null on failure
 */
function getJWTToken($staff_id, $staff_department_id, $status_semasa)
{
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

    if ($response === false || $httpCode !== 200) {
        error_log("JWT Auth failed: HTTP $httpCode, Error: $error, Response: $response");
        return null;
    }

    $decoded = json_decode($response, true);
    return isset($decoded['token']) ? $decoded['token'] : null;
}

/**
 * Get or refresh JWT token with caching
 * @param int $staff_id Staff ID from session
 * @return string|null JWT token or null on failure
 */
function getAuthToken($staff_id)
{
    // Check if token exists in session and is still valid (basic check)
    if (
        isset($_SESSION['jwt_token']) && isset($_SESSION['jwt_expires']) &&
        time() < $_SESSION['jwt_expires']
    ) {
        return $_SESSION['jwt_token'];
    }

    // Get staff data for authentication
    $staffData = getStaffAuthData($staff_id);

    if (!$staffData) {
        error_log("Staff data not found for ID: $staff_id");
        return null;
    }

    // Get new JWT token
    $token = getJWTToken(
        $staffData['staff_id'],
        $staffData['staff_department_id'],
        $staffData['status_semasa']
    );

    if ($token) {
        // Store token in session (expires in 1 hour - adjust as needed)
        $_SESSION['jwt_token'] = $token;
        $_SESSION['jwt_expires'] = time() + 3600; // 1 hour
        $_SESSION['jwt_staff_id'] = $staff_id;
    }

    return $token;
}

/**
 * Make API call with JWT authentication
 * @param string $endpoint API endpoint
 * @param array|null $data Request data
 * @param string $method HTTP method
 * @param int $staff_id Staff ID for authentication
 * @return array API response
 */
function getApiDataWithJWT($endpoint, $data = null, $method = 'GET', $staff_id = null)
{
    $host = 'http://mytotalhealth.com.my/referral-api/api/';
    $url = $host . $endpoint;

    // Get JWT token
    $token = getAuthToken($staff_id);
    if (!$token) {
        return array(
            'success' => false,
            'error' => 'Authentication failed - could not get JWT token',
            'response' => json_encode(array('error' => 'Authentication failed')),
            'httpCode' => 401
        );
    }

    $method = strtoupper($method);

    $headers = array(
        'Authorization: Bearer ' . $token,
        'Accept: application/json',
        'Content-Type: application/json'
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    if ($method === 'GET') {
        curl_setopt($ch, CURLOPT_URL, $url);
    } elseif ($method === 'POST') {
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    $headers = curl_getinfo($ch, CURLINFO_HEADER_OUT);

    // If unauthorized, clear token and retry once
    if ($httpCode === 401 && isset($_SESSION['jwt_token'])) {
        unset($_SESSION['jwt_token']);
        unset($_SESSION['jwt_expires']);

        // Get new token and retry
        $token = getAuthToken($staff_id);
        if ($token) {
            $headers[0] = 'Authorization: Bearer ' . $token; // Update auth header
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
        }
    }

    curl_close($ch);

    if ($response === false || ($httpCode !== 200 && $httpCode !== 201 && $httpCode !== 204)) {
        return array(
            'success' => false,
            'error' => 'API Request Failed',
            'details' => array(
                'url' => $url,
                'http_code' => $httpCode,
                'curl_error' => $error,
                'response' => $response
            ),
            'response' => $response ?: json_encode(array('error' => 'No response')),
            'httpCode' => $httpCode
        );
    }

    return array(
        'success' => true,
        'response' => $response,
        'httpCode' => $httpCode,
        'headers' => $headers
    );
}

// Wrapper functions for existing API calls
function getBusinessUnit($staff_id)
{
    $result = getApiDataWithJWT('business-units', null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded['data']) ? $decoded['data'] : array();
}

function createForm($data, $staff_id)
{
    $formattedData = array(
        'business_unit_id' => (int)$data['business_unit_id'],
        'label_name' => $data['label_name'],
        'field_name' => $data['field_name'],
        'field_type' => $data['field_type'],
        'is_hidden' => isset($data['is_hidden']) ? (int)$data['is_hidden'] : 0,
        'is_required' => isset($data['is_required']) ? (int)$data['is_required'] : 0,
    );

    if (isset($data['value_fields']) && is_array($data['value_fields'])) {
        $formattedData['value_fields'] = array_values(array_filter($data['value_fields']));
    }

    $result = getApiDataWithJWT('form', $formattedData, 'POST', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 201) {
        return array(
            'success' => true,
            'id' => $decoded['form_id']
        );
    } else {
        return array('error' => true, 'message' => isset($decoded['message']) ? $decoded['message'] : 'Unknown error');
    }
}

function getFormDetails($business_unit_id, $staff_id)
{
    $result = getApiDataWithJWT('form/show/' . $business_unit_id, null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

function getAllReferral($staff_id)
{
    $result = getApiDataWithJWT('referral', null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    // Return the full data structure with all, sent, received
    return isset($decoded['data']) ? $decoded['data'] : array('all' => array(), 'sent' => array(), 'received' => array());
}

function getReferral($referral_id, $staff_id)
{
    $result = getApiDataWithJWT('referral/' . $referral_id, null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

function getExternalOrganization($staff_id)
{
    $result = getApiDataWithJWT('external-organizations', null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

function getReferralStatus($staff_id)
{
    $result = getApiDataWithJWT('library/status', null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

function getReferralPriority($staff_id)
{
    $result = getApiDataWithJWT('library/priority', null, 'GET', $staff_id);

    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

function getReportChart($staff_id)
{
    $result = getApiDataWithJWT('report/chart', null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

function getReportDashboard($staff_id)
{
    $result = getApiDataWithJWT('report/dashboard', null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

function getReport($formData, $staff_id)
{
    $result = getApiDataWithJWT('report', array($formData), 'POST', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    // Handle different HTTP status codes
    switch ($httpCode) {
        case 200:
            return array(
                'success' => true,
                'data' => $decoded,
            );
        case 404:
            return array(
                'success' => false,
                'message' => isset($decoded['message']) ? $decoded['message'] : 'No referral found',
                'error' => isset($decoded['error']) ? $decoded['error'] : 'Referral not found'
            );
        case 422:
            return array(
                'success' => false,
                'message' => isset($decoded['message']) ? $decoded['message'] : 'Validation error',
                'error' => isset($decoded['error']) ? $decoded['error'] : 'Invalid input parameters',
                'details' => isset($decoded['details']) ? $decoded['details'] : null
            );
        case 500:
            return array(
                'success' => false,
                'message' => isset($decoded['message']) ? $decoded['message'] : 'Server error occurred',
                'error' => isset($decoded['error']) ? $decoded['error'] : 'Internal server error'
            );
        default:
            return array(
                'success' => false,
                'message' => 'API request failed with HTTP code: ' . $httpCode,
                'error' => 'Unexpected response from server'
            );
    }
}

function getSummaryReport($business_unit_id, $staff_id)
{
    $result = getApiDataWithJWT('report/summary/' . $business_unit_id, null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

// Check if we have a staff ID for authentication
if (!$staff_id) {
    echo json_encode(array(
        'success' => false,
        'error' => 'No staff ID available for authentication',
        'message' => 'Staff ID is required for JWT authentication. Please ensure you are logged in.',
        'debug' => array(
            'session_username' => isset($_SESSION["myusername"]) ? $_SESSION["myusername"] : 'not set',
            'staff_id' => $staff_id
        )
    ));
    exit;
}

// Main request handler
$input = file_get_contents('php://input');
$jsonData = json_decode($input, true);
$response = array('success' => false, 'message' => 'Invalid request');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($jsonData && isset($jsonData['action'])) {
        // Handle JSON requests
        switch ($jsonData['action']) {
            case 'business-units':
                $response = array('data' => getBusinessUnit($staff_id));
                break;
            case 'create-form':
                if (isset($jsonData['formData'])) {
                    $response = createForm($jsonData['formData'], $staff_id);
                }
                break;
            case 'form-details':
                if (isset($jsonData['business_unit_id'])) {
                    $response = array('data' => getFormDetails($jsonData['business_unit_id'], $staff_id));
                }
                break;
            case 'get-referral':
                if (isset($jsonData['referral_id'])) {
                    $response = array('data' => getReferral($jsonData['referral_id'], $staff_id));
                }
                break;
            case 'get-report':
                if (isset($jsonData['formData'])) {
                    $response = getReport($jsonData['formData'], $staff_id);
                }
                break;
        }
        echo json_encode($response);
    } elseif (isset($_POST['action'])) {
        // Handle form-data requests
        switch ($_POST['action']) {
            case 'business-units':
                $response = array('data' => getBusinessUnit($staff_id));
                break;
            case 'create-form':
                $formData = array(
                    'business_unit_id' => isset($_POST['business_unit_id']) ? $_POST['business_unit_id'] : null,
                    'label_name' => isset($_POST['label_name']) ? $_POST['label_name'] : null,
                    'field_name' => isset($_POST['field_name']) ? $_POST['field_name'] : null,
                    'field_type' => isset($_POST['field_type']) ? $_POST['field_type'] : null,
                    'is_hidden' => isset($_POST['is_hidden']) ? $_POST['is_hidden'] : 0,
                    'is_required' => isset($_POST['is_required']) ? $_POST['is_required'] : 0,
                );
                if (isset($_POST['value_fields']) && is_array($_POST['value_fields'])) {
                    $formData['value_fields'] = $_POST['value_fields'];
                }
                $response = createForm($formData, $staff_id);
                break;
            case 'form-details':
                if (isset($_POST['business_unit_id'])) {
                    $response = array('data' => getFormDetails($_POST['business_unit_id'], $staff_id));
                }
                break;
            case 'all-referral':
                $response = array('data' => getAllReferral($staff_id));
                break;
            case 'external-organizations':
                $response = array('data' => getExternalOrganization($staff_id));
                break;
            case 'referral-status':
                $response = array('data' => getReferralStatus($staff_id));
                break;
            case 'referral-priority':
                $response = array('data' => getReferralPriority($staff_id));
                break;
            case 'report-chart':
                $response = array('data' => getReportChart($staff_id));
                break;
            case 'report-dashboard':
                $response = array('data' => getReportDashboard($staff_id));
                break;
            case 'get-report':
                if (isset($_POST['formData'])) {
                    $response = getReport($_POST['formData'], $staff_id);
                }
                break;
            case 'get-summary-report':
                if (isset($_POST['business_unit_id'])) {
                    $response = getSummaryReport($_POST['business_unit_id'], $staff_id);
                }
                break;
        }
        echo json_encode($response);
    }
} else {
    echo json_encode($response);
}
