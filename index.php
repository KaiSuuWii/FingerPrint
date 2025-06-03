<?php
/*
 * Author: Dahir Muhammad Dahir
 * Date: 12-April-2020 5:07 AM
 * About: I will tell you later
 */

namespace fingerprint;

// Get the request URI
$request_uri = $_SERVER['REQUEST_URI'];

// Remove any query strings
$request_uri = strtok($request_uri, '?');

// Remove trailing slashes
$request_uri = rtrim($request_uri, '/');

// If empty, set to default
if (empty($request_uri)) {
    $request_uri = '/';
}

// Route handling
switch ($request_uri) {
    case '/register':
        require("./src/html/register.html");
        break;
    case '/log':
        require("./src/html/log.html");
        break;
    default:
        require("./src/html/home.html");
        break;
}
