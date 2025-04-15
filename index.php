<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <link rel="stylesheet" media="screen" type="text/css" href="../common/css/layout.css" />
    <style>
        .referral-container {
            display: flex;
            flex-direction: column;
            padding: 15px 25px 35px 15px;
            background-color: white;
            border-radius: 8px;
        }

        .referral_header {
            /* background-color: #DBE5EE; */
            padding-top: 2px;
            padding-bottom: 2px;
            border-radius: 10px;
        }

        .referral_h1 {
            color: black;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
        }

        .main-container {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            padding: 15px;
        }

        .referral-container {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }

        .btn-referral {
            text-decoration: none;
            background-color: gray;
            color: black;
            padding: 10px 5px 10px 5px;
            border-radius: 8px;
        }

        .referral-filter {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            padding-top: 10px;
            padding-bottom: 10px;
        }

        .referral-select {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            gap: 20px;
        }

        select {
            border: 0px solid white;
            border-radius: 5px;
            padding: 10px 5px 10px 5px;
        }

        .referral-id {
            border-radius: 5px;
            font-size: 14px;
        }
    </style>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

</head>
<?php
require_once('../lock_adv.php');
$connect = 1;
include('../common/index_adv.php');
?>

<body class="referral-body">
    <div class="referral-container">
        <div class="referral_header">
            <h1 class="referral_h1">
                <img src="referral.png" width="30px" style="padding-right:5px;" /> Referral
            </h1>
        </div>
        <div class="main-container">
            <a href="create.php" type="button" class="btn-referral">New Referral</a>
            <div class="referral-filter">
                <p style="padding-right:15px;">Filter</p>
                <div class="referral-select">
                    <select name="business_unit" id="">
                        <option value="">Business Unit</option>
                    </select>
                    <select name="status" id="">
                        <option value="">Status</option>
                    </select>
                    <select name="datepicker" id="">
                        <option value="">Last 30 days</option>
                    </select>
                    <input type="text" name="referral_id" id="referral_id" class="referral-id" placeholder="#REF01234">
                </div>
            </div>
        </div>

    </div>
</body>