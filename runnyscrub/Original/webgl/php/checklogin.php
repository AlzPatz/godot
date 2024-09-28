<?php 

    // First we execute our common code to connection to the database and start the session 
    require("common.php"); 
    require("security.php");

    $login_ok = false; 
	$uname_check = strval($_GET['name']); 
	$pw_check = strval($_GET['password']);
    CheckBasicQueryParameters($uname_check, $pw_check);

    $ip = $_SERVER['REMOTE_ADDR'];
    $datetime_now = new DateTime();
    CheckIPFlooding($db, $ip, $uname_check, $datetime_now);

    // Retrieve the user data from the database.  If $row_check is false, then the username 
    // they entered is not registered. 
    $row_check = ReturnUserRowIfExists($uname_check, $db);

    if($row_check) {
        $login_ok = CheckPassword($pw_check, $row_check);
    }

    if(!$login_ok) {
        echo "Login Failed!";
        die();
    }

    //Now we need to check that there are not any outstanding sessions. If there are, then we delete them
    RemoveAllCurrentSessionsForUsername($uname_check, $db); 

    //Update the user table with the new last login time, ip address and also set the flat that a new session is avaliable
    //------------------------------------------------------------------------------------------------------------------------------
    $strdate = $datetime_now->format('Y-m-d H:i:s'); // should already be set from earlier, but do anyway just in case
    $query_updateusertablle = "
    UPDATE users
    SET newsessionavailable = 1, lastlogintime = :time, lastloginip = :ip
    WHERE username = :username
    ";

    $query_params = array(
        ':time' => $strdate,
        ':ip' => $ip,
        ':username' => $uname_check 
    );

    try 
    { 
        // Execute the query to create the user 
        $stmt = $db->prepare($query_updateusertablle); 
        $result = $stmt->execute($query_params); 
    } 
    catch(PDOException $ex) 
    { 
        echo "Failed-PDOException-UpdatingUserTableWithLoginTimeEtc: ". $ex->getMessage();
        die();
    } 
    //------------------------------------------------------------------------------------------------------------------------------
    
    echo "Success!";
    die();
