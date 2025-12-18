<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

    <link rel="stylesheet" media="screen" type="text/css" href="common/css/layout.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/externalReferee/css/style.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<?php
require_once('../../lock_adv.php');
$connect = 1;
include('../../common/index_adv.php');

// Check if user has admin permission (referral must be 1 or 2)
if (isset($referral) && $referral == 0) {
    header('Location: /odb/referral/403.php');
    exit();
}
?>

<body>
    <?php include('../navbar.php'); ?>
    <div class="referral-container mb-3">
        <div class="d-flex justify-content-start align-items-center px-3 mb-3">
            <span class="fw-bold text-start me-3" style="font-size:18px;">External Referees</span>
        </div>

        <div class="row px-3 g-3">
            <!-- Left Column: Form -->
            <div class="col-md-5">
                <div class="d-flex flex-column p-3 rounded-2 shadow"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <form action="referral/externalReferee/post.php" method="POST" id="externalRefereeForm"
                        name="externalRefereeForm" onsubmit="validateForm(event)">
                        <p class="fw-bold mb-3 text-start" style="font-size:16px;">New External Referee</p>
                        <div class="mb-2">
                            <p class="r-text mb-1 text-start">Name<span style="color:red;">*</span></p>
                            <input type="text" name="name" class="form-control form-control-sm">
                            <div class="error-message text-start" id="error-name" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <p class="r-text mb-1 text-start">Email</p>
                                <input type="email" name="email" class="form-control form-control-sm">
                                <div class="error-message text-start" id="error-email"
                                    style="color: red;font-size:12px;"></div>
                            </div>
                            <div class="col">
                                <p class="r-text mb-1 text-start">Phone<span style="color:red;">*</span></p>
                                <input type="tel" name="phone" class="form-control form-control-sm">
                                <div class="error-message text-start" id="error-phone"
                                    style="color: red;font-size:12px;"></div>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <p class="r-text mb-1 text-start">Organization<span style="color:red;">*</span></p>
                                <select name="external_organization_id" id="organization-select"
                                    class="form-control form-control-sm">
                                    <option value="">Select Organization</option>
                                </select>
                                <div class="error-message text-start" id="error-organization"
                                    style="color: red;font-size:12px;">
                                </div>
                                <div class="mt-2">
                                    <button type="button" id="add-new-org-btn"
                                        class="btn btn-sm btn-outline-primary w-100">+
                                        Add New Organization</button>
                                </div>
                            </div>
                            <div class="col">
                                <p class="r-text mb-1 text-start">Position<span style="color:red;">*</span></p>
                                <input type="text" name="position" class="form-control form-control-sm">
                                <div class="error-message text-start" id="error-position"
                                    style="color: red;font-size:12px;"></div>
                            </div>
                        </div>

                        <!-- New Organization Form (Hidden by default) -->
                        <div id="new-organization-section" style="display: none;"
                            class="border rounded p-3 mb-3 bg-light">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <p class="fw-bold mb-0 text-start">New Organization Details</p>
                                <button type="button" id="cancel-new-org-btn"
                                    class="btn btn-sm btn-outline-secondary">Cancel</button>
                            </div>
                            <div class="mb-2">
                                <p class="r-text mb-1 text-start">Organization Name<span style="color:red;">*</span></p>
                                <input type="text" name="new_org_name" id="new-org-name"
                                    class="form-control form-control-sm">
                                <div class="error-message text-start" id="error-new-org-name"
                                    style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="mb-2">
                                <p class="r-text mb-1 text-start">Address</p>
                                <textarea name="new_org_address" id="new-org-address"
                                    class="form-control form-control-sm" rows="2"></textarea>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text mb-1 text-start">Postcode</p>
                                    <input type="text" name="new_org_postcode" id="new-org-postcode"
                                        class="form-control form-control-sm">
                                </div>
                                <div class="col">
                                    <p class="r-text mb-1 text-start">State</p>
                                    <select name="new_org_state" id="new-org-state"
                                        class="form-control form-control-sm">
                                        <option value="">Select State</option>
                                        <option value="Johor">Johor</option>
                                        <option value="Kedah">Kedah</option>
                                        <option value="Kelantan">Kelantan</option>
                                        <option value="Melaka">Melaka</option>
                                        <option value="Negeri Sembilan">Negeri Sembilan</option>
                                        <option value="Pahang">Pahang</option>
                                        <option value="Perak">Perak</option>
                                        <option value="Perlis">Perlis</option>
                                        <option value="Pulau Pinang">Pulau Pinang</option>
                                        <option value="Sabah">Sabah</option>
                                        <option value="Sarawak">Sarawak</option>
                                        <option value="Selangor">Selangor</option>
                                        <option value="Terengganu">Terengganu</option>
                                        <option value="Kuala Lumpur">Kuala Lumpur</option>
                                        <option value="Labuan">Labuan</option>
                                        <option value="Putrajaya">Putrajaya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-2">
                                <p class="r-text mb-1 text-start">Country</p>
                                <select name="new_org_country" id="new-org-country"
                                    class="form-control form-control-sm">
                                    <option value="Malaysia" selected>Malaysia</option>
                                </select>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end align-items-center">
                            <button type="submit" id="real-submit" style="display: none;"></button>
                            <input type="submit" value="Submit" class="submitButton">
                        </div>
                    </form>
                </div>
            </div>

            <!-- Right Column: Table -->
            <div class="col-md-7">
                <div class="d-flex flex-column justify-content-between p-2 rounded-2 shadow"
                    style="overflow:hidden; background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <span class="fw-bold text-start px-2 pt-2 pb-3" style="font-size:16px;">All External Referees</span>
                    <div class="table-responsive">
                        <table class="referral-tbl table table-hover rounded-2" id="external-referees-table"
                            style="background-color: transparent !important;">
                            <thead style="border-bottom: 2px solid #dbe2e9;margin-bottom:15px !important;">
                                <tr>
                                    <th class="sortable" data-column="nama_referee"
                                        style="font-size:14px;width: 20%;text-align:start;cursor:pointer;user-select:none;">
                                        Name <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                    </th>
                                    <th class="sortable" data-column="email"
                                        style="font-size:14px;width: 20%;text-align:start;cursor:pointer;user-select:none;">
                                        Email <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                    </th>
                                    <th class="sortable" data-column="phone"
                                        style="font-size:14px;width: 15%;text-align:start;cursor:pointer;user-select:none;">
                                        Phone <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                    </th>
                                    <th class="sortable" data-column="organization"
                                        style="font-size:14px;width: 20%;text-align:start;cursor:pointer;user-select:none;">
                                        Organization <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                    </th>
                                    <th class="sortable" data-column="position"
                                        style="font-size:14px;width: 15%;text-align:start;cursor:pointer;user-select:none;">
                                        Position <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                    </th>
                                    <th style="font-size:14px;width: 10%;text-align:start;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="external-referees-tbody">
                                <tr>
                                    <td colspan="6" class="text-center">Loading...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="referral/js/errorLogger.js?v=<?php echo time(); ?>"></script>
    <script>
    const referralPermission = <?php echo json_encode(isset($referral) ? (int)$referral : 2); ?>;
    </script>
    <script src="referral/externalReferee/js/index.js?v=<?php echo time(); ?>"></script>
</body>

</html>