<?php
/**
 * Development-only role switcher for Referral testing.
 * Sets a session override for the referral role and clears the cached JWT
 * so the next API request fetches a fresh token with the chosen role.
 *
 * This file must NOT be deployed to production.
 */
date_default_timezone_set('Asia/Kuala_Lumpur');

if (session_id() == '') {
    session_start();
}

// Restrict to localhost only
$serverName = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : '';
$httpHost   = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
$isLocal    = in_array($serverName, array('localhost', '127.0.0.1'))
    || strpos($serverName, 'localhost') !== false
    || strpos($httpHost, 'localhost') !== false
    || strpos($httpHost, '127.0.0.1') !== false;

if (!$isLocal) {
    http_response_code(403);
    echo 'This endpoint is not available in production.';
    exit;
}

if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method not allowed.';
    exit;
}

$allowed_roles = array(0, 1, 2);
$role_input    = isset($_POST['role']) ? $_POST['role'] : null;

if ($role_input === 'clear') {
    unset($_SESSION['referral_dev_role_override']);
} elseif ($role_input !== null) {
    $role = (int)$role_input;
    if (in_array($role, $allowed_roles, true)) {
        $_SESSION['referral_dev_role_override'] = $role;
    }
}

// Business unit / outlet override, so a SuperAdmin can simulate viewing the
// referral module as if scoped to a specific business unit / outlet.
if (isset($_POST['bu_id']) || isset($_POST['outlet'])) {
    $bu_input     = isset($_POST['bu_id']) ? trim($_POST['bu_id']) : '';
    $outlet_input = isset($_POST['outlet']) ? trim($_POST['outlet']) : '';

    if ($bu_input === 'clear') {
        unset($_SESSION['referral_dev_bu_override']);
        unset($_SESSION['referral_dev_outlet_override']);
    } else {
        if ($bu_input !== '') {
            $_SESSION['referral_dev_bu_override'] = (int)$bu_input;
        }
        if ($outlet_input !== '') {
            $outlet_ids = array_values(array_filter(array_map('intval', explode(',', $outlet_input))));
            $_SESSION['referral_dev_outlet_override'] = $outlet_ids;
        }
    }
}

// Clear cached JWT so the next request gets a fresh token with the new role
unset($_SESSION['referral_jwt_token']);
unset($_SESSION['referral_jwt_expires']);

$_dev_referral_base = '/odb/referral/';

$redirect = isset($_POST['redirect']) && $_POST['redirect'] !== ''
    ? $_POST['redirect']
    : $_dev_referral_base . 'index.php';

// Only allow relative redirects to prevent open redirect
if (strpos($redirect, '://') !== false) {
    $redirect = $_dev_referral_base . 'index.php';
}

header('Location: ' . $redirect);
exit;
