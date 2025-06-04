<?php
require_once("querydb.php");
header('Content-Type: application/json');
echo fingerprint\getAllUsers(); 