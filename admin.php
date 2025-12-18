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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');

// Check if user has admin permission (referral must be 1 or 2)
if (isset($referral) && $referral == 0) {
    header('Location: /odb/referral/403.php');
    exit();
}
?>

<body>
    <?php include('navbar.php'); ?>
    <div class="referral-container mb-3">
        <div class="d-flex justify-content-start align-items-center px-3 mb-3">
            <span class="fw-bold text-start me-3" style="font-size:18px;">Admin Panel</span>
        </div>

        <div class="row px-3 g-3">
            <!-- Left Column: Form -->
            <div class="col-md-5">
                <div class="d-flex flex-column p-3 rounded-2 shadow"
                    style="background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <div class="alert alert-warning r-text" role="alert">
                        <strong>Note:</strong> Once a form is created, it cannot be updated or edited to avoid affecting
                        existing
                        referral records that use this form.
                    </div>
                    <form name="admin-form" id="admin-form" onsubmit="validateForm(event)"
                        enctype="multipart/form-data">
                        <div class="row mb-2 align-items-center">
                            <label class="col-sm-4 r-text text-sm-start">Business Unit</label>
                            <div class="col-sm-8">
                                <select name="business-unitss" id="business-units"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Select Business Unit</option>
                                </select>
                                <div class="error-message" id="error-business-units"
                                    style="color: red; font-size: 12px;">
                                </div>
                            </div>
                        </div>
                        <div class="row mb-2 align-items-center">
                            <label class="col-sm-4 r-text text-sm-start">Label Name</label>
                            <div class="col-sm-8">
                                <input type="text" name="label_name" id="label_name"
                                    class="form-control form-control-sm">
                                <div class="error-message" id="error-label-name" style="color: red; font-size: 12px;">
                                </div>
                            </div>
                        </div>
                        <div class="row mb-2 align-items-center">
                            <label class="col-sm-4 r-text text-sm-start">Hide Label?</label>
                            <div class="col-sm-8 d-flex align-items-center">
                                <input class="form-check-input mt-0 me-2 r-text" type="checkbox" value="1"
                                    name="is_hidden" aria-label="Checkbox for following text input"> Yes
                            </div>
                        </div>
                        <div class="row mb-2 align-items-center">
                            <label class="col-sm-4 r-text text-sm-start">Field Name</label>
                            <div class="col-sm-8">
                                <input type="text" name="field_name" id="field_name"
                                    class="form-control form-control-sm">
                            </div>
                        </div>
                        <div class="row mb-2 align-items-center">
                            <label class="col-sm-4 r-text text-sm-start">Required?</label>
                            <div class="col-sm-8 d-flex align-items-center">
                                <input class="form-check-input mt-0 me-2 r-text" type="checkbox" value="1"
                                    name="is_required" aria-label="Checkbox for following text input"> Yes
                            </div>
                        </div>
                        <div class="row mb-2 align-items-center">
                            <label class="col-sm-4 r-text text-sm-start">Field Type</label>
                            <div class="col-sm-8">
                                <select name="input_type" id="input_type" class="form-select form-select-sm">
                                    <option value="">Select Field Type</option>
                                    <!-- <option value="button">button - clickable button</option> -->
                                    <option value="checkbox">checkbox - checkbox</option>
                                    <!-- <option value="color">color - color picker</option> -->
                                    <!-- <option value="date">date - date control</option> -->
                                    <!-- <option value="datetime-local">datetime-local - date and time control</option> -->
                                    <!-- <option value="email">email - field for an e-mail address</option> -->
                                    <option value="file">file - file-select field</option>
                                    <!-- <option value="hidden">hidden - hidden input field</option> -->
                                    <!-- <option value="image">image - image as submit button</option>
                                    <option value="month">month - month and year control</option>
                                    <option value="number">number - field for entering a number</option>
                                    <option value="password">password - password field</option> -->
                                    <option value="radio">radio - radio button</option>
                                    <!-- <option value="range">range - range control</option>
                                    <option value="reset">reset - reset button</option>
                                    <option value="search">search - text field for search</option>
                                    <option value="submit">submit - submit button</option>
                                    <option value="tel">tel - field for entering a telephone number</option> -->
                                    <option value="text">text - single-line text field</option>
                                    <!-- <option value="time">time - control for entering a time</option>
                                    <option value="url">url - field for entering a URL</option>
                                    <option value="week">week - week and year control</option> -->
                                </select>
                                <div class="error-message" id="error-field-type" style="color: red; font-size: 12px;">
                                </div>
                            </div>
                        </div>

                        <div class="row mb-2 align-items-center" id="dynamic-values" style="display: none;">
                            <label class="col-sm-4 r-text text-sm-start">Values</label>
                            <div class="col-sm-8" id="value-fields">
                                <div class="input-group mb-2">
                                    <input type="text" name="value_fields[]" class="form-control form-control-sm"
                                        placeholder="Enter value">
                                    <button type="button" class="btn btn-sm btn-danger remove-value-btn">Remove</button>
                                </div>
                                <button type="button" id="addValueBtn" class="btn btn-sm btn-primary">Add More</button>
                            </div>
                            <div class="error-message" id="error-value-field" style="color: red; font-size: 12px;">
                            </div>
                        </div>

                        <div class="row mb-2">
                            <div class="col-12 d-flex justify-content-end">
                                <input type="submit" value="Submit" class="submitButton">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 d-flex justify-content-end">
                                <div class="success-message" style="color: green; font-size: 12px;"></div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Right Column: Table -->
            <div class="col-md-7">
                <div class="d-flex flex-column justify-content-between p-2 rounded-2 shadow"
                    style="overflow:hidden; background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <span class="fw-bold text-start px-2 pt-2 pb-3" style="font-size:16px;">All Forms</span>
                    <div class="table-responsive">
                        <table class="referral-tbl table table-hover rounded-2" id="forms-table"
                            style="background-color: transparent !important;">
                            <thead style="border-bottom: 2px solid #dbe2e9;margin-bottom:15px !important;">
                                <tr>
                                    <th style="font-size:14px;width: 5%;text-align:start;">#</th>
                                    <th class="sortable" data-column="label_name"
                                        style="font-size:14px;width: 25%;text-align:start;cursor:pointer;user-select:none;">
                                        Label Name <i class="bi bi-arrow-down-up"
                                            style="font-size:12px;opacity:0.5;"></i>
                                    </th>
                                    <th class="sortable" data-column="is_hidden"
                                        style="font-size:14px;width: 10%;text-align:start;cursor:pointer;user-select:none;">
                                        Hidden <i class="bi bi-arrow-down-up" style="font-size:12px;opacity:0.5;"></i>
                                    </th>
                                    <th style="font-size:14px;width: 45%;text-align:start;">Form Details</th>
                                    <th style="font-size:14px;width: 15%;text-align:start;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="forms-tbody">
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="referral/js/errorLogger.js?v=<?php echo time(); ?>"></script>
    <script>
        const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
        const id_user = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        const staff_outlet =
            <?php echo json_encode(isset($staff_outlet) ? $staff_outlet : ''); ?>; //add staff_outlet in lock.php
        const staffPosition = <?php echo json_encode(isset($status_semasa) ? $status_semasa : ''); ?>;
        const referralPermission = <?php echo json_encode(isset($referral) ? (int)$referral : 2); ?>;
    </script>
    <script src="referral/js/admin.js?v=<?php echo time(); ?>"></script>

</body>

</html>