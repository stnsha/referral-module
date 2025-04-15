<!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <link rel="stylesheet" media="screen" type="text/css" href="../common/css/layout.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css" />

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body>
    <div class="container text-center bg-white rounded p-2">
        <p class="r-main-title">New Referral</p>
        <form action="" id="referral-form">
            <div class="row align-items-start text-start p-4">
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
                            </div>
                            <div class="col">
                                <select name="assignee_from" id="assignee_from"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Assignee</option>
                                </select>
                            </div>
                            <div class="col">
                                <select name="location_from" id="location_from"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Location</option>
                                </select>
                            </div>
                        </div>
                        <p class="r-text">Referring To<span style="color:red;">*</span></p>
                        <div class="row mb-2">
                            <div class="col">
                                <select name="business_unit_to" id="business_unit_to"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Business Unit</option>
                                </select>
                            </div>
                            <div class="col">
                                <select name="recipient_to" id="recipient_to"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Recipient</option>
                                </select>
                            </div>
                            <div class="col">
                                <select name="location_to" id="location_to"
                                    class="form-select form-select-sm text-capitalize">
                                    <option value="">Location</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Referring Indication</p>
                        <div class="mb-2">
                            <p class="r-text">Reason of Referral<span style="color:red;">*</span></p>
                            <input type="referral_reason" class="form-control form-control-sm" required>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Details of Patient's Condition<span style="color:red;">*</span></p>
                            <textarea name="referral_condition" class="form-control form-control-sm" rows="5"
                                required></textarea>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Relevant Medical History (if applicable)</p>
                            <textarea class="form-control form-control-sm" rows="5"></textarea>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Priority <span style="color:red;">*</span></p>

                            <div class="form-check">
                                <input class="form-check-input border" type="radio" name="priority">
                                <label class="form-check-label r-text">
                                    High (1 to 2 working days)
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input border" type="radio" name="priority" checked>
                                <label class="form-check-label r-text">
                                    Standard (3 to 5 working days)
                                </label>
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
                                <input type="text" name="customer_ic" class="form-control form-control-sm" required>
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
                            <input type="text" name="customer_name" class="form-control form-control-sm" required>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <p class="r-text">Phone No.<span style="color:red;">*</span></p>
                                <input type="text" name="customer_phone" class="form-control form-control-sm" required>
                            </div>
                            <div class="col">
                                <p class="r-text">Email</p>
                                <input type="text" name="customer_email" class="form-control form-control-sm">
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <p class="r-text">Age</p>
                                <input type="text" name="customer_age" class="form-control form-control-sm" required>
                            </div>
                            <div class="col">
                                <p class="r-text">Gender</p>
                                <input type="text" name="customer_gender" class="form-control form-control-sm" required>
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Address<span style="color:red;">*</span></p>
                            <textarea name="customer_address" class="form-control form-control-sm" rows="3"
                                required></textarea>
                        </div>
                    </div>
                    <div class="border-bottom pb-3 mb-3">
                        <p class="r-title">Attachments</p>
                        <input class="form-control mb-2" type="file" multiple>
                        <!--png/jpeg/jpg/pdf/word/excel-->
                        <div class="col m-4">
                            <div class="col mb-2">
                                <img src="img/document.png" alt="" style="width: 25px;">
                                <span class="r-text">prescription.png</span>
                            </div>
                            <div class="col mb-2">
                                <img src="img/document.png" alt="" style="width: 25px;">
                                <span class="r-text">prescription.pdf</span>
                            </div>
                            <div class="col mb-2">
                                <img src="img/document.png" alt="" style="width: 25px;">
                                <span class="r-text">prescription.xlsx</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-column justify-content-center align-items-center">
                <input type="submit" value="Submit" class="submitButton">
                <a href="index.php" class="btn-back">Back</a>
            </div>
        </form>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script>
            const department = <?php echo json_encode(isset($department) ? $department : ''); ?>;
            const id_user = <?php echo json_encode(isset($id_user) ? $id_user : ''); ?>;
            const staff_outlet =
                <?php echo json_encode(isset($staff_outlet) ? $staff_outlet : ''); ?>; //add staff_outlet in lock_adv.php
        </script>
        <script src="js/app.js"></script>


</body>