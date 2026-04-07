<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Referral - Yearly Comparison</title>
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/style.css?v=<?php echo filemtime(__DIR__ . '/../css/style.css'); ?>" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<?php
require_once('../../lock_adv.php');
$connect = 1;
include('../../common/index_adv.php');
?>

<body>
    <div class="header" style="position: relative;">
        <b class="rtop"><b class="r1"></b><b class="r2"></b><b class="r3"></b><b class="r4"></b></b>
        <h1 class="headerH1"><img src='common/img/myreferral.png' width='20px'>Yearly Comparison</h1>
        <b class="rbottom"><b class="r4"></b><b class="r3"></b><b class="r2"></b><b class="r1"></b></b>
    </div>
    <?php include('../navbar.php'); ?>
    <div class="referral-container mb-3">

        <!-- Page title -->
        <!-- <div class="row mb-1">
            <div class="col-12">
                <div class="d-flex justify-content-start align-items-center px-3">
                    <span class="fw-bold text-start me-3" style="font-size:18px;">Yearly Comparison</span>
                </div>
            </div>
        </div> -->

        <!-- Filter -->
        <div class="row mb-1">
            <div class="col-12">
                <div class="d-flex flex-column py-2 px-3"
                    style="overflow:hidden; background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <span class="fw-bold text-start pt-3 pb-2" style="font-size:14px;">Filter</span>
                    <div class="d-flex pb-3 mb-2 gap-2 align-items-center">
                        <select name="filter-business-unit" id="filter-business-unit"
                            class="form-select form-select-sm text-capitalize" style="max-width: 220px;">
                        </select>
                        <select name="filter-year" id="filter-year"
                            class="form-select form-select-sm" style="max-width: 120px;">
                        </select>
                        <button type="button" id="resetFiltersBtn" class="btn btn-outline-secondary btn-sm"
                            style="white-space: nowrap; padding: 0.25rem 0.5rem; font-size: 0.875rem;">Reset Filters</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Yearly summary section -->
        <div class="row mb-1 mx-3 rounded-2 shadow">
            <div class="row mt-2 mb-3 px-3">
                <div class="col-12">
                    <span class="fw-bold text-start me-3" style="font-size:16px;">
                        Summary &mdash; <span id="yearly-title-year"></span>
                    </span>
                </div>
            </div>

            <!-- Chart 1: Total referrals per BU -->
            <div class="row mb-3 px-3">
                <div class="col-12">
                    <div class="card border-0">
                        <div class="card-body">
                            <h6 class="card-title">Total Referrals by Business Unit</h6>
                            <div style="position: relative; height: 260px;">
                                <canvas id="yearlyTotalChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chart 2: Created vs Received | Chart 3: Status -->
            <div class="row mb-3 px-3">
                <div class="col-md-6 mb-3">
                    <div class="card border-0">
                        <div class="card-body">
                            <h6 class="card-title">Created vs Received by Business Unit</h6>
                            <div style="position: relative; height: 260px;">
                                <canvas id="yearlySentReceivedChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <div class="card border-0">
                        <div class="card-body">
                            <h6 class="card-title">Status Distribution by Business Unit</h6>
                            <div style="position: relative; height: 260px;">
                                <canvas id="yearlyStatusChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chart 4: Top locations per BU -->
            <div class="row mb-3 px-3">
                <div class="col-12">
                    <div class="card border-0">
                        <div class="card-body">
                            <h6 class="card-title">Top Locations by Business Unit</h6>
                            <div style="position: relative; height: 280px;">
                                <canvas id="yearlyLocationsChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>

    <script>
        const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
        const id_u = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        const staff_outlet = <?php echo json_encode(isset($staff_outlet) ? $staff_outlet : ''); ?>;
        const staffPosition = <?php echo json_encode(isset($status_semasa) ? $status_semasa : ''); ?>;
        const referralPermission = <?php echo json_encode(isset($referral) ? (int)$referral : 2); ?>;
    </script>

    <script src="referral/js/errorLogger.js?v=<?php echo time(); ?>"></script>
    <script src="referral/js/report-yearly.js?v=<?php echo time(); ?>"></script>
</body>

</html>
