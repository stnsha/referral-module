<?php
require 'api.php';
header('Content-Type: application/json');

$data = array();

// echo '<pre>';
// print_r($_POST);
// echo '</pre>';

$referral_id = isset($_POST['referral_id']) ? $_POST['referral_id'] : null;
$updated_recipient_to = isset($_POST['updated_recipient_to']) ? $_POST['updated_recipient_to'] : null;
$bu_id_reply = isset($_POST['bu_id_reply']) ? $_POST['bu_id_reply'] : null;
$status = isset($_POST['status']) ? $_POST['status'] : 1;
$additional_remarks_reply = isset($_POST['additional_remarks_reply']) ? $_POST['additional_remarks_reply'] : null;


if (isset($_POST['refer_another']) && $_POST['refer_another'] === 'on') {
    $status = 3;
    $refer_business_unit = isset($_POST['refer_business_unit']) ? $_POST['refer_business_unit'] : null;
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
    'additional_remarks' => $additional_remarks_reply
);

$form_data = array();
foreach ($_POST as $key => $value) {
    if (!in_array($key, array(
        'updated_recipient_to',
        'referral_id',
        'bu_id_reply',
        'additional_remarks_refer',
        'additional_remarks_reply',
        'refer_another',
        'refer_business_unit',
        'refer_location',
        'refer_to',
        'referral_reason',
        'referral_condition',
        'medical_history',
        'status',
    ))) {
        $form_data[$key] = $value;
    }
}

if ($bu_id_reply !== null) {
    $data['form_data'] = array(
        $bu_id_reply => $form_data
    );
}

// echo json_encode($data);

$endpoint = 'referral'; // change as needed
$response = getApiData($endpoint, $data, 'PUT');
echo json_encode($response);

exit;

/*
{
    "refer_another": {
        "refer_business_unit": "2",
        "refer_location": "303",
        "refer_to": "",
        "referral_reason": "Medical assessment on lower back pain",
        "referral_condition": "Lower back pain rated at 7/10, persistent despite physiotherapy and pharmacy treatment.\r\nPatient reports stiffness after prolonged sitting and minimal improvement.\r\nPharmacist advised on pain relief medication (paracetamol and muscle rub), but symptoms persist.",
        "medical_history": "Mild scoliosis diagnosed during teenage years. No history of trauma or major illness.",
        "additional_remarks_refer": "Patient has been cooperative and compliant with both physiotherapy and pharmacy recommendations. However, the ongoing pain and limited response to conservative treatment suggest the need for further clinical evaluation. Consider ruling out structural or neurological causes. Patient open to further diagnostic tests if required."
    },
    "referral": {
        "referral_id": "4",
        "updated_recipient_to": "3333",
        "business_unit_id_reply": "5",
        "status": 3,
        "additional_remarks": "No current medications apart from pain relief."
    },
    "form_data": {
        "5": {
            "drug_allergies": "No",
            "prescription_status": "25",
            "pickup_time": "14:20"
        }
    }
}
*/