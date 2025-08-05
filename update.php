<?php
require 'api-jwt.php';
header('Content-Type: application/json');

$data = array();

$referral_id = isset($_POST['referral_id']) ? $_POST['referral_id'] : null;
$updated_recipient_to = isset($_POST['updated_recipient_to']) ? $_POST['updated_recipient_to'] : null;
$bu_id_reply = isset($_POST['bu_id_reply']) ? $_POST['bu_id_reply'] : null;

// Handle status and status_note based on user selection
$status = isset($_POST['status']) ? $_POST['status'] : 2;
$status_note = null;

if ($status == 5) {
    $status_note = isset($_POST['status_note']) ? $_POST['status_note'] : null;
}

$additional_remarks_reply = isset($_POST['additional_remarks_reply']) ? $_POST['additional_remarks_reply'] : null;

if (isset($_POST['refer_another']) && $_POST['refer_another'] === 'on') {
    $status = 3;
    $refer_business_unit = isset($_POST['refer_business_unit_id']) ? $_POST['refer_business_unit_id'] : null;
    $refer_location = isset($_POST['refer_location']) ? $_POST['refer_location'] : null;
    $refer_to = isset($_POST['refer_to']) ? $_POST['refer_to'] : null;
    $referral_reason = isset($_POST['referral_reason']) ? $_POST['referral_reason'] : null;
    $referral_condition = isset($_POST['referral_condition']) ? $_POST['referral_condition'] : null;
    $medical_history = isset($_POST['medical_history']) ? $_POST['medical_history'] : null;
    $additional_remarks_refer = isset($_POST['additional_remarks_refer']) ? $_POST['additional_remarks_refer'] : null;

    $data['refer_another'] = array(
        'refer_business_unit' => $refer_business_unit,
        'refer_location' => $refer_location,
        'refer_to' => $refer_to,
        'referral_reason' => $referral_reason,
        'referral_condition' => $referral_condition,
        'medical_history' => $medical_history,
        'additional_remarks_refer' => $additional_remarks_refer,
    );
}

$data['referral'] = array(
    'referral_id' => $referral_id,
    'updated_recipient_to' => $updated_recipient_to,
    'business_unit_id_reply' => $bu_id_reply,
    'status' => $status,
    'status_note' => $status_note,
    'additional_remarks' => $additional_remarks_reply
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
            'referral_reason',
            'referral_condition',
            'medical_history',
            'status',
            'status_note',
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
