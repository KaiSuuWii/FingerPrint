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

        $user_id = $user_data->employee_id;
        //this is not necessarily index_finger it could be
        //any finger we wish to identify
        $pre_reg_fmd_string = $user_data->index_finger[0];

        $hand_data = json_decode(getUserFmds($user_id));
        if ($hand_data === null) {
            throw new Exception("Error retrieving user fingerprint data");
        }
        
        $enrolled_fingers = [
            "index_finger" => $hand_data[0]->indexfinger,
            "middle_finger" => $hand_data[0]->middlefinger //MIDDLE FINGER IS THE FUCKING THUMB CUZ IM TOO LAZY
        ];

        $json_response = verify_fingerprint($pre_reg_fmd_string, $enrolled_fingers);
        $response = json_decode($json_response);

        if($response === "match"){
            $user_details = getUserDetails($user_id);
            if ($user_details === null) {
                throw new Exception("Error retrieving user details");
            }
            // Debug the user details before sending
            error_log("User details: " . $user_details);
            echo $user_details;
        }
        else{
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
