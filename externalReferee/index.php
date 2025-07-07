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
?>

<body>
    <div class="container text-center bg-white rounded p-2">
        <p class="r-main-title">External Referees</p>
        <form action="referral/externalReferee/post.php" method="POST" id="externalRefereeForm"
            name="externalRefereeForm" onsubmit="validateForm(event)">
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
                                <p class="r-text">Email<span style="color:red;">*</span></p>
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
                                <input type="text" name="organization" class="form-control form-control-sm">
                                <div class="error-message" id="error-organization" style="color: red;font-size:12px;">
                                </div>
                            </div>
                            <div class="col">
                                <p class="r-text">Position<span style="color:red;">*</span></p>
                                <input type="text" name="position" class="form-control form-control-sm">
                                <div class="error-message" id="error-position" style="color: red;font-size:12px;"></div>
                            </div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Specialty<span style="color:red;">*</span></p>
                            <input type="text" name="specialty" class="form-control form-control-sm">
                            <div class="error-message" id="error-specialty" style="color: red;font-size:12px;"></div>
                        </div>
                        <div class="mb-2">
                            <p class="r-text">Address<span style="color:red;">*</span></p>
                            <textarea name="address" class="form-control form-control-sm" rows="3"></textarea>
                            <div class="error-message" id="error-address" style="color: red;font-size:12px;"></div>
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
    <script src="referral/externalReferee/js/index.js"></script>
</body>

</html>