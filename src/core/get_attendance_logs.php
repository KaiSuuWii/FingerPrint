<?php
require_once("querydb.php");
header('Content-Type: application/json');

date_default_timezone_set("Asia/Manila");

function getAttendanceLogsFiltered($date = null) {
    $myDatabase = new fingerprint\Database();
    if ($date) {
        $sql_query = "SELECT id, employee_id, time, log_in FROM attendance_logs WHERE DATE(time) = ? ORDER BY id DESC";
        $param_type = "s";
        $param_array = [$date];
        $logs = $myDatabase->select($sql_query, $param_type, $param_array);
    } else {
        $sql_query = "SELECT id, employee_id, time, log_in FROM attendance_logs ORDER BY id DESC";
        $logs = $myDatabase->select($sql_query);
    }
    if (!$logs) $logs = [];
    return json_encode($logs);
}

$date = isset($_GET['date']) ? $_GET['date'] : null;
echo getAttendanceLogsFiltered($date); 