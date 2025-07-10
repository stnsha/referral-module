<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <!-- <link rel="stylesheet" media="screen" type="text/css" href="../common/css/layout.css" /> -->
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css" />
    <link rel="stylesheet" href="https://cdn.datatables.net/2.3.0/css/dataTables.dataTables.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/2.3.0/js/dataTables.js"></script>

    <script>
    const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
    const id_user = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
    const staff_outlet =
        <?php echo json_encode(isset($staff_outlet) ? $staff_outlet : ''); ?>; //add staff_outlet in lock_adv.php
    </script>
    <script src="js/report.js"></script>
</body>

</html>