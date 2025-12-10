<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <link rel="stylesheet" media="screen" type="text/css" href="common/css/layout.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/externalReferee/css/style.css" />

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<?php
require_once('../../lock_adv.php');
$connect = 1;
include('../../common/index_adv.php');

// Check if user has admin permission (referral must be 1 or 2)
if (isset($referral) && $referral == 0) {
    header('Location: ../index.php');
    exit();
}
?>

<body>

    <!-- External Referees List Table -->
    <div class="row align-items-start text-start py-2 px-4 mb-3">
        <div class="col h-auto border rounded p-3">
            <p class="r-title mb-3">All External Referees</p>
            <div class="table-responsive">
                <table class="table table-striped table-bordered table-sm">
                    <thead class="table-light">
                        <tr>
                            <th style="width: 20%;">Name</th>
                            <th style="width: 20%;">Email</th>
                            <th style="width: 15%;">Phone</th>
                            <th style="width: 25%;">Organization</th>
                            <th style="width: 15%;">Position</th>
                            <th style="width: 10%;">Actions</th>
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

    <form action="referral/externalReferee/post.php" method="POST" id="externalRefereeForm" name="externalRefereeForm"
        onsubmit="validateForm(event)">
        <div class="row align-items-start text-start py-2 px-4">
            <div class="col h-auto border rounded p-2">
                <div class="border-bottom pb-3 mb-3">
                    <p class="r-title">External Referee Information</p>
                    <div class="mb-2">
                        <p class="r-text">Name<span style="color:red;">*</span></p>
                        <input type="text" name="name" class="form-control form-control-sm">
                        <div class="error-message" id="error-name" style="color: red;font-size:12px;"></div>
                    </div>
                    <div class="row mb-2">
                        <div class="col">
                            <p class="r-text">Email</p>
                            <input type="email" name="email" class="form-control form-control-sm">
                            <div class="error-message" id="error-email" style="color: red;font-size:12px;"></div>
                        </div>
                        <div class="col">
                            <p class="r-text">Phone<span style="color:red;">*</span></p>
                            <input type="tel" name="phone" class="form-control form-control-sm">
                            <div class="error-message" id="error-phone" style="color: red;font-size:12px;"></div>
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col">
                            <p class="r-text">Organization<span style="color:red;">*</span></p>
                            <select name="external_organization_id" id="organization-select"
                                class="form-control form-control-sm">
                                <option value="">Select Organization</option>
                            </select>
                            <div class="error-message" id="error-organization" style="color: red;font-size:12px;">
                            </div>
                            <div class="mt-2">
                                <button type="button" id="add-new-org-btn" class="btn btn-sm btn-outline-primary">+
                                    Add New Organization</button>
                            </div>
                        </div>
                        <div class="col">
                            <p class="r-text">Position<span style="color:red;">*</span></p>
                            <input type="text" name="position" class="form-control form-control-sm">
                            <div class="error-message" id="error-position" style="color: red;font-size:12px;"></div>
                        </div>
                    </div>

                    <!-- New Organization Form (Hidden by default) -->
                    <div id="new-organization-section" style="display: none;" class="border rounded p-3 mb-3 bg-light">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <p class="r-text fw-bold mb-0">New Organization Details</p>
                            <button type="button" id="cancel-new-org-btn"
                                class="btn btn-sm btn-outline-secondary">Cancel</button>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Organization Name<span style="color:red;">*</span></p>
                            <input type="text" name="new_org_name" id="new-org-name"
                                class="form-control form-control-sm">
                            <div class="error-message" id="error-new-org-name" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Address</p>
                            <textarea name="new_org_address" id="new-org-address" class="form-control form-control-sm"
                                rows="2"></textarea>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <p class="r-text">Postcode</p>
                                <input type="text" name="new_org_postcode" id="new-org-postcode"
                                    class="form-control form-control-sm">
                            </div>
                            <div class="col">
                                <p class="r-text">State</p>
                                <select name="new_org_state" id="new-org-state" class="form-control form-control-sm">
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
                            <p class="r-text">Country</p>
                            <select name="new_org_country" id="new-org-country" class="form-control form-control-sm">
                                <option value="Malaysia" selected>Malaysia</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row align-items-start text-start py-2 px-4">
            <div class="d-flex flex-column justify-content-center align-items-center">
                <button type="submit" id="real-submit" style="display: none;"></button>
                <input type="submit" value="Submit" class="submitButton">
                <a href="index.php" class="btn-back">Back</a>
            </div>
        </div>
    </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="referral/js/errorLogger.js"></script>
    <script>
        const referralPermission = <?php echo json_encode(isset($referral) ? (int)$referral : 2); ?>;
    </script>
    <script src="referral/externalReferee/js/index.js"></script>
</body>

</html>