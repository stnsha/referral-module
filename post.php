<?php
require 'api-jwt.php';
header('Content-Type: application/json');

$data = array();

$business_unit_from = isset($_POST['business_unit_id_from']) ? $_POST['business_unit_id_from'] : null;
$business_unit_to = isset($_POST['business_unit_id_to']) ? $_POST['business_unit_id_to'] : null;

//recipient to
$recipient = array();

if (!isset($_POST['external_referral'])) {
    //(internal)
    $recipient = array(
        'staff_id' => isset($_POST['recipient_to']) ? (int)$_POST['recipient_to'] : null,
        'business_unit_id' => $business_unit_to,
        'location' => isset($_POST['location_to']) ? $_POST['location_to'] : null,
    );
} else {
    //external
    $recipient = array(
        'organization' => isset($_POST['organization']) ? (int)$_POST['organization'] : null,
        'location_organization' => isset($_POST['location_organization']) ? $_POST['location_organization'] : null,
        'referee' => isset($_POST['referee']) ? $_POST['referee'] : null,
    );
}

$data['business_units'] = array(
    'assignee' => array(
        'staff_id' => isset($_POST['assignee_id_from']) ? (int)$_POST['assignee_id_from'] : null,
        'business_unit_id' => $business_unit_from,
        'location' => isset($_POST['location_id_from']) ? $_POST['location_id_from'] : null,
        'referral_reason' => isset($_POST['referral_reason']) ? $_POST['referral_reason'] : '',
        'referral_condition' => isset($_POST['referral_condition']) ? $_POST['referral_condition'] : '',
        'medical_history' => isset($_POST['medical_history']) ? $_POST['medical_history'] : '',
        'additional_remarks' => isset($_POST['additional_remarks']) ? $_POST['additional_remarks'] : '',
    ),
    'recipient' => $recipient
);

$data['referral'] = array(
    'customer_id' => isset($_POST['customer_id']) ? (int)$_POST['customer_id'] : null,
    'priority' => isset($_POST['priority']) ? (int)$_POST['priority'] : null
);

$form_data = array();
foreach ($_POST as $key => $value) {
    if (!in_array($key, array(
        'business_unit_from',
        'assignee_from',
        'location_from',
        'business_unit_id_from',
        'assignee_id_from',
        'location_id_from',
        'business_unit_to',
        'business_unit_id_to',
        'recipient_to',
        'location_to',
        'referral_reason',
        'referral_condition',
        'medical_history',
        'additional_remarks',
        'priority',
        'customer_id',
        'customer_ic',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_age',
        'customer_gender',
        'customer_address'
    ))) {
        $form_data[$key] = $value;
    }
}

if ($business_unit_from !== null) {
    $data['form_data'] = array(
        $business_unit_from => $form_data
    );
}

$uploadedFiles = array();
if (isset($_FILES['attachments']) && isset($_FILES['attachments']['name']) && is_array($_FILES['attachments']['name'])) {
    foreach ($_FILES['attachments']['name'] as $index => $name) {
        if (!empty($name) && $_FILES['attachments']['error'][$index] === 0) {
            $tmpPath = $_FILES['attachments']['tmp_name'][$index];
            $fileContent = file_get_contents($tmpPath);
            $base64 = base64_encode($fileContent);

            $uploadedFiles[] = array(
                'name' => $name,
                'type' => $_FILES['attachments']['type'][$index],
                'size' => $_FILES['attachments']['size'][$index],
                'base64' => $base64
            );
        }
    }
}
$data['attachments'] = $uploadedFiles;

// echo json_encode($data);

$endpoint = 'referral';
$response = getApiDataWithJWT($endpoint, $data, 'POST');
if (is_array($response) && array_key_exists('ch', $response)) {
    unset($response['ch']);
}
echo json_encode($response);
