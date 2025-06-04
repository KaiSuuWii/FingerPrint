<?php
// attendance.php
// Fetches or creates attendance logs for a given employee_id

require_once("../core/Database.php");

header('Content-Type: application/json');

if (isset($_GET['latest']) && $_GET['latest'] == 1) {
    $db = new fingerprint\Database();
    $sql = "SELECT id, employee_id, time, log_in FROM attendance_logs ORDER BY id DESC LIMIT 1";
    $logs = $db->select($sql);
    echo json_encode([
        'status' => 'success',
        'logs' => $logs
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create a new attendance log
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['employee_id'], $input['time'], $input['log_in'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'employee_id, time, and log_in are required'
        ]);
        exit;
    }
    $employee_id = $input['employee_id'];
    $time = $input['time']; // Should be in 'YYYY-MM-DD HH:MM:SS' format
    $log_in = $input['log_in'] ? 1 : 0;

    try {
        $db = new fingerprint\Database();
        $sql = "INSERT INTO attendance_logs (employee_id, time, log_in) VALUES (?, ?, ?)";
        $param_type = "ssi";
        $param_array = [$employee_id, $time, $log_in];
        $db->insert($sql, $param_type, $param_array);
        echo json_encode([
            'status' => 'success',
            'message' => 'Attendance log created'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

// GET request: fetch logs
if (!isset($_GET['employee_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'employee_id is required'
    ]);
    exit;
}

$employee_id = $_GET['employee_id'];

try {
    $db = new fingerprint\Database();
    $sql = "SELECT id, employee_id, time, log_in FROM attendance_logs WHERE employee_id = ? ORDER BY id DESC";
    $param_type = "s";
    $param_array = [$employee_id];
    $logs = $db->select($sql, $param_type, $param_array);
    echo json_encode([
        'status' => 'success',
        'logs' => $logs
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 