<?php
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

        $outlet_results = mysqli_query($conn, "SELECT id, comp_name FROM outlet WHERE RIGHT(code, 1) = '$ending_code' ORDER BY comp_name ASC");

        $all_locations = array();

        while ($row = mysqli_fetch_assoc($outlet_results)) {
            $row['comp_name'] = normalizeCompName($row['comp_name']);
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
            'address' => $row['c_addr']
        );
    }

    return $customerDetails;
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

        $outlet_results = mysqli_query($conn, "SELECT id, comp_name FROM outlet WHERE id IN ($outlet_ids) ORDER BY comp_name ASC");

        $all_locations = array();

        while ($row = mysqli_fetch_assoc($outlet_results)) {
            $row['comp_name'] = normalizeCompName($row['comp_name']);
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

function getStaffDetails($staff_id, $location_id, $bu_id)
{
    global $conn;

    $staff_id = mysqli_real_escape_string($conn, $staff_id);
    $location_id = mysqli_real_escape_string($conn, $location_id);
    $bu_id = mysqli_real_escape_string($conn, $bu_id);

    $sql = "SELECT 
            r.name,
            s.nama_staff, 
            o.comp_name
        FROM staff s
        INNER JOIN outlet o ON o.id = $location_id AND FIND_IN_SET(o.id, s.outlet)
        INNER JOIN ref_business_unit r ON r.id = $bu_id
        WHERE s.id = $staff_id";

    $result = mysqli_query($conn, $sql);

    $staffDetails = array();

    if ($row = mysqli_fetch_assoc($result)) {
        $staffDetails[] = array(
            'business_unit' => $row['name'],
            'staff' => $row['nama_staff'],
            'outlet' => normalizeCompName($row['comp_name'])
        );
    }

    return $staffDetails;
}

function getBusinessUnit($bu_id) {}

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


if (isset($_GET['action']) && $_GET['action'] == 'getStaffDetails' && isset($_GET['staff_id']) && isset($_GET['location_id']) && isset($_GET['bu_id'])) {
    header('Content-Type: application/json');
    echo json_encode(getStaffDetails($_GET['staff_id'], $_GET['location_id'], $_GET['bu_id']));
    exit;
}
