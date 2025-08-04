<?php
header('Content-Type: application/json');

$API_TOKEN = "1|4lpr0@r3f3rr4L";

$headers = function_exists('apache_request_headers') ? apache_request_headers() : array();
$token = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if ($token != $API_TOKEN) {
    sendResponse(false, 'Invalid token');
}

$method = $_SERVER['REQUEST_METHOD'];
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['action'])) {
    sendResponse(false, 'Missing action');
}

$action = $data['action'];

// route to the right function
if ($action == 'getAllStaff') {
    getAllStaff();
} elseif ($action == 'getStaffDetails') {
    if (!isset($data['staff_id'])) {
        sendResponse(false, 'Missing staff_id');
    }
    getStaffDetails($data['staff_id']);
} elseif ($action == 'getByDepartment') {
    if (!isset($data['department'])) {
        sendResponse(false, 'Missing department');
    }
    getByDepartment($data['department']);
} else {
    sendResponse(false, 'Invalid action');
}

// reusable function to send responses
function sendResponse($success, $message, $data = null)
{
    echo json_encode(array(
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ));
    exit;
}

// API functions
function getAllStaff()
{
    $list = array(
        array('id' => 1, 'name' => 'Ali', 'dept' => 'HR'),
        array('id' => 2, 'name' => 'Siti', 'dept' => 'Finance')
    );
    sendResponse(true, 'All staff retrieved', $list);
}

function getStaffDetails($staff_id)
{
    $staff = array('id' => $staff_id, 'name' => 'John Doe', 'dept' => 'HR');
    sendResponse(true, 'Staff details retrieved', $staff);
}

function getByDepartment($department)
{
    $list = array(
        array('id' => 1, 'name' => 'Ali', 'dept' => $department),
        array('id' => 2, 'name' => 'Siti', 'dept' => $department)
    );
    sendResponse(true, 'Staff by department retrieved', $list);
}
