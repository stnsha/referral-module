<?php
require 'api-jwt.php';
header('Content-Type: application/json');

// Helper functions from backend.php to avoid function conflicts
function formatIC($ic)
{
    // Remove dashes and any non-numeric characters, keep only digits
    return preg_replace('/[^0-9]/', '', $ic);
}

function searchCustomer($icno = null, $customer_id = null)
{
    global $conn;

    $conditions = array();
    if ($icno !== null && $icno !== '') {
        $icno = formatIC($icno); // Remove dashes
        $icno = mysqli_real_escape_string($conn, $icno);
        $conditions[] = "ic LIKE '%$icno%'";
    }
    if ($customer_id > 0) {
        $conditions[] = "id = $customer_id";
    }

    if (empty($conditions)) {
        return array();
    }

    $query = "SELECT id, customer_name, ic, gender, birth_date, phone, email, c_addr FROM customer WHERE " . implode(" OR ", $conditions);

    $searchIcno = mysqli_query($conn, $query);

    if (!$searchIcno || mysqli_num_rows($searchIcno) == 0) {
        return array();
    }

    $customerDetails = array();
    while ($row = mysqli_fetch_assoc($searchIcno)) {
        $customerDetails[] = array(
            'id' => $row['id'],
            'name' => $row['customer_name'],
            'ic' => $row['ic'],
            'gender' => $row['gender'],
            'birth_date' => $row['birth_date'],
            'phone' => $row['phone'],
            'email' => $row['email'],
            'address' => $row['c_addr']
        );
    }

    return $customerDetails;
}

function getStaffDetails($staff_id, $location_id)
{
    global $conn;

    $staff_id = mysqli_real_escape_string($conn, (int)$staff_id);
    $location_id = mysqli_real_escape_string($conn, $location_id);

    $sql = "SELECT
        s.nama_staff,
        s.department,
        CONCAT('6', REPLACE(s.hp, '-', '')) AS contact,
        o.code,
        s.email,
        s.status_semasa
    FROM staff s
    INNER JOIN outlet o ON o.id = $location_id AND FIND_IN_SET(o.id, s.outlet) 
    WHERE s.id = $staff_id";

    $result = mysqli_query($conn, $sql);

    $staffDetails = array();

    if ($result && $row = mysqli_fetch_assoc($result)) {
        $staffDetails[] = array(
            'nama_staff' => $row['nama_staff'],
            'contact' => $row['contact'],
            'outlet' => $row['code'],
            'email' => isset($row['email']) ? $row['email'] : null,
            'designation' => isset($row['status_semasa']) ? $row['status_semasa'] : null
        );
    }

    return $staffDetails;
}

$data = array();

$business_unit_from = isset($_POST['business_unit_id_from']) ? $_POST['business_unit_id_from'] : null;
$business_unit_to = isset($_POST['business_unit_id_to']) ? $_POST['business_unit_id_to'] : null;

//recipient to
$recipient = array();
$assigneeData = array();
$referralData = array();

if (!isset($_POST['external_referral'])) {
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
        'priority' => isset($_POST['priority']) ? (int)$_POST['priority'] : null
    );
} else {
    //external
    // Get patient data using searchCustomer
    $customer_id = isset($_POST['customer_id']) ? (int)$_POST['customer_id'] : null;
    $patientData = searchCustomer(null, $customer_id);
    $patient = !empty($patientData) ? $patientData[0] : array();

    // Get staff details for assignee
    $staff_id = isset($_POST['assignee_id_from']) ? (int)$_POST['assignee_id_from'] : null;
    $location_id = isset($_POST['location_id_from']) ? $_POST['location_id_from'] : null;
    $staffData = getStaffDetails($staff_id, $location_id);
    $staffDetails = !empty($staffData) ? $staffData[0] : array();

    $recipient = array(
        'organization' => isset($_POST['organization']) ? (int)$_POST['organization'] : null,
        'location_organization' => isset($_POST['location_organization']) ? $_POST['location_organization'] : null,
        'referee' => isset($_POST['referee']) ? $_POST['referee'] : null
    );

    // Merge staff details with other assignee data and include staff_id
    $assigneeData = array_merge(
        array(
            'staff_id' => $staff_id,
            'business_unit_id' => $business_unit_from,
            'location' => $location_id,
            'referral_reason' => isset($_POST['referral_reason']) ? $_POST['referral_reason'] : '',
            'referral_condition' => isset($_POST['referral_condition']) ? $_POST['referral_condition'] : '',
            'medical_history' => isset($_POST['medical_history']) ? $_POST['medical_history'] : '',
            'additional_remarks' => isset($_POST['additional_remarks']) ? $_POST['additional_remarks'] : '',
        ),
        $staffDetails
    );

    $referralData = array(
        'patient' => $patient,
        'priority' => isset($_POST['priority']) ? (int)$_POST['priority'] : null
    );
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
        'location_organization',
        'referee'
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
// exit;

$endpoint = 'referral';
$response = getApiDataWithJWT($endpoint, $data, 'POST');
if (is_array($response) && array_key_exists('ch', $response)) {
    unset($response['ch']);
}
echo json_encode($response);