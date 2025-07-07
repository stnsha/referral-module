<?php
require '../api.php';
header('Content-Type: application/json');

$data = array(
    "name" => isset($_POST['name']) ? $_POST['name'] : "",
    "email" => isset($_POST['email']) ? $_POST['email'] : "",
    "phone" => isset($_POST['phone']) ? $_POST['phone'] : "",
    "organization" => isset($_POST['organization']) ? $_POST['organization'] : "",
    "position" => isset($_POST['position']) ? $_POST['position'] : "",
    "specialty" => isset($_POST['specialty']) ? $_POST['specialty'] : "",
    "address" => isset($_POST['address']) ? $_POST['address'] : ""
);

// echo json_encode($data);

$endpoint = 'external-referees';
$response = getApiData($endpoint, $data, 'POST');
if (is_array($response) && array_key_exists('ch', $response)) {
    unset($response['ch']);
}

echo json_encode($response);


exit;
