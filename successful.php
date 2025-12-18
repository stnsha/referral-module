<?php
define('API_JWT_INCLUDED', true);
require_once('api-jwt.php');

// Get referral ID and sequence from query parameters
$referral_id = isset($_GET['id']) ? $_GET['id'] : null;
$sequence = isset($_GET['sequence']) ? $_GET['sequence'] : null;

// Initialize variables
$pdfBase64 = null;
$patientPhone = null;
$outletPhone = null;
$organizationPhone = null;
$refereePhone = null;

// Fetch referral successful data
if ($referral_id) {
    $result = getReferralSuccessful($referral_id, $staff_id, $sequence);

    if (!empty($result)) {
        $pdfBase64 = isset($result['pdfBase64']) ? $result['pdfBase64'] : null;
        $patientPhone = isset($result['patientPhone']) ? $result['patientPhone'] : null;
        $outletPhone = isset($result['outletPhone']) ? $result['outletPhone'] : null;
        $organizationPhone = isset($result['organizationPhone']) ? $result['organizationPhone'] : null;
        $refereePhone = isset($result['refereePhone']) ? $result['refereePhone'] : null;
    }
}
?>
<!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

    <link rel="stylesheet" media="screen" type="text/css" href="common/css/layout.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/style.css" />
</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <div class="text-center bg-white rounded p-2">
        <div class="col align-items-center">
            <span class="r-main-title">Referral #REF<?php echo str_pad($_GET['id'], 4, 0, STR_PAD_LEFT) ?></span>
        </div>
        <div class="my-4 d-flex flex-column align-items-center">
            <div class="alert alert-success mb-4" role="alert">
                <i class="bi bi-check-circle-fill"></i> Referral submitted successfully!
            </div>

            <?php if ($pdfBase64): ?>
            <a href="#"
                onclick="downloadPDF('<?php echo $pdfBase64; ?>', 'Referral_#REF<?php echo str_pad($referral_id, 4, 0, STR_PAD_LEFT); ?>.pdf'); return false;"
                class="btn-new-referral mt-2">
                <i class="bi bi-download"></i> Download PDF Referral
            </a>
            <?php endif; ?>

            <?php if ($patientPhone): ?>
            <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $patientPhone); ?>?text=<?php echo urlencode('Dear Patient, your healthcare referral document has been issued. Kindly review the attached PDF for further instructions. https://mytotalhealth.com.my/referral-api/view/' . $referral_id); ?>"
                target="_blank" class="btn-new-referral mt-2">
                <i class="bi bi-whatsapp"></i> Send WhatsApp to Patient
            </a>
            <?php endif; ?>

            <?php if ($outletPhone): ?>
            <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $outletPhone); ?>?text=<?php echo urlencode('New referral #REF' . str_pad($referral_id, 4, 0, STR_PAD_LEFT) . ' has been created. http://octopusdb.info:8080/odb/referral/view.php?id=' . $referral_id); ?>"
                target="_blank" class="btn-new-referral mt-2">
                <i class="bi bi-whatsapp"></i> Send WhatsApp to Outlet
            </a>
            <?php endif; ?>

            <?php if ($organizationPhone): ?>
            <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $organizationPhone); ?>?text=<?php echo urlencode('External referral #REF' . str_pad($referral_id, 4, 0, STR_PAD_LEFT) . ' has been created.'); ?>"
                target="_blank" class="btn-new-referral mt-2">
                <i class="bi bi-whatsapp"></i> Send WhatsApp to Organization
            </a>
            <?php endif; ?>

            <?php if ($refereePhone): ?>
            <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $refereePhone); ?>?text=<?php echo urlencode('External referral #REF' . str_pad($referral_id, 4, 0, STR_PAD_LEFT) . ' has been created.'); ?>"
                target="_blank" class="btn-new-referral mt-2">
                <i class="bi bi-whatsapp"></i> Send WhatsApp to Referee
            </a>
            <?php endif; ?>

            <a href="referral/index.php" class="btn-referral mt-3">
                <i class="bi bi-house-fill"></i> Back to Home
            </a>
        </div>

        <script>
        function downloadPDF(base64String, filename) {
            // Convert base64 to blob
            const byteCharacters = atob(base64String);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {
                type: 'application/pdf'
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        </script>
    </div>
</body>