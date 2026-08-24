<!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">

    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/style.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/toast.css?v=<?php echo time(); ?>" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <?php include('navbar.php'); ?>
    <div class="header" style="position: relative;">
        <b class="rtop"><b class="r1"></b><b class="r2"></b><b class="r3"></b><b class="r4"></b></b>
        <h1 class="headerH1"><img src='common/img/myreferral.png' width='20px'>Create New MyReferral</h1>
        <b class="rbottom"><b class="r4"></b><b class="r3"></b><b class="r2"></b><b class="r1"></b></b>
    </div>
    <div class="referral-container mb-3 text-center">
        <form action="referral/post.php" method="POST" id="referral-form" name="referral-form"
            onsubmit="validateForm(event)" enctype="multipart/form-data">
            <input type="hidden" name="consult_call_id" id="consult_call_id" value="">
            <input type="hidden" name="follow_up_id" id="follow_up_id" value="">
            <div class="row align-items-start text-start py-2 px-4">
                <div class="col h-auto border rounded me-2 p-2">
                    <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Referral Details</p>
                        <p class="r-text">Referred From<span style="color:red;">*</span></p>
                        <div class="row mb-2">
                            <div class="col" style="display:none;">
                                <select name="business_unit_from" id="business_unit_from"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Business Unit</option>
                                </select>
                                <input type="hidden" name="business_unit_id_from">

                                <div class="error-message" id="error-business-unit-from"
                                    style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col">
                                <select name="location_from" id="location_from"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Location</option>
                                </select>
                                <input type="hidden" name="location_id_from">
                                <div class="error-message" id="error-location-from" style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col" style="display: none;">
                                <select name="assignee_from" id="assignee_from"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Assignee</option>
                                    <div class="error-message" id="error-assignee-from"
                                        style="color: red;font-size:12px;">
                                    </div>
                                </select>
                                <input type="hidden" name="assignee_id_from"
                                    value="<?php echo isset($id_user) ? $id_user : ''; ?>">
                            </div>
                        </div>
                        <p class="r-text">Referring To<span style="color:red;">*</span></p>
                        <div class="row mb-2">
                            <div class="col">
                                <select name="business_unit_to" id="business_unit_to"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Business Unit</option>
                                </select>
                                <input type="hidden" name="business_unit_id_to">

                                <div class="error-message" id="error-business-unit-to"
                                    style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col">
                                <select name="location_to" id="location_to"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Location</option>
                                </select>
                                <div class="error-message" id="error-location-to" style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col" style="display:none;">
                                <select name="recipient_to" id="recipient_to"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Recipient (Optional)</option>
                                </select>
                                <div class="error-message" id="error-recipient-to" style="color: red;font-size:12px;">
                                </div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2 py-2">
                            <input type="checkbox" class="me-2" name="external_referral" id="external_referral">
                            <span class="r-text" style="padding: 0;">External Referral</span>
                        </div>
                    </div>
                    <div class="d-none border-bottom pb-3 mb-3 external-referral" id="external-referral">
                        <div class="d-flex align-items-center gap-2 pb-2">
                            <span class="r-title" style="padding: 0;">External Referral</span>
                        </div>
                        <div class="row mb-2 external-referral-content">
                            <div class="col">
                                <select name="organization" id="organization"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Organization</option>
                                </select>
                                <div class="error-message" id="error-organization" style="color: red;font-size:12px;">
                                </div>
                                <div class="mt-2">
                                    <button type="button" id="add-new-org-btn" class="btn btn-sm btn-outline-primary">+
                                        Add New Organization</button>
                                </div>
                            </div>
                            <div class="col">
                                <select name="referee" id="referee" class="form-select form-select-sm text-capitalize">
                                    <option value="">Recipient (Optional)</option>
                                </select>
                                <div class="error-message" id="error-referee" style="color: red;font-size:12px;">
                                </div>
                                <div class="mt-2">
                                    <button type="button" id="add-new-recipient-btn"
                                        class="btn btn-sm btn-outline-primary">+ Add New Recipient</button>
                                </div>
                            </div>
                        </div>
                        <!-- New Organization Form (Hidden by default) -->
                        <div id="new-organization-section" style="display: none;"
                            class="border rounded p-3 mb-3 bg-light">
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
                                <textarea name="new_org_address" id="new-org-address"
                                    class="form-control form-control-sm" rows="10"></textarea>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text">Postcode</p>
                                    <input type="text" name="new_org_postcode" id="new-org-postcode"
                                        class="form-control form-control-sm">
                                </div>
                                <div class="col">
                                    <p class="r-text">State</p>
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
                                <p class="r-text">Country</p>
                                <select name="new_org_country" id="new-org-country"
                                    class="form-control form-control-sm">
                                    <option value="Malaysia" selected>Malaysia</option>
                                </select>
                            </div>
                        </div>
                        <!-- New Recipient Form (Hidden by default) -->
                        <div id="new-recipient-section" style="display: none;" class="border rounded p-3 mb-3 bg-light">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <p class="r-text fw-bold mb-0">New Recipient Details</p>
                                <button type="button" id="cancel-new-recipient-btn"
                                    class="btn btn-sm btn-outline-secondary">Cancel</button>
                            </div>
                            <div class="mb-2">
                                <p class="r-text">Name<span style="color:red;">*</span></p>
                                <input type="text" name="new_recipient_name" id="new-recipient-name"
                                    class="form-control form-control-sm">
                                <div class="error-message" id="error-new-recipient-name"
                                    style="color: red;font-size:12px;"></div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text">Email</p>
                                    <input type="email" name="new_recipient_email" id="new-recipient-email"
                                        class="form-control form-control-sm">
                                    <div class="error-message" id="error-new-recipient-email"
                                        style="color: red;font-size:12px;"></div>
                                </div>
                                <div class="col">
                                    <p class="r-text">Phone<span style="color:red;">*</span></p>
                                    <input type="tel" name="new_recipient_phone" id="new-recipient-phone"
                                        class="form-control form-control-sm">
                                    <div class="error-message" id="error-new-recipient-phone"
                                        style="color: red;font-size:12px;"></div>
                                </div>
                            </div>
                            <div class="mb-2">
                                <p class="r-text">Position<span style="color:red;">*</span></p>
                                <input type="text" name="new_recipient_position" id="new-recipient-position"
                                    class="form-control form-control-sm">
                                <div class="error-message" id="error-new-recipient-position"
                                    style="color: red;font-size:12px;"></div>
                            </div>
                        </div>
                    </div>
                    <div class=" border-bottom pb-3 mb-3">
                        <p class="r-title">Customer Information</p>

                        <!-- Mode radios — always visible -->
                        <div class="mb-3">
                            <label class="me-3 r-text" style="display:inline-flex;align-items:center;">
                                <input type="radio" name="customer_mode" value="existing" style="margin-right:5px;"> Existing Customer
                            </label>
                            <label class="r-text" style="display:inline-flex;align-items:center;">
                                <input type="radio" name="customer_mode" value="new" style="margin-right:5px;"> New Customer
                            </label>
                        </div>

                        <!-- Customer form — hidden until mode is chosen -->
                        <div id="customer-form-section" style="display:none;">
                            <!-- ID type radios -->
                            <div class="mb-2">
                                <label class="me-3 r-text" style="display:inline-flex;align-items:center;">
                                    <input type="radio" name="id_type" value="nric" checked style="margin-right:5px;"> NRIC<span style="color:red;">*</span>
                                </label>
                                <label class="r-text" style="display:inline-flex;align-items:center;">
                                    <input type="radio" name="id_type" value="passport" style="margin-right:5px;"> Passport<span style="color:red;">*</span>
                                </label>
                            </div>

                            <!-- IC / Passport input with autocomplete -->
                            <div class="mb-2">
                                <div class="d-flex gap-2">
                                    <input type="hidden" name="customer_id">
                                    <div style="flex:1;position:relative;">
                                        <input type="text" name="customer_ic" id="customer_ic_input" class="form-control form-control-sm"
                                            placeholder="Enter NRIC or Passport number" autocomplete="off">
                                        <div id="customer-autocomplete-list" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:1050;background:#fff;border:1px solid #dee2e6;border-top:none;border-radius:0 0 4px 4px;max-height:220px;overflow-y:auto;box-shadow:0 4px 8px rgba(0,0,0,0.08);"></div>
                                    </div>
                                    <button type="button" id="clear-customer-btn" class="btn btn-sm btn-outline-danger" title="Clear customer information">Clear</button>
                                </div>
                                <div class="error-message" id="error-customer-ic" style="color:red;font-size:12px;"></div>
                                <div id="create-customer-link-container" style="display:none;margin-top:8px;">
                                    <a href="../customer/add.php" id="create-customer-link" class="btn btn-sm btn-primary" target="_blank">Create New Customer</a>
                                </div>
                            </div>

                            <!-- Customer detail fields -->
                            <div class="mb-2">
                                <p class="r-text">Name<span style="color:red;">*</span></p>
                                <input type="text" name="customer_name" class="form-control form-control-sm">
                                <div class="error-message" id="error-customer-name" style="color:red;font-size:12px;"></div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text">Phone No.<span style="color:red;">*</span></p>
                                    <input type="text" name="customer_phone" class="form-control form-control-sm">
                                    <div class="error-message" id="error-customer-phone" style="color:red;font-size:12px;"></div>
                                </div>
                                <div class="col">
                                    <p class="r-text">Email</p>
                                    <input type="text" name="customer_email" class="form-control form-control-sm">
                                    <div class="error-message" id="error-customer-email" style="color:red;font-size:12px;"></div>
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text">Age</p>
                                    <input type="text" name="customer_age" class="form-control form-control-sm">
                                    <div class="error-message" id="error-customer-age" style="color:red;font-size:12px;"></div>
                                </div>
                                <div class="col">
                                    <p class="r-text">Gender</p>
                                    <input type="text" name="customer_gender" class="form-control form-control-sm">
                                    <div class="error-message" id="error-customer-gender" style="color:red;font-size:12px;"></div>
                                </div>
                            </div>
                            <div class="mb-2">
                                <p class="r-text">Address<span style="color:red;">*</span></p>
                                <textarea name="customer_address" class="form-control form-control-sm" rows="3"></textarea>
                                <div class="error-message" id="error-customer-address" style="color:red;font-size:12px;"></div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text">Race<span style="color:red;">*</span></p>
                                    <select name="customer_race" id="customer_race" class="form-select form-select-sm">
                                        <option value="">Select Race</option>
                                        <option value="1">MALAY</option>
                                        <option value="2">CHINESE</option>
                                        <option value="3">INDIAN</option>
                                        <option value="4">SABAH ETHNIC</option>
                                        <option value="5">SARAWAK ETHNIC</option>
                                        <option value="6">OTHERS</option>
                                    </select>
                                    <div class="error-message" id="error-customer-race" style="color:red;font-size:12px;"></div>
                                </div>
                                <div class="col">
                                    <p class="r-text">Nationality<span style="color:red;">*</span></p>
                                    <select name="customer_nationality" id="customer_nationality" class="form-select form-select-sm">
                                        <option value="">Select Nationality</option>
                                        <option value="MALAYSIA">MALAYSIA</option>
                                        <option value="SINGAPORE">SINGAPORE</option>
                                        <option value="INDONESIA">INDONESIA</option>
                                        <option value="BRUNEI">BRUNEI</option>
                                        <option value="PHILIPPINES">PHILIPPINES</option>
                                        <option value="THAILAND">THAILAND</option>
                                    </select>
                                    <div class="error-message" id="error-customer-nationality" style="color:red;font-size:12px;"></div>
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col-6">
                                    <p class="r-text">Contact Method<span style="color:red;">*</span></p>
                                    <select name="contact_method" id="contact_method" class="form-select form-select-sm" required>
                                        <option value="0">Pick One</option>
                                        <option value="1" selected>Call & WhatsApp</option>
                                        <option value="2">Call Only</option>
                                        <option value="3">WhatsApp Only</option>
                                    </select>
                                    <div class="error-message" id="error-contact-method" style="color:red;font-size:12px;"></div>
                                </div>
                            </div>
                            <div id="save-customer-section" style="display:none;" class="mt-2">
                                <button type="button" id="save-customer-btn" class="btn btn-sm btn-success">Save Customer</button>
                                <div class="error-message" id="error-save-customer" style="color:red;font-size:12px;margin-top:4px;"></div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <p class="r-title">Attachments</p>
                            <input name="attachments[]" class="form-control mb-2 r-text" type="file" multiple
                                id="attachmentInput">
                            <!--png/jpeg/jpg/pdf/word/excel-->
                            <div class="col m-4" id="attachmentPreview"></div>
                        </div>
                    </div>
                </div>
                <div class="col h-auto border rounded ms-2 p-2">
                    <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Referring Indication</p>
                        <div class="mb-2">
                            <p class="r-text">Purpose of Referral<span style="color:red;">*</span></p>
                            <textarea name="referral_reason" id="referral_reason" class="form-control form-control-sm" rows="10"></textarea>
                            <div class="error-message" id="error-referral-reason" style="color: red;font-size:12px;">
                            </div>
                            <small class="form-text text-muted">
                                Only state the purpose of referral. <span style="color:red;font-weight:bold;">DO NOT</span> include greetings such as "Dear Doctor".
                            </small>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Details of Patient's Condition<span style="color:red;">*</span></p>
                            <textarea name="referral_condition" id="referral_condition" class="form-control form-control-sm"
                                rows="10"></textarea>
                            <div class="error-message" id="error-referral-condition" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Relevant Medical History (if applicable)</p>
                            <textarea name="medical_history" id="medical_history" class="form-control form-control-sm" rows="10"></textarea>
                            <div class="error-message" id="error-medical-history" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Priority <span style="color:red;">*</span></p>
                            <div class="referral-priority"></div>
                            <div class="error-message" id="error-priority" style="color: red;font-size:12px;">
                            </div>
                        </div>
                    </div>
                    <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Current/Past Treatments</p>

                        <div class="business-unit-1 content">
                            <!-- style="display:none;"-->
                            <p class="r-title">Alpro Audiology</p>
                        </div>
                        <div class="business-unit-2 content">
                            <!-- style="display:none;"-->
                            <p class="r-title">Alpro Baby</p>
                        </div>
                        <div class="business-unit-3 content">
                            <!-- style="display:none;"-->
                            <p class="r-title">Alpro Clinic</p>
                        </div>
                        <div class="business-unit-4 content">
                            <!-- style="display:none;"-->
                            <p class="r-title">Alpro Optisaver</p>
                        </div>
                        <div class="business-unit-5 content">
                            <!-- style="display:none;"-->
                            <p class="r-title">Alpro Pharmacy</p>
                        </div>
                        <div class="business-unit-6 content">
                            <!-- style="display:none;"-->
                            <p class="r-title">Alpro Physio</p>
                        </div>
                        <div class="business-unit-7 content">
                            <!-- style="display:none;"-->
                            <p class="r-title">Alpro Sugi</p>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Additional Remarks</p>
                            <textarea name="additional_remarks" id="additional_remarks"
                                class="form-control form-control-sm" rows="5"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row align-items-start text-start py-2 px-4">
                <div class="d-flex justify-content-center align-items-center">
                    <button type="submit" id="real-submit" style="display: none;"></button>
                    <input type="submit" value="Submit" class="btn-new-referral me-2">
                    <a href="referral/index.php" class="btn-referral">Back</a>
                </div>
            </div>
        </form>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script>
        const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
        const staffId = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        const staffPosition = <?php echo json_encode(isset($status_semasa) ? $status_semasa : ''); ?>;
        const referralPermission = <?php echo json_encode(isset($referral) ? (int)$referral : 0); ?>;
        const staffOutlet = <?php echo json_encode(isset($outlet) ? $outlet : ''); ?>;
        const staffBusinessUnitId = <?php echo json_encode(isset($businessUnitId) ? (int)$businessUnitId : null); ?>;
    </script>
    <script src="referral/js/toast.js?v=<?php echo time(); ?>"></script>
    <script src="referral/js/errorLogger.js?v=<?php echo time(); ?>"></script>
    <script src="referral/js/create.js?v=<?php echo time(); ?>"></script>


</body>