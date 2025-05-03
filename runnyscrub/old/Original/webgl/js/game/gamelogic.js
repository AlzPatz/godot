function gameLogicObject(main, director){
	this.main = main;
	this.director = director;
	this.state;

	//Control for web services pause
	this.wbtoggle;
	this.wbtoggle2;
	this.wbtimer;
	//Working
	this.timer;
	this.fraction;
	this.mfrac;

	this.havekey = true;
	this.key;

	this.time_since_last_tick = 0;
	this.tick_interval = 15; //15 seconds
}

gameLogicObject.prototype.initialise = function() {
	this.resetGameLogicAndSendSessionStartRequest();
}

gameLogicObject.prototype.resetGameLogicAndSendSessionStartRequest = function() {
	this.state = "waitingforserver_gamestart";
	this.director.bGoodToGo = false;
	this.wbtoggle = false;
	this.wbtimer = 0.0;

	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
		this.director.server.httpRequest=new XMLHttpRequest();
	}
	else {// code for IE6, IE5
		this.director.server.httpRequest=new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	this.director.server.httpRequest.onreadystatechange=function() {
		if (game.screen_main.director.server.httpRequest.readyState==4 && game.screen_main.director.server.httpRequest.status==200) {
			game.screen_main.director.server.requestResponseText = game.screen_main.director.server.httpRequest.responseText;
			game.screen_main.director.bGoodToGo = true;
		}
	  }
	this.director.server.httpRequest.open("GET","php/startsession.php?name="+this.director.user.username+"&password="+this.director.user.password,true);
	this.director.server.httpRequest.send();
}

gameLogicObject.prototype.update = function() {
	switch(this.state) {
		case "waitingforserver_gamestart":
			//graphics.sfx.setAndTriggerEffectsTarget(false, 3.0, [0.0,1.0,1.0,0.0], [0.8,0.6,1.0,1.0], 600, 450, 0.5, false);
			this.director.draw_BgGrayBorders();
			if(!this.wbtoggle) {
				//Setting up
				this.fraction = this.wbtimer / this.main.trans_t_webconnect;
				if(this.fraction > 1.0) {
					this.wbtoggle = true;
					this.wbtoggle2 = false;
					this.fraction = 1.0;
					this.director.server.intro_angle = 0.0;
				}
				this.director.server.drawMsgIntro(this.fraction, this.main.trans_t_webconnect);
			}
			else {
				//Displaying results
				if(!this.wbtoggle2) {
					this.director.server.drawMsgWait();
					if(this.director.bGoodToGo) {
						this.wbtoggle2 = true;
						this.director.server.setUpSpinToAxisAllign();
					}
				}
				else {
					if(this.director.server.drawSpinToAxisAllign()) {
						this.state = "server_displaystartmsg_intro";
						this.wbtimer = 0.0;
						this.time_since_last_tick = 0;
					}
				}
			}
		this.wbtimer += frameTimer.seconds;
		this.director.applyStandardMenuBackgroundScroll();
		break;
		case "server_displaystartmsg_intro":
			this.director.draw_BgGrayBorders();
			this.fraction = this.wbtimer / this.main.trans_t_webdisplayresults;
			if(this.fraction > 1.0) {
				this.fraction = 1.0;
				this.state = "server_displaymsg";
				this.wbtimer = 0.0;
				var text = "";
				switch(this.director.server.requestResponseText.length) {
					default:
						this.director.server.setupMsgResultText("::NAK:: ERROR!... Unable to find fugitive... ::EOT::");
						//Session Fail.. 
						console.log(this.director.server.requestResponseText);
					break;
					case 5:
						//Look for length 5
						this.key = this.director.server.requestResponseText;
						this.director.server.setupMsgResultText("::ACK:: Fugitive Targetted... ::EOT::");
					break;
				}
				this.wbtoggle = false;
			}
			this.director.server.drawMsgResultIntro(this.fraction);
		this.wbtimer += frameTimer.seconds;
		this.director.applyStandardMenuBackgroundScroll();
		break;
		case "server_displaymsg":
			this.director.draw_BgGrayBorders();
			if(!this.wbtoggle) {
					this.fraction = this.wbtimer / this.main.trans_t_webdisplayresults2;
					if(this.fraction > 1.0) {
						this.fraction = 1.0;
						this.wbtoggle = true;
						this.wbtimer = 0.0;
					}
					this.director.server.drawMsgResult(this.fraction);
				}
				else {
					//Wait sometime then exit
					this.director.server.drawMsgResult(1.0);
					if(this.wbtimer > this.main.web_msg_persist_time) {
						switch(this.director.server.requestResponseText.length) {
								case 5:
								//Back to main menu
								this.state = "server_transtogame";
								this.wbtimer = 0.0;
							break;
							default:
								// TO DO SESSION FAIL!
								console.log("TO DO: What if register session fails");
							break;
						}
					}
				}
		this.wbtimer += frameTimer.seconds;
		this.director.applyStandardMenuBackgroundScroll();
		break;
		case "server_transtogame":
			this.director.draw_BgGrayBorders();
			this.fraction = this.wbtimer / this.main.web_msg_backtomainmenu_time;
			if(this.fraction >= 1.0) {
				this.fraction = 1.0;
				this.state = "bg_borderout";
				this.wbtimer = 0.0;
			}

			if(this.fraction <= 0.333333) {
				this.fraction = 1.0 - ( this.director.fractionModifier(3.0 * this.fraction));
				this.director.server.drawMsgResult(this.fraction);
			}
			else {
				if(this.fraction <= 0.666666) {
					this.fraction = 1.0 - (this.director.fractionModifier(3.0 * (this.fraction - 0.333333)));
					this.director.server.drawMsgResultIntro(this.fraction);
				}
				else {
					this.fraction = 1.0 - (this.director.fractionModifier(3.0 * (this.fraction - 0.666666)));
					this.director.server.drawMsgIntro(this.fraction, 0.333333 * this.main.web_msg_backtotextentry_time);
				}
			}
		this.wbtimer += frameTimer.seconds;
		this.director.applyStandardMenuBackgroundScroll();
		break;
		case "bg_borderout":
			//Remove the back ground frame
			this.fraction = this.wbtimer / this.main.bg_grayborder_timetoenter;
			if(this.fraction > 1.0) {
				this.fraction = 1.0;
				this.state = "game_init";
			}
			this.fraction = 1.0 - this.fraction;		

			this.director.draw_BgGrayBorders_Frac(this.fraction);
			this.director.applyStandardMenuBackgroundScroll();
			this.wbtimer += frameTimer.seconds;

			/*
			this.discalc = 0.5 * this.fraction * this.main.bg_grayborder_percentscreentocover * graphics.c_height;
			//Top Black Bar
			graphics.requestDrawGUI("blackpixel", graphics.c_halfwidth,0.5 * this.discalc, graphics.c_width, this.discalc,0.0,
									this.main.bg_grayborder_depth,this.main.bg_grayborder_opacity,this.main.bg_grayborder_opacity,this.main.bg_grayborder_opacity,this.main.bg_grayborder_opacity, 
									0.0, 0.0, 1.0,1.0);
			//Top White Bar
			graphics.requestDrawGUI("whitepixel", graphics.c_halfwidth, this.discalc, graphics.c_width, this.main.bg_whitebar_thickness,0.0,
									this.main.bg_whitebar_depth,this.main.bg_whitebar_opacity,this.main.bg_whitebar_opacity,this.main.bg_whitebar_opacity,this.main.bg_whitebar_opacity, 
									0.0, 0.0, 1.0,1.0);
			//Bottom Black Bar
			graphics.requestDrawGUI("blackpixel", graphics.c_halfwidth, graphics.c_height - (0.5 * this.discalc), graphics.c_width, this.discalc,0.0,
									this.main.bg_grayborder_depth,this.main.bg_grayborder_opacity,this.main.bg_grayborder_opacity,this.main.bg_grayborder_opacity,this.main.bg_grayborder_opacity, 
									0.0, 0.0, 1.0,1.0);
			//Bottom White Bar
			graphics.requestDrawGUI("whitepixel", graphics.c_halfwidth, graphics.c_height - this.discalc, graphics.c_width, this.main.bg_whitebar_thickness,0.0,
									this.main.bg_whitebar_depth,this.main.bg_whitebar_opacity,this.main.bg_whitebar_opacity,this.main.bg_whitebar_opacity,this.main.bg_whitebar_opacity, 
									0.0, 0.0, 1.0,1.0);
			*/

		break;
		case "game_init":
			this.director.applyStandardMenuBackgroundScroll();
			//One frame, just set up the count down timer 

			//To enable the correct platform creation, we need to know how far the various zooms will go

			//The tracking to player start is comprised of three stages
			//1. Accelerate from base scroll speed to speed max
			//2. Hold Speed Max for a time
			//3. Deccelerate from Speed Max to Speed Mind (which is the speed we want to arrive at the player, normally 0)

			//Split total time up into their respective parts
			this.duration_stage1 = this.main.g_introTime * this.main.g_introfrac_stage1;
			this.duration_stage2 = this.main.g_introTime * this.main.g_introfrac_stage2;
			this.duration_stage3 = this.main.g_introTime - this.duration_stage1 - this.duration_stage2;

			this.v_init = this.main.world_menuScrollSpeed; //Speed as finishing the webservices intro
			this.v_max = this.v_init * this.main.g_intro_max_speed_scalar; //max speed that is held for a duration
			this.v_min = this.main.character_speedBase;//this.main.g_intro_speed_end; //speed going when reaches target (normally 0 but might want a rolling start..)

			this.distance_stage1 = this.calcDistanceOverSmoothAcceleration(this.v_init, this.v_max, this.duration_stage1);
			this.distance_stage2 = this.v_max * this.duration_stage2; //Constant speed
			this.distance_stage3 = this.calcDistanceOverSmoothAcceleration(this.v_max, this.v_min, this.duration_stage3);

			this.distance_total = 	this.distance_stage1 + 
									this.distance_stage2 +
									this.distance_stage3;

			//console.log("Total Distance for Tracking: " + this.distance_total);

			this.g_currentx = this.director.cameraFocus.x;
			this.g_currenty = this.director.cameraFocus.y;
			this.g_targetx = this.g_currentx + this.distance_total - graphics.c_halfwidth; //This should not be minus!!
			this.g_targety = +0.5 * this.main.character_height;
			this.g_deltay = this.g_targety - this.g_currenty;

			this.main.platformBuilder.setUpForIntro(this.g_targetx);
				
			//console.log("Tracking Expected from: " + this.g_currentx + " , to , " + this.g_targetx);

			this.timer = 0.0;
			this.main.character.initialise(this.g_targetx, this.g_targety, this.main.platformBuilder.numActivePlatforms - 1);
			this.main.character.active = true;

			//graphics.sfx.setAndTriggerEffectsTarget(false, 0.75 * this.main.g_introTime, [0.0,1.0,1.0,0.0], [0.8,0.6,1.0,1.0], 600, 450, 0.9, true);
			//graphics.sfx.setAndTriggerEffectsTarget(false, 0.75 * this.main.g_introTime, [0.0,0.0,1.0,1.0], [0.8,0.6,1.0,1.0], 400, 300, 0.66, false);
			//graphics.sfx.setAndTriggerEffectsTarget(false, 1.0, [0.0,0.0,0.0,0.0], [1.0,1.0,1.0,1.0], 400, 300, 0.0, false);
			this.state = "game_intro";
		break;
		case "game_intro":
			this.timer += 0.016666667; //Need to smooth out frame timer
			this.fraction = this.timer / this.main.g_introTime;
			if(this.fraction >= 1.0) {
				this.fraction = 1.0;
				this.state = "game";
				this.main.character.state = "running";
			}			

			this.posx;
			this.posy;

			if(this.fraction <= this.main.g_introfrac_stage1) {
				this.frac = this.fraction / this.main.g_introfrac_stage1;
				this.posx = this.g_currentx + 
							this.calcAccIntegral(this.frac * this.duration_stage1, 
												this.v_init, 
												this.v_max, 
												this.duration_stage1);
			}
			else {
				if(this.fraction <= this.main.g_introfrac_stage2 + this.main.g_introfrac_stage1) {
					this.posx = this.g_currentx + 
								this.distance_stage1 + 
								(this.v_max * (((this.fraction - this.main.g_introfrac_stage1) / 
												this.main.g_introfrac_stage2) * this.duration_stage2));
				}
				else {
					this.frac = this.fraction - this.main.g_introfrac_stage1 - this.main.g_introfrac_stage2;
					this.frac = this.frac / (1.0 - this.main.g_introfrac_stage1 - this.main.g_introfrac_stage2);
					this.posx = this.g_currentx +
								this.distance_stage1 +
								this.distance_stage2 +
								this.calcAccIntegral(this.frac * this.duration_stage3,
									this.v_max, 
									this.v_min, 
									this.duration_stage3);
				}
			}

			this.director.cameraFocus.x = Math.floor(this.posx);
			this.director.cameraFocus.y = Math.floor(this.g_currenty + (this.g_deltay * this.fraction));

		break;
		case "game":
			this.director.cameraFocus.x = Math.floor(this.main.character.position.x) + graphics.c_halfwidth;;
			this.director.cameraFocus.y = Math.floor(this.main.character.position.y);
			if(this.main.character.isDead) {
				this.state = "game_end";
			}

			this.time_since_last_tick += frameTimer.seconds;
			if(this.havekey && this.time_since_last_tick > this.tick_interval) {
				this.time_since_last_tick = 0;
				this.havekey = false;
				if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
					this.director.server.httpRequest=new XMLHttpRequest();
				}
				else {// code for IE6, IE5
					this.director.server.httpRequest=new ActiveXObject("Microsoft.XMLHTTP");
				}
				
				this.director.server.httpRequest.onreadystatechange=function() {
					if (game.screen_main.director.server.httpRequest.readyState==4 && game.screen_main.director.server.httpRequest.status==200) {
						game.screen_main.director.server.requestResponseText = game.screen_main.director.server.httpRequest.responseText;
						game.screen_main.director.gamelogic.havekey = true;
						game.screen_main.director.gamelogic.key = game.screen_main.director.server.requestResponseText;
						console.log("Session Tick Return: " + game.screen_main.director.gamelogic.key);
					}
				  }
				this.director.server.httpRequest.open("GET","php/ticksession.php?name="+this.director.user.username+"&password="+this.director.user.password+"&key="+this.key+"&score=999",true);
				console.log("Session Tick Send: " + this.key);
				this.director.server.httpRequest.send();
			}
		break;
		case "game_end":
			//Temp loop code
			this.director.applyStandardMenuBackgroundScroll();
			this.main.character.isDead = false;
			this.main.character.active = false;

			if(this.havekey) {
				this.director.bGoodToGo = false;
				if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
					this.director.server.httpRequest=new XMLHttpRequest();
				}
				else {// code for IE6, IE5
					this.director.server.httpRequest=new ActiveXObject("Microsoft.XMLHTTP");
				}
				
				this.director.server.httpRequest.onreadystatechange=function() {
					if (game.screen_main.director.server.httpRequest.readyState==4 && game.screen_main.director.server.httpRequest.status==200) {
						game.screen_main.director.server.requestResponseText = game.screen_main.director.server.httpRequest.responseText;
						game.screen_main.director.bGoodToGo = true;
						console.log("Session End Return: --- ");
					}
				  }
				this.director.server.httpRequest.open("GET","php/endsession.php?name="+this.director.user.username+"&password="+this.director.user.password+"&key="+this.key+"&score=999",true);
				this.director.server.httpRequest.send();
				console.log("Session End Send: " + this.key);
				this.state = "game_end_submitting_score";
				this.dead_wait = 0.0;
				this.dead_wait_pass = false;
			}
		break;
		case "game_end_submitting_score":
			
			this.director.applyStandardMenuBackgroundScroll();

			this.dead_wait += frameTimer.seconds;
			if(this.dead_wait >= this.main.end_game_min_wait_score_submit) {
				this.dead_wait = this.main.end_game_min_wait_score_submit;
				this.dead_wait_pass = true;
			}

			this.dead_wait_percentage = this.dead_wait / this.main.end_game_min_wait_score_submit;
			this.director.server.drawMsgIntro(this.dead_wait_percentage, this.main.end_game_min_wait_score_submit);
			this.drawDeadMessage(this.dead_wait_percentage);

			this.dead_wait_percentage *= 4.0;
			if(this.dead_wait_percentage > 1.0) {
				this.dead_wait_percentage = 1.0;
			}
			this.director.draw_BgGrayBorders_Frac(this.dead_wait_percentage);

			if(this.director.bGoodToGo && this.dead_wait_pass) {
				switch(this.director.server.requestResponseText) {
				default:
					//this.director.server.setupMsgResultText("::NAK:: ERROR!... Unable to find fugitive... ::EOT::");
					//Session Fail.. 
					console.log(this.director.server.requestResponseText);
				break;
				case "Success!":
					//this.director.server.setupMsgResultText("::ACK:: Fugitive Targetted... ::EOT::");
					console.log("Score submitted!");
				break;
				}
				//this.resetGameLogicAndSendSessionStartRequest();
				this.state = "game_end_response_received_bring_in_frame_and_spin";
				this.timer = 0.0;
				this.fraction = 0.0;
				this.done_something_toggle = false;
				this.director.server.setUpSpinToAxisAllign();
			}
		break;
		case "game_end_response_received_bring_in_frame_and_spin":
			this.director.draw_BgGrayBorders();
			this.director.applyStandardMenuBackgroundScroll();
			if(!this.done_something_toggle) {
				this.done_something_toggle = this.director.server.drawSpinToAxisAllign();
				if(this.done_something_toggle) {
					this.director.server.setupMsgResultText("Score Uploaded...");
				}
			}
			else {
				this.fraction = this.timer / this.main.dead_msg_results_submitted_display_time;
				if(this.fraction > 1.0) {
					this.state = "game_end_remove_submitted_msg";
					this.timer = 0.0;
					this.fraction = 1.0;
				}
				if(this.fraction <= 0.5) {
					this.director.server.drawMsgResultIntro(this.fraction * 2.0);
				}
				else {
					this.director.server.drawMsgResult(2.0 * (this.fraction - 0.5));
				}
				this.timer += frameTimer.seconds;
			}
		break;	
		case "game_end_remove_submitted_msg":
			this.director.applyStandardMenuBackgroundScroll();
			this.director.draw_BgGrayBorders();
			//Text out, background out, shape out
			this.fraction = this.timer / this.main.dead_msg_server_msg_out;
			this.__bend = false;
			if(this.fraction >= 1.0) {
				this.fraction = 1.0;
				this.__bend = true;
			}

			if(this.fraction <= 0.2) {
				this.fraction = 1.0 - (this.fraction * 5.0);
				this.director.server.drawMsgResult(this.fraction);
			}
			else if (this.fraction <= 0.4) {
				this.fraction = 1.0 - ((this.fraction - 0.2) * 5.0);
				this.director.server.drawMsgResultIntro(this.fraction);			
			}
			else if (this.fraction <= 0.6) {	
				this.fraction = 1.0 - ((this.fraction - 0.4) * 5.0);
				this.director.server.drawMsgIntro(this.fraction, 0.333333 * this.main.web_msg_backtotextentry_time);
			}
			else if (this.fraction < 0.8) {
				this.fraction = ((this.fraction - 0.6) * 5.0);
				this.director.drawFrameIn(this.fraction);
			}
			else {
				this.fraction = ((this.fraction - 0.8) * 5.0);
				this.director.draw_BgFrameBackground();
				this.director.draw_BgFrameBorder(this.fraction);
			}

			this.timer += frameTimer.seconds;
			if(this.__bend) {
				this.state = "game_end_stats_enter";
				this.timer = 0.0;
				this.fraction = 0.0;
				this.director.titletext.setText("RUNNING IS FUTILE");
			}

		break;
		case "game_end_stats_enter":
			this.director.applyStandardMenuBackgroundScroll();
			this.director.draw_BgGrayBorders();
			this.director.draw_BgFrameBackground();
			this.director.draw_BgFrameBorder(1.0);

			this.fraction = this.timer / this.main.end_game_hstable_button_intro_time;

			if(this.fraction > 1.0) {
				this.fraction  = 1.0;
			}

			if(this.fraction == 1.0) {
				this.state = "game_end_stats_update";
				this.timer = 0.0;
				this.fraction = 0.0;
			}
			
			if(this.fraction < 0.5) {
				this.director.draw_EndGame_HighScoreTableAndButtonIntro(2.0 * this.fraction);
			}
			else {
				this.director.draw_EndGame_HighScoreTableAndButtonIntro(1.0);
				this.director.draw_EndGame_HighScoreContentIntro(this.fraction);
			}
			
			this.timer += frameTimer.seconds;
		break;
		case "game_end_stats_update":
			this.director.applyStandardMenuBackgroundScroll();
			this.director.draw_BgGrayBorders();
			this.director.draw_BgFrameBackground();
			this.director.draw_BgFrameBorder(1.0);

			this.fraction = this.timer / this.main.end_game_hstable_oscillation_time;
			if(this.fraction > 1.0) {
				this.fraction  = 1.0;
				//Doesn't end it, just repeats
			}
			this.timer += frameTimer.seconds;

			this.director.draw_EndGame_HighScoreTableAndButtonIntro(1.0);
			this.director.draw_EndGame_HighScoreTableContent(this.fraction);

			this.res = this.director.input_endgamebuttons();
			switch(this.res) {
				case 0:
					//Nothing, continue
				break;
				case 1:
					//Retry
					this.state = "game_end_move_to_retry";
					this.timer = 0.0;
					this.fraction = 0.0;
				break;
				case 2:
					//Quit to main menu
					this.state = "game_end_move_to_mainmenu";
					this.timer = 0.0;
					this.fraction = 0.0;
				break;
			}
		break;
		case "game_end_move_to_retry":
			this.director.applyStandardMenuBackgroundScroll();
			this.fraction = this.timer / this.main.end_game_setup_for_restart_time;
			if(this.fraction > 1.0) {
				this.fraction  = 1.0;
				//Switch to restart game!
				this.director.changestate_menu("game_in");
			}
			this.timer += frameTimer.seconds;

			this.director.draw_BgGrayBorders();
			if(this.fraction <= 0.5) {
				//Stage one
				this.fraction *= 2.0;
				this.director.draw_BgFrameBackground();
				this.director.draw_BgFrameBorder(1.0);

				if(this.fraction <= 0.5) {
					this.fraction = 1.0 - (2.0 * this.fraction);
					this.director.draw_EndGame_HighScoreTableAndButtonIntro(1.0);
					this.director.draw_EndGame_HighScoreContentIntro(this.fraction);
				}
				else {
					this.director.draw_EndGame_HighScoreTableAndButtonIntro(1.0 - (2.0 * (this.fraction - 0.5)));
				}
			}
			else {
				//Stage two
				this.fraction = 2.0 * (this.fraction - 0.5);

				if(this.fraction <= 0.5) {
					this.director.draw_BgFrameBackground();
					this.director.draw_BgFrameBorder(1.0 - (2.0 * this.fraction));
				}
				else {
					this.director.drawFrameIn(1.0 - (2.0 * (this.fraction - 0.5)));
				}

			}
		break;
		case "game_end_move_to_mainmenu":
			this.director.applyStandardMenuBackgroundScroll();
			this.fraction = this.timer / this.main.end_game_setup_for_mainmenuintro_time;
			if(this.fraction > 1.0) {
				this.fraction  = 1.0;
				//Switch to restart game!
				this.director.changestate_menu("main_in");
			}
			this.timer += frameTimer.seconds;
			this.director.draw_BgFrameBackground();
			this.director.draw_BgFrameBorder(1.0);
			if(this.fraction <= 0.5) {
				this.fraction = 1.0 - (2.0 * this.fraction);
				this.director.draw_EndGame_HighScoreTableAndButtonIntro(1.0);
				this.director.draw_EndGame_HighScoreContentIntro(this.fraction);
			}
			else {
				this.director.draw_EndGame_HighScoreTableAndButtonIntro(1.0 - (2.0 * (this.fraction - 0.5)));
			}
		break;
	}
}

gameLogicObject.prototype.drawDeadMessage = function(fraction) {
	//Draw the dead message on the screen
	//Just come in and go out in a tenth of the run time on each side
	this.dead_msg_actual_percentage = 1.0;
	if(fraction <= 0.1) {
		this.dead_msg_actual_percentage = fraction * 10.0;
	}
	else if (fraction > 0.9) {
		this.dead_msg_actual_percentage = (1.0 - fraction) * 10.0;
	}
	else 
	{
		this.dead_msg_actual_percentage += this.main.dead_msg_flash_amp * Math.sin(4.0 * ((this.dead_msg_actual_percentage - 0.2) / 0.8));
		//Clamp]
		if(this.dead_msg_actual_percentage > 1.0) {
			this.dead_msg_actual_percentage = 1.0;
		}
	}
	this.__f = this.dead_msg_actual_percentage;
	graphics.requestDrawGUI("deadmsg", 0.5 * graphics.c_width, 0.5 * graphics.c_height, graphics.c_width, graphics.c_height, 0.0, 0.6, this.__f, this.__f, this.__f, this.__f, 0.0, 0.0, 1.0, 1.0);
}

gameLogicObject.prototype.calcDistanceOverSmoothAcceleration = function(v_start, v_end, duration) {
	/*
	Speed = v_start + ((v_end - v_start) * (0.5 * (sin[(-Pi/2] + ((t/T) * Pi)] + 1)))
	Distance = Integral of above
	= - ((T * v_end * sin[(Pi*t)/T]) / (2 * Pi)) + ((T * v_start * sin[(Pi*t) / T]) / (2 * Pi))  + (v_end * t)/2 + (v_start * t)/2
	*/
	return this.calcAccIntegral(duration, v_start, v_end, duration) - this.calcAccIntegral(0.0, v_start, v_end, duration);
}

gameLogicObject.prototype.calcAccIntegral = function(t, v_start, v_end, duration) {
	this.SinPi_tT = Math.sin((Math.PI * t) / duration);
	this.Two_pi = 2.0 * Math.PI;
	this.half_s = v_start * t * 0.5;
	this.half_e = v_end * t * 0.5;
	this.t_s = t * v_start;
	this.t_e = t * v_end;

	return ((-this.t_e * this.SinPi_tT) / this.Two_pi) +
			((this.t_s * this.SinPi_tT) / this.Two_pi) +
			this.half_s +
			this.half_e;
}
