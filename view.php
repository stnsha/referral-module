<!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

    <!-- <link rel="stylesheet" media="screen" type="text/css" href="../common/css/layout.css" /> -->
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css" />
</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <div class="container text-center bg-white rounded p-2">
        <div class="col align-items-center">
            <span class="r-main-title">Referral #REF<?php echo str_pad($_GET['id'], 4, 0, STR_PAD_LEFT) ?></span>
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
                        <p class="r-text">Referring To<span style="color:red;">*</span></p>
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
                    </div>
                    <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Initial Referral</p>
                        <div class="mb-2">
                            <p class="r-text">Reason of Referral<span style="color:red;">*</span></p>
                            <textarea name="referral_reason" id="referral_reason" class="form-control form-control-sm"
                                rows="5" readonly></textarea>
                            <div class="error-message" id="error-referral-reason" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Details of Patient's Condition<span style="color:red;">*</span></p>
                            <textarea name="referral_condition" id="referral_condition"
                                class="form-control form-control-sm" rows="5" readonly></textarea>
                            <div class="error-message" id="error-referral-condition" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Relevant Medical History (if applicable)</p>
                            <textarea name="medical_history" id="medical_history" class="form-control form-control-sm"
                                rows="5" readonly></textarea>
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
                    </div>
                </div>
                <div class="col h-auto border rounded ms-2 p-2">
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

                    <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Attachments</p>
                        <input name="attachments[]" class="form-control mb-2" type="file" multiple id="attachmentInput">
                        <!--png/jpeg/jpg/pdf/word/excel-->

                        <div class="col m-4" id="attachmentPreview"></div>
                        <div class="col m-4" id="attachmentDisplay"></div>
                    </div>
                </div>
            </div>
            <div class="row align-items-start text-start py-2 px-4">
                <div class="col h-auto border rounded me-2 p-2 referring-indication">
                    <p class="r-title">Referring Indication</p>
                    <div class="mb-2">
                        <p class="r-text">Reason of Referral<span style="color:red;">*</span></p>
                        <textarea name="referral_reason_refer" id="referral_reason_refer"
                            class="form-control form-control-sm" rows="5" readonly></textarea>
                        <div class="error-message" id="error-referral-reason" style="color: red;font-size:12px;">
                        </div>
                    </div>
                    <div class="mb-2">
                        <p class="r-text">Details of Patient's Condition<span style="color:red;">*</span></p>
                        <textarea name="referral_condition_refer" id="referral_condition_refer"
                            class="form-control form-control-sm" rows="5" readonly></textarea>
                        <div class="error-message" id="error-referral-condition" style="color: red;font-size:12px;">
                        </div>
                    </div>
                    <div class="mb-2">
                        <p class="r-text">Relevant Medical History (if applicable)</p>
                        <textarea name="medical_history_refer" id="medical_history_refer"
                            class="form-control form-control-sm" rows="5" readonly></textarea>
                        <div class="error-message" id="error-medical-history" style="color: red;font-size:12px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row align-items-start text-start py-2 px-4">
                <div class="col h-auto border rounded me-2 p-2">
                    <form action="update.php" method="POST" id="referral-form" name="referral-form"
                        class="referral-view" onsubmit="validateForm(event)" enctype="multipart/form-data">
                        <input type="hidden" name="updated_recipient_to">
                        <input type="hidden" name="referral_id" value="<?php echo $_GET['id']  ?>" readonly>
                        <p class="r-title">Reply Form</p>
                        <div class="reply-form reply-content">
                            <!-- style="display:none;"-->
                        </div>
                        <!-- <div class="mb-2">
                            <p class="r-text">Additional Remarks</p>
                            <textarea name="additional_remarks" id="additional_remarks"
                                class="form-control form-control-sm" rows="5"></textarea>
                        </div> -->
                </div>
            </div>
            <div class="row align-items-start text-start py-2 px-4">
                <div class="col h-auto border rounded me-2 p-2">
                    <div class="d-flex align-items-center gap-2 py-2">
                        <span class="r-title" style="padding: 0;">Refer Another</span>
                        <input type="checkbox" name="refer_another" id="refer_another">
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
                                class="form-select form-select-sm text-capitalize" disabled>
                                <option value="">Location</option>
                            </select>
                            <div class="error-message text-danger small" id="error-refer-location"></div>
                        </div>

                        <div class="col">
                            <select name="refer_to" id="refer_to" class="form-select form-select-sm text-capitalize"
                                disabled>
                                <option value="">Assignee</option>
                            </select>
                            <div class="error-message text-danger small" id="error-refer-to"></div>
                        </div>
                    </div>

                    <div class="refer-form">
                        <div class="border-bottom pb-3 my-3">
                            <p class="r-title">Referring Indication</p>

                            <div class="mb-2">
                                <p class="r-text">Reason of Referral<span style="color:red;">*</span></p>
                                <textarea name="referral_reason" class="form-control form-control-sm"
                                    rows="5"></textarea>
                                <div class="error-message" id="error-referral-reason"
                                    style="color: red;font-size:12px;"></div>
                            </div>

                            <div class="mb-2">
                                <p class="r-text">Details of Patient's Condition<span style="color:red;">*</span></p>
                                <textarea name="referral_condition" class="form-control form-control-sm"
                                    rows="5"></textarea>
                                <div class="error-message" id="error-referral-condition"
                                    style="color: red;font-size:12px;"></div>
                            </div>

                            <div class="mb-2">
                                <p class="r-text">Relevant Medical History (if applicable)</p>
                                <textarea name="medical_history" class="form-control form-control-sm"
                                    rows="5"></textarea>
                                <div class="error-message" id="error-medical-history"
                                    style="color: red;font-size:12px;"></div>
                            </div>
                        </div>
                    </div>

                    <div class="mb-3 referral-status">
                        <span class="r-title">Status</span>
                        <div class="form-check">
                            <input class="form-check-input border" type="radio" name="status" id="statusOpen" value="1">
                            <label class="form-check-label r-text" for="statusOpen">Open</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input border" type="radio" name="status" id="statusProgress"
                                value="2">
                            <label class="form-check-label r-text" for="statusProgress">In Progress</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input border" type="radio" name="status" id="statusReferred"
                                value="3">
                            <label class="form-check-label r-text" for="statusReferred">Referred</label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input border" type="radio" name="status" id="statusClosed"
                                value="4">
                            <label class="form-check-label r-text" for="statusClosed">Closed</label>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2">
                        <input type="submit" value="Submit" class="btn btn-primary">
                        <a href="index.php" class="btn btn-secondary">Back</a>
                    </div>
                </div>
            </div>
            </form>
            <div class="row align-items-start text-start py-2 px-4">
                <div class="col h-auto border rounded me-2 p-2">
                    <p class="r-title">Referral History</p>
                    <div class="referral-history" id="referralHistoryContainer">
                        <!-- <button class="referral-accordion">Dr. Ong Seong Woo, Clinic A (Malaysia)</button>
                        <div class="referral-panel">
                            <span>heyyy</span>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script>
            const referral_id = <?php echo json_encode(isset($_GET['id']) ? $_GET['id'] : ''); ?>;
            const staffId = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        </script>
        <script src="js/view.js"></script>
</body>