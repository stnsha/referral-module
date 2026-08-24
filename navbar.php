<?php
// Dev role switcher toolbar (localhost + real SuperAdmin only)
$_navbar_serverName = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : '';
$_navbar_httpHost   = isset($_SERVER['HTTP_HOST'])   ? $_SERVER['HTTP_HOST']   : '';
$_navbar_isLocal    = in_array($_navbar_serverName, array('localhost', '127.0.0.1'))
    || strpos($_navbar_serverName, 'localhost') !== false
    || strpos($_navbar_httpHost,   'localhost') !== false
    || strpos($_navbar_httpHost,   '127.0.0.1') !== false;

$_navbar_realReferral = isset($referral) ? (int)$referral : 0;

if ($_navbar_isLocal) {
    if (session_id() == '') {
        session_start();
    }

    // Only a real SuperAdmin can simulate a lower role; the override is
    // ignored (and left in the session) for anyone else so it doesn't leak
    // elevated access to a non-SuperAdmin who happens to hit this page.
    if ($_navbar_realReferral === 1 && isset($_SESSION['referral_dev_role_override'])) {
        $referral = (int)$_SESSION['referral_dev_role_override'];
    }
}

$_navbar_roleLabels = array(0 => 'Normal User', 1 => 'Super Admin', 2 => 'HQ Admin');

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
<?php if ($_navbar_isLocal && $_navbar_realReferral === 1): ?>
<?php
    $_navbar_activeOverride = isset($_SESSION['referral_dev_role_override']) ? (int)$_SESSION['referral_dev_role_override'] : null;
    $_navbar_activeLabel    = $_navbar_activeOverride !== null ? $_navbar_roleLabels[$_navbar_activeOverride] : 'DB Default';
    $_navbar_currentUri     = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/odb/referral/index.php';
?>
<div
    style="background:#12122a;color:#d0d0f0;padding:5px 14px;font-size:11px;font-family:monospace;display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-bottom:1px solid #333;">
    <span style="color:#888;letter-spacing:.05em;">DEV ROLE</span>
    <strong style="color:#f0c040;">[<?php echo htmlspecialchars($_navbar_activeLabel); ?>]</strong>
    <?php foreach ($_navbar_roleLabels as $_r => $_label): ?>
    <form method="POST" action="/odb/referral/dev-switch-role.php" style="display:inline;margin:0;">
        <input type="hidden" name="role" value="<?php echo $_r; ?>">
        <input type="hidden" name="redirect" value="<?php echo htmlspecialchars($_navbar_currentUri); ?>">
        <button type="submit"
            style="background:<?php echo ($_navbar_activeOverride === $_r ? '#2e2e6e' : '#1e1e3e'); ?>;color:<?php echo ($_navbar_activeOverride === $_r ? '#f0c040' : '#aaa'); ?>;border:1px solid <?php echo ($_navbar_activeOverride === $_r ? '#555' : '#333'); ?>;padding:2px 7px;font-size:11px;cursor:pointer;border-radius:3px;font-family:monospace;"><?php echo $_r; ?>:
            <?php echo $_label; ?></button>
    </form>
    <?php endforeach; ?>
    <?php if ($_navbar_activeOverride !== null): ?>
    <form method="POST" action="/odb/referral/dev-switch-role.php" style="display:inline;margin:0;">
        <input type="hidden" name="role" value="clear">
        <input type="hidden" name="redirect" value="<?php echo htmlspecialchars($_navbar_currentUri); ?>">
        <button type="submit"
            style="background:#3a1010;color:#ff8888;border:1px solid #a44;padding:2px 7px;font-size:11px;cursor:pointer;border-radius:3px;font-family:monospace;">Clear
            Override</button>
    </form>
    <?php endif; ?>
    <span style="color:#444;">|</span>
    <span style="color:#888;letter-spacing:.05em;">DEV BU/OUTLET</span>
    <strong style="color:#f0c040;">[<?php
        echo isset($_SESSION['referral_dev_bu_override']) ? 'BU ' . (int)$_SESSION['referral_dev_bu_override'] : 'BU: DB Default';
        echo ' / ';
        echo isset($_SESSION['referral_dev_outlet_override']) ? 'Outlet ' . htmlspecialchars(implode(',', $_SESSION['referral_dev_outlet_override'])) : 'Outlet: DB Default';
    ?>]</strong>
    <form method="POST" action="/odb/referral/dev-switch-role.php" style="display:inline-flex;gap:4px;align-items:center;margin:0;">
        <input type="hidden" name="redirect" value="<?php echo htmlspecialchars($_navbar_currentUri); ?>">
        <input type="text" name="bu_id" placeholder="BU id"
            value="<?php echo isset($_SESSION['referral_dev_bu_override']) ? (int)$_SESSION['referral_dev_bu_override'] : ''; ?>"
            style="width:55px;font-size:11px;font-family:monospace;background:#1e1e3e;color:#d0d0f0;border:1px solid #333;border-radius:3px;padding:2px 4px;">
        <input type="text" name="outlet" placeholder="outlet ids (csv)"
            value="<?php echo isset($_SESSION['referral_dev_outlet_override']) ? htmlspecialchars(implode(',', $_SESSION['referral_dev_outlet_override'])) : ''; ?>"
            style="width:110px;font-size:11px;font-family:monospace;background:#1e1e3e;color:#d0d0f0;border:1px solid #333;border-radius:3px;padding:2px 4px;">
        <button type="submit"
            style="background:#1e1e3e;color:#aaa;border:1px solid #333;padding:2px 7px;font-size:11px;cursor:pointer;border-radius:3px;font-family:monospace;">Apply</button>
    </form>
    <?php if (isset($_SESSION['referral_dev_bu_override']) || isset($_SESSION['referral_dev_outlet_override'])): ?>
    <form method="POST" action="/odb/referral/dev-switch-role.php" style="display:inline;margin:0;">
        <input type="hidden" name="bu_id" value="clear">
        <input type="hidden" name="redirect" value="<?php echo htmlspecialchars($_navbar_currentUri); ?>">
        <button type="submit"
            style="background:#3a1010;color:#ff8888;border:1px solid #a44;padding:2px 7px;font-size:11px;cursor:pointer;border-radius:3px;font-family:monospace;">Clear
            BU/Outlet</button>
    </form>
    <?php endif; ?>
</div>
<?php endif; ?>
<nav class="referral-nav navbar navbar-expand-lg navbar-light mb-3">
    <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <i class="bi bi-list"></i>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link <?php echo $dashboard_active; ?>" href="referral/index.php">
                        Dashboard</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo $customer_active; ?>" href="referral/customerFilter/index.php">Search
                        by Customer</a>
                </li>
                <?php if (isset($referral) && (int)$referral === 1): ?>
                <li class="nav-item">
                    <a class="nav-link <?php echo $admin_active; ?>" href="referral/admin.php">Admin Panel</a>
                </li>
                <?php endif; ?>
                <li class="nav-item">
                    <a class="nav-link <?php echo $external_active; ?>"
                        href="referral/externalOrganization/index.php">External Organization</a>
                </li>
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
                <?php if (isset($referral) && ($referral == 1 || $referral == 2) && $department == 16) { ?>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $business_units_active; ?>"
                            href="referral/businessUnit/index.php">Business Units</a>
                    </li>
                <?php } ?>
            </ul>
        </div>
    </div>
</nav>