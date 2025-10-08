<?php
header('Content-Type: application/json');

// Start session if not already started (PHP 5.3 compatible)
if (session_id() == '') {
    session_start();
}

// Include database connection
$connect = 1;
include(__DIR__ . '/../common/index_adv.php');

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
    } elseif ($method === 'PATCH') {
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
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

    // Handle HTTP status codes according to API documentation
    if ($response === false) {
        return array(
            'success' => false,
            'error' => 'API Request Failed',
            'message' => 'cURL error: ' . $error,
            'response' => json_encode(array('error' => 'No response')),
            'httpCode' => 0
        );
    }

    // Success codes: 200, 201, 204
    if ($httpCode === 200 || $httpCode === 201 || $httpCode === 204) {
        return array(
            'success' => true,
            'response' => $response,
            'httpCode' => $httpCode,
            'headers' => $headers
        );
    }

    // Handle error codes according to API documentation
    $decodedError = json_decode($response, true);
    $errorMessage = isset($decodedError['message']) ? $decodedError['message'] : 'API Request Failed';

    return array(
        'success' => false,
        'error' => $errorMessage,
        'message' => $errorMessage,
        'response' => $response,
        'httpCode' => $httpCode,
        'details' => $decodedError
    );

    return array(
        'success' => true,
        'response' => $response,
        'httpCode' => $httpCode,
        'headers' => $headers
    );
}

/**
 * Verify JWT token
 * @param string $token JWT token to verify
 * @return array Verification result
 */
function verifyToken($token)
{
    $host = 'http://mytotalhealth.com.my/referral-api/api/';
    $url = $host . 'auth/verify';

    $data = array(
        'token' => $token
    );

    $headers = array(
        'Accept: application/json',
        'Content-Type: application/json'
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
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
            'message' => 'cURL error: ' . $error
        );
    }

    $decoded = json_decode($response, true);

    if ($httpCode == 200) {
        return array(
            'success' => true,
            'valid' => $decoded['valid'],
            'message' => $decoded['message'],
            'payload' => isset($decoded['payload']) ? $decoded['payload'] : null
        );
    } else {
        return array(
            'success' => false,
            'valid' => false,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Token verification failed'
        );
    }
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

function getAllForm($recipientBuId, $staff_id)
{
    $data = array(
        'recipientBuId' => (int)$recipientBuId
    );

    $result = getApiDataWithJWT('form/list', $data, 'POST', $staff_id);

    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

function getAllForms($staff_id)
{
    $result = getApiDataWithJWT('form/all', null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

/**
 * Hide form
 * @param int $form_id Form ID
 * @param int $staff_id Staff ID for authentication
 * @return array Result
 */
function hideForm($form_id, $staff_id)
{
    $result = getApiDataWithJWT('form/hide/' . $form_id, null, 'PUT', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 204 || $httpCode == 200) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Form hidden successfully'
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to hide form'
        );
    }
}

/**
 * Unhide form
 * @param int $form_id Form ID
 * @param int $staff_id Staff ID for authentication
 * @return array Result
 */
function unhideForm($form_id, $staff_id)
{
    $result = getApiDataWithJWT('form/unhide/' . $form_id, null, 'PUT', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 204 || $httpCode == 200) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Form unhidden successfully'
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to unhide form'
        );
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

function getSummaryReport($staff_id)
{
    $result = getApiDataWithJWT('report/summary', null, 'GET', $staff_id);

    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

/**
 * Get all external referees
 * @param int $staff_id Staff ID for authentication
 * @return array External referees data
 */
function getExternalReferees($staff_id)
{
    $result = getApiDataWithJWT('external-referees', null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

/**
 * Get single external referee
 * @param int $referee_id External referee ID
 * @param int $staff_id Staff ID for authentication
 * @return array External referee data
 */
function getExternalReferee($referee_id, $staff_id)
{
    $result = getApiDataWithJWT('external-referees/' . $referee_id, null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

/**
 * Create external referee
 * @param array $data Referee data
 * @param int $staff_id Staff ID for authentication
 * @return array Creation result
 */
function createExternalReferee($data, $staff_id)
{
    $result = getApiDataWithJWT('external-referees', $data, 'POST', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 201) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'External referee created successfully',
            'data' => $decoded
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to create external referee'
        );
    }
}

function updateExternalReferee($referee_id, $data, $staff_id)
{
    $result = getApiDataWithJWT('external-referees/' . $referee_id, $data, 'PUT', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 200 || $httpCode == 204) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'External referee updated successfully',
            'data' => $decoded
        );
    } else {
        // Include raw response for debugging
        $errorMessage = isset($decoded['message']) ? $decoded['message'] : 'Failed to update external referee';

        // Include full error details if available
        if (isset($decoded['error'])) {
            $errorMessage .= ' - ' . $decoded['error'];
        }

        return array(
            'success' => false,
            'error' => true,
            'message' => $errorMessage,
            'httpCode' => $httpCode,
            'response' => $result['response']
        );
    }
}

/**
 * Delete external referee
 * @param int $referee_id External referee ID
 * @param int $staff_id Staff ID for authentication
 * @return array Deletion result
 */
function deleteExternalReferee($referee_id, $staff_id)
{
    $result = getApiDataWithJWT('external-referees/' . $referee_id, null, 'DELETE', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 204 || $httpCode == 200) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'External referee deleted successfully'
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to delete external referee'
        );
    }
}

/**
 * Create form details
 * @param array $data Form details data containing form_id and form_details array
 * @param int $staff_id Staff ID for authentication
 * @return array Creation result
 */
function createFormDetails($data, $staff_id)
{
    $result = getApiDataWithJWT('formDetails/create', $data, 'POST', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 201) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Form details created successfully'
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to create form details'
        );
    }
}

/**
 * Get form detail by ID
 * @param int $detail_id Form detail ID
 * @param int $staff_id Staff ID for authentication
 * @return array Form detail data
 */
function getFormDetail($detail_id, $staff_id)
{
    $result = getApiDataWithJWT('formDetails/' . $detail_id, null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

/**
 * Update form detail
 * @param int $detail_id Form detail ID
 * @param array $data Updated form detail data
 * @param int $staff_id Staff ID for authentication
 * @return array Update result
 */
function updateFormDetail($detail_id, $data, $staff_id)
{
    $result = getApiDataWithJWT('formDetails/' . $detail_id, $data, 'PUT', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 200) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Form updated successfully'
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to update form detail'
        );
    }
}

/**
 * Delete form detail
 * @param int $detail_id Form detail ID
 * @param int $staff_id Staff ID for authentication
 * @return array Deletion result
 */
function deleteFormDetail($detail_id, $staff_id)
{
    $result = getApiDataWithJWT('formDetails/' . $detail_id, null, 'DELETE', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 204 || $httpCode == 200) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Form deleted successfully'
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to delete form detail'
        );
    }
}

/**
 * Get single business unit by ID
 * @param int $business_unit_id Business unit ID
 * @param int $staff_id Staff ID for authentication
 * @return array Business unit data
 */
function getSingleBusinessUnit($business_unit_id, $staff_id)
{
    $result = getApiDataWithJWT('business-units/' . $business_unit_id, null, 'GET', $staff_id);
    if (!$result['success']) {
        return array();
    }
    $decoded = json_decode($result['response'], true);
    return isset($decoded) ? $decoded : array();
}

/**
 * Create business unit
 * @param array $data Business unit data
 * @param int $staff_id Staff ID for authentication
 * @return array Creation result
 */
function createBusinessUnit($data, $staff_id)
{
    $result = getApiDataWithJWT('business-units', $data, 'POST', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 201) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Business unit created successfully',
            'data' => $decoded
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to create business unit'
        );
    }
}

/**
 * Update business unit
 * @param int $business_unit_id Business unit ID
 * @param array $data Updated business unit data
 * @param int $staff_id Staff ID for authentication
 * @return array Update result
 */
function updateBusinessUnit($business_unit_id, $data, $staff_id)
{
    $result = getApiDataWithJWT('business-units/' . $business_unit_id, $data, 'PUT', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 200) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Business unit updated successfully',
            'data' => $decoded
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to update business unit'
        );
    }
}

/**
 * Delete business unit
 * @param int $business_unit_id Business unit ID
 * @param int $staff_id Staff ID for authentication
 * @return array Deletion result
 */
function deleteBusinessUnit($business_unit_id, $staff_id)
{
    $result = getApiDataWithJWT('business-units/' . $business_unit_id, null, 'DELETE', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 204) {
        return array(
            'success' => true,
            'message' => 'Business unit deleted successfully'
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to delete business unit'
        );
    }
}

/**
 * Create referral
 * @param array $data Referral data including business_units, referral, form_data, and attachments
 * @param int $staff_id Staff ID for authentication
 * @return array Creation result
 */
function createReferral($data, $staff_id)
{
    $result = getApiDataWithJWT('referral', $data, 'POST', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 201) {
        return array(
            'success' => true,
            'id' => isset($decoded['id']) ? $decoded['id'] : null,
            'pdf_base64' => isset($decoded['pdf_base64']) ? $decoded['pdf_base64'] : null,
            'message' => 'Referral created successfully'
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to create referral',
            'details' => isset($decoded['errors']) ? $decoded['errors'] : null
        );
    }
}

/**
 * Update referral
 * @param array $data Referral update data including referral, refer_another, attachments, and form_data
 * @param int $staff_id Staff ID for authentication
 * @return array Update result
 */
function updateReferral($data, $staff_id)
{
    $result = getApiDataWithJWT('referral', $data, 'PUT', $staff_id);
    $httpCode = $result['httpCode'];
    $decoded = json_decode($result['response'], true);

    if ($httpCode == 200) {
        return array(
            'success' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Referral updated successfully'
        );
    } else {
        return array(
            'success' => false,
            'error' => true,
            'message' => isset($decoded['message']) ? $decoded['message'] : 'Failed to update referral',
            'details' => isset($decoded['errors']) ? $decoded['errors'] : null
        );
    }
}

/**
 * Download attachment and output as file
 * @param int $attachment_id Attachment ID
 * @param int $staff_id Staff ID for authentication
 * @return void Outputs file directly or JSON error
 */
function downloadAttachment($attachment_id, $staff_id)
{
    $result = getApiDataWithJWT('attachment/' . $attachment_id, null, 'GET', $staff_id);

    if (!$result['success']) {
        header('Content-Type: application/json');
        echo json_encode(array(
            'success' => false,
            'message' => 'Failed to retrieve attachment',
            'error' => $result['message']
        ));
        exit;
    }

    $decoded = json_decode($result['response'], true);

    if (!$decoded || !isset($decoded['base64'])) {
        header('Content-Type: application/json');
        echo json_encode(array(
            'success' => false,
            'message' => 'Invalid attachment data received'
        ));
        exit;
    }

    // Extract file information
    $filename = isset($decoded['name']) ? $decoded['name'] : 'download';
    $contentType = isset($decoded['type']) ? $decoded['type'] : 'application/octet-stream';
    $fileContent = base64_decode($decoded['base64']);

    if ($fileContent === false) {
        header('Content-Type: application/json');
        echo json_encode(array(
            'success' => false,
            'message' => 'Failed to decode file content'
        ));
        exit;
    }

    // Set headers for file download
    header('Content-Type: ' . $contentType);
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Transfer-Encoding: binary');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Expires: 0');
    header('Content-Length: ' . strlen($fileContent));

    // Output the decoded file content
    echo $fileContent;
    exit;
}

function downloadExternalForm($referral_id, $staff_id)
{
    $result = getApiDataWithJWT('referral/download/' . $referral_id, null, 'GET', $staff_id);

    if (!$result['success']) {
        header('Content-Type: application/json');
        echo json_encode(array(
            'success' => false,
            'message' => 'Failed to retrieve attachment',
            'error' => $result['message']
        ));
        exit;
    }

    $decoded = json_decode($result['response'], true);

    if (!$decoded || !isset($decoded['pdfBase64'])) {
        header('Content-Type: application/json');
        echo json_encode(array(
            'success' => false,
            'message' => 'Invalid attachment data received'
        ));
        exit;
    }

    // Extract file information
    $filename = isset($decoded['name']) ? $decoded['name'] : 'download';
    $contentType = isset($decoded['type']) ? $decoded['type'] : 'application/octet-stream';
    $fileContent = base64_decode($decoded['pdfBase64']);

    if ($fileContent === false) {
        header('Content-Type: application/json');
        echo json_encode(array(
            'success' => false,
            'message' => 'Failed to decode file content'
        ));
        exit;
    }

    // Set headers for file download
    header('Content-Type: ' . $contentType);
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Transfer-Encoding: binary');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Expires: 0');
    header('Content-Length: ' . strlen($fileContent));

    // Output the decoded file content
    echo $fileContent;
    exit;
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

// Check for action in query parameter or JSON body
$action = isset($_GET['action']) ? $_GET['action'] : (isset($jsonData['action']) ? $jsonData['action'] : null);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action) {
        // Handle JSON requests
        switch ($action) {
            case 'business-units':
                $response = array('data' => getBusinessUnit($staff_id));
                break;
            case 'create-form':
                if (isset($jsonData['formData'])) {
                    $response = createForm($jsonData['formData'], $staff_id);
                }
                break;
            case 'get-forms':
                if (isset($jsonData['recipientBuId'])) {
                    $response = array('data' => getAllForm($jsonData['recipientBuId'], $staff_id));
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
            case 'verify-token':
                if (isset($jsonData['token'])) {
                    $response = verifyToken($jsonData['token']);
                }
                break;
            case 'verify-session':
                // Get current JWT token from session and verify it
                if (isset($_SESSION['jwt_token'])) {
                    $response = verifyToken($_SESSION['jwt_token']);
                } else {
                    $response = array(
                        'success' => false,
                        'valid' => false,
                        'message' => 'No JWT token found in session'
                    );
                }
                break;
            case 'get-auth-token':
                // Test the getAuthToken function
                $token = getAuthToken($staff_id);
                if ($token) {
                    $response = array(
                        'success' => true,
                        'message' => 'JWT token retrieved successfully',
                        'token' => $token,
                        'staff_id' => $staff_id,
                        'expires_at' => isset($_SESSION['jwt_expires']) ? date('Y-m-d H:i:s', $_SESSION['jwt_expires']) : 'Unknown'
                    );
                } else {
                    $response = array(
                        'success' => false,
                        'message' => 'Failed to get JWT token',
                        'staff_id' => $staff_id
                    );
                }
                break;
            case 'create-referral':
                if (isset($jsonData['referralData'])) {
                    $response = createReferral($jsonData['referralData'], $staff_id);
                }
                break;
            case 'update-referral':
                if (isset($jsonData['referralData'])) {
                    $response = updateReferral($jsonData['referralData'], $staff_id);
                }
                break;
            case 'download-attachment':
                $attachment_id = isset($jsonData['attachment_id']) ? $jsonData['attachment_id'] : null;
                if ($attachment_id) {
                    downloadAttachment($attachment_id, $staff_id);
                    return;
                } else {
                    $response = array('success' => false, 'message' => 'Missing attachment_id');
                }
                break;
            case 'download-external-form':
                $referral_id = isset($jsonData['referral_id']) ? $jsonData['referral_id'] : null;
                if ($referral_id) {
                    downloadExternalForm($referral_id, $staff_id);
                    return;
                } else {
                    $response = array('success' => false, 'message' => 'Missing referral_id');
                }
                break;

            case 'external-organizations':
                $response = array('data' => getExternalOrganization($staff_id));
                break;
            case 'external-referees':
                $response = array('data' => getExternalReferees($staff_id));
                break;
            case 'update-external-referee':
                // Get referee_id from query parameter
                $referee_id = isset($_GET['referee_id']) ? $_GET['referee_id'] : null;
                if ($referee_id && $jsonData) {
                    $response = updateExternalReferee($referee_id, $jsonData, $staff_id);
                } else {
                    $response = array('success' => false, 'error' => true, 'message' => 'Missing referee_id or data');
                }
                break;
            case 'delete-external-referee':
                $referee_id = isset($jsonData['referee_id']) ? $jsonData['referee_id'] : null;
                if ($referee_id) {
                    $response = deleteExternalReferee($referee_id, $staff_id);
                } else {
                    $response = array('success' => false, 'error' => true, 'message' => 'Missing referee_id');
                }
                break;
            case 'all-forms':
                $response = array('data' => getAllForms($staff_id));
                break;
            case 'hide-form':
                if (isset($jsonData['form_id'])) {
                    $response = hideForm($jsonData['form_id'], $staff_id);
                }
                break;
            case 'unhide-form':
                if (isset($jsonData['form_id'])) {
                    $response = unhideForm($jsonData['form_id'], $staff_id);
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
            case 'get-forms':
                if (isset($_POST['recipientBuId'])) {
                    $response = array('data' => getAllForm($_POST['recipientBuId'], $staff_id));
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