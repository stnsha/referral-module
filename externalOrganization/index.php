<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

    <link rel="stylesheet" media="screen" type="text/css" href="common/css/layout.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/style.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/externalOrganization/css/style.css" />
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
            <span class="fw-bold text-start me-3" style="font-size:18px;">External Organizations</span>
        </div>

        <div class="row px-3 g-3">
            <!-- Left Column: Form -->
            <div class="col-md-4">
                <div class="d-flex flex-column p-3 rounded-2 shadow"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <form action="referral/externalOrganization/post.php" method="POST" id="externalOrganizationForm"
                        name="externalOrganizationForm" onsubmit="validateForm(event)">
                        <p class="fw-bold mb-3 text-start" style="font-size:16px;">New External Organization</p>

                        <!-- Organization Fields (Primary) -->
                        <div class="mb-2">
                            <p class="r-text mb-1 text-start">Organization Name<span style="color:red;">*</span></p>
                            <input type="text" name="org_name" id="org-name" class="form-control form-control-sm">
                            <div class="error-message text-start" id="error-org-name" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text mb-1 text-start">Address</p>
                            <textarea name="org_address" id="org-address" class="form-control form-control-sm" rows="2"></textarea>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <p class="r-text mb-1 text-start">Postcode</p>
                                <input type="text" name="org_postcode" id="org-postcode" class="form-control form-control-sm">
                            </div>
                            <div class="col">
                                <p class="r-text mb-1 text-start">State</p>
                                <select name="org_state" id="org-state" class="form-control form-control-sm">
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
                        <div class="mb-3">
                            <p class="r-text mb-1 text-start">Country</p>
                            <select name="org_country" id="org-country" class="form-control form-control-sm">
                                <option value="Malaysia" selected>Malaysia</option>
                            </select>
                        </div>

                        <!-- Add Referee Section (Collapsible) -->
                        <div class="mb-2">
                            <button type="button" id="add-referee-btn" class="btn btn-sm btn-outline-primary w-100">
                                + Add New External Referee
                            </button>
                        </div>

                        <!-- New Referee Form (Hidden by default) -->
                        <div id="new-referee-section" style="display: none;" class="border rounded p-3 mb-3 bg-light">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <p class="fw-bold mb-0 text-start">New External Referee Details</p>
                                <button type="button" id="cancel-referee-btn" class="btn btn-sm btn-outline-secondary">Cancel</button>
                            </div>
                            <div class="mb-2">
                                <p class="r-text mb-1 text-start">Referee Name<span style="color:red;">*</span></p>
                                <input type="text" name="referee_name" id="referee-name" class="form-control form-control-sm">
                                <div class="error-message text-start" id="error-referee-name" style="color: red;font-size:12px;"></div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text mb-1 text-start">Email</p>
                                    <input type="email" name="referee_email" id="referee-email" class="form-control form-control-sm">
                                    <div class="error-message text-start" id="error-referee-email" style="color: red;font-size:12px;"></div>
                                </div>
                                <div class="col">
                                    <p class="r-text mb-1 text-start">Phone<span style="color:red;">*</span></p>
                                    <input type="tel" name="referee_phone" id="referee-phone" class="form-control form-control-sm">
                                    <div class="error-message text-start" id="error-referee-phone" style="color: red;font-size:12px;"></div>
                                </div>
                            </div>
                            <div class="mb-2">
                                <p class="r-text mb-1 text-start">Position<span style="color:red;">*</span></p>
                                <input type="text" name="referee_position" id="referee-position" class="form-control form-control-sm">
                                <div class="error-message text-start" id="error-referee-position" style="color: red;font-size:12px;"></div>
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
            <div class="col-md-8">
                <div class="d-flex flex-column justify-content-between p-2 rounded-2 shadow"
                    style="overflow:hidden; background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <span class="fw-bold text-start px-2 pt-2 pb-3" style="font-size:16px;">All External Organizations</span>
                    <div class="table-responsive">
                        <table class="referral-tbl table table-hover rounded-2" id="external-organizations-table"
                            style="background-color: transparent !important;">
                            <thead style="border-bottom: 2px solid #dbe2e9;margin-bottom:15px !important;">
                                <tr>
                                    <th style="font-size:14px;width: 5%;text-align:center;"></th>
                                    <th class="sortable" data-column="name"
                                        style="font-size:14px;width: 30%;text-align:start;cursor:pointer;user-select:none;">
                                        Organization Name <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                    </th>
                                    <th class="sortable" data-column="address"
                                        style="font-size:14px;width: 35%;text-align:start;cursor:pointer;user-select:none;">
                                        Address <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                    </th>
                                    <th class="sortable" data-column="state"
                                        style="font-size:14px;width: 15%;text-align:start;cursor:pointer;user-select:none;">
                                        State <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                    </th>
                                    <th style="font-size:14px;width: 15%;text-align:start;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="external-organizations-tbody">
                                <tr>
                                    <td colspan="5" class="text-center">Loading...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Referee Modal -->
    <div class="modal fade" id="addRefereeModal" tabindex="-1" aria-labelledby="addRefereeModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addRefereeModalLabel">Add Referee to Organization</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="modal-org-id">
                    <div class="mb-2">
                        <p class="r-text mb-1 text-start">Referee Name<span style="color:red;">*</span></p>
                        <input type="text" id="modal-referee-name" class="form-control form-control-sm">
                        <div class="error-message text-start" id="error-modal-referee-name" style="color: red;font-size:12px;"></div>
                    </div>
                    <div class="row mb-2">
                        <div class="col">
                            <p class="r-text mb-1 text-start">Email</p>
                            <input type="email" id="modal-referee-email" class="form-control form-control-sm">
                            <div class="error-message text-start" id="error-modal-referee-email" style="color: red;font-size:12px;"></div>
                        </div>
                        <div class="col">
                            <p class="r-text mb-1 text-start">Phone<span style="color:red;">*</span></p>
                            <input type="tel" id="modal-referee-phone" class="form-control form-control-sm">
                            <div class="error-message text-start" id="error-modal-referee-phone" style="color: red;font-size:12px;"></div>
                        </div>
                    </div>
                    <div class="mb-2">
                        <p class="r-text mb-1 text-start">Position<span style="color:red;">*</span></p>
                        <input type="text" id="modal-referee-position" class="form-control form-control-sm">
                        <div class="error-message text-start" id="error-modal-referee-position" style="color: red;font-size:12px;"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="modal-save-referee">Save Referee</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Organization Modal -->
    <div class="modal fade" id="editOrgModal" tabindex="-1" aria-labelledby="editOrgModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editOrgModalLabel">Edit Organization</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="edit-org-id">
                    <div class="mb-2">
                        <p class="r-text mb-1 text-start">Organization Name<span style="color:red;">*</span></p>
                        <input type="text" id="edit-org-name" class="form-control form-control-sm">
                        <div class="error-message text-start" id="error-edit-org-name" style="color: red;font-size:12px;"></div>
                    </div>
                    <div class="mb-2">
                        <p class="r-text mb-1 text-start">Address</p>
                        <textarea id="edit-org-address" class="form-control form-control-sm" rows="2"></textarea>
                    </div>
                    <div class="row mb-2">
                        <div class="col">
                            <p class="r-text mb-1 text-start">Postcode</p>
                            <input type="text" id="edit-org-postcode" class="form-control form-control-sm">
                        </div>
                        <div class="col">
                            <p class="r-text mb-1 text-start">State</p>
                            <select id="edit-org-state" class="form-control form-control-sm">
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
                        <select id="edit-org-country" class="form-control form-control-sm">
                            <option value="Malaysia" selected>Malaysia</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="modal-save-org">Save Changes</button>
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
    <script src="referral/externalOrganization/js/index.js?v=<?php echo time(); ?>"></script>
</body>

</html>
