<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <link rel="stylesheet" media="screen" type="text/css" href="../common/css/layout.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css" />
    <link rel="stylesheet" href="https://cdn.datatables.net/2.3.0/css/dataTables.dataTables.css" />

</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <div class="referral-container">
        <div class="referral_header">
            <h1 class="referral_h1">
                <img src="img/referral.png" width="30px" style="padding-right:5px;" /> Referral
            </h1>
        </div>
        <div class="success-message"></div>
        <div class="head-container">
            <div class="referral-filter">
                <p style="padding-right:15px;">Filter</p>
                <div class="referral-select">
                    <select name="business_unit" id="business_unit">
                        <option value="">Business Unit</option>
                    </select>
                    <select name="status" id="">
                        <option value="">All Status</option>
                        <option value="1">Open</option>
                        <option value="2">In Progress</option>
                        <option value="3">Forwarded</option>
                        <option value="4">Closed</option>
                    </select>
                    <input type="text" name="referral_id" id="referral_id" class="referral-id" placeholder="#REF01234">
                </div>
            </div>

            <a href="create.php" type="button" class="btn-referral">New Referral</a>
        </div>
        <div class="body-container">
            <table id="myTable">
                <thead>
                    <tr>
                        <th>Referral ID</th>
                        <th>Description</th>
                        <th>Business Unit</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
            </table>
        </div>


    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/2.3.0/js/dataTables.js"></script>

    <script>
        const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
        const id_user = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        const staff_outlet =
            <?php echo json_encode(isset($staff_outlet) ? $staff_outlet : ''); ?>; //add staff_outlet in lock_adv.php
    </script>
    <script src="js/app.js"></script>
    <script>
        const message = sessionStorage.getItem('successMessage');
        if (message) {
            const div = document.querySelector('.success-message');
            if (div) {
                div.textContent = message;
                div.classList.add('alert', 'alert-success'); // optional styling
            }
            sessionStorage.removeItem('successMessage');
        }
    </script>
</body>