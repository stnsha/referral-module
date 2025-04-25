<?php
header('Content-Type: application/json');

function getApiData($prefix, $data = null)
{
    $host = 'http://172.18.28.51:8002/api/';
    $token = '1|4lpr0@r3f3rr4L';
    $url = $host . $prefix;

    $headers = array(
        'Authorization: ' . $token,
        'Accept: application/json',
        'Content-Type: application/json'
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    if ($data) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);

    // Simple error display
    if ($response === false && ($httpCode !== 200 && $httpCode !== 201)) {
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

    curl_close($ch);
    return array(
        'response' => $response,
        'httpCode' => $httpCode
    );
}

function getBusinessUnit()
{
    $data = getApiData('business-units');
    if ($data['httpCode'] != 200) {
        return array();
    }
    $decoded = json_decode($data['response'], true);
    return isset($decoded['data']) ? $decoded['data'] : array();
}

function createForm($data)
{
    // Transform data to match Laravel's expected format
    $formattedData = array(
        'business_unit_id' => (int)$data['business_unit_id'],
        'label_name' => $data['label_name'],
        'field_name' => $data['field_name'],
        'field_type' => $data['field_type'],
        'is_hidden' => isset($data['is_hidden']) ? (int)$data['is_hidden'] : 0,
        'is_required' => isset($data['is_required']) ? (int)$data['is_required'] : 0,
    );

    // Add value_fields if present
    if (isset($data['value_fields']) && is_array($data['value_fields'])) {
        $formattedData['value_fields'] = array_values(array_filter($data['value_fields']));
    }

    $data = getApiData('form', $formattedData);
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
        }
    } elseif (isset($_POST['action'])) {
        // Handle form-data requests
        switch ($_POST['action']) {
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
        }
    }
}

echo json_encode($response);
