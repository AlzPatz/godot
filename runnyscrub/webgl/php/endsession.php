<?php

	require("common.php"); 
    require("security.php");

    $uname = strval($_GET['name']); 
    $pw = strval($_GET['password']);
    CheckBasicQueryParameters($uname, $pw);

    $key = strval($_GET['key']);
    $score = strval($_GET['score']);
    CheckBasicQueryParameters($key, $score);

    $ip = $_SERVER['REMOTE_ADDR'];
    $datetime_now = new DateTime();
    $time_now = $datetime_now->format('Y-m-d H:i:s'); //Turn into mySQL compatible string
    //CheckIPFlooding($db, $ip, $uname, $datetime_now); //Start and session cannot flood as they coud happen at any time
    
    $user_row = ReturnUserRowIfExists($uname, $db);
    $login_ok = false;
    if($user_row) {
        $login_ok = CheckPassword($pw, $user_row);
    }

    if(!$login_ok) {
        echo "Login Failed!";
        die();
    }

    $trusted_over_final_steps = true;

    $session = ReturnSessionRow($uname, $ip, $db);
    if(!$session) {
    	UserTrustBroken_Sequencing($uname, $ip, $db, "No Active Session was found when asked for at end session");
    	$trusted_over_final_steps = false;
    }

    if(!ValidateEndSessionData($uname, $ip, $db, $score, $key, $session)) {
    	$trusted_over_final_steps = false;
    }

    GenerateEndOfSession($trusted_over_final_steps, $uname, $ip, $db, $score, $key, $session, $datetime_now);
    RemoveAllCurrentSessionsForUsername($uname, $db);
    SetNewSessionAvailable(true, $uname, $db);

    echo "Success!";
    die();

