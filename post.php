<?php
require 'api.php';
header('Content-Type: application/json');

echo '<pre>';
print_r($_POST);
echo '</pre>';
echo '<pre>';
print_r($_FILES);
echo '</pre>';

exit;
$data = array();

$business_unit_from = isset($_POST['business_unit_id_from']) ? $_POST['business_unit_id_from'] : null;
$business_unit_to = isset($_POST['business_unit_id_to']) ? $_POST['business_unit_id_to'] : null;

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
    'recipient' => array(
        'staff_id' => isset($_POST['recipient_to']) ? (int)$_POST['recipient_to'] : null,
        'business_unit_id' => $business_unit_to,
        'location' => isset($_POST['location_to']) ? $_POST['location_to'] : null,
    )
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

// echo json_encode($data);

$endpoint = 'referral';
$response = getApiData($endpoint, $data, 'POST');
// echo json_encode($response);

if (isset($response['httpCode']) && $response['httpCode'] == 201) {
    $rawJson = $response['response'];
    $decoded = json_decode($rawJson, true);

    $id = isset($decoded['id']) ? $decoded['id'] : null;

    if ($id !== null) {
        // echo 'ID: ' . $id;
        header('Location: qr.php?id=' . urlencode($id));
        exit;
    } else {
        echo 'ID not found in response.';
    }
} else {
    echo 'Unexpected status code: ' . json_encode($response);
}

exit;

$uploadedFiles = array();

if (!empty($_FILES['attachments']['name'][0])) {
    foreach ($_FILES['attachments']['name'] as $index => $name) {
        if ($_FILES['attachments']['error'][$index] === 0) {
            $uploadedFiles[] = array(
                'name' => $name,
                'type' => $_FILES['attachments']['type'][$index],
                'tmp_name' => $_FILES['attachments']['tmp_name'][$index],
                'error' => $_FILES['attachments']['error'][$index],
                'size' => $_FILES['attachments']['size'][$index]
            );
        }
    }
}
