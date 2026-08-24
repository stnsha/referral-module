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
    $result = mysqli_query($conn, "
        SELECT rbu.*, o.code AS outlet_code
        FROM ref_business_unit rbu
        LEFT JOIN outlet o ON o.id = rbu.outlet_id
        ORDER BY rbu.name ASC
    ");

    $departments = array();

    while ($row = mysqli_fetch_assoc($result)) {
        $departments[] = array(
            'id'                  => $row['id'],
            'name'                => $row['name'],
            'staff_department_id' => $row['staff_department_id'],
            'outlet_id'           => isset($row['outlet_id']) ? $row['outlet_id'] : null,
            'outlet_code'         => isset($row['outlet_code']) ? $row['outlet_code'] : '',
            'ending_code'         => $row['ending_code'],
            'is_active'           => isset($row['is_active']) ? (int)$row['is_active'] : 1
        );
    }

    return $departments;
}

function searchOutlets($search_term)
{
    global $conn;
    $search_term = mysqli_real_escape_string($conn, $search_term);
    $like = '%' . $search_term . '%';
    $result = mysqli_query($conn, "
        SELECT id, code FROM outlet
        WHERE code LIKE '$like'
        ORDER BY comp_name ASC
        LIMIT 30
    ");
    $outlets = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $outlets[] = array('id' => $row['id'], 'code' => $row['code']);
    }
    return $outlets;
}

function getDepartments()
{
    global $conn;

    $query = "SELECT id, depart_name FROM staff_department
              WHERE id IS NOT NULL
              ORDER BY depart_name ASC";
    $result = mysqli_query($conn, $query);

    $departments = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $departments[] = array(
            'id' => $row['id'],
            'name' => $row['depart_name']
        );
    }

    return $departments;
}

function searchDepartments($search_term)
{
    global $conn;

    if (empty($search_term)) {
        return getDepartments();
    }

    $search_term = mysqli_real_escape_string($conn, $search_term);

    $query = "SELECT id, depart_name FROM staff_department
              WHERE depart_name LIKE '%$search_term%'
              ORDER BY depart_name ASC
              LIMIT 10";

    $result = mysqli_query($conn, $query);

    $departments = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $departments[] = array(
            'id' => $row['id'],
            'name' => $row['depart_name']
        );
    }

    return $departments;
}

function toggleBusinessUnitStatus($business_unit_id, $is_active)
{
    global $conn;

    if (!$business_unit_id) {
        return array('success' => false, 'message' => 'Business unit ID is required');
    }

    $business_unit_id = (int)$business_unit_id;
    $is_active = (int)$is_active;

    if (!in_array($is_active, array(0, 1))) {
        return array('success' => false, 'message' => 'Invalid status value');
    }

    $query = "UPDATE ref_business_unit SET is_active = $is_active WHERE id = $business_unit_id";
    $result = mysqli_query($conn, $query);

    if ($result) {
        $status_text = $is_active ? 'active' : 'inactive';
        return array('success' => true, 'message' => 'Business unit marked as ' . $status_text);
    }
    return array('success' => false, 'message' => 'Database error: ' . mysqli_error($conn));
}

function getLocations($ref_bus_id)
{
    global $conn;

    $ref_bus_id = mysqli_real_escape_string($conn, $ref_bus_id);

    $ref_bus_query = mysqli_query($conn, "SELECT ending_code, outlet_id FROM ref_business_unit WHERE id = $ref_bus_id");

    if ($ref_bus_result = mysqli_fetch_assoc($ref_bus_query)) {
        $ending_code = $ref_bus_result['ending_code'];
        $outlet_id   = $ref_bus_result['outlet_id'];

        if (isset($ending_code) && $ending_code !== '' && $ending_code !== null) {
            $codes = array_map('trim', explode(',', $ending_code));
            $escaped = array();
            foreach ($codes as $c) {
                if ($c !== '') {
                    $escaped[] = "'" . mysqli_real_escape_string($conn, $c) . "'";
                }
            }
            $in_clause = implode(',', $escaped);
            $outlet_results = mysqli_query($conn, "SELECT id, code FROM outlet WHERE RIGHT(code, 1) IN ($in_clause) ORDER BY comp_name ASC");
        } elseif (!empty($outlet_id)) {
            // Special case (e.g., HQ): return the directly linked outlet
            $outlet_id_int = intval($outlet_id);
            $outlet_results = mysqli_query($conn, "SELECT id, code FROM outlet WHERE id = $outlet_id_int ORDER BY comp_name ASC");
        } else {
            return array();
        }

        $all_locations = array();

        while ($row = mysqli_fetch_assoc($outlet_results)) {
            $all_locations[] = $row;
        }

        return $all_locations;
    }

    return array();
}

function searchCustomerAuto($query)
{
    global $conn;

    $query = trim($query);
    if (strlen($query) < 2) {
        return array();
    }

    $escaped = mysqli_real_escape_string($conn, $query);
    $sql = "SELECT id, customer_name, ic, phone FROM customer
            WHERE ic LIKE '$escaped%' OR customer_name LIKE '%$escaped%'
            ORDER BY customer_name ASC
            LIMIT 10";

    $result = mysqli_query($conn, $sql);
    if (!$result) {
        return array();
    }

    $customers = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $customers[] = array(
            'id'    => $row['id'],
            'name'  => $row['customer_name'],
            'ic'    => $row['ic'],
            'phone' => $row['phone']
        );
    }
    return $customers;
}

function searchCustomer($icno = null, $customer_id = null, $id_type = 'nric')
{
    global $conn;

    $conditions = array();
    if ($icno !== null && $icno !== '') {
        // For NRIC: format and validate 12 digits
        if ($id_type === 'nric') {
            $icno = formatIC($icno); // Remove dashes

            // Validate IC is exactly 12 digits
            if (strlen($icno) !== 12 || !ctype_digit($icno)) {
                return array();
            }
        } else {
            // For Passport: just trim and sanitize, no length validation
            $icno = trim($icno);
            $icno = preg_replace('/\s+/', '', $icno);  // Remove spaces

            // Optional: basic validation (not empty, reasonable length)
            if (empty($icno) || strlen($icno) < 6) {
                return array();
            }
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

    $query = "SELECT id, customer_name, ic, gender, birth_date, phone, email, c_addr, race, nationality FROM customer WHERE " . implode(" OR ", $conditions);

    $searchIcno = mysqli_query($conn, $query);

    if (!$searchIcno || mysqli_num_rows($searchIcno) == 0) {
        return array();
    }

    $customerDetails = array();
    while ($row = mysqli_fetch_assoc($searchIcno)) {
        // Calculate age if birth_date exists
        $age = null;
        if ($row['birth_date'] && $row['birth_date'] !== '0000-00-00') {
            $birthDate = new DateTime($row['birth_date']);
            $today = new DateTime();
            $age = $today->diff($birthDate)->y;
        }

        $customerDetails[] = array(
            'id' => $row['id'],
            'name' => $row['customer_name'],
            'ic' => $row['ic'],
            'gender' => $row['gender'],
            'birth_date' => $row['birth_date'],
            'age' => $age,
            'phone' => $row['phone'],
            'email' => $row['email'],
            'address' => $row['c_addr'],
            'race' => $row['race'],
            'nationality' => $row['nationality']
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
        'customer_address' => 'c_addr',
        'customer_race' => 'race',
        'customer_nationality' => 'nationality'
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
        case 'customer_race':
            $allowed_races = array('MALAY', 'CHINESE', 'INDIAN', 'SABAH ETHNIC', 'SARAWAK ETHNIC', 'OTHERS');
            if (!in_array($value, $allowed_races)) {
                return array('success' => false, 'message' => 'Invalid race value');
            }
            break;
        case 'customer_nationality':
            $allowed_nationalities = array('MALAYSIA', 'SINGAPORE', 'INDONESIA', 'BRUNEI', 'PHILIPPINES', 'THAILAND');
            if (!in_array($value, $allowed_nationalities)) {
                return array('success' => false, 'message' => 'Invalid nationality value');
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

function createCustomer($ic, $name, $phone, $email, $address, $age = null, $gender = null, $race = null, $nationality = null)
{
    global $conn;

    // Validation
    $ic = formatIC(trim($ic)); // Remove dashes from IC
    $name = trim($name);
    $phone = trim($phone);
    $email = trim($email);
    $address = trim($address);
    $race = $race ? trim($race) : null;
    $nationality = $nationality ? trim($nationality) : null;

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

    $allowed_races = array('MALAY', 'CHINESE', 'INDIAN', 'SABAH ETHNIC', 'SARAWAK ETHNIC', 'OTHERS');
    if (!empty($race) && !in_array($race, $allowed_races)) {
        return array('success' => false, 'message' => 'Invalid race value');
    }

    $allowed_nat = array('MALAYSIA', 'SINGAPORE', 'INDONESIA', 'BRUNEI', 'PHILIPPINES', 'THAILAND');
    if (!empty($nationality) && !in_array($nationality, $allowed_nat)) {
        return array('success' => false, 'message' => 'Invalid nationality value');
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
    $race_escaped = $race ? mysqli_real_escape_string($conn, $race) : null;
    $nationality_escaped = $nationality ? mysqli_real_escape_string($conn, $nationality) : null;

    // Get current timestamp for created date
    $current_timestamp = date('Y-m-d H:i:s');
    $timestamp_escaped = mysqli_real_escape_string($conn, $current_timestamp);

    // Build INSERT dynamically
    $cols = "ic, customer_name, phone, email, c_addr, gender, date";
    $vals = "'$ic_escaped', '$name_escaped', '$phone_escaped', '$email_escaped', '$address_escaped', '$gender_escaped', '$timestamp_escaped'";

    if ($birth_date) {
        $cols .= ", birth_date";
        $vals .= ", '$birth_date'";
    }
    if ($race_escaped) {
        $cols .= ", race";
        $vals .= ", '$race_escaped'";
    }
    if ($nationality_escaped) {
        $cols .= ", nationality";
        $vals .= ", '$nationality_escaped'";
    }

    $insert_query = "INSERT INTO customer ($cols) VALUES ($vals)";
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
                'age' => $age,
                'race' => $race,
                'nationality' => $nationality
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

    $staff_query = mysqli_query($conn, "SELECT outlet, referral FROM staff WHERE id = $staff_id");

    if ($staff_row = mysqli_fetch_assoc($staff_query)) {
        $referral = isset($staff_row['referral']) ? (int)$staff_row['referral'] : 0;

        // Dev role override (localhost + real SuperAdmin only), same session key
        // as referral/dev-switch-role.php / navbar.php's toolbar. backend.php
        // never starts a session on its own, so it must be started here to see it.
        $devServerName = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : '';
        $devHttpHost   = isset($_SERVER['HTTP_HOST'])   ? $_SERVER['HTTP_HOST']   : '';
        $devIsLocal    = in_array($devServerName, array('localhost', '127.0.0.1'))
            || strpos($devServerName, 'localhost') !== false
            || strpos($devHttpHost,   'localhost') !== false
            || strpos($devHttpHost,   '127.0.0.1') !== false;

        if ($devIsLocal && $referral === 1) {
            if (session_id() == '') {
                session_start();
            }
            if (isset($_SESSION['referral_dev_role_override'])) {
                $referral = (int)$_SESSION['referral_dev_role_override'];
            }
        }

        if ($referral === 1 || $referral === 2) {
            // SuperAdmin / HQ Admin: every active outlet, not just the staff's own
            $outlet_results = mysqli_query($conn, "SELECT id, code FROM outlet WHERE recycle != 1 ORDER BY comp_name ASC");
        } else {
            // Normal user: only outlets listed in staff.outlet (comma-separated ids)
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
        }

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

function getStaffDetails($staff_id, $location_id, $deptId, $bu_id = null, $checkOutletAccess = true)
{
    global $conn;

    $staff_id = mysqli_real_escape_string($conn, (int)$staff_id);
    $location_id = !empty($location_id) ? mysqli_real_escape_string($conn, $location_id) : null;
    $bu_id = !empty($bu_id) ? mysqli_real_escape_string($conn, $bu_id) : null;
    $deptId = mysqli_real_escape_string($conn, $deptId);

    if ($checkOutletAccess) {
        if (!empty($location_id)) {
            $outletJoin = "INNER JOIN outlet o ON o.id = $location_id AND FIND_IN_SET(o.id, s.outlet)";
            $outletSelect = "o.code as code";
        } else {
            $outletJoin = "";
            $outletSelect = "NULL as code";
        }
    } else {
        if (!empty($location_id)) {
            $outletJoin = "LEFT JOIN outlet o ON o.id = $location_id";
            $outletSelect = "o.code as code";
        } else {
            $outletJoin = "";
            $outletSelect = "NULL as code";
        }
    }

    $sql = "SELECT
            " . (!empty($bu_id) ? "r.name" : "NULL as name") . ",
            s.nama_staff,
            s.department,
            CONCAT('6', REPLACE(s.hp, '-', '')) AS contact,
            $outletSelect
        FROM staff s
        $outletJoin
        " . (!empty($bu_id) ? "INNER JOIN ref_business_unit r ON r.id = $bu_id" : "") . "
        WHERE s.id = $staff_id" . ($checkOutletAccess ? " AND s.department = $deptId" : "");

    // Debug logging
    error_log("getStaffDetails SQL: " . $sql);
    error_log("getStaffDetails params - staff_id: $staff_id, location_id: " . ($location_id ? $location_id : 'NULL') . ", bu_id: " . ($bu_id ? $bu_id : 'NULL') . ", checkOutletAccess: " . ($checkOutletAccess ? 'true' : 'false'));

    $result = mysqli_query($conn, $sql);

    if (!$result) {
        error_log("getStaffDetails query error: " . mysqli_error($conn));
    }

    $staffDetails = array();

    if ($row = mysqli_fetch_assoc($result)) {
        error_log("getStaffDetails row: " . print_r($row, true));
        $staffDetails[] = array(
            'business_unit' => $row['name'],
            'staff' => $row['nama_staff'],
            'contact' => $row['contact'],
            'outlet' => $row['code'],
            'department_id' => $row['department']
        );
    } else {
        error_log("getStaffDetails: No rows returned");
    }

    return $staffDetails;
}

function getReferredFrom($staff_id, $location_id, $bu_id)
{
    global $conn;

    $staff_id = mysqli_real_escape_string($conn, (int)$staff_id);
    $location_id = !empty($location_id) ? mysqli_real_escape_string($conn, $location_id) : null;
    $bu_id = !empty($bu_id) ? mysqli_real_escape_string($conn, $bu_id) : null;

    if (!empty($location_id)) {
        $outletJoin = "LEFT JOIN outlet o ON o.id = $location_id";
        $outletSelect = "o.code as code";
    } else {
        $outletJoin = "";
        $outletSelect = "NULL as code";
    }

    $sql = "SELECT
            " . (!empty($bu_id) ? "r.name as name," : "NULL as name,") . "
            s.nama_staff,
            s.department,
            CONCAT('6', REPLACE(s.hp, '-', '')) AS contact,
            $outletSelect
        FROM staff s
        $outletJoin
        " . (!empty($bu_id) ? "LEFT JOIN ref_business_unit r ON r.id = $bu_id" : "") . "
        WHERE s.id = $staff_id";

    // Debug logging
    error_log("getReferredFrom SQL: " . $sql);
    error_log("getReferredFrom params - staff_id: $staff_id, location_id: " . ($location_id ? $location_id : 'NULL') . ", bu_id: " . ($bu_id ? $bu_id : 'NULL'));

    $result = mysqli_query($conn, $sql);

    if (!$result) {
        error_log("getReferredFrom query error: " . mysqli_error($conn));
    }

    $staffDetails = array();

    if ($row = mysqli_fetch_assoc($result)) {
        error_log("getReferredFrom row: " . print_r($row, true));
        $staffDetails[] = array(
            'business_unit' => $row['name'],
            'staff' => $row['nama_staff'],
            'contact' => $row['contact'],
            'outlet' => $row['code'],
            'department_id' => $row['department']
        );
    } else {
        error_log("getReferredFrom: No rows returned");
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

function isLocationMatch($staffId, $locationId, $businessUnitId)
{
    global $conn;

    $staffId = mysqli_real_escape_string($conn, (int)$staffId);
    $locationId = mysqli_real_escape_string($conn, (int)$locationId);
    $businessUnitId = mysqli_real_escape_string($conn, (int)$businessUnitId);

    $query = "SELECT s.id
    FROM staff s
    INNER JOIN ref_business_unit r ON r.staff_department_id = $businessUnitId
    WHERE s.id = '$staffId' 
    AND FIND_IN_SET('$locationId', s.outlet)
    LIMIT 1";

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

/**
 * Get distinct department IDs from staff table
 */
function getDistinctDepartments()
{
    global $conn;

    $query = "SELECT DISTINCT department FROM staff
              WHERE department IS NOT NULL AND department != ''
              ORDER BY department ASC";
    $result = mysqli_query($conn, $query);

    $departments = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $departments[] = array(
            'id' => $row['department'],
            'name' => 'Department ' . $row['department']
        );
    }

    return $departments;
}

/**
 * Search staff by name for autocomplete (max 5 results)
 */
function searchStaff($search_term)
{
    global $conn;

    if (empty($search_term)) {
        return array();
    }

    $search_term = mysqli_real_escape_string($conn, $search_term);

    $query = "SELECT id, nama_staff, department, outlet, referral
              FROM staff
              WHERE nama_staff LIKE '%$search_term%'
              ORDER BY nama_staff ASC
              LIMIT 5";

    $result = mysqli_query($conn, $query);

    $staff_list = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $staff_list[] = array(
            'id' => $row['id'],
            'nama_staff' => $row['nama_staff'],
            'department' => $row['department'],
            'outlet' => $row['outlet'],
            'referral' => (int)$row['referral']
        );
    }

    return $staff_list;
}

/**
 * Update staff referral permission (0, 1, or 2)
 */
function updateStaffReferral($staff_id, $referral_value)
{
    global $conn;

    if (!$staff_id || !isset($referral_value)) {
        return array('success' => false, 'message' => 'Missing required parameters');
    }

    $referral_value = (int)$referral_value;
    if (!in_array($referral_value, array(0, 1, 2))) {
        return array('success' => false, 'message' => 'Invalid referral permission value');
    }

    $staff_id = mysqli_real_escape_string($conn, $staff_id);

    $query = "UPDATE staff SET referral = $referral_value WHERE id = $staff_id";
    $result = mysqli_query($conn, $query);

    if ($result) {
        return array('success' => true, 'message' => 'Staff access updated successfully');
    } else {
        return array('success' => false, 'message' => 'Database error: ' . mysqli_error($conn));
    }
}

/**
 * Get outlet names from CSV string of IDs
 */
function getOutletCodes($ids)
{
    global $conn;

    if (empty($ids)) {
        return array();
    }

    $ids = array_map('intval', $ids);
    $ids_str = implode(',', $ids);

    $result = mysqli_query($conn, "SELECT id, code FROM outlet WHERE id IN ($ids_str)");

    $map = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $map[$row['id']] = $row['code'];
    }

    return $map;
}

/**
 * Get id => code map for every active outlet (recycle != 1).
 * Used to resolve outlet codes for the report export, since the
 * referral-api's own database has no outlet code table.
 */
function getAllOutletCodes()
{
    global $conn;

    $result = mysqli_query($conn, "SELECT id, code FROM outlet WHERE recycle != 1");

    $map = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $map[$row['id']] = $row['code'];
    }

    return $map;
}

function getOutletNames($outlet_csv)
{
    global $conn;

    if (empty($outlet_csv)) {
        return 'None';
    }

    $outlet_ids = explode(',', $outlet_csv);
    $outlet_ids = array_map('intval', $outlet_ids);
    $outlet_ids_str = implode(',', $outlet_ids);

    $query = "SELECT code FROM outlet WHERE id IN ($outlet_ids_str) ORDER BY code ASC";
    $result = mysqli_query($conn, $query);

    $outlet_names = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $outlet_names[] = $row['code'];
    }

    return empty($outlet_names) ? 'None' : implode(', ', $outlet_names);
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

if (isset($_GET['action']) && $_GET['action'] == 'searchCustomerAuto' && isset($_POST['query'])) {
    header('Content-Type: application/json');
    echo json_encode(searchCustomerAuto($_POST['query']));
    exit;
}

if (
    isset($_GET['action']) && $_GET['action'] == 'searchCustomer' &&
    (isset($_POST['icno']) || isset($_POST['customer_id']))
) {
    $icno = isset($_POST['icno']) ? $_POST['icno'] : null;
    $customer_id = isset($_POST['customer_id']) ? $_POST['customer_id'] : null;
    $id_type = isset($_POST['id_type']) ? $_POST['id_type'] : 'nric';  // NEW

    header('Content-Type: application/json');
    echo json_encode(searchCustomer($icno, $customer_id, $id_type));  // Pass id_type
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
    $checkOutletAccess = isset($_GET['check_outlet_access']) ? (bool)$_GET['check_outlet_access'] : true;
    echo json_encode(getStaffDetails($_GET['staff_id'], $_GET['location_id'], $_GET['deptId'], $bu_id, $checkOutletAccess));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'getReferredFrom' && isset($_GET['staff_id']) && isset($_GET['location_id']) && isset($_GET['bu_id'])) {
    header('Content-Type: application/json');
    echo json_encode(getReferredFrom($_GET['staff_id'], $_GET['location_id'], $_GET['bu_id']));
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

if (isset($_GET['action']) && $_GET['action'] == 'isLocationMatch' && isset($_GET['staffId']) && isset($_GET['locationId']) && isset($_GET['businessUnitId'])) {
    header('Content-Type: application/json');
    echo json_encode(isLocationMatch($_GET['staffId'], $_GET['locationId'], $_GET['businessUnitId']));
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
    $race = isset($_POST['race']) ? $_POST['race'] : null;
    $nationality = isset($_POST['nationality']) ? $_POST['nationality'] : null;

    header('Content-Type: application/json');
    echo json_encode(createCustomer($ic, $name, $phone, $email, $address, $age, $gender, $race, $nationality));
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

// Get all business units
if (isset($_GET['action']) && $_GET['action'] == 'getBusinessUnits') {
    header('Content-Type: application/json');
    echo json_encode(getBusinessUnits());
    exit;
}

// Get distinct departments
if (isset($_GET['action']) && $_GET['action'] == 'getDistinctDepartments') {
    header('Content-Type: application/json');
    echo json_encode(getDistinctDepartments());
    exit;
}

// Get all departments FROM staff_department table
if (isset($_GET['action']) && $_GET['action'] == 'getDepartments') {
    header('Content-Type: application/json');
    echo json_encode(getDepartments());
    exit;
}

// Search departments by name for autocomplete
if (isset($_GET['action']) && $_GET['action'] == 'searchDepartments' && isset($_POST['search_term'])) {
    header('Content-Type: application/json');
    echo json_encode(searchDepartments($_POST['search_term']));
    exit;
}

// Get outlet codes by IDs
if (isset($_GET['action']) && $_GET['action'] == 'getOutletCodes') {
    header('Content-Type: application/json');
    $ids = isset($_POST['ids']) ? array_map('intval', explode(',', $_POST['ids'])) : array();
    echo json_encode(getOutletCodes($ids));
    exit;
}

// Get id => code map for every active outlet (for report export)
if (isset($_GET['action']) && $_GET['action'] == 'getAllOutletCodes') {
    header('Content-Type: application/json');
    echo json_encode(getAllOutletCodes());
    exit;
}

// Search outlets by code for autocomplete
if (isset($_GET['action']) && $_GET['action'] == 'searchOutlets') {
    header('Content-Type: application/json');
    $search_term = isset($_POST['search_term']) ? $_POST['search_term'] : '';
    echo json_encode(searchOutlets($search_term));
    exit;
}

// Toggle business unit active/inactive status
if (
    isset($_GET['action']) && $_GET['action'] == 'toggleBusinessUnitStatus' &&
    isset($_POST['business_unit_id']) && isset($_POST['is_active'])
) {
    header('Content-Type: application/json');
    echo json_encode(toggleBusinessUnitStatus($_POST['business_unit_id'], $_POST['is_active']));
    exit;
}

// Search staff by name
if (isset($_GET['action']) && $_GET['action'] == 'searchStaff' && isset($_POST['search_term'])) {
    header('Content-Type: application/json');
    echo json_encode(searchStaff($_POST['search_term']));
    exit;
}

// Update staff referral permission
if (
    isset($_GET['action']) && $_GET['action'] == 'updateStaffReferral' &&
    isset($_POST['staff_id']) && isset($_POST['referral_value'])
) {
    header('Content-Type: application/json');
    echo json_encode(updateStaffReferral($_POST['staff_id'], $_POST['referral_value']));
    exit;
}