<?php
header('Content-Type: application/json');

// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Headers: Content-Type");
// header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// // Handle preflight OPTIONS request
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     exit(0);
// }

function getApiData($prefix, $data = null, $method)
{
    $host = 'http://mytotalhealth.com.my/referral-api/api/';
    $token = '1|4lpr0@r3f3rr4L';
    $url = $host . $prefix;

    $method = strtoupper($method);

    $headers = array(
        'Authorization: ' . $token,
        'Accept: application/json',
        'Content-Type: application/json'
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    if ($method === 'GET') {
        // if (!empty($data)) {
        //     $url .= '?' . http_build_query($data);
        // }
        curl_setopt($ch, CURLOPT_URL, $url);
    } elseif ($method === 'POST') {
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    $headers = curl_getinfo($ch, CURLINFO_HEADER_OUT);

    if ($response === false || ($httpCode !== 200 && $httpCode !== 201 && $httpCode !== 204)) {
        die(json_encode(array(
            'success' => false,
            'error' => 'API Request Failed',
            'details' => array(
                'url' => $url,
                'http_code' => $httpCode,
                'curl_error' => $error,
                'response' => $response
            )
        )));
    }

    $result = array(
        'response' => $response,
        'httpCode' => $httpCode,
        'headers' => $headers,
        'ch' => $ch
    );

    return $result;
}

function getBusinessUnit()
{
    $data = getApiData('business-units', null, 'GET');
    if ($data['httpCode'] != 200) {
        return array();
    }
    $decoded = json_decode($data['response'], true);
    return isset($decoded['data']) ? $decoded['data'] : array();
}

function createForm($data)
{
    $formattedData = array(
        'business_unit_id' => (int)$data['business_unit_id'],
        'label_name' => $data['label_name'],
        'field_name' => $data['field_name'],
        'field_type' => $data['field_type'],
        'is_hidden' => isset($data['is_hidden']) ? (int)$data['is_hidden'] : 0,
        'is_required' => isset($data['is_required']) ? (int)$data['is_required'] : 0,
    );

    if (isset($data['value_fields']) && is_array($data['value_fields'])) {
        $formattedData['value_fields'] = array_values(array_filter($data['value_fields']));
    }

    $data = getApiData('form', $formattedData, 'POST');
    $result  = $data['response'];
    $httpCode = $data['httpCode'];

    $decoded = json_decode($result, true);

    if ($httpCode == 201) {
        return array(
            'success' => true,
            'id' => $decoded['form_id']
        );
    } else {
        return array('error' => true, 'message' => $decoded['message']);
    }
}

function getFormDetails($business_unit_id)
{
    $data = getApiData('form/show/' . $business_unit_id, null, 'GET');
    if ($data['httpCode'] != 200) {
        return array();
    }

    $decoded = json_decode($data['response'], true);

    return isset($decoded) ? $decoded : array();
}

function getAllReferral()
{
    $data = getApiData('referral', null, 'GET');
    if ($data['httpCode'] != 200) {
        return array();
    }
    $decoded = json_decode($data['response'], true);

    return isset($decoded['data']) ? $decoded['data'] : array();
}

function getReferral($referral_id)
{
    $data = getApiData('referral/' . $referral_id, null, 'GET');

    if ($data['httpCode'] != 200) {
        return array();
    }
    $decoded = json_decode($data['response'], true);

    return isset($decoded) ? $decoded : array();
}

function downloadAttachment($attachment_id)
{
    $data = getApiData('attachment/' . $attachment_id, null, 'GET');

    // Always close the curl handle
    if (isset($data['ch'])) {
        curl_close($data['ch']);
    }

    if ($data['httpCode'] != 200) {
        header('Content-Type: application/json');
        echo json_encode(array(
            'success' => false,
            'message' => 'Failed to retrieve attachment'
        ));
        exit;
    }

    // Get the raw response data
    $response = $data['response'];

    // Parse the response as JSON to get metadata
    $responseData = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE && isset($responseData['data'])) {
        // If response is valid JSON with data, extract content type and filename
        $contentType = isset($responseData['data']['content_type']) ? $responseData['data']['content_type'] : 'application/octet-stream';
        $filename = isset($responseData['data']['filename']) ? $responseData['data']['filename'] : 'download';
        $fileContent = isset($responseData['data']['file_content']) ? base64_decode($responseData['data']['file_content']) : null;

        if ($fileContent) {
            // Set headers for file download
            header('Content-Type: ' . $contentType);
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Transfer-Encoding: binary');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Pragma: public');
            header('Expires: 0');

            // Output the decoded file content
            echo $fileContent;
            exit;
        }
    }

    // If not JSON or no valid data, treat as binary response
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="download"');
    header('Content-Transfer-Encoding: binary');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Expires: 0');

    // Output the raw response
    echo $response;
    exit;
}

function getExternalOrganization()
{
    $data = getApiData('external-organizations', null, 'GET');
    if ($data['httpCode'] != 200) {
        return array();
    }
    $decoded = json_decode($data['response'], true);

    return isset($decoded) ? $decoded : array();
}

function getReferralStatus()
{
    $data = getApiData('referral/displayStatus', null, 'GET');
    if ($data['httpCode'] != 200) {
        return array();
    }
    $decoded = json_decode($data['response'], true);

    return isset($decoded) ? $decoded : array();
}

function getReportChart()
{
    $data = getApiData('report/chart', null, 'GET');
    if ($data['httpCode'] != 200) {
        return array();
    }
    $decoded = json_decode($data['response'], true);

    return isset($decoded) ? $decoded : array();
}

function getReportDashboard()
{
    $data = getApiData('report/dashboard', null, 'GET');
    if ($data['httpCode'] != 200) {
        return array();
    }
    $decoded = json_decode($data['response'], true);

    return isset($decoded) ? $decoded : array();
}

function getReport($formData)
{
    return array($formData);
    exit;
    $data = getApiData('report', array($formData), 'POST');
    $result = $data['response'];
    $httpCode = $data['httpCode'];

    $decoded = json_decode($result, true);

    // Handle different HTTP status codes
    switch ($httpCode) {
        case 200:
            // Success - return the API response with success flag
            return array(
                'success' => true,
                'data' => $decoded,
            );

        case 422:
            // Validation error
            return array(
                'success' => false,
                'message' => isset($decoded['message']) ? $decoded['message'] : 'Validation error',
                'error' => isset($decoded['error']) ? $decoded['error'] : 'Invalid input parameters',
                'details' => isset($decoded['details']) ? $decoded['details'] : null
            );

        case 500:
            // Server error
            return array(
                'success' => false,
                'message' => isset($decoded['message']) ? $decoded['message'] : 'Server error occurred',
                'error' => isset($decoded['error']) ? $decoded['error'] : 'Internal server error'
            );

        default:
            // Other HTTP errors
            return array(
                'success' => false,
                'message' => 'API request failed with HTTP code: ' . $httpCode,
                'error' => 'Unexpected response from server'
            );
    }
}

function getSummaryReport($business_unit_id)
{
    $data = getApiData('report/summary/' . $business_unit_id, null, 'GET');
    if ($data['httpCode'] != 200) {
        return array();
    }
    $decoded = json_decode($data['response'], true);

    return isset($decoded) ? $decoded : array();
}

// Main request handler
$input = file_get_contents('php://input');
$jsonData = json_decode($input, true);
$response = array('success' => false, 'message' => 'Invalid request');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($jsonData && isset($jsonData['action'])) {
        // Handle JSON requests
        switch ($jsonData['action']) {
            case 'business-units':
                $response = array('data' => getBusinessUnit());
                break;
            case 'create-form':
                if (isset($jsonData['formData'])) {
                    $response = createForm($jsonData['formData']);
                }
                break;
            case 'form-details':
                if (isset($jsonData['business_unit_id'])) {
                    $response = array('data' => getFormDetails($jsonData['business_unit_id']));
                }
                break;

            case 'get-referral':
                if (isset($jsonData['referral_id'])) {
                    $response = array('data' => getReferral($jsonData['referral_id']));
                }
                break;

            case 'download-attachment':
                $attachment_id = isset($jsonData['attachment_id']) ? $jsonData['attachment_id'] : null;
                if ($attachment_id) {
                    downloadAttachment($attachment_id);
                    // downloadAttachment handles its own output and exit
                    return;
                } else {
                    $response = array('success' => false, 'message' => 'Missing attachment_id');
                }
                break;
            case 'get-report':
                if (isset($jsonData['formData'])) {
                    $response = getReport($jsonData['formData']);
                }
                break;
        }

        echo json_encode($response);
    } elseif (isset($_POST['action'])) {
        // Handle form-data requests
        switch ($_POST['action']) {
            case 'download-attachment':
                $attachment_id = isset($_POST['attachment_id']) ? $_POST['attachment_id'] : null;
                if ($attachment_id) {
                    downloadAttachment($attachment_id);
                    // downloadAttachment handles its own output and exit
                    return;
                } else {
                    $response = array('success' => false, 'message' => 'Missing attachment_id');
                }
                break;

            case 'business-units':
                $response = array('data' => getBusinessUnit());
                break;

            case 'create-form':
                $formData = array(
                    'business_unit_id' => isset($_POST['business_unit_id']) ? $_POST['business_unit_id'] : null,
                    'label_name' => isset($_POST['label_name']) ? $_POST['label_name'] : null,
                    'field_name' => isset($_POST['field_name']) ? $_POST['field_name'] : null,
                    'field_type' => isset($_POST['field_type']) ? $_POST['field_type'] : null,
                    'is_hidden' => isset($_POST['is_hidden']) ? $_POST['is_hidden'] : 0,
                    'is_required' => isset($_POST['is_required']) ? $_POST['is_required'] : 0,
                );

                // Handle array inputs for value_fields
                if (isset($_POST['value_fields']) && is_array($_POST['value_fields'])) {
                    $formData['value_fields'] = $_POST['value_fields'];
                }

                $response = createForm($formData);
                break;

            case 'form-details':
                if (isset($jsonData['business_unit_id'])) {
                    $response = array('data' => getFormDetails($jsonData['business_unit_id']));
                }
                break;

            case 'all-referral':
                $response = array('data' => getAllReferral());
                break;

            case 'external-organizations':
                $response = array('data' => getExternalOrganization());
                break;

            case 'referral-status':
                $response = array('data' => getReferralStatus());
                break;

            case 'report-chart':
                $response = array('data' => getReportChart());
                break;

            case 'report-dashboard':
                $response = array('data' => getReportDashboard());
                break;

            case 'get-report':
                if (isset($_POST['formData'])) {
                    $response = getReport($_POST['formData']);
                }
                break;
            case 'get-summary-report':
                if (isset($_POST['business_unit_id'])) {
                    $response = getSummaryReport($_POST['business_unit_id']);
                }
                break;
        }

        echo json_encode($response);
    }
}
