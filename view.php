<!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

    <!-- <link rel="stylesheet" media="screen" type="text/css" href="common/css/layout.css" /> -->
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/style.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/css/toast.css?v=<?php echo time(); ?>" />
</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
// echo $businessUnitId;
?>

<body>
    <?php include('navbar.php'); ?>
    <div class="referral-container mb-3 text-center">
        <div class="col align-items-center">
            <span class="r-main-title text-start px-3">MyReferral
                #REF<?php echo str_pad($_GET['id'], 4, 0, STR_PAD_LEFT) ?></span>
        </div>
        <div class="referral-show">
            <div class="row align-items-start text-start py-2 px-4">
                <div class="col h-auto border rounded me-2 p-2">
                    <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Referral Details</p>
                        <p class="r-text">Referred From<span style="color:red;">*</span></p>
                        <div class="row mb-2">
                            <div class="col">
                                <input type="text" name="business_unit_from" id="business_unit_from"
                                    class="form-control form-control-sm text-capitalize" readonly>
                                <div class="error-message" id="error-business-unit-from"
                                    style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col">
                                <input type="text" name="location_from" id="location_from"
                                    class="form-control form-control-sm text-capitalize" readonly>
                                <div class="error-message" id="error-location-from" style="color: red;font-size:12px;">
                                </div>
                            </div>

                            <div class="col">
                                <input type="text" name="assignee_from" id="assignee_from"
                                    class="form-control form-control-sm text-capitalize" readonly>
                                <div class="error-message" id="error-assignee-from" style="color: red;font-size:12px;">
                                </div>
                            </div>
                        </div>
                        <p class="r-text referring-to" id="referring-to">Referring To<span style=" color:red;">*</span>
                        </p>
                        <p class="r-text external-referral-text" id="external-referral-text">External Referral<span
                                style="color:red;">*</span></p>
                        <div class="row mb-2">
                            <div class="col">
                                <!-- <select name="business_unit_to" id="business_unit_to"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Business Unit</option>
                                </select> -->
                                <input type="text" name="business_unit_to" id="business_unit_to"
                                    class="form-control form-control-sm text-capitalize" readonly>
                                <div class="error-message" id="error-business-unit-to"
                                    style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col">
                                <p class="r-text" id="location-to-label" style="display:none;">Location<span
                                        style="color:red;">*</span></p>
                                <!-- <select name="location_to" id="location_to"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Location</option>
                                </select> -->
                                <input type="text" name="location_to" id="location_to"
                                    class="form-control form-control-sm text-capitalize" readonly>
                                <div class="error-message" id="error-location-to" style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col">
                                <!-- <select name="recipient_to_s" id="recipient_to_s"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Recipient</option>
                                </select> -->
                                <input type="text" name="recipient_to" id="recipient_to"
                                    class="form-control form-control-sm text-capitalize" readonly>
                                <div class="error-message" id="error-recipient-to" style="color: red;font-size:12px;">
                                </div>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <input type="text" name="organization" id="organization"
                                    class="form-control form-control-sm text-capitalize" readonly>
                                <div class="error-message" id="error-organization" style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col">
                                <input type="text" name="location_organization" id="location_organization"
                                    class="form-control form-control-sm text-capitalize" readonly>
                                <div class="error-message" id="error-location-organization"
                                    style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col">
                                <input type="text" name="referee" id="referee"
                                    class="form-control form-control-sm text-capitalize" readonly>
                                <div class="error-message" id="error-referee" style="color: red;font-size:12px;">
                                </div>
                            </div>
                        </div>
                        <!-- Takeover Button -->
                        <div class="row mb-2" id="takeover-button-container" style="display: none;">
                            <div class="col">
                                <button type="button" id="takeover-referral-btn" class="btn btn-primary btn-sm">
                                    Takeover Referral
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Customer Information</p>
                        <div class="d-flex mb-2">
                            <div class="me-2">
                                <p class="r-text">I/C No.<span style="color:red;">*</span></p>
                                <input type="hidden" name="customer_id" id="customer_id" readonly>
                                <input type="text" name="customer_ic" id="customer_ic"
                                    class="form-control form-control-sm" readonly>
                                <div class="error-message" id="error-customer-ic" style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <!-- <div class="text-center align-self-end w-auto">
                                <span class="r-text">or</span>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <p class="r-text">Alpro VIP Number</p>
                                <input type="text" name="" class="form-control form-control-sm" readonly>
                            </div> -->
                        </div>
                        <!-- <div class="mb-2">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="">
                                <label class="form-check-label r-text">
                                    New Customer/Patient?
                                </label>
                            </div>
                        </div> -->
                        <div class="mb-2">
                            <p class="r-text">Name<span style="color:red;">*</span></p>
                            <input type="text" name="customer_name" id="customer_name"
                                class="form-control form-control-sm" readonly>
                            <div class="error-message" id="error-customer-name" style="color: red;font-size:12px;">
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text">Phone No.<span style="color:red;">*</span></p>
                                    <input type="text" name="customer_phone" id="customer_phone"
                                        class="form-control form-control-sm" readonly>
                                    <div class="error-message" id="error-customer-phone"
                                        style="color: red;font-size:12px;">
                                    </div>
                                </div>
                                <div class="col">
                                    <p class="r-text">Email</p>
                                    <input type="text" name="customer_email" id="customer_email"
                                        class="form-control form-control-sm" readonly>
                                    <div class="error-message" id="error-customer-email"
                                        style="color: red;font-size:12px;">
                                    </div>
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text">Age</p>
                                    <input type="text" name="customer_age" id="customer_age"
                                        class="form-control form-control-sm" readonly>
                                    <div class="error-message" id="error-customer-age"
                                        style="color: red;font-size:12px;">
                                    </div>
                                </div>
                                <div class="col">
                                    <p class="r-text">Gender</p>
                                    <input type="text" name="customer_gender" id="customer_gender"
                                        class="form-control form-control-sm" readonly>
                                    <div class="error-message" id="error-customer-gender"
                                        style="color: red;font-size:12px;"></div>
                                </div>
                            </div>
                            <div class="mb-2">
                                <p class="r-text">Address<span style="color:red;">*</span></p>
                                <textarea name="customer_address" id="customer_address"
                                    class="form-control form-control-sm" rows="3" readonly></textarea>
                                <div class="error-message" id="error-customer-address"
                                    style="color: red;font-size:12px;">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="border-bottom pb-3 mb-3 attachment-container">
                        <p class="r-title">Attachments</p>
                        <input name="attachments[]" class="form-control mb-2 attachment-input r-text" type="file"
                            multiple id="attachmentInput">
                        <!--png/jpeg/jpg/pdf/word/excel-->

                        <div class="col my-4" id="attachmentPreview"></div>
                        <div class="col my-4" id="attachmentDisplay"></div>
                    </div>
                </div>
                <div class="col h-auto border rounded ms-2 p-2">
                    <p class="r-title">Referral History</p>
                    <div class="referral-history" id="referralHistoryContainer">
                        <!-- <button class="referral-accordion">Dr. Ong Seong Woo, Clinic A (Malaysia)</button>
                        <div class="referral-panel">
                            <span>heyyy</span>
                        </div> -->
                    </div>
                    <!-- tukar to referral history slide -->
                    <!-- <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Initial Referral</p>
                        <div class="mb-2">
                            <p class="r-text">Purpose of Referral<span style="color:red;">*</span></p>
                            <textarea name="referral_reason" id="referral_reason" class="form-control form-control-sm"
                                rows="10" readonly></textarea>
                            <div class="error-message" id="error-referral-reason" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Details of Patient's Condition<span style="color:red;">*</span></p>
                            <textarea name="referral_condition" id="referral_condition"
                                class="form-control form-control-sm" rows="10" readonly></textarea>
                            <div class="error-message" id="error-referral-condition" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Relevant Medical History (if applicable)</p>
                            <textarea name="medical_history" id="medical_history" class="form-control form-control-sm"
                                rows="10" readonly></textarea>
                            <div class="error-message" id="error-medical-history" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Priority <span style="color:red;">*</span></p>

                            <div class="form-check">
                                <input class="form-check-input border" type="radio" name="priority" value="1">
                                <label class="form-check-label r-text">
                                    High (1 to 2 working days)
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input border" type="radio" name="priority" value="2" checked>
                                <label class="form-check-label r-text">
                                    Standard (3 to 5 working days)
                                </label>
                            </div>
                            <div class="error-message" id="error-priority" style="color: red;font-size:12px;">
                            </div>
                        </div>
                    </div> -->
                </div>
            </div>
            <!-- <div class="row align-items-start text-start py-2 px-4 referring-indication-container">
                <div class="col h-auto border rounded me-2 p-2 referring-indication">
                    <p class="r-title">Referring Indication</p>
                    <div class="mb-2">
                        <p class="r-text">Purpose of Referral<span style="color:red;">*</span></p>
                        <textarea name="referral_reason_refer" id="referral_reason_refer"
                            class="form-control form-control-sm" rows="10" readonly></textarea>
                        <div class="error-message" id="error-referral-reason" style="color: red;font-size:12px;">
                        </div>
                    </div>
                    <div class="mb-2">
                        <p class="r-text">Details of Patient's Condition<span style="color:red;">*</span></p>
                        <textarea name="referral_condition_refer" id="referral_condition_refer"
                            class="form-control form-control-sm" rows="10" readonly></textarea>
                        <div class="error-message" id="error-referral-condition" style="color: red;font-size:12px;">
                        </div>
                    </div>
                    <div class="mb-2">
                        <p class="r-text">Relevant Medical History (if applicable)</p>
                        <textarea name="medical_history_refer" id="medical_history_refer"
                            class="form-control form-control-sm" rows="10" readonly></textarea>
                        <div class="error-message" id="error-medical-history" style="color: red;font-size:12px;">
                        </div>
                    </div>
                </div>
            </div> -->

            <form action="referral/update.php" method="POST" id="referral-form" name="referral-form"
                class="referral-view" onsubmit="validateForm(event)" enctype="multipart/form-data">
                <input type="hidden" name="updated_recipient_to" id="updated_recipient_to">
                <input type="hidden" name="referral_id" value="<?php echo $_GET['id']  ?>" readonly>
                <div class="row align-items-start text-start py-2 px-4 reply-form-container">
                    <div class="col h-auto border rounded me-2 p-2">
                        <p class="r-title">Reply Form</p>
                        <div class="reply-form reply-content">
                            <!-- style="display:none;"-->
                        </div>
                        <!-- <div class="mb-2">
                            <p class="r-text">Additional Remarks</p>
                            <textarea name="additional_remarks" id="additional_remarks"
                                class="form-control form-control-sm" rows="10"></textarea>
                        </div> -->
                    </div>
                </div>
                <div class="row align-items-start text-start py-2 px-4">
                    <div class="col h-auto border rounded me-2 p-2">
                        <div class="refer-another-container">
                            <div class="py-2">
                                <label class="r-title" style="display: inline-flex; align-items: center; padding: 0;">
                                    Refer Another
                                    <input type="checkbox" name="refer_another" id="refer_another"
                                        style="margin-left: 8px;">
                                </label>
                            </div>

                            <div class="row mb-2 refer-another">
                                <div class="col">
                                    <select name="refer_business_unit" id="refer_business_unit"
                                        class="form-select form-select-sm text-capitalize" disabled>
                                        <option value="">Business Unit</option>
                                    </select>
                                    <input type="hidden" name="refer_business_unit_id">

                                    <div class="error-message text-danger small" id="error-refer-business-unit"></div>
                                </div>

                                <div class="col">
                                    <select name="refer_location" id="refer_location"
                                        class="form-select form-select-sm text-capitalize" disabled required>
                                        <option value="">Location</option>
                                    </select>
                                    <div class="error-message text-danger small" id="error-refer-location"></div>
                                </div>

                            </div>

                            <div class="d-flex align-items-center gap-2 py-2" style="display: none;"
                                id="external-referral-checkbox-container">
                                <input type="checkbox" class="me-2" name="refer_external_referral"
                                    id="refer_external_referral" disabled>
                                <span class="r-text" style="padding: 0;">External Referral</span>
                            </div>

                            <div class="d-none border-bottom pb-3 mb-3" id="refer-external-referral-section">
                                <div class="d-flex align-items-center gap-2 pb-2">
                                    <span class="r-title" style="padding: 0;">External Referral</span>
                                </div>
                                <div class="row mb-2">
                                    <div class="col">
                                        <select name="refer_organization" id="refer_organization"
                                            class="form-select form-select-sm text-capitalize">
                                            <option value="">Organization</option>
                                        </select>
                                        <div class="error-message" id="error-refer-organization"
                                            style="color: red;font-size:12px;">
                                        </div>
                                        <div class="mt-2">
                                            <button type="button" id="refer-add-new-org-btn"
                                                class="btn btn-sm btn-outline-primary">+ Add New Organization</button>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <select name="refer_referee" id="refer_referee"
                                            class="form-select form-select-sm text-capitalize">
                                            <option value="">Recipient (Optional)</option>
                                        </select>
                                        <div class="error-message" id="error-refer-referee"
                                            style="color: red;font-size:12px;">
                                        </div>
                                        <div class="mt-2">
                                            <button type="button" id="refer-add-new-recipient-btn"
                                                class="btn btn-sm btn-outline-primary" disabled>+ Add New
                                                Recipient</button>
                                        </div>
                                    </div>
                                </div>
                                <!-- New Organization Form (Hidden by default) -->
                                <div id="refer-new-organization-section" style="display: none;"
                                    class="border rounded p-3 mb-3 bg-light">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <p class="r-text fw-bold mb-0">New Organization Details</p>
                                        <button type="button" id="refer-cancel-new-org-btn"
                                            class="btn btn-sm btn-outline-secondary">Cancel</button>
                                    </div>
                                    <div class="mb-2">
                                        <p class="r-text">Organization Name<span style="color:red;">*</span></p>
                                        <input type="text" name="refer_new_org_name" id="refer-new-org-name"
                                            class="form-control form-control-sm">
                                        <div class="error-message" id="error-refer-new-org-name"
                                            style="color: red;font-size:12px;"></div>
                                    </div>
                                    <div class="mb-2">
                                        <p class="r-text">Address</p>
                                        <textarea name="refer_new_org_address" id="refer-new-org-address"
                                            class="form-control form-control-sm" rows="10"></textarea>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col">
                                            <p class="r-text">Postcode</p>
                                            <input type="text" name="refer_new_org_postcode" id="refer-new-org-postcode"
                                                class="form-control form-control-sm">
                                        </div>
                                        <div class="col">
                                            <p class="r-text">State</p>
                                            <select name="refer_new_org_state" id="refer-new-org-state"
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
                                        <select name="refer_new_org_country" id="refer-new-org-country"
                                            class="form-control form-control-sm">
                                            <option value="Malaysia" selected>Malaysia</option>
                                        </select>
                                    </div>
                                </div>
                                <!-- New Recipient Form (Hidden by default) -->
                                <div id="refer-new-recipient-section" style="display: none;"
                                    class="border rounded p-3 mb-3 bg-light">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <p class="r-text fw-bold mb-0">New Recipient Details</p>
                                        <button type="button" id="refer-cancel-new-recipient-btn"
                                            class="btn btn-sm btn-outline-secondary">Cancel</button>
                                    </div>
                                    <div class="mb-2">
                                        <p class="r-text">Name<span style="color:red;">*</span></p>
                                        <input type="text" name="refer_new_recipient_name" id="refer-new-recipient-name"
                                            class="form-control form-control-sm">
                                        <div class="error-message" id="error-refer-new-recipient-name"
                                            style="color: red;font-size:12px;"></div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col">
                                            <p class="r-text">Email</p>
                                            <input type="email" name="refer_new_recipient_email"
                                                id="refer-new-recipient-email" class="form-control form-control-sm">
                                            <div class="error-message" id="error-refer-new-recipient-email"
                                                style="color: red;font-size:12px;"></div>
                                        </div>
                                        <div class="col">
                                            <p class="r-text">Phone<span style="color:red;">*</span></p>
                                            <input type="tel" name="refer_new_recipient_phone"
                                                id="refer-new-recipient-phone" class="form-control form-control-sm">
                                            <div class="error-message" id="error-refer-new-recipient-phone"
                                                style="color: red;font-size:12px;"></div>
                                        </div>
                                    </div>
                                    <div class="mb-2">
                                        <p class="r-text">Position<span style="color:red;">*</span></p>
                                        <input type="text" name="refer_new_recipient_position"
                                            id="refer-new-recipient-position" class="form-control form-control-sm">
                                        <div class="error-message" id="error-refer-new-recipient-position"
                                            style="color: red;font-size:12px;"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="refer-form" style="display: none;">
                                <div class="border-bottom pb-3 my-3">
                                    <p class="r-title">Referring Indication</p>

                                    <div class="mb-2">
                                        <p class="r-text">Purpose of Referral<span style="color:red;">*</span></p>
                                        <textarea name="referral_reason" class="form-control form-control-sm"
                                            rows="10"></textarea>
                                        <div class="error-message" id="error-referral-reason"
                                            style="color: red;font-size:12px;"></div>
                                    </div>

                                    <div class="mb-2">
                                        <p class="r-text">Details of Patient's Condition<span
                                                style="color:red;">*</span>
                                        </p>
                                        <textarea name="referral_condition" class="form-control form-control-sm"
                                            rows="10"></textarea>
                                        <div class="error-message" id="error-referral-condition"
                                            style="color: red;font-size:12px;"></div>
                                    </div>

                                    <div class="mb-2">
                                        <p class="r-text">Relevant Medical History (if applicable)</p>
                                        <textarea name="medical_history" class="form-control form-control-sm"
                                            rows="10"></textarea>
                                        <div class="error-message" id="error-medical-history"
                                            style="color: red;font-size:12px;"></div>
                                    </div>

                                    <div class="mb-2">
                                        <p class="r-text">Priority <span style="color:red;">*</span></p>
                                        <div class="referral-priority"></div>
                                        <div class="error-message" id="error-priority"
                                            style="color: red;font-size:12px;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3 referral-status">
                            <span class="r-title">Status</span>
                            <div id="status-options">
                                <!-- Status options will be loaded dynamically -->
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 form-button">
                            <input type="submit" value="Submit" class="btn-new-referral form-btn-submit">
                            <a href="referral/index.php" class="btn-referral">Back</a>
                        </div>
                    </div>
                </div>
            </form>
            <!-- <div class="row align-items-start text-start py-2 px-4">
                <div class="col h-auto border rounded me-2 p-2">
                    <p class="r-title">Referral History</p>
                    <div class="referral-history" id="referralHistoryContainer">
                        <button class="referral-accordion">Dr. Ong Seong Woo, Clinic A (Malaysia)</button>
                        <div class="referral-panel">
                            <span>heyyy</span>
                        </div>
                    </div>
                </div>
            </div> -->
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
        <script>
        const referral_id = <?php echo json_encode(isset($_GET['id']) ? $_GET['id'] : ''); ?>;
        const staffId = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
        const businessUnitId = <?php echo json_encode(isset($businessUnitId) ? $businessUnitId : ''); ?>;
        const staffOutlet = <?php echo json_encode(isset($outlet) ? $outlet : ''); ?>;
        const viewOnly = <?php echo json_encode(isset($_GET['view_only']) ? $_GET['view_only'] : null); ?>;
        const referralPermission = <?php echo json_encode(isset($referral) ? (int)$referral : 2); ?>;
        </script>
        <script src="referral/js/toast.js?v=<?php echo time(); ?>"></script>
        <script src="referral/js/errorLogger.js?v=<?php echo time(); ?>"></script>
        <script src="referral/js/view.js?v=<?php echo time(); ?>"></script>
</body>