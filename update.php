<?php
require 'api.php';
header('Content-Type: application/json');

$data = array();

$form_data = array();
foreach ($_POST as $key => $value) {
    if (!in_array($key, array(
        'referral_id',
        'bu_id_reply',
    ))) {
        $form_data[$key] = $value;
    }
}

$data[] = array(
    'referral_id' => $_POST['referral_id'],
    'bu_id_reply' => $_POST['bu_id_reply'],
    'form_data' => $form_data
);

// echo json_encode($data);

$endpoint = 'referral'; // change as needed
$response = getApiData($endpoint, $data, 'PUT');
echo json_encode($response);

exit;
