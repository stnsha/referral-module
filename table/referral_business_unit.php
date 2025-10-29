<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

$connect = 1;
include('../../common/index_adv.php');

if (!isset($conn)) {
    die(json_encode(array("status" => 500, "message" => "Database connection error")));
}

function createTableBusinessUnit($conn)
{
    $sql = "CREATE TABLE IF NOT EXISTS ref_business_unit(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(25) NOT NULL,
        staff_department_id INT NOT NULL,
        ending_code VARCHAR(1) NOT NULL,
        PRIMARY KEY (id)
        )";

    if ($conn->query($sql) === TRUE) {
        echo "Table created successfully.";
    } else {
        echo "Error creating table: " . $conn->error;
    }

    insertBusinessUnit($conn);
    $conn->close();
}

function insertBusinessUnit($conn)
{
    $data = array(
        array('name' => 'Alpro Pharmacy', 'staff_department_id' => 1, 'ending_code' => '1'),
        array('name' => 'Alpro Audiology', 'staff_department_id' => 1, 'ending_code' => 'A'),
        array('name' => 'Alpro Sugi', 'staff_department_id' => 1, 'ending_code' => 'S'),
        array('name' => 'Alpro Clinic',  'staff_department_id' => 2, 'ending_code' => 'C'),
        array('name' => 'Alpro Baby', 'staff_department_id' => 21, 'ending_code' => 'B'),
        array('name' => 'Alpro Physio',  'staff_department_id' => 20, 'ending_code' => '0'),
        array('name' => 'Alpro Optisaver',  'staff_department_id' => 35, 'ending_code' => 'P')
    );

    usort($data, function ($a, $b) {
        return strcmp($a['name'], $b['name']);
    });

    foreach ($data as $row) {
        $name = $conn->real_escape_string($row['name']);
        $dept_id = (int)$row['staff_department_id'];
        $ending_code = $conn->real_escape_string($row['ending_code']);

        $sql = "INSERT INTO ref_business_unit (name, staff_department_id, ending_code) VALUES ('$name', $dept_id, '$ending_code')";
        if (!$conn->query($sql)) {
            echo "Insert failed for {$name}: " . $conn->error . "<br>";
        }
    }
}
createTableBusinessUnit($conn);
