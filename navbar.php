<?php
// Get current page to highlight active nav item
$current_page = basename($_SERVER['PHP_SELF']);
$current_dir = basename(dirname($_SERVER['PHP_SELF']));

// Determine active class for each nav item
$dashboard_active = ($current_page == 'index.php' && $current_dir == 'referral') ? 'active' : '';
$admin_active = ($current_page == 'admin.php') ? 'active' : '';
$external_active = ($current_dir == 'externalOrganization') ? 'active' : '';
$customer_active = ($current_dir == 'customerFilter') ? 'active' : '';
$business_units_active = ($current_page == 'index.php' && $current_dir == 'businessUnit') ? 'active' : '';
$report_active = ($current_page == 'report.php' || $current_dir == 'report') ? 'active' : '';
$report_monthly_active = ($current_page == 'monthly.php' && $current_dir == 'report') ? 'active' : '';
$report_yearly_active = ($current_page == 'yearly.php' && $current_dir == 'report') ? 'active' : '';
?>
<nav class="referral-nav navbar navbar-expand-lg navbar-light mb-3">
    <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <i class="bi bi-list"></i>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link <?php echo $dashboard_active; ?>" href="referral/index.php">MyReferral
                        Dashboard</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo $customer_active; ?>" href="referral/customerFilter/index.php">Search
                        by Customer</a>
                </li>
                <?php if (isset($referral) && $referral != 0) { ?>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $admin_active; ?>" href="referral/admin.php">Admin Panel</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $external_active; ?>"
                            href="referral/externalOrganization/index.php">External Organization</a>
                    </li>
                <?php } ?>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle <?php echo $report_active; ?>" href="referral/report/monthly.php" role="button"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Report
                    </a>
                    <ul class="dropdown-menu">
                        <li>
                            <a class="dropdown-item <?php echo $report_monthly_active; ?>"
                                href="referral/report/monthly.php">Monthly Summary</a>
                        </li>
                        <li>
                            <a class="dropdown-item <?php echo $report_yearly_active; ?>"
                                href="referral/report/yearly.php">Yearly Comparison</a>
                        </li>
                    </ul>
                </li>
            </ul>
            <ul class="navbar-nav ms-auto">
                <?php if (isset($referral) && $referral == 1 && $department == 16) { ?>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $business_units_active; ?>"
                            href="referral/businessUnit/index.php">Business Units</a>
                    </li>
                <?php } ?>
            </ul>
        </div>
    </div>
</nav>