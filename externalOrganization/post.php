<?php
session_start();
define('API_JWT_INCLUDED', true);
require '../api-jwt.php';
header('Content-Type: application/json');

// Staff ID is already set by api-jwt.php from session (lines 22-34)
// So we can use it directly

// Build the data array for organization creation
$data = array(
    "name" => isset($_POST['org_name']) ? $_POST['org_name'] : "",
    "address" => isset($_POST['org_address']) ? $_POST['org_address'] : "",
    "postcode" => isset($_POST['org_postcode']) ? $_POST['org_postcode'] : "",
    "state" => isset($_POST['org_state']) ? $_POST['org_state'] : "",
    "country" => isset($_POST['org_country']) ? $_POST['org_country'] : "Malaysia"
);

// If referee details are provided, add nested referee array
if (isset($_POST['referee_name']) && !empty($_POST['referee_name'])) {
    $data['referees'] = array(
        array(
            "name" => $_POST['referee_name'],
            "email" => isset($_POST['referee_email']) ? $_POST['referee_email'] : "",
            "phone" => isset($_POST['referee_phone']) ? $_POST['referee_phone'] : "",
            "position" => isset($_POST['referee_position']) ? $_POST['referee_position'] : ""
        )
    );
}

$endpoint = 'external-organizations';
$response = getApiDataWithJWT($endpoint, $data, 'POST', $staff_id);
if (is_array($response) && array_key_exists('ch', $response)) {
    unset($response['ch']);
}

echo json_encode($response);
exit;
