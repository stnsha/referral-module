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
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css?v=<?php echo time(); ?>" />
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
        <div class="row mb-3">
            <div class="col-12">
                <div class="d-flex justify-content-start align-items-center px-3">
                    <span class="fw-bold text-start me-3" style="font-size:20px;">Referral Dashboard</span>
                    <a href="create.php" type="button" class="btn-new-referral me-2">New Referral</a>
                    <a href="report.php" type="button" class="btn-referral" id="viewReportbtn">View
                        Report</a>
                </div>
            </div>
        </div>
        <div class="row align-items-stretch mb-3 px-3 g-2">
            <div class="col-4">
                <div class="d-flex flex-column p-3 rounded-2 shadow align-items-start mb-3"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <div class="d-flex justify-content-center align-items-end mb-2" style="line-height: 1;">
                        <span class="fw-bold" style="font-size: 32px !important; color: #173F5F; line-height: 1;"
                            id="total-referral-count">0</span>
                        <span style="font-size:16px; color: #173F5F; line-height: 1; margin-left: 8px;"
                            class="fw-bold">Referral</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span>Open</span>
                        <span id="referral-open-count">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span>In Progress</span>
                        <span id="referral-progress-count">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span>Referred</span>
                        <span id="referral-referred-count">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span>Closed</span>
                        <span id="referral-closed-count">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span>Not Present</span>
                        <span id="referral-not-present-count">0</span>
                    </div>
                </div>
            </div>
            <div class="col-4">
                <div class="d-flex flex-column p-3 rounded-2 shadow align-items-start mb-3"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <div class="d-flex justify-content-center align-items-end mb-2" style="line-height: 1;">
                        <span class="fw-bold" style="font-size: 32px !important; color: #173F5F; line-height: 1;"
                            id="total-priority-count">0</span>
                        <span style="font-size:16px; color: #173F5F; line-height: 1; margin-left: 8px;"
                            class="fw-bold">Priority</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span>Low</span>
                        <span id="referral-low-count">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span>Medium</span>
                        <span id="referral-medium-count">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span>High</span>
                        <span id="referral-high-count">0</span>
                    </div>
                </div>
            </div>
            <div class="col-4">
                <div class="d-flex flex-column p-3 rounded-2 shadow align-items-start mb-3"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <div class="d-flex justify-content-center align-items-end mb-2" style="line-height: 1;">
                        <span class="fw-bold" style="font-size: 32px !important; color: #173F5F; line-height: 1;"
                            id="total-business-unit-count">0</span>
                        <span style="font-size:16px; color: #173F5F; line-height: 1; margin-left: 8px;"
                            class="fw-bold">Business
                            Unit</span>
                    </div>
                    <div class="business-units-report w-100" id="business-units-list">
                        <!-- First 4 business units will be shown here to match referral column height -->
                    </div>
                    <div class="collapse w-100" id="businessUnitsCollapse">
                        <!-- Additional business units will be shown here when expanded -->
                    </div>
                    <button type="button" data-bs-toggle="collapse" data-bs-target="#businessUnitsCollapse"
                        aria-expanded="false" aria-controls="businessUnitsCollapse"
                        style="background: none; border: none; color: #6c757d; font-size: 10px; padding: 5px 0; cursor: pointer; text-decoration: none;"
                        id="toggleButton" class="d-none">
                        <span id="toggleText" class="pe-2">Show More</span><i class="bi bi-chevron-down"
                            id="toggleIcon"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="row mb-3 px-3">
            <div class="col-12">
                <div class="d-flex flex-column rounded-2 shadow p-2"
                    style="overflow:hidden; background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <span class="fw-bold text-start pt-3 pb-2" style="font-size:14px;">Filter</span>

                    <!-- Referral Type Filter -->
                    <div class="d-flex gap-2 pb-2 mb-2">
                        <span class="fw-bold text-start" style="font-size:12px; align-self:center;">View:</span>
                        <div class="btn-group" role="group" aria-label="Referral type filter">
                            <input type="radio" class="btn-check" name="referral-type" id="type-all" value="all" checked>
                            <label class="btn btn-outline-primary btn-sm" for="type-all">All</label>

                            <input type="radio" class="btn-check" name="referral-type" id="type-sent" value="sent">
                            <label class="btn btn-outline-primary btn-sm" for="type-sent">Sent</label>

                            <input type="radio" class="btn-check" name="referral-type" id="type-received"
                                value="received">
                            <label class="btn btn-outline-primary btn-sm" for="type-received">Received</label>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between pb-3 mb-2">
                        <div class="d-flex gap-2" style="flex: 1; max-width: 70%;">
                            <select name="filter-business-unit" id="filter-business-unit"
                                class="form-select form-select-sm text-capitalize">
                            </select>
                            <select name="filter-status" id="filter-status"
                                class="form-select form-select-sm text-capitalize">
                            </select>
                            <input type="text" class="form-control form-control-sm" name="filter-date-range"
                                id="filter-date-range" placeholder="Select Date Range">
                            <input type="text" class="form-control form-control-sm" name="filter-referral-id"
                                id="filter-referral-id" placeholder="#REF0001">
                            <button type="button" id="resetFiltersBtn" class="btn btn-outline-secondary btn-sm"
                                style="white-space: nowrap; padding: 0.25rem 0.5rem; font-size: 0.875rem;">Reset
                                Filters</button>
                        </div>
                        <div class="d-inline-flex align-items-center">

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
        <div class="row mb-3 px-3">
            <div class="col-12">
                <div class="d-flex flex-column justify-content-between p-2 rounded-2 shadow"
                    style="overflow:hidden; background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <table class="referral-tbl table table-hover rounded-2" id="referral-tbl"
                        style="background-color: transparent !important;">
                        <thead style="border-bottom: 2px solid #dbe2e9;margin-bottom:15px !important;">
                            <tr>
                                <th style="font-size:16px;width: 10%;text-align:start;">Referral ID</th>
                                <th style="font-size:16px;width: 30%;text-align:start;">Referral Reason</th>
                                <th style="font-size:16px;width: 12%;text-align:start;">Referred From</th>
                                <th style="font-size:16px;width: 12%;text-align:start;">Referred To</th>
                                <th style="font-size:16px;width: 11%;text-align:start;">Status</th>
                                <th style="font-size:16px;width: 25%;text-align:start;">Action</th>
                            </tr>
                        </thead>
                    </table>
                </div>
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
        const id_user = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        const staff_outlet =
            <?php echo json_encode(isset($staff_outlet) ? $staff_outlet : ''); ?>; //add staff_outlet in lock_adv.php
    </script>

    <script src="js/errorLogger.js?v=<?php echo time(); ?>"></script>
    <script src="js/index.js?v=<?php echo time(); ?>"></script>
</body>

</html>