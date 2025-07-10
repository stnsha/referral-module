<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Report</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <!-- <link rel="stylesheet" media="screen" type="text/css" href="../common/css/layout.css" /> -->
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <div class="referral-container">
        <div class="d-flex justify-content-start align-items-center ms-3 mb-3">
            <h1 class="fw-bold text-start">Referral</h1>
        </div>
        <div class="d-flex row justify-content-center mb-3">
            <div class="d-flex flex-column col-3 me-3 py-4 rounded-2 shadow align-items-start"
                style="background: linear-gradient(135deg, #e8f2ff 0%, #f0f8ff 100%); min-height:200px;">
                <div class="d-flex flex-column justify-content-center align-items-start mb-2">
                    <span class="fw-bold" style="font-size: 32px !important; color: #173F5F;">7</span>
                    <span style="font-size:16px; color: #173F5F;" class="fw-bold">Business Unit</span>
                </div>
                <div class="business-units-report w-100">
                    <div class="d-flex justify-content-between w-100 mb-1">
                        <span>Alpro Pharmacy</span>
                        <span>8</span>
                    </div>
                    <div class="d-flex justify-content-between w-100 mb-1">
                        <span>Alpro Clinic</span>
                        <span>13</span>
                    </div>
                    <div class="collapse" id="businessUnitsCollapse">
                        <div class="d-flex justify-content-between w-100 mb-1">
                            <span>Alpro Optisaver</span>
                            <span>5</span>
                        </div>
                        <div class="d-flex justify-content-between w-100 mb-1">
                            <span>Alpro Baby</span>
                            <span>2</span>
                        </div>
                        <div class="d-flex justify-content-between w-100 mb-1">
                            <span>Alpro Physio</span>
                            <span>5</span>
                        </div>
                        <div class="d-flex justify-content-between w-100 mb-1">
                            <span>Alpro Sugi</span>
                            <span>1</span>
                        </div>
                        <div class="d-flex justify-content-between w-100">
                            <span>Alpro Audiology</span>
                            <span>3</span>
                        </div>
                    </div>
                </div>
                <button class="btn btn-sm mt-2 w-100" type="button" data-bs-toggle="collapse"
                    data-bs-target="#businessUnitsCollapse" aria-expanded="false" aria-controls="businessUnitsCollapse"
                    style="font-size: 12px; background-color: #173F5F; color: white; border: 1px solid #173F5F; font-weight: 500; transition: all 0.3s ease;"
                    id="toggleButton"
                    onmouseover="this.style.backgroundColor='#0a4788'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(19, 92, 170, 0.3)';"
                    onmouseout="this.style.backgroundColor='#173F5F'; this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <span id="toggleText" class="pe-2">Show More</span><i class="bi bi-chevron-down"
                        id="toggleIcon"></i>
                </button>
            </div>
            <div class="d-flex flex-column col-3 me-5 p-4 rounded-2 shadow align-items-start"
                style="background: linear-gradient(135deg, #e8f2ff 0%, #f0f8ff 100%);">
                <div class="d-flex flex-column justify-content-center align-items-start mb-2">
                    <span class="fw-bold" style="font-size: 32px !important; color: #173F5F;">12</span>
                    <span style="font-size:16px; color: #173F5F;" class="fw-bold">Referral</span>
                </div>
                <div class="d-flex justify-content-between w-100 mb-1">
                    <span>Open</span>
                    <span>8</span>
                </div>
                <div class="d-flex justify-content-between w-100 mb-1">
                    <span>Referred</span>
                    <span>13</span>
                </div>
                <div class="d-flex justify-content-between w-100">
                    <span>Closed</span>
                    <span>1</span>
                </div>
            </div>
            <div class="d-flex flex-column col-5 ps-4 py-3 pe-5 rounded-2 shadow align-items-start"
                style="background: linear-gradient(135deg, #e8f2ff 0%, #f0f8ff 100%); min-height:200px;">
                <canvas id="myChart" style="width:100%;height:100%;"></canvas>
            </div>
        </div>
        <div class="d-flex justify-content-between rounded-2 shadow ms-3 p-2 mb-3"
            style="overflow:hidden; background: linear-gradient(135deg, #e8f2ff 0%, #f0f8ff 100%);">
            <!-- <a href="create.php" type="button" class="btn-referral me-2">New Referral</a> -->
            <div class="d-flex gap-2">
                <select name="filter-business-unit" id="filter-business-unit"
                    class="form-select form-select-sm text-capitalize" style="min-width: 150px;">
                </select>
                <select name="filter-status" id="filter-status" class="form-select form-select-sm text-capitalize"
                    style="min-width: 120px;">
                    <option value="1">Open</option>
                    <option value="2">Referred</option>
                    <option value="3">Status</option>
                </select>
                <input type="date" class="form-control form-control-sm" name="filter-start-date" id="filter-start-date"
                    placeholder="Start Date" style="min-width: 140px;">
                <input type="date" class="form-control form-control-sm" name="filter-end-date" id="filter-end-date"
                    placeholder="End Date" style="min-width: 140px;">
                <input type="text" class="form-control form-control-sm" name="filter-referral-id"
                    id="filter-referral-id" placeholder="#REF0001" style="min-width: 120px;">
            </div>
            <div class="d-inline-flex align-items-center">
                <button type="button" class="btn-referral" id="generateReportBtn" aria-expanded="false"
                    aria-controls="generate-report">
                    Generate Report
                </button>
                <div class="generate-report ms-2" id="generate-report" style="display: none;">
                    <select name="report-parameter" id="report-parameter"
                        class="form-select form-select-sm text-capitalize">
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="d-flex flex-column justify-content-between ms-3 mb-3 p-2 rounded-2 shadow"
            style="overflow:hidden; background: linear-gradient(135deg, #e8f2ff 0%, #f0f8ff 100%);">
            <table class="referral-tbl table table-borderless table-hover rounded-2" id="referral-tbl"
                style="background-color: transparent !important;">
                <thead style="border-bottom: 2px solid white;padding-bottom:5px;">
                    <tr>
                        <th style="font-size:16px;width: 10%;text-align:start;">Referral ID</th>
                        <th style="font-size:16px;width: 40%;text-align:start;">Referral Reason</th>
                        <th style="font-size:16px;width: 10%;text-align:start;">Business Unit</th>
                        <th style="font-size:16px;width: 10%;text-align:start;">Status</th>
                        <th style="font-size:16px;width: 20%;text-align:start;">Action</th>
                    </tr>
                </thead>
            </table>

        </div>

    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js">
    </script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>

    <script>
        const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
        const id_u = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        const staff_outlet =
            <?php echo json_encode(isset($staff_outlet) ? $staff_outlet : ''); ?>; //add staff_outlet in lock_adv.php
    </script>

    <script src="js/report.js"></script>
</body>

</html>