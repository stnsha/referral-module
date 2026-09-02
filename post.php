<?php
define('API_JWT_INCLUDED', true);
require 'api-jwt.php';
header('Content-Type: application/json');

$data = array();

$business_unit_from = isset($_POST['business_unit_id_from']) ? $_POST['business_unit_id_from'] : null;
$business_unit_to = isset($_POST['business_unit_id_to']) ? $_POST['business_unit_id_to'] : null;

//recipient to
$recipient = array();
$assigneeData = array();
$referralData = array();

//(internal)
$recipient = array(
    'staff_id' => isset($_POST['recipient_to']) ? (int)$_POST['recipient_to'] : null,
    'business_unit_id' => $business_unit_to,
    'location' => isset($_POST['location_to']) ? $_POST['location_to'] : null,
);

$assigneeData = array(
    'staff_id' => isset($_POST['assignee_id_from']) ? (int)$_POST['assignee_id_from'] : null,
    'business_unit_id' => $business_unit_from,
    'location' => isset($_POST['location_id_from']) ? $_POST['location_id_from'] : null,
    'referral_reason' => isset($_POST['referral_reason']) ? $_POST['referral_reason'] : '',
    'referral_condition' => isset($_POST['referral_condition']) ? $_POST['referral_condition'] : '',
    'medical_history' => isset($_POST['medical_history']) ? $_POST['medical_history'] : '',
    'additional_remarks' => isset($_POST['additional_remarks']) ? $_POST['additional_remarks'] : '',
);

$referralData = array(
    'customer_id' => isset($_POST['customer_id']) ? (int)$_POST['customer_id'] : null,
    'priority' => isset($_POST['priority']) ? (int)$_POST['priority'] : null,
    'consult_call_id' => (isset($_POST['consult_call_id']) && $_POST['consult_call_id'] !== '') ? (int)$_POST['consult_call_id'] : null,
    'consult_call_detail_id' => (isset($_POST['consult_call_detail_id']) && $_POST['consult_call_detail_id'] !== '') ? (int)$_POST['consult_call_detail_id'] : null
);

// Validate customer_id - must be a positive integer
if (!isset($_POST['customer_id']) || empty($_POST['customer_id']) || (int)$_POST['customer_id'] <= 0) {
    http_response_code(400);
    echo json_encode(array(
        'success' => false,
        'httpCode' => 400,
        'response' => json_encode(array(
            'error' => 'Invalid customer_id',
            'message' => 'Customer ID is required and must be a valid positive integer. Please ensure you have selected or created a customer.'
        ))
    ));
    exit;
}

if (isset($_POST['external_referral'])) {
    //external
    // Get patient data using searchCustomer
    $customer_id = isset($_POST['customer_id']) ? (int)$_POST['customer_id'] : null;
    // Get staff details for assignee
    $staff_id = isset($_POST['assignee_id_from']) ? (int)$_POST['assignee_id_from'] : null;
    $location_id = isset($_POST['location_id_from']) ? $_POST['location_id_from'] : null;

    // Build recipient data based on conditions
    $recipient = array();

    // Check if using existing organization or creating new one
    if (isset($_POST['organization']) && !empty($_POST['organization'])) {
        // Existing organization selected
        $recipient['organization'] = (int)$_POST['organization'];

        // Check if using existing referee or creating new one
        if (isset($_POST['referee']) && !empty($_POST['referee'])) {
            // Condition 1: Existing organization + existing referee
            $recipient['referee'] = (int)$_POST['referee'];
        } elseif (isset($_POST['new_recipient_name']) && !empty($_POST['new_recipient_name'])) {
            // Condition 2: Existing organization + new recipient
            $recipient['new_recipient'] = array(
                'name' => $_POST['new_recipient_name'],
                'email' => isset($_POST['new_recipient_email']) ? $_POST['new_recipient_email'] : '',
                'phone' => isset($_POST['new_recipient_phone']) ? $_POST['new_recipient_phone'] : '',
                'position' => isset($_POST['new_recipient_position']) ? $_POST['new_recipient_position'] : ''
            );
        }
    } elseif (isset($_POST['new_org_name']) && !empty($_POST['new_org_name'])) {
        // New organization being created
        $recipient['new_organization'] = array(
            'name' => $_POST['new_org_name'],
            'address' => isset($_POST['new_org_address']) ? $_POST['new_org_address'] : '',
            'postcode' => isset($_POST['new_org_postcode']) ? $_POST['new_org_postcode'] : '',
            'state' => isset($_POST['new_org_state']) ? $_POST['new_org_state'] : '',
            'country' => isset($_POST['new_org_country']) ? $_POST['new_org_country'] : 'Malaysia'
        );

        // Check if creating new recipient as well
        if (isset($_POST['new_recipient_name']) && !empty($_POST['new_recipient_name'])) {
            // Condition 3: New organization + new recipient
            $recipient['new_recipient'] = array(
                'name' => $_POST['new_recipient_name'],
                'email' => isset($_POST['new_recipient_email']) ? $_POST['new_recipient_email'] : '',
                'phone' => isset($_POST['new_recipient_phone']) ? $_POST['new_recipient_phone'] : '',
                'position' => isset($_POST['new_recipient_position']) ? $_POST['new_recipient_position'] : ''
            );
        }
        // Condition 4 (implicit): New organization only (no new recipient) - already handled above
    }
}

$data['business_units'] = array(
    'assignee' => $assigneeData,
    'recipient' => $recipient
);

$data['referral'] = $referralData;

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
        'customer_address',
        'external_referral',
        'organization',
        'referee',
        'new_org_name',
        'new_org_address',
        'new_org_postcode',
        'new_org_state',
        'new_org_country',
        'new_recipient_name',
        'new_recipient_email',
        'new_recipient_phone',
        'new_recipient_position',
        'consult_call_id',
        'consult_call_detail_id',
        'follow_up_id',
        'id_type'
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

if (isset($_POST['external_referral'])) {
    $endpoint = 'external-referral';
} else {
    $endpoint = 'referral';
}

$response = getApiDataWithJWT($endpoint, $data, 'POST');
if (is_array($response) && array_key_exists('ch', $response)) {
    unset($response['ch']);
}

echo json_encode($response);