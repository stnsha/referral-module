<?php
date_default_timezone_set('Asia/Kuala_Lumpur');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$connect = 1;
include('../common/index_adv.php');

if (!isset($conn)) {
    die(json_encode(array("status" => 500, "message" => "Database connection error")));
}

function normalizeCompName($comp_name)
{
    $comp_name = ucwords(strtolower($comp_name));
    $pos = strpos($comp_name, '(');
    if ($pos !== false) {
        $comp_name = trim(substr($comp_name, 0, $pos));
    }
    return $comp_name;
}

function getBusinessUnits()
{
    global $conn;
    $department_results = mysqli_query($conn, "SELECT * FROM ref_business_unit");

    $departments = array();

    while ($row = mysqli_fetch_assoc($department_results)) {
        $departments[] = $row;
    }

    return $departments;
}

function getLocations($ref_bus_id)
{
    global $conn;

    $ref_bus_id = mysqli_real_escape_string($conn, $ref_bus_id);

    $ref_bus_query = mysqli_query($conn, "SELECT ending_code FROM ref_business_unit WHERE id = $ref_bus_id");

    if ($ref_bus_result = mysqli_fetch_assoc($ref_bus_query)) {
        $ending_code = $ref_bus_result['ending_code'];

        $outlet_results = mysqli_query($conn, "SELECT id, code FROM outlet WHERE RIGHT(code, 1) = '$ending_code' ORDER BY comp_name ASC");

        $all_locations = array();

        while ($row = mysqli_fetch_assoc($outlet_results)) {
            $all_locations[] = $row;
        }

        return $all_locations;
    }

    return array();
}

function searchCustomer($icno = null, $customer_id = null)
{
    global $conn;

    $conditions = array();
    if ($icno !== null && $icno !== '') {
        $icno = formatIC($icno); // Remove dashes

        // Validate IC is exactly 12 digits
        if (strlen($icno) !== 12 || !ctype_digit($icno)) {
            return array();
        }

        $icno = mysqli_real_escape_string($conn, $icno);
        $conditions[] = "ic = '$icno'";
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

function searchCustomerByIc($icno)
{
    global $conn;

    if ($icno === null || $icno === '') {
        return null;
    }

    $icno = formatIC($icno); // Remove dashes

    // Validate IC is exactly 12 digits
    if (strlen($icno) !== 12 || !ctype_digit($icno)) {
        return null;
    }

    $icno = mysqli_real_escape_string($conn, $icno);

    $query = "SELECT id FROM customer WHERE ic = '$icno' LIMIT 1";
    $result = mysqli_query($conn, $query);

    if (!$result || mysqli_num_rows($result) == 0) {
        return null;
    }

    $row = mysqli_fetch_assoc($result);
    return $row ? (int)$row['id'] : null;
}

function updateCustomer($customer_id, $field, $value)
{
    global $conn;

    if (!$customer_id || !$field) {
        return array('success' => false, 'message' => 'Missing required parameters');
    }

    // Prevent IC number from being updated
    if ($field === 'customer_ic') {
        return array('success' => false, 'message' => 'IC number cannot be updated');
    }

    $customer_id = mysqli_real_escape_string($conn, $customer_id);
    $value = mysqli_real_escape_string($conn, $value);

    // Map frontend field names to database column names
    $field_mapping = array(
        'customer_name' => 'customer_name',
        'customer_phone' => 'phone',
        'customer_email' => 'email',
        'customer_age' => 'birth_date', // Special handling needed
        'customer_gender' => 'gender',
        'customer_address' => 'c_addr'
    );

    if (!isset($field_mapping[$field])) {
        return array('success' => false, 'message' => 'Invalid field');
    }

    $db_field = $field_mapping[$field];

    // Special handling for age - convert to birth_date
    if ($field === 'customer_age') {
        if (!is_numeric($value) || $value < 0 || $value > 150) {
            return array('success' => false, 'message' => 'Invalid age');
        }
        $birth_year = date('Y') - intval($value);
        $value = $birth_year . '-01-01'; // Default to January 1st
    }

    // Validation
    switch ($field) {
        case 'customer_name':
            $trimmed_value = trim($value);
            if (empty($trimmed_value)) {
                return array('success' => false, 'message' => 'Name is required');
            }
            break;
        case 'customer_phone':
            $trimmed_value = trim($value);
            if (empty($trimmed_value)) {
                return array('success' => false, 'message' => 'Phone is required');
            }
            if (strlen($trimmed_value) < 10) {
                return array('success' => false, 'message' => 'Phone number must be at least 10 digits');
            }
            break;
        case 'customer_email':
            if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                return array('success' => false, 'message' => 'Invalid email format');
            }
            break;
        case 'customer_address':
            $trimmed_value = trim($value);
            if (empty($trimmed_value)) {
                return array('success' => false, 'message' => 'Address is required');
            }
            break;
        case 'customer_ic':
            $trimmed_value = trim($value);
            if (empty($trimmed_value)) {
                return array('success' => false, 'message' => 'I/C No. is required');
            }
            break;
    }

    $query = "UPDATE customer SET $db_field = '$value' WHERE id = $customer_id";
    $result = mysqli_query($conn, $query);

    if ($result) {
        return array('success' => true, 'message' => 'Customer updated successfully');
    } else {
        return array('success' => false, 'message' => 'Database error: ' . mysqli_error($conn));
    }
}

function formatIC($ic)
{
    // Remove dashes and any non-numeric characters, keep only digits
    return preg_replace('/[^0-9]/', '', $ic);
}

function extractDetailsFromIC($ic)
{
    // Extract age, gender and birthday from Malaysian IC format
    $age = null;
    $gender = null;
    $birthday = null;

    $icno = formatIC($ic);

    if (strlen($icno) == 12) {
        $year = (int) substr($icno, 0, 2);
        $month = (int) substr($icno, 2, 2);
        $day = (int) substr($icno, 4, 2);
        $lastDigit = (int) substr($icno, -1);

        $currentYear = (int) date('Y');
        $fullYear = $year > ($currentYear % 100) ? 1900 + $year : 2000 + $year;

        if (checkdate($month, $day, $fullYear)) {
            $gender = ($lastDigit % 2 === 0) ? 'Female' : 'Male';
            $age = $currentYear - $fullYear;
            $birthday = sprintf('%04d-%02d-%02d', $fullYear, $month, $day);
        }
    }

    return array('age' => $age, 'gender' => $gender, 'birthday' => $birthday);
}

function createCustomer($ic, $name, $phone, $email, $address, $age = null, $gender = null)
{
    global $conn;

    // Validation
    $ic = formatIC(trim($ic)); // Remove dashes from IC
    $name = trim($name);
    $phone = trim($phone);
    $email = trim($email);
    $address = trim($address);

    if (empty($ic)) {
        return array('success' => false, 'message' => 'I/C No. is required');
    }

    if (empty($name)) {
        return array('success' => false, 'message' => 'Name is required');
    }

    if (empty($phone)) {
        return array('success' => false, 'message' => 'Phone is required');
    }

    if (empty($address)) {
        return array('success' => false, 'message' => 'Address is required');
    }

    // Validate email format if provided
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return array('success' => false, 'message' => 'Invalid email format');
    }

    // Check if customer with this IC already exists
    $ic_escaped = mysqli_real_escape_string($conn, $ic);
    $check_query = "SELECT id FROM customer WHERE ic = '$ic_escaped'";
    $check_result = mysqli_query($conn, $check_query);

    if ($check_result && mysqli_num_rows($check_result) > 0) {
        return array('success' => false, 'message' => 'Customer with this I/C already exists');
    }

    // Auto-generate age, gender and birthday from IC if not provided
    $icDetails = extractDetailsFromIC($ic);

    if (empty($age)) {
        $age = $icDetails['age'];
    }

    if (empty($gender)) {
        $gender = $icDetails['gender'];
    }

    // Use birthday from IC (always for new customers)
    $birth_date = $icDetails['birthday'];

    // Escape all values for database
    $ic_escaped = mysqli_real_escape_string($conn, $ic);
    $name_escaped = mysqli_real_escape_string($conn, $name);
    $phone_escaped = mysqli_real_escape_string($conn, $phone);
    $email_escaped = mysqli_real_escape_string($conn, $email);
    $address_escaped = mysqli_real_escape_string($conn, $address);
    $gender_escaped = mysqli_real_escape_string($conn, $gender);

    // birth_date is already set from IC extraction above

    // Get current timestamp for created date
    $current_timestamp = date('Y-m-d H:i:s');
    $timestamp_escaped = mysqli_real_escape_string($conn, $current_timestamp);

    // Insert new customer
    $insert_query = "INSERT INTO customer (ic, customer_name, phone, email, c_addr, gender, date" .
        ($birth_date ? ", birth_date" : "") . ") VALUES " .
        "('$ic_escaped', '$name_escaped', '$phone_escaped', '$email_escaped', '$address_escaped', '$gender_escaped', '$timestamp_escaped'" .
        ($birth_date ? ", '$birth_date'" : "") . ")";

    $result = mysqli_query($conn, $insert_query);

    if ($result) {
        $customer_id = mysqli_insert_id($conn);
        return array(
            'success' => true,
            'message' => 'Customer created successfully',
            'customer_id' => $customer_id,
            'customer' => array(
                'id' => $customer_id,
                'name' => $name,
                'ic' => $ic,
                'phone' => $phone,
                'email' => $email,
                'address' => $address,
                'gender' => $gender,
                'age' => $age
            )
        );
    } else {
        return array('success' => false, 'message' => 'Database error: ' . mysqli_error($conn));
    }
}

function getStaffLocation($staff_id)
{
    global $conn;

    $staff_id = mysqli_real_escape_string($conn, $staff_id);

    $staff_query = mysqli_query($conn, "SELECT outlet FROM staff WHERE id = $staff_id");

    if ($staff_row = mysqli_fetch_assoc($staff_query)) {
        $outlet = trim($staff_row['outlet']);

        // Remove spaces and split by comma
        $outlets = array_map('trim', explode(',', $outlet));

        // Filter out empty values
        $outlets = array_filter($outlets);

        // Reindex array
        $outlets = array_values($outlets);

        if (empty($outlets)) {
            return array();
        }

        // Convert to comma-separated string for SQL
        $outlet_ids = implode(',', array_map('intval', $outlets));

        $outlet_results = mysqli_query($conn, "SELECT id, code FROM outlet WHERE id IN ($outlet_ids) ORDER BY comp_name ASC");

        $all_locations = array();

        while ($row = mysqli_fetch_assoc($outlet_results)) {
            $all_locations[] = $row;
        }

        return $all_locations;
    }

    return array();
}

function getAssignees($location_id)
{
    global $conn;

    $location_id = mysqli_real_escape_string($conn, $location_id);

    $outlet_results = mysqli_query($conn, "SELECT id, nama_staff FROM staff WHERE FIND_IN_SET('$location_id', outlet)");

    $staffs = array();

    while ($row = mysqli_fetch_assoc($outlet_results)) {
        $staffs[] = $row;
    }

    return $staffs;
}

function getStaffDetails($staff_id, $location_id, $bu_id = null, $deptId)
{
    global $conn;

    $staff_id = mysqli_real_escape_string($conn, (int)$staff_id);
    $location_id = mysqli_real_escape_string($conn, $location_id);
    $bu_id = !empty($bu_id) ? mysqli_real_escape_string($conn, $bu_id) : null;
    $deptId = mysqli_real_escape_string($conn, $deptId);

    //simulate session staff id (testing purposes)
    if (!empty($staff_id)) {
        $sql = "SELECT
            " . (!empty($bu_id) ? "r.name" : "NULL as name") . ",
            s.nama_staff,
            s.department,
            CONCAT('6', REPLACE(s.hp, '-', '')) AS contact,
            o.code
        FROM staff s
        INNER JOIN outlet o ON o.id = $location_id AND FIND_IN_SET(o.id, s.outlet)
        " . (!empty($bu_id) ? "INNER JOIN ref_business_unit r ON r.id = $bu_id" : "") . "
        WHERE s.id = $staff_id OR s.department = $deptId";
    } else {
        $sql = "SELECT
        " . (!empty($bu_id) ? "r.name" : "NULL as name") . ",
        s.nama_staff,
        s.department,
        CONCAT('6', REPLACE(s.hp, '-', '')) AS contact,
        o.code
    FROM staff s
    INNER JOIN outlet o ON o.id = $location_id AND FIND_IN_SET(o.id, s.outlet)
    " . (!empty($bu_id) ? "INNER JOIN ref_business_unit r ON r.id = $bu_id" : "") . "
    WHERE FIND_IN_SET($location_id, s.outlet) OR s.department = $deptId
    ORDER BY s.id ASC
    LIMIT 1";
    }

    $result = mysqli_query($conn, $sql);

    $staffDetails = array();

    if ($row = mysqli_fetch_assoc($result)) {
        $staffDetails[] = array(
            'business_unit' => $row['name'],
            'staff' => $row['nama_staff'],
            'contact' => $row['contact'],
            'outlet' => $row['code'],
            'department_id' => $row['department']
        );
    }

    return $staffDetails;
}

function isStaffMatch($staffId, $deptId)
{
    global $conn;

    $staffId = mysqli_real_escape_string($conn, (int)$staffId);
    $deptId = mysqli_real_escape_string($conn, $deptId);

    $query = "SELECT nama_staff FROM staff WHERE id = '$staffId' AND department = '$deptId' LIMIT 1";

    $result = mysqli_query($conn, $query);

    if (!$result) {
        return false;
    }

    $row = mysqli_fetch_assoc($result);

    return $row ? true : false;
}

function getBusinessUnit($deptId)
{
    global $conn;
    $deptId = mysqli_real_escape_string($conn, $deptId);

    $query = "SELECT id FROM ref_business_unit WHERE staff_department_id = '$deptId'";

    $result = mysqli_query($conn, $query);

    if (!$result) {
        return null;
    }

    $row = mysqli_fetch_assoc($result);

    return $row ? $row['id'] : null;
}

function getBusinessUnitName($buId)
{
    global $conn;
    $buId = mysqli_real_escape_string($conn, $buId);

    $query = "SELECT name FROM ref_business_unit WHERE id = '$buId' LIMIT 1";

    $result = mysqli_query($conn, $query);

    if (!$result) {
        return null;
    }

    $row = mysqli_fetch_assoc($result);

    return $row ? $row['name'] : null;
}

function getStaffName($staffId)
{
    global $conn;
    $staffId = mysqli_real_escape_string($conn, $staffId);

    $query = "SELECT nama_staff FROM staff WHERE id = '$staffId' LIMIT 1";

    $result = mysqli_query($conn, $query);

    if (!$result) {
        return null;
    }

    $row = mysqli_fetch_assoc($result);

    return $row ? $row['nama_staff'] : null;
}

function getRecipientDetails($location, $business_unit)
{
    global $conn;

    $location = mysqli_real_escape_string($conn, $location);
    $business_unit = mysqli_real_escape_string($conn, $business_unit);

    $query = "SELECT
                (SELECT o.code FROM outlet o WHERE o.id = '$location' LIMIT 1) AS outlet_name,
                (SELECT r.name FROM ref_business_unit r WHERE r.id = '$business_unit' LIMIT 1) AS business_unit_name";

    $result = mysqli_query($conn, $query);

    if (!$result) {
        return null;
    }

    $row = mysqli_fetch_assoc($result);

    return $row ? array('outlet_name' => $row['outlet_name'], 'business_unit_name' => $row['business_unit_name']) : null;
}

if (isset($_GET['action']) && $_GET['action'] == 'getLocations' && isset($_POST['ref_bus_id'])) {
    header('Content-Type: application/json');
    echo json_encode(getLocations($_POST['ref_bus_id']));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'getBusinessUnits') {
    header('Content-Type: application/json');
    echo json_encode(getBusinessUnits());
    exit;
}

if (
    isset($_GET['action']) && $_GET['action'] == 'searchCustomer' &&
    (isset($_POST['icno']) || isset($_POST['customer_id']))
) {
    $icno = isset($_POST['icno']) ? $_POST['icno'] : null;
    $customer_id = isset($_POST['customer_id']) ? $_POST['customer_id'] : null;

    header('Content-Type: application/json');
    echo json_encode(searchCustomer($icno, $customer_id));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'getAssignees' && isset($_GET['location_id'])) {
    header('Content-Type: application/json');
    echo json_encode(getAssignees($_GET['location_id']));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'getStaffLocation' && isset($_GET['staff_id'])) {
    header('Content-Type: application/json');
    echo json_encode(getStaffLocation($_GET['staff_id']));
    exit;
}


if (isset($_GET['action']) && $_GET['action'] == 'getStaffDetails' && isset($_GET['staff_id']) && isset($_GET['location_id']) && isset($_GET['deptId'])) {
    header('Content-Type: application/json');
    $bu_id = isset($_GET['bu_id']) ? $_GET['bu_id'] : null;
    echo json_encode(getStaffDetails($_GET['staff_id'], $_GET['location_id'], $bu_id, $_GET['deptId']));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'getRecipientDetails' && isset($_GET['location']) && isset($_GET['business_unit'])) {
    header('Content-Type: application/json');
    echo json_encode(getRecipientDetails($_GET['location'], $_GET['business_unit']));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'getBusinessUnit' && isset($_GET['staffDeptId'])) {
    header('Content-Type: application/json');
    echo json_encode(getBusinessUnit($_GET['staffDeptId']));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'getBusinessUnitName' && isset($_GET['bu_id'])) {
    header('Content-Type: application/json');
    echo json_encode(getBusinessUnitName($_GET['bu_id']));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'getStaffName' && isset($_GET['staff_id'])) {
    header('Content-Type: application/json');
    echo json_encode(getStaffName($_GET['staff_id']));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'isStaffMatch' && isset($_GET['staffId'])  && isset($_GET['deptId'])) {
    header('Content-Type: application/json');
    echo json_encode(isStaffMatch($_GET['staffId'], $_GET['deptId']));
    exit;
}


if (isset($_GET['action']) && $_GET['action'] == 'updateCustomer' && isset($_POST['customer_id']) && isset($_POST['field']) && isset($_POST['value'])) {
    header('Content-Type: application/json');
    echo json_encode(updateCustomer($_POST['customer_id'], $_POST['field'], $_POST['value']));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'createCustomer') {
    $ic = isset($_POST['ic']) ? $_POST['ic'] : '';
    $name = isset($_POST['name']) ? $_POST['name'] : '';
    $phone = isset($_POST['phone']) ? $_POST['phone'] : '';
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $address = isset($_POST['address']) ? $_POST['address'] : '';
    $age = isset($_POST['age']) ? $_POST['age'] : null;
    $gender = isset($_POST['gender']) ? $_POST['gender'] : null;

    header('Content-Type: application/json');
    echo json_encode(createCustomer($ic, $name, $phone, $email, $address, $age, $gender));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'searchCustomerByIc' && isset($_POST['icno'])) {
    $icno = $_POST['icno'];
    $customer_id = searchCustomerByIc($icno);

    header('Content-Type: application/json');
    if ($customer_id !== null) {
        echo json_encode(array('success' => true, 'customer_id' => $customer_id));
    } else {
        echo json_encode(array('success' => false, 'message' => 'Customer not found'));
    }
    exit;
}