<?php

	function CheckBasicQueryParameters($uname, $pw) {
		if(empty($uname) || empty($pw))
		{
			echo "Failed-Empty";
			die();
		}
	}

	function CheckIPFlooding($db, $ip, $uname, $datetime_now) 
	{
		//Let's make sure the IP address has not requested a login (or create user) too recently 
	    //=========================================================================================================
	    $query_ipcheck = "
	        SELECT
	            time_lastlogin
	        FROM iplogintracking
	        WHERE
	            ip = :ip
	        AND
	        	username = :uname
	        ";

	    $queryparams_ipcheck = array(
	        ':ip' => $ip,
	        ':uname' => $uname
	        );

	    try 
	    { 
	        // These two statements run the query against your database table. 
	        $stmt_checkip = $db->prepare($query_ipcheck); 
	        $result_checkip = $stmt_checkip->execute($queryparams_ipcheck); 
	    } 
	    catch(PDOException $ex) 
	    { 
	        echo "Failed-PDOException-IPCheck";
	        die();
	    }  

	    $datetime_now->getTimestamp();

	    $row_checkip = $stmt_checkip->fetch();
	    if($row_checkip)
	    {
	        //IP address found, so we check the time of last login compared to now
	        $time_last = strtotime($row_checkip['time_lastlogin']);
	        $time_now = strtotime($datetime_now->format('Y-m-d H:i:s'));
	        $delta = $time_now - $time_last;

	        if($delta < 2) {
	            //Login too fast
	            //Update last time attempted
	            //Note we are not updating trust values on floods from IPs. Just in case is innocent somehow
	            $strdate = $datetime_now->format('Y-m-d H:i:s');
	            $query_updateiptime = "
	            UPDATE iplogintracking
	            SET time_lastlogin = :time, caught_flooding = 1
	            WHERE ip= :ip";
	            $query_params = array(
	                ':time' => $strdate,
	                ':ip' => $ip,
	            );
	            try 
	            { 
	                // Execute the query to create the user 
	                $stmt = $db->prepare($query_updateiptime); 
	                $result = $stmt->execute($query_params ); 
	            } 
	            catch(PDOException $ex) 
	            { 
	                echo "Failed-PDOException-UPDATEIPTIME-FailedFloodTest";
	                die();
	            }
	            //Fail as this is flood request
	            echo "Failed-LastLoginWithin2Seconds";
	            die();
	        }
	        else {
	            //OK (just update the ip table with the latest login time)
	            //Update last time attempted
	            $strdate = $datetime_now->format('Y-m-d H:i:s');
	            $query_updateiptime = "
	            UPDATE iplogintracking
	            SET time_lastlogin = :time
	            WHERE ip= :ip";
	            $query_params = array(
	                ':time' => $strdate,
	                ':ip' => $ip,
	            );
	            try 
	            { 
	                // Execute the query to create the user 
	                $stmt = $db->prepare($query_updateiptime); 
	                $result = $stmt->execute($query_params); 
	            } 
	            catch(PDOException $ex) 
	            { 
	                echo "Failed-PDOException-UPDATEIPTIME-PassedFloodTest";
	                echo $ex->getMessage();
	                die();
	            }
	        }
	    }
	    else 
	    {
	        //IP not found, so we add a row
	        $query_insertnewiptime = "
	        INSERT INTO iplogintracking(
	            ip,
	            username,
	            time_firstlogin,
	            time_lastlogin,
	            caught_flooding
	        ) VALUES (
	            :ip,
	            :uname,
	            :time_first,
	            :time_last,
	            0
	        )
	        ";
	        $queryparams_ipcheck = array(
	            ':ip' => $ip,
	            ':uname' => $uname,
	            ':time_first' => $datetime_now->format('Y-m-d H:i:s'),
	            ':time_last' => $datetime_now->format('Y-m-d H:i:s')
	            );

	        try 
	        { 
	            // Execute the query to create the user 
	            $stmt = $db->prepare($query_insertnewiptime); 
	            $result = $stmt->execute($queryparams_ipcheck); 
	        } 
	        catch(PDOException $ex) 
	        { 
	            echo "Failed-PDOException-NEWIPTIMEADD";
	            die();
	        } 
	    }
	}

	function ReturnUserRowIfExists($uname, $db) {
		 // We will use this SQL query to see whether the username entered by the 
	     // user is already in use.  A SELECT query is used to retrieve data from the database. 
	     // :username is a special token, we will substitute a real value in its place when 
	     // we execute the query. 
		 $query = " 
            SELECT 
                id,
                username,
                password,
                salt,
                trusted,
                tarnished_by_ip,
                detected_incorrect_session_sequence,
                detected_invalid_score_submission,
                highscore,
                lastlogintime,
                lastloginip,
                number_started_sessions,
                number_completed_sessions,
                newsessionavailable,
                latest_user_notes
            FROM users 
            WHERE 
                username = :username 
        "; 
         // This contains the definitions for any special tokens that we place in 
	     // our SQL query.  In this case, we are defining a value for the token 
	     // :username.  It is possible to insert $_POST['username'] directly into 
	     // your $query string; however doing so is very insecure and opens your 
	     // code up to SQL injection exploits.  Using tokens prevents this. 
	     // For more information on SQL injections, see Wikipedia: 
	     // http://en.wikipedia.org/wiki/SQL_Injection 
        $query_params = array( 
            ':username' => $uname 
        ); 
         
        try 
        { 
            // These two statements run the query against your database table. 
            $stmt = $db->prepare($query); 
            $result = $stmt->execute($query_params); 
        } 
        catch(PDOException $ex) 
        { 
			echo "Failed-PDOException - Returning user row if exists";
			die();
            //die("Failed to run query: " . $ex->getMessage()); 
        } 
         
        // The fetch() method returns an array representing the "next" row from 
        // the selected results, or false if there are no more rows to fetch. 
        $row = $stmt->fetch(); 
         
        //We are not returning a bool, rather the row.. which could be "false" if no row
		return $row;
	}

	function RemoveAllCurrentSessionsForUsername($uname, $db) {
		//If there are any sessions for the user, then we delete them
        $query_check = " 
        DELETE FROM 
            currentsessions 
        WHERE 
            username = :username 
         "; 
     
        $query_params_check = array( 
            ':username' => $uname 
        ); 
     
        try 
        { 
            $stmt_check = $db->prepare($query_check); 
            $result_check = $stmt_check->execute($query_params_check); 
        } 
        catch(PDOException $ex) 
        { 
            echo "Failed-PDOException- Deleting possible sessions";
            echo $ex->getMessage();
            die();
        } 
	}

	function SetNewSessionAvailable($avaliable, $uname, $db) {
		//This function assumes that you have already validated the username and password...
		$aval = 0;
		if($avaliable) {
			$aval = 1;
		}

		$query = "
			UPDATE users
			SET newsessionavailable = :available
			WHERE username = :username
		";

		$query_params = array(
			':available' => $aval,
			':username' => $uname 
			);

		try 
	    { 
	        // Execute the query to create the user 
	        $stmt = $db->prepare($query); 
	        $result = $stmt->execute($query_params); 
	    } 
	    catch(PDOException $ex) 
	    { 
	        echo "Failed-PDOException-Setting New Session Available: ". $ex->getMessage();
	        die();
	    } 
	}

	function ReturnSessionRow($uname, $ip, $db) { //don't need to pass ip lol. remove from all functions.. TO DO 
		//This function assumes that you have already validated the username and password...
		 $query = " 
            SELECT 
                ip,
                trusted,
                starttime,
                trusted_initially,
                trust_broken_inplay,
               	last_checkin_time,
               	last_checkin_score,
               	checkin_count, 
               	current_key,
               	first_error
            FROM currentsessions 
            WHERE 
                username = :username 
        "; 
        $query_params = array( 
            ':username' => $uname 
        ); 
         
        try 
        { 
            // These two statements run the query against your database table. 
            $stmt = $db->prepare($query); 
            $result = $stmt->execute($query_params); 
        } 
        catch(PDOException $ex) 
        { 
			echo "Failed-PDOException - Checking session if exists: ". $ex->getMessage();
			die();
        } 
         
        $row = $stmt->fetch(); 
        return $row;
	}

	function CheckPassword($pw_check, $row_check) {
		// Using the password submitted by the user and the salt stored in the database, 
        // we now check to see whether the passwords match by hashing the submitted password 
        // and comparing it to the hashed version already stored in the database. 
        $checker = hash('sha256', $pw_check . $row_check['salt']); 
        
		for($rcount = 0; $rcount < 65536; $rcount++) 
        { 
            $checker = hash('sha256', $checker . $row_check['salt']); 
        } 

        return $checker === $row_check['password'];
	}

	function GenerateRandomKeyString($len) {
	   $string = '';
	   $characters = "ABCDEFHJKLMNPRTVWXYZ";
	   for ($p = 0; $p < $len; $p++) {
	       $string .= $characters[mt_rand(0, strlen($characters)-1)];
	   }
	   return $string;
	}

	function CheckAndCrossUpdateUserAndIPTrust($uname, $db, $user_row, $ip) {
		//We know that username is valid, and that ip should be in the table..
    	$query = "
        SELECT
            caught_flooding
        FROM iplogintracking
        WHERE
            ip = :ip
        ";

   		$query_params = array(
        	':ip' => $ip
        );
     
        try 
        { 
            // These two statements run the query against your database table. 
            $stmt = $db->prepare($query); 
            $result = $stmt->execute($query_params); 
        } 
        catch(PDOException $ex) 
        { 
			echo "Failed-PDOException - Finding ip when cross checking user trust with flooding: ". $ex->getMessage();
			die();
        } 
         
        $row = $stmt->fetch(); 
		
		if(!$row) {
			//Very unlikley and incorrect, here will just fail with an warning
			echo "Failed - Strange - IP unable to be found in table even though login would have been forced earlier: ";
			die();
		}

		if($row['caught_flooding'] === 0) {
			return;
		}

		//As caught flooding, if trusted and tarnished_by_ip not already set, set them
		if($user_row['trusted'] === 0 || $user_row['tarnished_by_ip'] === 0) {
			$query = "
				UPDATE users
				SET tarnished_by_ip = :	tarnished_by_ip, 
					trusted = :trusted,
				WHERE username = :username
			";

			$query_params = array(
				':username' => $uname,
				':tarnished_by_ip' => $true,
				':trusted' => $false, 
				);

			try 
		    { 
		        // Execute the query to create the user 
		        $stmt = $db->prepare($query); 
		        $result = $stmt->execute($query_params); 
		    } 
		    catch(PDOException $ex) 
		    { 
		        echo "Failed-PDOException- Updating User Table when Tranfering flood catch to user table: ". $ex->getMessage();
		        die();
		    }
		}
	}

	function UserTrustBroken_Sequencing($uname, $ip, $db, $msg) {
		//By here we know that the user is valid, as well as the password...

		$true = 1;
		$false = 0;

		$query = "
			UPDATE users
			SET detected_incorrect_session_sequence = :incorrect_sequence, 
				trusted = :trusted,
				latest_user_notes = :notes
			WHERE username = :username
		";

		$query_params = array(
			':username' => $uname,
			':incorrect_sequence' => $true,
			':trusted' => $false, 
			':notes' => $msg
			);

		try 
	    { 
	        // Execute the query to create the user 
	        $stmt = $db->prepare($query); 
	        $result = $stmt->execute($query_params); 
	    } 
	    catch(PDOException $ex) 
	    { 
	        echo "Failed-PDOException- Updating User Table when Sequencing trust broken: ".$msg." _____MSG______". $ex->getMessage();
	        die();
	    }
	}

	function UpdateSession_TrustBrokenOnTick($uname, $ip, $db) {
		//By here we know that the user is valid, as well as the password and the session...
		$true = 1;
		$false = 0;

		$query = "
			UPDATE currentsessions
			SET trust_broken_inplay = :broken, 
				trusted = :trusted
			WHERE username = :username
		";

		$query_params = array(
			':username' => $uname,
			':broken' => $true,
			':trusted' => $false
			);

		try 
	    { 
	        // Execute the query to create the user 
	        $stmt = $db->prepare($query); 
	        $result = $stmt->execute($query_params); 
	    } 
	    catch(PDOException $ex) 
	    { 
	        echo "Failed-PDOException- Updating Current Sesssion Table when tick trust broken: ". $ex->getMessage();
	        die();
	    }
	}

	function UpdateSession_TrustBrokenOnEnd($uname, $ip, $db) {
		//By here we know that the user is valid, as well as the password and the session...
		//Think this isn't needed as this row is basically deleted once the finished session is made which deduces its own trust fails
		$true = 1;
		$false = 0;

		$query = "
			UPDATE currentsessions
			SET
				trusted = :trusted
			WHERE username = :username
		";

		$query_params = array(
			':username' => $uname,
			':trusted' => $false
			);

		try 
	    { 
	        // Execute the query to create the user 
	        $stmt = $db->prepare($query); 
	        $result = $stmt->execute($query_params); 
	    } 
	    catch(PDOException $ex) 
	    { 
	        echo "Failed-PDOException- Updating Current Sesssion Table when tick trust broken: ". $ex->getMessage();
	        die();
	    }
	}

	function UpdateSession_TickData($uname, $ip, $db, $score, $key, $current_time, $row) {
		//We arrive here knowing that the login works and there is a session to update
		$count = $row['checkin_count'] + 1;
		$query = "
			UPDATE currentsessions
			SET last_checkin_time = :lastcheckintime, 
				last_checkin_score = :score,
				checkin_count = :count,
				current_key = :key
			WHERE username = :username
		";

		$query_params = array(
			':username' => $uname,
			':lastcheckintime' => $current_time,
			':score' => $score, 
			':count' => $count,
			':key' => $key 
			);

		try 
	    { 
	        // Execute the query to create the user 
	        $stmt = $db->prepare($query); 
	        $result = $stmt->execute($query_params); 
	    } 
	    catch(PDOException $ex) 
	    { 
	        echo "Failed-PDOException- Updating Session Tick Data: ". $ex->getMessage();
	        die();
	    } 
	}

	function ValidateTickData($uname, $ip, $db, $score, $key, $row){
		//We arrive here knowing that there is a session active and some of it's info is in $row
		//i.e. no need to check for false on $row itself

        $valid = true;

		//Check 1: Time since last update is not too short or long
		$datetime_now = new DateTime();
		$datetime_now->getTimestamp();
    	$time_now = strtotime($datetime_now->format('Y-m-d H:i:s'));
        $time_last = strtotime($row['last_checkin_time']);
        $delta = $time_now - $time_last;

       if($delta > 30) {
    		UserTrustBroken_Sequencing($uname, $ip, $db, "Session Tick came after more than 30 seconds...");
    		$valid = false;
    	}

    	if($delta < 3) {
    		UserTrustBroken_Sequencing($uname, $ip, $db, "Session Tick came quicker than 3 second interval...");
    		$valid = false;
    	}

		//Check 2: Check the key is correct
    	if($key != $row['current_key']) {
    		UserTrustBroken_Sequencing($uname, $ip, $db, "Incorrect Key Submission...TICK");
    		$valid = false;
    	}

		//Check 3: Check the maths of the score.. is it obviously erroneous
    	//TO DO ============================================================

		//If invalidated then update the session data
    	if(!$valid) {
    		UpdateSession_TrustBrokenOnTick($uname, $ip, $db);
    	}
	}

	function ValidateEndSessionData($uname, $ip, $db, $score, $key, $row) {
		//We arrive here knowing that there is a session active and some of it's info is in $row
		//i.e. no need to check for false on $row itself

        $valid = true;

		//Check 1: Time since last update is not too long (can be very short if game ends quickly after an update...)
		$datetime_now = new DateTime();
		$datetime_now->getTimestamp();
    	$time_now = strtotime($datetime_now->format('Y-m-d H:i:s'));
        $time_last = strtotime($row['last_checkin_time']);
        $delta = $time_now - $time_last;

       if($delta > 30) {
    		UserTrustBroken_Sequencing($uname, $ip, $db, "Session End came after more than 30 seconds since last tick...");
    		$valid = false;
    	}

    	//Check 2: Check the key is correct
    	if($key != $row['current_key']) {
    		UserTrustBroken_Sequencing($uname, $ip, $db, "Incorrect Key Submission...END");
    		$valid = false;
    	}

    	//Check 3: Check the maths of the score.. is it obviously erroneous
    	//TO DO ============================================================

		//If invalidated then update the session data
    	if(!$valid) {
    		UpdateSession_TrustBrokenOnEnd($uname, $ip, $db);
    	}

    	return $valid;
	}

	function GenerateEndOfSession($trusted_over_final_steps, $uname, $ip, $db, $score, $key, $row, $datetime_now) {
		//Just in case we didn't have the user tagged as untrusted due to recent flooding..
		$honeypot = 0;
		$user_row = ReturnUserRowIfExists($uname, $db); //We know this is valid
		CheckAndCrossUpdateUserAndIPTrust($uname, $db, $user_row, $ip);
		if($user_row['trusted'] === 0) {
        	$honeypot = 1;
    	}

		if($row['trusted'] == 0) {
			$honeypot = 1;
		}

		if(!$trusted_over_final_steps) {
			$honeypot = 1;
		}

		$start_time = $row['starttime'];
		//$start_time_string = $start_time->format('Y-m-d H:i:s'); 

		$end_time = $datetime_now;
		$trustinplay = $row['trust_broken_inplay'];
		if($trusted_over_final_steps) {
			$trustatend = 0;
		}
		else {
			$trustatend = 1;
		}
		$trust_init = $row['trusted_initially'];
		$count = $row['checkin_count'];
		$error = $row['first_error'];

		$query = "
				INSERT INTO finishedsessions (
					username,
					ip,
					score,
					start_time,
					end_time,
					honeypot,
					trusted_initially,
					trust_broken_inplay,
					trust_broken_atend,
					checkin_count,
					first_error
				) VALUES (
					:username,
					:ip,
					:score,
					:start_time,
					:end_time,
					:honeypot,
					:trust_init,
					:trust_inplay,
					:trust_atend,
					:count,
					:error
				)
		";

		$query_params = array( 
	        ':username' => $uname, 
	        ':ip' => $ip,
	        ':score' => $score, 
	        ':start_time' => $start_time, 
	        ':end_time' => $datetime_now->format('Y-m-d H:i:s'),
	        ':honeypot' => $honeypot,
	        ':trust_init' => $trust_init,
	        ':trust_inplay' => $trustinplay,
	        ':trust_atend' => $trustatend,
	        ':count' => $count,
	        ':error' => $error
	    ); 

	    try 
	    { 
	        // Execute the query to create the user 
	        $stmt = $db->prepare($query); 
	        $result = $stmt->execute($query_params); 
	    } 
	    catch(PDOException $ex) 
	    { 
	      	echo "Failed-PDOException - Generating end of session data: ";
	        echo $ex->getMessage();
			die();
	    } 

	    //If it is the user's high score then can update!
	    if($score > $user_row['highscore']) {
		    $query = "
				UPDATE users
				SET highscore = :highscore
				WHERE username = :username
			";

			$query_params = array(
				':highscore' => $score,
				':username' =>  $uname
				);

			try 
		    { 
		        // Execute the query to create the user 
		        $stmt = $db->prepare($query); 
		        $result = $stmt->execute($query_params); 
		    } 
		    catch(PDOException $ex) 
		    { 
		        echo "Failed-PDOException- Updating User highscore: ". $ex->getMessage();
		        die();
		    } 
	    }

	    //We need to increment the number of completed sessions and then if
	    //it is not a honey pot then we can tag the user and available for another session

	    $avail = 1;
	    if($honeypot) {
	    	$avail = 0;
	    }

	    $numcomplete = $user_row['number_completed_sessions'] + 1;

	    $query = "
			UPDATE users
			SET number_completed_sessions = :number_completed_sessions, 
				newsessionavailable = :newsessionavailable
			WHERE username = :username
		";

		$query_params = array(
			':number_completed_sessions' => $numcomplete,
			':newsessionavailable' => $avail,
			':username' =>  $uname
			);

		try 
	    { 
	        // Execute the query to create the user 
	        $stmt = $db->prepare($query); 
	        $result = $stmt->execute($query_params); 
	    } 
	    catch(PDOException $ex) 
	    { 
	        echo "Failed-PDOException- Updating user table with number of completed sessions and if another sesh valid: ". $ex->getMessage();
	        die();
	    } 
    }