<?php
require_once("querydb.php");
date_default_timezone_set("Asia/Manila");

function getAttendanceLogsForExport($date = null) {
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
    return $logs;
}

$date = isset($_GET['date']) ? $_GET['date'] : null;
$start = isset($_GET['start']) ? $_GET['start'] : null;
$end = isset($_GET['end']) ? $_GET['end'] : null;

if ($start && $end) {
    $myDatabase = new fingerprint\Database();
    $sql_query = "SELECT id, employee_id, time, log_in FROM attendance_logs WHERE DATE(time) BETWEEN ? AND ? ORDER BY id DESC";
    $param_type = "ss";
    $param_array = [$start, $end];
    $logs = $myDatabase->select($sql_query, $param_type, $param_array);
    $startObj = DateTime::createFromFormat('Y-m-d', $start);
    $endObj = DateTime::createFromFormat('Y-m-d', $end);
    $filename = ($startObj ? $startObj->format('d-m-Y') : $start) . '_' . ($endObj ? $endObj->format('d-m-Y') : $end) . '-logs.csv';
} else if ($date) {
    $dateObj = DateTime::createFromFormat('Y-m-d', $date);
    $filename = $dateObj ? $dateObj->format('d-m-Y') : date('d-m-Y');
    $filename .= '-logs.csv';
    $logs = getAttendanceLogsForExport($date);
} else {
    $filename = date('d-m-Y') . '-logs.csv';
    $logs = getAttendanceLogsForExport();
}

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$output = fopen('php://output', 'w');
fputcsv($output, ['ID', 'Employee Number', 'Date', 'Time', 'Status']);
foreach ($logs as $log) {
    $dateTime = explode(' ', $log['time']);
    $status = $log['log_in'] == 1 ? 'LOGGED IN' : 'LOGGED OUT';
    fputcsv($output, [
        $log['id'],
        $log['employee_id'],
        $dateTime[0],
        $dateTime[1],
        $status
    ]);
}
fclose($output);
