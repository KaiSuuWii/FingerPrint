<?php
/*
 * Author: Dahir Muhammad Dahir (EDITOR: KAIVENI THE GOAT)
 * Date: 26-April-2020 5:44 PM
 * About: identification and verification
 * will be carried out in this file
 */

namespace fingerprint;

require_once("../core/helpers/helpers.php");
require_once("../core/querydb.php");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header
header('Content-Type: application/json');

if(!empty($_POST["data"])) {
    try {
        $user_data = json_decode($_POST["data"]);
        if ($user_data === null) {
            throw new Exception("Invalid JSON data received");
        }

        // Get the fingerprint data from the request
        $pre_reg_fmd_string = $user_data->index_finger[0];

        // Get all enrolled users' fingerprints
        $all_users_json = getAllUsers();
        if ($all_users_json === null) {
            throw new Exception("Error retrieving user data");
        }

        $all_users = json_decode($all_users_json);
        if ($all_users === null) {
            throw new Exception("Error decoding user data");
        }

        $match_found = false;
        $matched_user = null;

        // Iterate through all users to find a match
        foreach ($all_users as $user) {
            $enrolled_fingers = [
                "index_finger" => $user->indexfinger,
                "middle_finger" => $user->middlefinger
            ];

            $json_response = verify_fingerprint($pre_reg_fmd_string, $enrolled_fingers);
            $response = json_decode($json_response);

            if($response === "match") {
                $match_found = true;
                $matched_user = $user;
                break;
            }
        }

        if($match_found) {
            $user_details = getUserDetails($matched_user->employee_id);
            if ($user_details === null) {
                throw new Exception("Error retrieving user details");
            }
            // Debug the user details before sending
            error_log("User details: " . $user_details);
            echo $user_details;
        }
        else {
            echo json_encode(["status" => "failed", "message" => "No match found"]);
        }
    } catch (Exception $e) {
        error_log("Error in verify.php: " . $e->getMessage());
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
}
else {
    echo json_encode([
        "status" => "error",
        "message" => "post request with 'data' field required"
    ]);
}
