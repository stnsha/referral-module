<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Customer Filter</title>
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" media="screen" type="text/css" href="common/css/layout.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="referral/customerFilter/css/style.css?v=<?php echo time(); ?>" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<?php
require_once('../../lock_adv.php');
$connect = 1;
include('../../common/index_adv.php');
?>

<body>
    <div class="referral-container mb-3">
        <div class="row mb-3">
            <div class="col-12">
                <div class="d-flex justify-content-start align-items-center px-3">
                    <span class="fw-bold text-start me-3" style="font-size:20px;">Search Referral by Customer</span>
                </div>
            </div>
        </div>
        <div class="row mb-3 px-3">
            <div class="col-12">
                <div class="d-flex flex-column rounded-2 shadow p-3"
                    style="overflow:hidden; background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <span class="fw-bold text-start pb-3" style="font-size:14px;">Search</span>
                    <div class="d-flex gap-2 mb-2">
                        <input type="text" class="form-control form-control-sm" name="search-customer"
                            id="search-customer" placeholder="Enter Customer IC Number">
                        <button type="button" id="searchBtn" class="btn-referral" style="white-space: nowrap;">
                            <i class="bi bi-search me-1"></i>Search
                        </button>
                        <button type="button" id="clearSearchBtn" class="btn btn-outline-secondary btn-sm"
                            style="white-space: nowrap;">Clear</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mb-3 px-3">
            <div class="col-12">
                <div class="d-flex flex-column justify-content-between p-2 rounded-2 shadow"
                    style="overflow:hidden; background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);">
                    <table class="referral-tbl table table-hover rounded-2" id="customer-filter-tbl"
                        style="background-color: transparent !important;">
                        <thead style="border-bottom: 2px solid #dbe2e9;margin-bottom:15px !important;">
                            <tr>
                                <th style="font-size:16px;width: 10%;text-align:start;">Referral ID</th>
                                <th style="font-size:16px;width: 35%;text-align:start;">Referral Reason</th>
                                <th style="font-size:16px;width: 13%;text-align:start;">Referred From</th>
                                <th style="font-size:16px;width: 13%;text-align:start;">Referred To</th>
                                <th style="font-size:16px;width: 14%;text-align:start;">Status</th>
                                <th style="font-size:16px;width: 15%;text-align:start;">Action</th>
                            </tr>
                        </thead>
                        <tbody id="customer-filter-tbody">
                            <tr>
                                <td colspan="6" class="text-center" style="padding: 20px;">
                                    <span style="color: #6c757d;">Enter search criteria to find referrals</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="referral/js/errorLogger.js?v=<?php echo time(); ?>"></script>
    <script src="referral/customerFilter/js/index.js?v=<?php echo time(); ?>"></script>
</body>

</html>