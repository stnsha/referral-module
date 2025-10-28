<?php
require_once('../lock3_old.php');
$connect = 1;
include('../common/index.php');
require_once('api-jwt.php');

// Get referral ID from query parameter
$referral_id = isset($_GET['id']) ? $_GET['id'] : null;

// Initialize variables
$pdfBase64 = null;
$patientPhone = null;
$outletPhone = null;
$organizationPhone = null;
$refereePhone = null;

// Fetch referral successful data
if ($referral_id) {
    $result = getReferralSuccessful($referral_id, $staff_id);

    if (!empty($result)) {
        $pdfBase64 = isset($result['pdfBase64']) ? $result['pdfBase64'] : null;
        $patientPhone = isset($result['patientPhone']) ? $result['patientPhone'] : null;
        $outletPhone = isset($result['outletPhone']) ? $result['outletPhone'] : null;
        $organizationPhone = isset($result['organizationPhone']) ? $result['organizationPhone'] : null;
        $refereePhone = isset($result['refereePhone']) ? $result['refereePhone'] : null;
    }
}
?>