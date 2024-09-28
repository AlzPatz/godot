<?php

	require("common.php"); 
    require("security.php");

    $uname = strval($_GET['name']); 
    $pw = strval($_GET['password']);
    CheckBasicQueryParameters($uname, $pw);

    $ip = $_SERVER['REMOTE_ADDR'];
    $datetime_now = new DateTime();
    $time_now = $datetime_now->format('Y-m-d H:i:s'); //Turn into mySQL compatible string
    //CheckIPFlooding($db, $ip, $datetime_now); //Can come quickly after updating table later on...//Start and session cannot flood as they coud happen at any time
    
    $user_row = ReturnUserRowIfExists($uname, $db);
    $login_ok = false;
    if($user_row) {
        $login_ok = CheckPassword($pw, $user_row);
    }

    if(!$login_ok) {
        echo "Login Failed!";
        die();
    }

    //Check that there are not any outstanding sessions. If there are, then we delete them
    RemoveAllCurrentSessionsForUsername($uname, $db);
    //Make sure that IP and User Trusted flags are mirrored in case anything has changed (flood vs. generic hack attempt)
    CheckAndCrossUpdateUserAndIPTrust($uname, $db, $user_row, $ip);

    $trusted = true;
    //First check if a new session is allowed. This simple process ording check could stop some primitive 
    //Attempts to use the http requests to submit a fake score
    $newsessionavailable = $user_row['newsessionavailable'];
    if($newsessionavailable != 1) {
        UserTrustBroken_Sequencing($uname, $ip, $db, "Starting new session, sequence is invalid, could be tagged that way if honeypotted last end session and this is restarting now");
        $trusted = false;
    }

    if($user_row['trusted'] === 0) {
        $trusted = false;
    }

    $ReturnKey = GenerateRandomKeyString(5);

    //Register the new game session
    //------------------------------------------------------------------------------------------------------------------------------
    $query = "
        INSERT INTO currentsessions(
            username,
            ip,
            trusted,
            starttime,
            trusted_initially,
            trust_broken_inplay,
            last_checkin_time,
            last_checkin_score,
            checkin_count,
            current_key
        ) VALUES (
            :username,
            :ip,
            :trusted,
            :starttime,
            :trusted,
            :false,
            :starttime,
            :zero,
            :zero,
            :key
        )";

    $zero = 0;
    $params = array(
        'username' => $uname,
        'ip' => $ip,
        'trusted' => $trusted,
        'starttime' => $time_now,
        'false' => $zero,
        'zero' => $zero,
        'key' => $ReturnKey
    );

    try 
    { 
        $stmt = $db->prepare($query); 
        $result = $stmt->execute($params); 
    } 
    catch(PDOException $ex) 
    { 
        echo "Failed: Registering a new session, ";
        echo $ex->getMessage();
        die();
    } 
    //------------------------------------------------------------------------------------------------------------------------------    

    SetNewSessionAvailable(false, $uname, $db);
    echo $ReturnKey;
    die();



