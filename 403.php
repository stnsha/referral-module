<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>403 - Unauthorized Access</title>
    <base href="/odb/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .error-container {
            text-align: center;
            background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
            padding: 3rem;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 500px;
        }
        .error-code {
            font-size: 72px;
            font-weight: 600;
            color: #173F5F;
            margin-bottom: 1rem;
        }
        .error-icon {
            font-size: 64px;
            color: #dc3545;
            margin-bottom: 1.5rem;
        }
        .error-message {
            font-size: 24px;
            font-weight: 500;
            color: #173F5F;
            margin-bottom: 1rem;
        }
        .error-description {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 2rem;
        }
        .btn-return {
            background-color: #173F5F;
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
        }
        .btn-return:hover {
            background-color: #0f2d44;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>

<body>
    <div class="error-container">
        <i class="bi bi-shield-lock error-icon"></i>
        <div class="error-code">403</div>
        <div class="error-message">Access Denied</div>
        <div class="error-description">
            You do not have permission to access this page. Please contact your administrator if you believe this is an error.
        </div>
        <a href="referral/index.php" class="btn-return">
            <i class="bi bi-house-door me-2"></i>Return to Dashboard
        </a>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
