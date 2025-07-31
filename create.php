<!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">

    <!-- <link rel="stylesheet" media="screen" type="text/css" href="../common/css/layout.css" /> -->
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css" />
</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <div class="text-center bg-white rounded p-2">
        <p class="r-main-title">New Referral</p>
        <form action="post.php" method="POST" id="referral-form" name="referral-form" onsubmit="validateForm(event)"
            enctype="multipart/form-data">
            <div class="row align-items-start text-start py-2 px-4">
                <div class="col h-auto border rounded me-2 p-2">
                    <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Referral Details</p>
                        <p class="r-text">Referred From<span style="color:red;">*</span></p>
                        <div class="row mb-2">
                            <div class="col">
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
                            <div class="col">
                                <select name="assignee_from" id="assignee_from"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Assignee</option>
                                    <div class="error-message" id="error-assignee-from"
                                        style="color: red;font-size:12px;">
                                    </div>
                                </select>
                                <input type="hidden" name="assignee_id_from">
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
                            <div class="col">
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
                            </div>
                            <div class="col">
                                <select name="location_organization" id="location_organization"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Location</option>
                                </select>
                                <div class="error-message" id="error-location-organization"
                                    style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col">
                                <select name="referee" id="referee" class="form-select form-select-sm text-capitalize">
                                    <option value="">Recipient</option>
                                </select>
                                <div class="error-message" id="error-referee" style="color: red;font-size:12px;">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class=" border-bottom pb-3 mb-3">
                        <p class="r-title">Customer Information</p>
                        <div class="d-flex mb-2">
                            <div class="me-2">
                                <p class="r-text">I/C No.<span style="color:red;">*</span></p>
                                <input type="hidden" name="customer_id">
                                <input type="text" name="customer_ic" class="form-control form-control-sm">
                                <div class="error-message" id="error-customer-ic" style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <!-- <div class="text-center align-self-end w-auto">
                                <span class="r-text">or</span>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <p class="r-text">Alpro VIP Number</p>
                                <input type="text" name="" class="form-control form-control-sm">
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
                            <input type="text" name="customer_name" class="form-control form-control-sm">
                            <div class="error-message" id="error-customer-name" style="color: red;font-size:12px;">
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text">Phone No.<span style="color:red;">*</span></p>
                                    <input type="text" name="customer_phone" class="form-control form-control-sm">
                                    <div class="error-message" id="error-customer-phone"
                                        style="color: red;font-size:12px;"></div>
                                </div>
                                <div class="col">
                                    <p class="r-text">Email</p>
                                    <input type="text" name="customer_email" class="form-control form-control-sm">
                                    <div class="error-message" id="error-customer-email"
                                        style="color: red;font-size:12px;"></div>
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <p class="r-text">Age</p>
                                    <input type="text" name="customer_age" class="form-control form-control-sm">
                                    <div class="error-message" id="error-customer-age"
                                        style="color: red;font-size:12px;"></div>
                                </div>
                                <div class="col">
                                    <p class="r-text">Gender</p>
                                    <input type="text" name="customer_gender" class="form-control form-control-sm">
                                    <div class="error-message" id="error-customer-gender"
                                        style="color: red;font-size:12px;"></div>
                                </div>
                            </div>
                            <div class="mb-2">
                                <p class="r-text">Address<span style="color:red;">*</span></p>
                                <textarea name="customer_address" class="form-control form-control-sm"
                                    rows="3"></textarea>
                                <div class="error-message" id="error-customer-address"
                                    style="color: red;font-size:12px;"></div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <p class="r-title">Attachments</p>
                            <input name="attachments[]" class="form-control mb-2" type="file" multiple
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
                            <p class="r-text">Reason of Referral<span style="color:red;">*</span></p>
                            <textarea name="referral_reason" class="form-control form-control-sm" rows="5"></textarea>
                            <div class="error-message" id="error-referral-reason" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Details of Patient's Condition<span style="color:red;">*</span></p>
                            <textarea name="referral_condition" class="form-control form-control-sm"
                                rows="5"></textarea>
                            <div class="error-message" id="error-referral-condition" style="color: red;font-size:12px;">
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Relevant Medical History (if applicable)</p>
                            <textarea name="medical_history" class="form-control form-control-sm" rows="5"></textarea>
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
                <!-- <div class="col h-auto border rounded me-2 p-2">
                    <p class="r-title">Current/Past Treatments</p>

                    <div class="business-unit-1 content">
                        <p class="r-title">Alpro Audiology</p>
                    </div>
                    <div class="business-unit-2 content">
                        <p class="r-title">Alpro Baby</p>
                    </div>
                    <div class="business-unit-3 content">
                        <p class="r-title">Alpro Clinic</p>
                    </div>
                    <div class="business-unit-4 content">
                        <p class="r-title">Alpro Optisaver</p>
                    </div>
                    <div class="business-unit-5 content">
                        <p class="r-title">Alpro Pharmacy</p>
                    </div>
                    <div class="business-unit-6 content">
                        <p class="r-title">Alpro Physio</p>
                    </div>
                    <div class="business-unit-7 content">
                        <p class="r-title">Alpro Sugi</p>
                    </div>
                    <div class="mb-2">
                        <p class="r-text">Additional Remarks</p>
                        <textarea name="additional_remarks" id="additional_remarks" class="form-control form-control-sm"
                            rows="5"></textarea>
                    </div>
                </div> -->
            </div>
            <div class="row align-items-start text-start py-2 px-4">
                <div class="d-flex justify-content-center align-items-center">
                    <button type="submit" id="real-submit" style="display: none;"></button>
                    <input type="submit" value="Submit" class="btn-new-referral me-2">
                    <a href="index.php" class="btn-referral">Back</a>
                </div>
            </div>
        </form>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script>
            const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
            const staffId = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
        </script>
        <script src="js/errorLogger.js"></script>
        <script src="js/app.js"></script>


</body>