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
        $customer_id = isset($result['customerId']) ? $result['customerId'] : null;
        $pdfBase64 = isset($result['pdfBase64']) ? $result['pdfBase64'] : null;
        $patientPhone = isset($result['patientPhone']) ? $result['patientPhone'] : null;
        $outletPhone = isset($result['outletPhone']) ? $result['outletPhone'] : null;
        $organizationPhone = isset($result['organizationPhone']) ? $result['organizationPhone'] : null;
        $refereePhone = isset($result['refereePhone']) ? $result['refereePhone'] : null;
        $nextBusinessUnitId = isset($result['nextBusinessUnitId']) ? $result['nextBusinessUnitId'] : null;
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

// Fetch customer data for clinic link
$customer_name = null;
$customer_ic = null;
if ($customer_id) {
   // $customer_id = 539777316; // For testing purpose only, remove this line in production
    $customer_query = mysqli_query($conn, "SELECT customer_name, ic, phone FROM customer WHERE id = " . intval($customer_id) . " LIMIT 1");
    if ($customer_query && mysqli_num_rows($customer_query) > 0) {
        $customer_row = mysqli_fetch_assoc($customer_query);
        $customer_name = $customer_row['customer_name'];
        $customer_ic = $customer_row['ic'];
        // Use customer phone if patientPhone not available
        if (!$patientPhone) {
            $patientPhone = $customer_row['phone'];
        }
    }
}
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

            <?php if($nextBusinessUnitId == 3): ?>
            <a href="#"
               class="clinic-link btn-new-referral mt-2"
               data-ic="<?php echo htmlspecialchars($customer_ic, ENT_QUOTES); ?>"
               data-name="<?php echo htmlspecialchars($customer_name, ENT_QUOTES); ?>"
               data-phone="<?php echo htmlspecialchars($patientPhone, ENT_QUOTES); ?>"
               data-receipt=""
               data-payment=""
               data-refid="REF<?php echo str_pad($referral_id, 4, 0, STR_PAD_LEFT); ?>"
               title="Book Alpro Clinic Appointment">
                <img src="common/img/clinic_logo.png" width="20" alt="Clinic"> Book Clinic Appointment
            </a>
            <?php endif; ?>

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

        <script src="https://cdn.jsdelivr.net/npm/jssha/dist/sha256.js"></script>
        <script>
        function generateSHA256(message) {
            var shaObj = new jsSHA("SHA-256", "TEXT");
            shaObj.update(message);
            return shaObj.getHash("HEX");
        }

        function openClinicLink(ic, name, phone, receiptNo, paymentChannel, refId) {
            var errors = [];
            if (!ic || ic.trim() === "") errors.push("NRIC is missing");
            if (!name || name.trim() === "") errors.push("Customer name is missing");
            if (!phone || phone.trim() === "") errors.push("Mobile number is missing");

            if (errors.length > 0) {
                alert("Please complete the following before proceeding:\n- " + errors.join("\n- "));
                return;
            }

            receiptNo = receiptNo ? receiptNo.trim() : "";
            paymentChannel = paymentChannel ? paymentChannel.trim() : "";
            refId = refId ? refId.trim() : "";

            var exp = Math.floor(Date.now() / 30000);
            var comments = "Referral Case from MyReferral (#" + refId + ")";
            var payload = name + "|" + ic + "|" + phone + "|" + receiptNo + "|" + paymentChannel + "|" + comments + "|" + exp;
            var secretKey = "octopus2nexus integration";
            var token = generateSHA256(payload + secretKey);

            var headerData = {
                NRIC: ic,
                PatientName: name,
                MobileNo: phone,
                ReceiptNo: receiptNo,
                PaymentChannel: paymentChannel,
                Comments: comments,
                Exp: exp,
                Token: token
            };

            var headerJson = JSON.stringify(headerData);
            var headerBase64 = btoa(unescape(encodeURIComponent(headerJson)));
            var url = "http://thenexushealth.com/OctopusBookPublicAppointment?header=" + encodeURIComponent(headerBase64);

            window.open(url, "_blank");
        }

        document.addEventListener('click', function(e) {
            var target = e.target.closest('.clinic-link');
            if (!target) return;
            e.preventDefault();

            var ic = target.getAttribute('data-ic');
            var name = target.getAttribute('data-name');
            var phone = target.getAttribute('data-phone');
            var receiptNo = target.getAttribute('data-receipt');
            var paymentChannel = target.getAttribute('data-payment');
            var refId = target.getAttribute('data-refid');

            openClinicLink(ic, name, phone, receiptNo, paymentChannel, refId);
        });
        </script>
    </div>
</body>