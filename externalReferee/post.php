<?php
session_start();
define('API_JWT_INCLUDED', true);
require '../api-jwt.php';
header('Content-Type: application/json');

// Staff ID is already set by api-jwt.php from session (lines 22-34)
// So we can use it directly

// Build the data array based on whether it's new organization or existing
$data = array(
    "name" => isset($_POST['name']) ? $_POST['name'] : "",
    "email" => isset($_POST['email']) ? $_POST['email'] : "",
    "phone" => isset($_POST['phone']) ? $_POST['phone'] : "",
    "position" => isset($_POST['position']) ? $_POST['position'] : ""
);

// Check if using existing organization or creating new one
if (isset($_POST['external_organization_id']) && !empty($_POST['external_organization_id'])) {
    // Existing organization
    $data['external_organization_id'] = (int)$_POST['external_organization_id'];
} elseif (isset($_POST['new_org_name']) && !empty($_POST['new_org_name'])) {
    // New organization
    $data['organization'] = array(
        "name" => $_POST['new_org_name'],
        "address" => isset($_POST['new_org_address']) ? $_POST['new_org_address'] : "",
        "postcode" => isset($_POST['new_org_postcode']) ? $_POST['new_org_postcode'] : "",
        "state" => isset($_POST['new_org_state']) ? $_POST['new_org_state'] : "",
        "country" => isset($_POST['new_org_country']) ? $_POST['new_org_country'] : ""
    );
}

// echo json_encode($data);
// exit;

$endpoint = 'external-referees';
$response = getApiDataWithJWT($endpoint, $data, 'POST', $staff_id);
if (is_array($response) && array_key_exists('ch', $response)) {
    unset($response['ch']);
}

echo json_encode($response);
exit;