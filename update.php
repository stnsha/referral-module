<?php
define('API_JWT_INCLUDED', true);
require 'api-jwt.php';
header('Content-Type: application/json');

$data = array();

$referral_id = isset($_POST['referral_id']) ? $_POST['referral_id'] : null;
$updated_recipient_to = isset($_POST['updated_recipient_to']) ? $_POST['updated_recipient_to'] : null;
$location_to = isset($_POST['location_to']) ? $_POST['location_to'] : null;
$bu_id_reply = isset($_POST['bu_id_reply']) ? $_POST['bu_id_reply'] : null;

// Handle status and status_note based on user selection
$status = isset($_POST['status']) ? $_POST['status'] : 2;
$status_note = null;

if ($status == 5) {
    $status_note = isset($_POST['status_note']) ? $_POST['status_note'] : null;
}

$additional_remarks_reply = isset($_POST['additional_remarks_reply']) ? $_POST['additional_remarks_reply'] : null;
$post_diagnosis = isset($_POST['post_diagnosis']) ? $_POST['post_diagnosis'] : null;
$outcome = isset($_POST['outcome']) ? $_POST['outcome'] : null;
$feedback = isset($_POST['feedback']) ? $_POST['feedback'] : null;

// Initialize these variables
$referral_reason = null;
$referral_condition = null;
$medical_history = null;

if (isset($_POST['refer_another']) && $_POST['refer_another'] === 'on') {
    // When referring another, these fields belong to the new referral
    $referral_reason = isset($_POST['referral_reason']) ? $_POST['referral_reason'] : null;
    $referral_condition = isset($_POST['referral_condition']) ? $_POST['referral_condition'] : null;
    $medical_history = isset($_POST['medical_history']) ? $_POST['medical_history'] : null;
    $priority = isset($_POST['priority']) ? $_POST['priority'] : null;
    $status = 3;
    $refer_business_unit = isset($_POST['refer_business_unit_id']) ? $_POST['refer_business_unit_id'] : null;
    $refer_location = isset($_POST['refer_location']) ? $_POST['refer_location'] : null;
    $refer_to = isset($_POST['refer_to']) ? $_POST['refer_to'] : null;
    $additional_remarks_refer = isset($_POST['additional_remarks_refer']) ? $_POST['additional_remarks_refer'] : null;

    // Check if external referral is selected
    $is_external_referral = isset($_POST['refer_external_referral']) && $_POST['refer_external_referral'] === 'on';

    if ($is_external_referral) {
        // Handle external referral data
        $refer_organization = isset($_POST['refer_organization']) ? $_POST['refer_organization'] : null;
        $refer_referee = isset($_POST['refer_referee']) ? $_POST['refer_referee'] : null;

        // Check if new organization is being created
        $refer_new_org_name = isset($_POST['refer_new_org_name']) ? $_POST['refer_new_org_name'] : null;
        $refer_new_org_address = isset($_POST['refer_new_org_address']) ? $_POST['refer_new_org_address'] : null;
        $refer_new_org_postcode = isset($_POST['refer_new_org_postcode']) ? $_POST['refer_new_org_postcode'] : null;
        $refer_new_org_state = isset($_POST['refer_new_org_state']) ? $_POST['refer_new_org_state'] : null;
        $refer_new_org_country = isset($_POST['refer_new_org_country']) ? $_POST['refer_new_org_country'] : 'Malaysia';

        // Check if new recipient is being created
        $refer_new_recipient_name = isset($_POST['refer_new_recipient_name']) ? $_POST['refer_new_recipient_name'] : null;
        $refer_new_recipient_email = isset($_POST['refer_new_recipient_email']) ? $_POST['refer_new_recipient_email'] : null;
        $refer_new_recipient_phone = isset($_POST['refer_new_recipient_phone']) ? $_POST['refer_new_recipient_phone'] : null;
        $refer_new_recipient_position = isset($_POST['refer_new_recipient_position']) ? $_POST['refer_new_recipient_position'] : null;

        $data['refer_another'] = array(
            'is_external_referral' => true,
            'refer_organization' => $refer_organization,
            'refer_referee' => $refer_referee,
            'referral_reason' => $referral_reason,
            'referral_condition' => $referral_condition,
            'medical_history' => $medical_history,
            'priority' => $priority
        );

        // Add new organization data if provided
        if (!empty($refer_new_org_name)) {
            $data['refer_another']['new_organization'] = array(
                'name' => $refer_new_org_name,
                'address' => $refer_new_org_address,
                'postcode' => $refer_new_org_postcode,
                'state' => $refer_new_org_state,
                'country' => $refer_new_org_country
            );
        }

        // Add new recipient data if provided
        if (!empty($refer_new_recipient_name)) {
            $data['refer_another']['new_recipient'] = array(
                'name' => $refer_new_recipient_name,
                'email' => $refer_new_recipient_email,
                'phone' => $refer_new_recipient_phone,
                'position' => $refer_new_recipient_position
            );
        }
    } else {
        // Internal referral
        $data['refer_another'] = array(
            'is_external_referral' => false,
            'refer_business_unit' => $refer_business_unit,
            'refer_location' => $refer_location,
            'refer_to' => $refer_to,
            'referral_reason' => $referral_reason,
            'referral_condition' => $referral_condition,
            'medical_history' => $medical_history,
            'priority' => $priority,
            'additional_remarks_refer' => $additional_remarks_refer
        );
    }
}

$data['referral'] = array(
    'referral_id' => $referral_id,
    'updated_recipient_to' => $updated_recipient_to,
    'location_to' => $location_to,
    'business_unit_id_reply' => $bu_id_reply,
    'status' => $status,
    'status_note' => $status_note,
    'additional_remarks' => $additional_remarks_reply,
    'post_diagnosis' => $post_diagnosis,
    'outcome' => $outcome,
    'feedback' => $feedback
);

$form_data = array();
if ($status != 5) {
    foreach ($_POST as $key => $value) {
        if (!in_array($key, array(
            'updated_recipient_to',
            'referral_id',
            'bu_id_reply',
            'additional_remarks_refer',
            'additional_remarks_reply',
            'refer_another',
            'refer_business_unit',
            'refer_business_unit_id',
            'refer_location',
            'refer_to',
            'refer_external_referral',
            'refer_organization',
            'refer_referee',
            'refer_new_org_name',
            'refer_new_org_address',
            'refer_new_org_postcode',
            'refer_new_org_state',
            'refer_new_org_country',
            'refer_new_recipient_name',
            'refer_new_recipient_email',
            'refer_new_recipient_phone',
            'refer_new_recipient_position',
            'referral_reason',
            'referral_condition',
            'medical_history',
            'status',
            'status_note',
            'post_diagnosis',
            'outcome',
            'feedback',
            'location_to'
        ))) {
            $form_data[$key] = $value;
        }
    }
}

if ($bu_id_reply !== null) {
    $data['form_data'] = array(
        $bu_id_reply => $form_data
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
// exit;

$endpoint = 'referral';
$response = getApiDataWithJWT($endpoint, $data, 'PUT');
if (is_array($response) && array_key_exists('ch', $response)) {
    unset($response['ch']);
}
echo json_encode($response);