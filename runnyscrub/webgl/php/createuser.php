<?php 

    // First we execute our common code to connection to the database and start the session 
    require("common.php"); 
    require("security.php");
     
	$uname = strval($_GET['name']); 
	$pw = strval($_GET['password']);
    CheckBasicQueryParameters($uname, $pw);

    $ip = $_SERVER['REMOTE_ADDR'];
    $datetime_now = new DateTime();
    CheckIPFlooding($db, $ip, $uname, $datetime_now);

    $result_function = ReturnUserRowIfExists($uname, $db);

    if($result_function) {
        echo "Failed - Username in use, please log in!";
        die();
    }


    //Now we add the new user to the database. At the same time we mark the user as logged in (i.e. that a new session is avaliable)
    //------------------------------------------------------------------------------------------------------------------------------

    // An INSERT query is used to add new rows to a database table. 
    // Again, we are using special tokens (technically called parameters) to 
    // protect against SQL injection attacks. 
    $query = " 
        INSERT INTO users ( 
            username, 
            password, 
            salt, 
            lastlogintime,
            lastloginip,
            newsessionavailable
        ) VALUES ( 
            :username, 
            :password, 
            :salt, 
            :lastlogintime,
            :lastloginip,
            :newsessionavailable
        ) 
    "; 
     
    // A salt is randomly generated here to protect again brute force attacks 
    // and rainbow table attacks.  The following statement generates a hex 
    // representation of an 8 byte salt.  Representing this in hex provides 
    // no additional security, but makes it easier for humans to read. 
    // For more information: 
    // http://en.wikipedia.org/wiki/Salt_%28cryptography%29 
    // http://en.wikipedia.org/wiki/Brute-force_attack 
    // http://en.wikipedia.org/wiki/Rainbow_table 
    $salt = dechex(mt_rand(0, 2147483647)) . dechex(mt_rand(0, 2147483647)); 
     
    // This hashes the password with the salt so that it can be stored securely 
    // in your database.  The output of this next statement is a 64 byte hex 
    // string representing the 32 byte sha256 hash of the password.  The original 
    // password cannot be recovered from the hash.  For more information: 
    // http://en.wikipedia.org/wiki/Cryptographic_hash_function 
    $pwhash = hash('sha256',$pw . $salt); 
     
    // Next we hash the hash value 65536 more times.  The purpose of this is to 
    // protect against brute force attacks.  Now an attacker must compute the hash 65537 
    // times for each guess they make against a password, whereas if the password 
    // were hashed only once the attacker would have been able to make 65537 different  
    // guesses in the same amount of time instead of only one. 
    for($round = 0; $round < 65536; $round++) 
    { 
        $pwhash = hash('sha256', $pwhash . $salt); 
    } 
     
    // Here we prepare our tokens for insertion into the SQL query.  We do not 
    // store the original password; only the hashed version of it.  We do store 
    // the salt (in its plaintext form; this is not a security risk). 
	
    $current_time = new DateTime();
    $current_time->getTimestamp();
    $str_time = $current_time->format('Y-m-d H:i:s');
    $new_sesh = 1;
    $query_params = array( 
        ':username' => $uname, 
        ':password' => $pwhash, 
        ':salt' => $salt, 
        ':lastlogintime' => $str_time,
        ':lastloginip' => $ip,
        ':newsessionavailable' => $new_sesh
    ); 
     
    try 
    { 
        // Execute the query to create the user 
        $stmt = $db->prepare($query); 
        $result = $stmt->execute($query_params); 
    } 
    catch(PDOException $ex) 
    { 
      	echo "Failed-PDOException - Adding a new user to the table";
        echo $ex->getMessage();
		die();
    } 
    //------------------------------------------------------------------------------------------------------------------------------

    RemoveAllCurrentSessionsForUsername($uname, $db); //Although as we just created the user it is unlikely that there are any sessions...

    echo "Success!";
    die();
