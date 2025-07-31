<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Referral</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <!-- <link rel="stylesheet" media="screen" type="text/css" href="../common/css/layout.css" /> -->
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />

</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <div class="referral-container mb-3">
        <div class="row mb-1">
            <div class="col-12">
                <div class="d-flex justify-content-start align-items-end px-3">
                    <span class="fw-bold text-start me-3" style="font-size:20px;">Referral Report</span>
                </div>
            </div>
        </div>
        <div class="row mb-1">
            <div class="col-12">
                <div class="d-flex flex-column py-2 px-3"
                    style="overflow:hidden; background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <span class="fw-bold text-start pt-3 pb-2" style="font-size:14px;">Filter</span>
                    <div class="d-flex justify-content-between pb-3 mb-2">
                        <div class="d-flex gap-2" style="flex: 1; max-width: 70%;">
                            <select name="filter-business-unit" id="filter-business-unit"
                                class="form-select form-select-sm text-capitalize">
                            </select>
                            <select name="filter-location" id="filter-location"
                                class="form-select form-select-sm text-capitalize">
                            </select>
                            <select name="filter-status" id="filter-status"
                                class="form-select form-select-sm text-capitalize">
                            </select>
                            <select name="filter-priority" id="filter-priority"
                                class="form-select form-select-sm text-capitalize">
                                <option value="">All Priority</option>
                                <option value="1">High (1 to 2 working days)</option>
                                <option value="2"> Standard (3 to 5 working days)</option>
                            </select>
                            <select name="filter-month" id="filter-month"
                                class="form-select form-select-sm text-capitalize">
                            </select>
                            <select name="filter-year" id="filter-year"
                                class="form-select form-select-sm text-capitalize">
                            </select>
                            <button type="button" id="resetFiltersBtn" class="btn btn-outline-secondary btn-sm me-1"
                                style="white-space: nowrap; padding: 0.25rem 0.5rem; font-size: 0.875rem;">Reset
                                Filters</button>
                        </div>
                        <div class="d-inline-flex align-items-center mt-2">
                            <a href="#" type="button" class="btn-referral me-1" id="viewReportbtn">Download Report</a>
                            <!-- <button type=" button" class="btn-referral" id="generateReportBtn"
                                aria-expanded="false" aria-controls="generate-report">
                                Generate Report
                                </button>
                                <div class="generate-report ms-2" id="generate-report" style="display: none;">
                                    <select name="report-parameter" id="report-parameter"
                                        class="form-select form-select-sm text-capitalize">
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Charts Section -->
        <div class="row mb-3 px-3">
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">Status Distribution</h6>
                        <div
                            style="height: 300px; position: relative; display: flex; justify-content: center; align-items: center;">
                            <canvas id="statusChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">Priority Breakdown</h6>
                        <div
                            style="height: 300px; position: relative; display: flex; justify-content: center; align-items: center;">
                            <canvas id="priorityChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mb-3 px-3">
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">Sent vs Received</h6>
                        <div
                            style="height: 300px; position: relative; display: flex; justify-content: center; align-items: center;">
                            <canvas id="sentReceivedChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">Location Summary</h6>
                        <div
                            style="height: 300px; position: relative; display: flex; justify-content: center; align-items: center;">
                            <canvas id="locationChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row align-items-start text-start py-2 px-4">
            <div class="d-flex justify-content-center align-items-center">
                <a href="index.php" class="btn-referral">Back</a>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js">
    </script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>

    <script>
        const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
        const id_u = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        const staff_outlet =
            <?php echo json_encode(isset($staff_outlet) ? $staff_outlet : ''); ?>; //add staff_outlet in lock_adv.php
    </script>

    <script src="js/errorLogger.js"></script>
    <script src="js/report.js"></script>
</body>

</html>