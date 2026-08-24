<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Referral</title>
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <!-- <link rel="stylesheet" media="screen" type="text/css" href="common/css/layout.css" /> -->
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/style.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/toast.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/skeleton.css?v=<?php echo time(); ?>" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        /* Dashboard-only Reset button: dedicated id so the shared
           #resetFiltersBtn plain-link style (used by report.php) doesn't apply. */
        #dashResetFiltersBtn {
            background-color: #6c757d;
            border-color: #6c757d;
            color: #fff;
        }

        #dashResetFiltersBtn:hover {
            background-color: #5c636a;
            border-color: #565e64;
            color: #fff;
        }
    </style>
</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
// echo 'BUSINESS UNIT ID' . $businessUnitId;
?>

<body>
    <?php include('navbar.php'); ?>
    <div class="header" style="position: relative;">
        <b class="rtop"><b class="r1"></b><b class="r2"></b><b class="r3"></b><b class="r4"></b></b>
        <h1 class="headerH1"><img src='common/img/myreferral.png' width='20px'>MyReferral</h1>
        <b class="rbottom"><b class="r4"></b><b class="r3"></b><b class="r2"></b><b class="r1"></b></b>
    </div>
    <div class="referral-container mb-3">
        <div class="row mb-3">
            <div class="col-12">
                <div class="d-flex justify-content-start align-items-center px-3">
                    <span class="fw-bold text-start me-3" style="font-size:18px;">Dashboard</span>
                    <a href="referral/create.php" type="button" class="btn-new-referral">New Referral</a>
                </div>
            </div>
        </div>
        <div class="row align-items-stretch mb-3 px-3 g-2">
            <div class="col-3">
                <div class="d-flex flex-column h-100 p-3 rounded-2 shadow align-items-start mb-3"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <div class="d-flex justify-content-center align-items-end mb-2" style="line-height: 1;">
                        <span class="fw-bold" style="font-size: 32px !important; color: #173F5F; line-height: 1;"
                            id="total-referral-count">0</span>
                        <span style="font-size:16px; color: #173F5F; line-height: 1; margin-left: 8px;"
                            class="fw-bold">Referral</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span class="r-text">Open</span>
                        <span id="referral-open-count" class="r-text">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span class="r-text">In Progress</span>
                        <span id="referral-progress-count" class="r-text">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span class="r-text">Referred</span>
                        <span id="referral-referred-count" class="r-text">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span class="r-text">Closed</span>
                        <span id="referral-closed-count" class="r-text">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span class="r-text">Not Present</span>
                        <span id="referral-not-present-count" class="r-text">0</span>
                    </div>
                </div>
            </div>
            <div class="col-3">
                <div class="d-flex flex-column h-100 p-3 rounded-2 shadow align-items-start mb-3"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <div class="d-flex justify-content-center align-items-end mb-2" style="line-height: 1;">
                        <span class="fw-bold" style="font-size: 32px !important; color: #173F5F; line-height: 1;"
                            id="total-priority-count">0</span>
                        <span style="font-size:16px; color: #173F5F; line-height: 1; margin-left: 8px;"
                            class="fw-bold">Priority</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span class="r-text">Low</span>
                        <span id="referral-low-count" class="r-text">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span class="r-text">Medium</span>
                        <span id="referral-medium-count" class="r-text">0</span>
                    </div>
                    <div class="d-flex justify-content-between w-100">
                        <span class="r-text">High</span>
                        <span id="referral-high-count" class="r-text">0</span>
                    </div>
                </div>
            </div>
            <div class="col-3">
                <div class="d-flex flex-column h-100 p-3 rounded-2 shadow align-items-start mb-3"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <div class="d-flex justify-content-center align-items-end mb-2" style="line-height: 1;">
                        <span class="fw-bold" style="font-size: 32px !important; color: #173F5F; line-height: 1;"
                            id="total-type-of-referral-count">0</span>
                        <span style="font-size:16px; color: #173F5F; line-height: 1; margin-left: 8px;"
                            class="fw-bold">Type of
                            Referral</span>
                    </div>
                    <div class="w-100" id="type-of-referral-list">
                        <!-- Type of Referral breakdown rows populated by JS -->
                    </div>
                </div>
            </div>
            <div class="col-3">
                <div class="d-flex flex-column h-100 p-3 rounded-2 shadow align-items-start mb-3"
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
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <span class="fw-bold text-start pt-3 pb-2" style="font-size:14px;">Filter</span>

                    <!-- Referral Type Filter -->
                    <div class="d-flex gap-2 pb-2 mb-2">
                        <span class="fw-bold text-start" style="font-size:12px; align-self:center;">View:</span>
                        <div class="btn-group" role="group" aria-label="Referral type filter">
                            <input type="radio" class="btn-check" name="referral-type" id="type-all" value="all"
                                checked>
                            <label class="btn btn-outline-primary r-text btn-sm" for="type-all">All</label>

                            <input type="radio" class="btn-check" name="referral-type" id="type-sent" value="sent">
                            <label class="btn btn-outline-primary r-text btn-sm" for="type-sent">Sent</label>

                            <input type="radio" class="btn-check" name="referral-type" id="type-received"
                                value="received">
                            <label class="btn btn-outline-primary r-text btn-sm" for="type-received">Received</label>
                        </div>
                    </div>

                    <!-- Filter row 1: Business Unit From | Business Unit To | Outlet From | Outlet To -->
                    <div class="row g-2 align-items-end mb-2">
                        <div class="col-md-3">
                            <label for="filter-bu-from" class="form-label d-block text-start" style="font-size:12px; text-align:left;">Business Unit
                                From</label>
                            <select name="filter-bu-from" id="filter-bu-from"
                                class="form-select form-select-sm text-capitalize"></select>
                        </div>
                        <div class="col-md-3">
                            <label for="filter-bu-to" class="form-label d-block text-start" style="font-size:12px; text-align:left;">Business Unit
                                To</label>
                            <select name="filter-bu-to" id="filter-bu-to"
                                class="form-select form-select-sm text-capitalize"></select>
                        </div>
                        <div class="col-md-3">
                            <label for="filter-outlet-from-btn" class="form-label d-block text-start" style="font-size:12px; text-align:left;">Outlet
                                From</label>
                            <div class="vf-issuer-wrap" id="filter-outlet-from-wrap">
                                <div class="vf-s2-selection" id="filter-outlet-from-btn"
                                    tabindex="0">All Outlets</div>
                                <div class="vf-s2-dropdown" id="filter-outlet-from-dropdown">
                                    <div class="vf-s2-search-wrap">
                                        <input class="vf-s2-search" id="filter-outlet-from-search" type="search"
                                            placeholder="Search outlet...">
                                    </div>
                                    <ul class="vf-s2-list" id="filter-outlet-from-list"></ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label for="filter-outlet-to-btn" class="form-label d-block text-start" style="font-size:12px; text-align:left;">Outlet To</label>
                            <div class="vf-issuer-wrap" id="filter-outlet-to-wrap">
                                <div class="vf-s2-selection" id="filter-outlet-to-btn" tabindex="0">All
                                    Outlets</div>
                                <div class="vf-s2-dropdown" id="filter-outlet-to-dropdown">
                                    <div class="vf-s2-search-wrap">
                                        <input class="vf-s2-search" id="filter-outlet-to-search" type="search"
                                            placeholder="Search outlet...">
                                    </div>
                                    <ul class="vf-s2-list" id="filter-outlet-to-list"></ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filter row 2: Status | Priority | Date From | Date To -->
                    <div class="row g-2 align-items-end mb-2">
                        <div class="col-md-3">
                            <label for="filter-status" class="form-label d-block text-start" style="font-size:12px; text-align:left;">Status</label>
                            <select name="filter-status" id="filter-status"
                                class="form-select form-select-sm text-capitalize"></select>
                        </div>
                        <div class="col-md-3">
                            <label for="filter-priority" class="form-label d-block text-start" style="font-size:12px; text-align:left;">Priority</label>
                            <select name="filter-priority" id="filter-priority"
                                class="form-select form-select-sm text-capitalize"></select>
                        </div>
                        <div class="col-md-3">
                            <label for="filter-date-from" class="form-label d-block text-start" style="font-size:12px; text-align:left;">Date From</label>
                            <input type="date" class="form-control form-control-sm" name="filter-date-from"
                                id="filter-date-from">
                        </div>
                        <div class="col-md-3">
                            <label for="filter-date-to" class="form-label d-block text-start" style="font-size:12px; text-align:left;">Date To</label>
                            <input type="date" class="form-control form-control-sm" name="filter-date-to"
                                id="filter-date-to">
                        </div>
                    </div>

                    <!-- Filter row 3: Referral ID | Type of Referral | actions -->
                    <div class="row g-2 align-items-end">
                        <div class="col-md-3">
                            <label for="filter-referral-id" class="form-label d-block text-start" style="font-size:12px; text-align:left;">Referral
                                ID</label>
                            <input type="text" class="form-control form-control-sm" name="filter-referral-id"
                                id="filter-referral-id" placeholder="#REF0001">
                        </div>
                        <div class="col-md-3">
                            <label for="filter-referral-type" class="form-label d-block text-start" style="font-size:12px; text-align:left;">Type
                                of Referral</label>
                            <select name="filter-referral-type" id="filter-referral-type"
                                class="form-select form-select-sm">
                                <option value="">All</option>
                            </select>
                        </div>
                        <div class="col-md-6 d-flex gap-2 justify-content-end align-items-end">
                            <button type="button" class="btn btn-success btn-sm flex-fill" id="exportExcelBtn"
                                title="Export current filter results to Excel">
                                <i class="bi bi-file-earmark-spreadsheet me-1"></i>Export to Excel
                            </button>
                            <button type="button" class="btn btn-sm flex-fill" id="dashResetFiltersBtn"
                                title="Reset Filters">
                                <i class="bi bi-x-lg me-1"></i>Reset
                            </button>
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
                                <th class="sortable" data-column="ref_id"
                                    style="font-size:14px;width: 10%;text-align:start;cursor:pointer;user-select:none;">
                                    Referral ID <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th class="sortable" data-column="reason"
                                    style="font-size:14px;width: 26%;text-align:start;cursor:pointer;user-select:none;">
                                    Referral Reason <i class="bi bi-arrow-down-up"
                                        style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th class="sortable" data-column="type_of_referral"
                                    style="font-size:14px;width: 8%;text-align:start;cursor:pointer;user-select:none;white-space:nowrap;">
                                    Type of Referral <i class="bi bi-arrow-down-up"
                                        style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th class="sortable" data-column="from_business_unit"
                                    style="font-size:14px;width: 13%;text-align:start;cursor:pointer;user-select:none;white-space:nowrap;">
                                    Referred From <i class="bi bi-arrow-down-up"
                                        style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th class="sortable" data-column="to_business_unit"
                                    style="font-size:14px;width: 13%;text-align:start;cursor:pointer;user-select:none;white-space:nowrap;">
                                    Referred To <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th class="sortable" data-column="created_at"
                                    style="font-size:14px;width: 9%;text-align:start;cursor:pointer;user-select:none;white-space:nowrap;">
                                    Created At <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th class="sortable" data-column="status"
                                    style="font-size:14px;width: 9%;text-align:start;cursor:pointer;user-select:none;">
                                    Status <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th class="sortable" data-column="priority"
                                    style="font-size:14px;width: 9%;text-align:start;cursor:pointer;user-select:none;">
                                    Priority <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th style="font-size:14px;width: 10%;text-align:start;">Action</th>
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>

    <script>
        const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
        const id_user = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        const staff_outlet =
            <?php echo json_encode(isset($staff_outlet) ? $staff_outlet : ''); ?>; //add staff_outlet in lock.php
        const referralPermission = <?php echo json_encode(isset($referral) ? (int)$referral : 0); ?>;
        const staffBusinessUnitId = <?php echo json_encode(isset($businessUnitId) ? (int)$businessUnitId : null); ?>;
    </script>

    <script src="referral/js/toast.js?v=<?php echo time(); ?>"></script>
    <script src="referral/js/errorLogger.js?v=<?php echo time(); ?>"></script>
    <script src="referral/js/index.js?v=<?php echo time(); ?>"></script>
</body>

</html>