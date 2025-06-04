<?php
// import_users.php
header('Content-Type: application/json');

require_once("../core/Database.php");

if (!isset($_FILES['csv']) || $_FILES['csv']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['message' => 'No file uploaded or upload error.']);
    exit;
}

// Check file extension
$filename = $_FILES['csv']['name'];
if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) !== 'csv') {
    echo json_encode(['message' => 'Only .csv files are allowed.']);
    exit;
}

$file = $_FILES['csv']['tmp_name'];
$handle = fopen($file, 'r');
if ($handle === false) {
    echo json_encode(['message' => 'Failed to open file.']);
    exit;
}

// Read header
$header = fgetcsv($handle);
if (!$header) {
    echo json_encode(['message' => 'Invalid CSV file.']);
    exit;
}

// Find the columns
$fullNameIdx = array_search('Full Name', $header);
$employeeNumberIdx = array_search('Employee Number', $header);
if ($fullNameIdx === false || $employeeNumberIdx === false) {
    echo json_encode(['message' => 'CSV must have Full Name and Employee Number columns.']);
    exit;
}

$db = new fingerprint\Database();
$count = 0;
while (($row = fgetcsv($handle)) !== false) {
    $fullname = trim($row[$fullNameIdx]);
    $employee_id = trim($row[$employeeNumberIdx]);
    if ($fullname && $employee_id) {
        // Insert or update user
        $sql = "INSERT INTO users (employee_id, fullname) VALUES (?, ?) ON DUPLICATE KEY UPDATE fullname=?";
        $db->insert($sql, "sss", [$employee_id, $fullname, $fullname]);
        $count++;
    }
}
fclose($handle);
echo json_encode(['message' => 'Successfully Imported']); 