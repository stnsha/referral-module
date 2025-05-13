<?php
require 'api.php';
header('Content-Type: application/json');

$data = array();

$business_unit_from = isset($_POST['business_unit_from']) ? $_POST['business_unit_from'] : null;
$business_unit_to = isset($_POST['business_unit_to']) ? $_POST['business_unit_to'] : null;

$data['business_units'] = array(
    'assignee' => array(
        'staff_id' => isset($_POST['assignee_from']) ? (int)$_POST['assignee_from'] : null,
        'staff_department_id' => $business_unit_from
    ),
    'recipient' => array(
        'staff_id' => isset($_POST['recipient_to']) ? (int)$_POST['recipient_to'] : null,
        'staff_department_id' => $business_unit_to
    )
);

// $business_unit = isset($_POST['business_unit']) ? $_POST['business_unit'] : $business_unit_from;
$data['referral'] = array(
    'customer_id' => isset($_POST['customer_id']) ? (int)$_POST['customer_id'] : null,
    'referral_reason' => isset($_POST['referral_reason']) ? $_POST['referral_reason'] : '',
    'referral_condition' => isset($_POST['referral_condition']) ? $_POST['referral_condition'] : '',
    'medical_history' => isset($_POST['medical_history']) ? $_POST['medical_history'] : '',
    'priority' => isset($_POST['priority']) ? (int)$_POST['priority'] : null
);

$form_data = array();
foreach ($_POST as $key => $value) {
    if (!in_array($key, array(
        'business_unit_from',
        'assignee_from',
        'location_from',
        'business_unit_to',
        'recipient_to',
        'location_to',
        'referral_reason',
        'referral_condition',
        'medical_history',
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

$endpoint = 'referral'; // change as needed
$response = getApiData($endpoint, $data);
echo json_encode($response);

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
