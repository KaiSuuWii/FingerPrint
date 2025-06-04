<?php
/*
 * Author: Dahir Muhammad Dahir (FUCK THIS DUDE MAN) (EDITOR: KAIVENI THE GOAT)
 * Date: 26-April-2020 12:41 AM
 * About: this file is responsible
 * for all Database queries
 */

namespace fingerprint;
require_once("../core/Database.php");

function setUserFmds($employee_id, $index_finger_fmd_string, $middle_finger_fmd_string){
    $myDatabase = new Database();
    //MIDDLE FINGER IS THE FUCKING THUMB CUZ IM TOO LAZY
    $sql_query = "update users set indexfinger=?, middlefinger=? where employee_id=?";
    $param_type = "sss";
    $param_array = [$index_finger_fmd_string, $middle_finger_fmd_string, $employee_id];
    $affected_rows = $myDatabase->update($sql_query, $param_type, $param_array);

    if($affected_rows > 0){
        return "success";
    }
    else{
        return "failed in querydb";
    }
}

function getUserFmds($employee_id){
    $myDatabase = new Database();
    //MIDDLE FINGER IS THE FUCKING THUMB CUZ IM TOO LAZY
    $sql_query = "select indexfinger, middlefinger from users where employee_id=?";
    $param_type = "s";
    $param_array = [$employee_id];
    $fmds = $myDatabase->select($sql_query, $param_type, $param_array);
    return json_encode($fmds);
}

function getUserDetails($employee_id){
    $myDatabase = new Database();
    $sql_query = "select employee_id, fullname from users where employee_id=?"; 
    $param_type = "s";
    $param_array = [$employee_id];
    $user_info = $myDatabase->select($sql_query, $param_type, $param_array);
    return json_encode($user_info);
}

function getAllFmds(){
    $myDatabase = new Database();
     //MIDDLE FINGER IS THE FUCKING THUMB CUZ IM TOO LAZY
    $sql_query = "select indexfinger, middlefinger from users where indexfinger != ''";
    $allFmds = $myDatabase->select($sql_query);
    return json_encode($allFmds);
}

function getAllUsers(){
    $myDatabase = new Database();
    $sql_query = "select employee_id, fullname, indexfinger, middlefinger from users where indexfinger != '' OR middlefinger != ''";
    $users = $myDatabase->select($sql_query);
    return json_encode($users);
}

function getAttendanceLogs($employee_id){
    $myDatabase = new Database();
    $sql_query = "SELECT id, employee_id, time, log_in FROM attendance_logs WHERE employee_id=? ORDER BY id DESC";
    $param_type = "s";
    $param_array = [$employee_id];
    $logs = $myDatabase->select($sql_query, $param_type, $param_array);
    return json_encode($logs);
}