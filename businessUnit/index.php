<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Business Units Management</title>
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/style.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/toast.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" media="screen" type="text/css"
        href="referral/businessUnit/css/style.css?v=<?php echo time(); ?>" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
</head>
<?php
require_once('../../lock_adv.php');
$connect = 1;
include('../../common/index_adv.php');

// Dev role override (localhost + real SuperAdmin only), same session key as
// navbar.php's toolbar / api-jwt.php / backend.php. Applied here too so the
// Business Units gate below actually reflects a simulated role, not just
// the real DB value.
$_bu_realReferral = isset($referral) ? (int)$referral : 0;
$_bu_serverName = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : '';
$_bu_httpHost   = isset($_SERVER['HTTP_HOST'])   ? $_SERVER['HTTP_HOST']   : '';
$_bu_isLocal    = in_array($_bu_serverName, array('localhost', '127.0.0.1'))
    || strpos($_bu_serverName, 'localhost') !== false
    || strpos($_bu_httpHost,   'localhost') !== false
    || strpos($_bu_httpHost,   '127.0.0.1') !== false;

if ($_bu_isLocal) {
    if (session_id() == '') {
        session_start();
    }
    if ($_bu_realReferral === 1 && isset($_SESSION['referral_dev_role_override'])) {
        $referral = (int)$_SESSION['referral_dev_role_override'];
    }
}

// Business Units management is SuperAdmin-only (referral = 1); HQ Admin (2) is excluded
if (!isset($referral) || (int)$referral !== 1) {
    header('Location: /odb/referral/403.php');
    exit();
}
?>

<body>
    <?php include('../navbar.php'); ?>
    <div class="header" style="position: relative;">
        <b class="rtop"><b class="r1"></b><b class="r2"></b><b class="r3"></b><b class="r4"></b></b>
        <h1 class="headerH1"><img src='common/img/myreferral.png' width='20px'>Business Unit Management</h1>
        <b class="rbottom"><b class="r4"></b><b class="r3"></b><b class="r2"></b><b class="r1"></b></b>
    </div>

    <div class="referral-container mb-3">
        <!-- Title Row -->
        <!-- <div class="row mb-3">
            <div class="col-12">
                <div class="d-flex justify-content-start align-items-center px-3">
                    <span class="fw-bold text-start" style="font-size:18px;">Business Units Management</span>
                </div>
            </div>
        </div> -->

        <!-- Main Content: Table Left, Forms Right -->
        <div class="row px-3 g-3">

            <!-- LEFT: Business Units Table -->
            <div class="col-md-7">
                <div class="d-flex flex-column p-2 rounded-2 shadow"
                    style="overflow:hidden; background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <!-- <div class="d-flex justify-content-between align-items-center p-2">
                        <span class="fw-bold" style="font-size:14px;">Business Units</span>
                    </div> -->
                    <table class="referral-tbl table table-hover rounded-2" id="business-units-table"
                        style="background-color: transparent !important;">
                        <thead style="border-bottom: 2px solid #dbe2e9;margin-bottom:15px !important;">
                            <tr>
                                <th style="font-size:14px;width: 10%;text-align:start;">
                                    Status
                                </th>
                                <th class="sortable" data-column="name"
                                    style="font-size:14px;width: 20%;text-align:start;cursor:pointer;user-select:none;">
                                    Business Unit <i class="bi bi-arrow-down-up"
                                        style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th class="sortable" data-column="staff_department_id"
                                    style="font-size:14px;width: 25%;text-align:start;cursor:pointer;user-select:none;">
                                    Department ID <i class="bi bi-arrow-down-up"
                                        style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th class="sortable" data-column="ending_code"
                                    style="font-size:14px;width: 20%;text-align:start;cursor:pointer;user-select:none;">
                                    Ending Code <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                </th>
                                <th style="font-size:14px;width: 25%;text-align:start;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="bu-table-body">
                            <!-- Populated via AJAX -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- RIGHT: Forms (Stacked) -->
            <div class="col-md-5">

                <!-- Business Unit Form -->
                <div class="d-flex flex-column p-3 rounded-2 shadow mb-3"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <span class="fw-bold mb-3 text-start" style="font-size:14px;">New Business Unit</span>
                    <form id="business-unit-form">
                        <input type="hidden" id="bu-id" name="bu_id" value="">

                        <div class="row mb-2 align-items-start">
                            <label class="col-sm-3 r-text text-start">Name <span class="text-danger">*</span></label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control form-control-sm" id="bu-name" name="bu_name"
                                    maxlength="255" required>
                            </div>
                        </div>

                        <div class="row mb-2 align-items-start">
                            <label class="col-sm-3 r-text text-start">Outlet</label>
                            <div class="col-sm-8">
                                <select class="form-select form-select-sm" id="bu-outlet" name="bu_outlet">
                                    <option value="">Type to search...</option>
                                </select>
                            </div>
                        </div>

                        <div class="row mb-2 align-items-start">
                            <label class="col-sm-3 r-text text-start">Department</label>
                            <div class="col-sm-8">
                                <select class="form-select form-select-sm" id="bu-department" name="bu_department">
                                    <option value="">Type to search...</option>
                                </select>
                            </div>
                        </div>

                        <div class="row mb-3 align-items-start">
                            <label class="col-sm-3 r-text text-start">Ending Code</label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control form-control-sm r-text" id="bu-ending-code"
                                    name="bu_ending_code" maxlength="20" placeholder="e.g. 1 or 1,2,3,F (comma-separated)">
                                <!-- <small class="form-text text-muted text-start">Single character (A-Z, 0-9)</small> -->
                            </div>
                        </div>

                        <div class="row mb-3 align-items-start">
                            <label class="col-sm-3 r-text text-start">Status <span class="text-danger">*</span></label>
                            <div class="col-sm-8">
                                <div class="form-check">
                                    <input class="form-check-input border" type="radio" name="bu_status"
                                        id="bu-status-active" value="1" checked>
                                    <label class="form-check-label r-text" for="bu-status-active">
                                        Active
                                    </label>
                                </div>
                                <div class="form-check mt-1">
                                    <input class="form-check-input border" type="radio" name="bu_status"
                                        id="bu-status-inactive" value="0">
                                    <label class="form-check-label r-text" for="bu-status-inactive">
                                        Inactive
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 d-flex justify-content-end">
                                <button type="submit" class="btn btn-sm btn-new-referral"
                                    id="bu-submit-btn">Create</button>
                                <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="bu-cancel-btn"
                                    style="display:none;">Cancel</button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Access Control Form -->
                <div class="d-flex flex-column p-3 rounded-2 shadow"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <span class="fw-bold mb-3 text-start" style="font-size:14px;">Access Control</span>
                    <form id="access-control-form">

                        <div class="row mb-2 align-items-start">
                            <label class="col-sm-3 r-text text-start">Staff Name <span
                                    class="text-danger">*</span></label>
                            <div class="col-sm-8">
                                <select class="form-select form-select-sm" id="staff-search" name="staff_search"
                                    required>
                                    <option value="">Type to search...</option>
                                </select>
                                <!-- <small class="form-text text-muted text-start">Max 5 results</small> -->
                            </div>
                        </div>

                        <!-- Selected Staff Info Display -->
                        <div id="selected-staff-info" style="display:none;">
                            <div class="row mb-2">
                                <div class="col-12">
                                    <div class="p-2 rounded text-start"
                                        style="background-color: #f8f9fa; border: 1px solid #dee2e6;">
                                        <p class="mb-1 r-text text-start"><strong>Name:</strong> <span id="info-nama"
                                                class="r-text"></span></p>
                                        <p class="mb-1 r-text text-start"><strong>Department:</strong> <span
                                                id="info-department" class="r-text"></span></p>
                                        <p class="mb-1 r-text text-start"><strong>Outlets:</strong> <span
                                                id="info-outlet" class="r-text"></span>
                                        </p>
                                        <p class="mb-0 r-text text-start"><strong>Current Access:</strong> <span
                                                id="info-referral" class="r-text"></span></p>
                                    </div>
                                </div>
                            </div>

                            <div class="row mb-2 align-items-start">
                                <label class="col-sm-3 r-text text-start">Permission <span
                                        class="text-danger">*</span></label>
                                <div class="col-sm-8">
                                    <div class="form-check">
                                        <input class="form-check-input border" type="radio" name="referral_permission"
                                            id="permission-0" value="0" checked>
                                        <label class="form-check-label r-text" for="permission-0">
                                            Normal User (0)
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input border" type="radio" name="referral_permission"
                                            id="permission-1" value="1">
                                        <label class="form-check-label r-text" for="permission-1">
                                            Super Admin (1)
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input border" type="radio" name="referral_permission"
                                            id="permission-2" value="2">
                                        <label class="form-check-label r-text" for="permission-2">
                                            HQ Admin (2)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-12 d-flex justify-content-end">
                                    <button type="submit" class="btn btn-sm btn-new-referral">Update Access</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

    <script>
        const id_user = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        const referralPermission = <?php echo json_encode(isset($referral) ? (int)$referral : 0); ?>;
    </script>

    <script src="referral/js/toast.js?v=<?php echo time(); ?>"></script>
    <script src="referral/businessUnit/js/index.js?v=<?php echo time(); ?>"></script>
</body>

</html>