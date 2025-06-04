<?php
require_once("../core/querydb.php");
header('Content-Type: application/json');
if (!isset($_GET['employee_id'])) {
    echo json_encode([]);
    exit;
}
echo fingerprint\getUserDetails($_GET['employee_id']);
