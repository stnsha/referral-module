<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$connect = 1;
include('../common/index_adv.php');

if (!isset($conn)) {
    die(json_encode(array("status" => 500, "message" => "Database connection error")));
}

function getLocations($assignee_id)
{
    global $conn;

    $assignee_id = mysqli_real_escape_string($conn, $assignee_id);
    $outlets_result = mysqli_query($conn, "SELECT outlet FROM staff WHERE id = $assignee_id");

    if ($outlets_row = mysqli_fetch_assoc($outlets_result)) {
        $outlets = $outlets_row['outlet'];

        $outlets = preg_replace('/\s+/', '', $outlets); // Remove spaces
        $outlet_ids = explode(',', $outlets); // Split id into an array

        $outlet_ids = array_map('intval', $outlet_ids); // Ensure all IDs are integers
        $outlet_ids_list = implode(',', $outlet_ids); // Join the array into a comma-separated list

        $location_results = mysqli_query($conn, "SELECT id, comp_name FROM outlet WHERE id IN ($outlet_ids_list)");

        $locations = array();
        while ($row = mysqli_fetch_assoc($location_results)) {
            $comp_name = ucwords(strtolower($row['comp_name']));
            $pos = strpos($comp_name, '(');
            if ($pos !== false) {
                $comp_name = trim(substr($comp_name, 0, $pos));
            }
            $row['comp_name'] = $comp_name;
            $locations[] = $row;
        }


        return $locations;
    }

    return array();
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

function getAssignee($bu_id)
{
    global $conn;

    $bu_id = mysqli_real_escape_string($conn, $bu_id);
    $query = "SELECT id, nama_staff FROM staff WHERE department = $bu_id";
    $searchAssignee = mysqli_query($conn, $query);

    $assignees = array();
    while ($row = mysqli_fetch_assoc($searchAssignee)) {
        $assignees[] = array(
            'id' => $row['id'],
            'name' => $row['nama_staff']
        );
    }

    return $assignees;
}

function getStaff($staff_id, $location)
{
    global $conn;

    $staff_id = mysqli_real_escape_string($conn, $staff_id);
    $location = mysqli_real_escape_string($conn, $location);

    $query = "SELECT s.nama_staff, r.name 
              FROM staff s 
              INNER JOIN ref_business_unit r ON s.department = r.staff_department_id 
              WHERE s.id = $staff_id";

    $result = mysqli_query($conn, $query);

    $nama_staff = '';
    $department = '';

    if ($row = mysqli_fetch_assoc($result)) {
        $nama_staff = $row['nama_staff'];
        $department = $row['name'];
    }

    $comp_name = '';
    $query2 = "SELECT comp_name FROM outlet WHERE id = $location";
    $result2 = mysqli_query($conn, $query2);

    if ($result2 && $row2 = mysqli_fetch_assoc($result2)) {
        $comp_name = ucwords(strtolower($row2['comp_name']));
        $pos = strpos($comp_name, '(');
        if ($pos !== false) {
            $comp_name = trim(substr($comp_name, 0, $pos));
        }
    }

    $arr[] = array(
        'nama_staff' => $nama_staff,
        'department' => $department,
        'location' => $comp_name,
    );


    return $arr;
}

if (isset($_GET['action']) && $_GET['action'] == 'getLocations' && isset($_POST['assignee_id'])) {
    header('Content-Type: application/json');
    echo json_encode(getLocations($_POST['assignee_id']));
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

if (isset($_GET['action']) && $_GET['action'] == 'getAssignees' && isset($_POST['business_unit_id'])) {
    header('Content-Type: application/json');
    echo json_encode(getAssignee($_POST['business_unit_id']));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] == 'getStaff' && isset($_GET['staff_id'])) {
    header('Content-Type: application/json');
    echo json_encode(getStaff($_GET['staff_id'], $_GET['location']));
    exit;
}
