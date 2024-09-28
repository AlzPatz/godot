/*
mainscreen.js :: Pixel Peasant, Alex Paterson, 2014
* Due to the desire to have the scrolling landscape in the background at all times, the main screen will encompass all menu and game stages of the game
*/
function mainScreen(){
	//Game Properties -> They be for a tweakin' :)
	//---------------------------------------------------------------------
	//RENDERING
	this.depth_sky = 0.9;
	this.depth_background_far = 0.8;
	this.depth_spotlights_far = 0.82;
	this.depth_background_near = 0.7;
	this.depth_spotlights_near = 0.72;
	this.depth_character = 0.65;
	this.depth_platform = 0.6;
	this.depth_floor = 0.55;
	this.depth_rain = 0.4;
	this.depth_lightning_close_min = 0.68;
	this.depth_lightning_close_max = 0.69;

	//PHYSICS
	this.gravity = 1400.0;
	//CHARACTER
	this.character_width = 64.0;
	this.character_height = 128.0;
	this.character_longJumpGravFactor = 0.3;
	this.character_jumpSpeed = 400.0;
	this.character_speedBase = 475.0;
	this.character_collision_sidewaysbounce = 0.2;
	this.character_collision_base_ext = 1.0;
	this.character_longjumpgravfactor = 0.3;
	this.character_acc = 1200.0;
	//WORLD
	this.world_menuScrollSpeed = 2000.0;
	this.world_menuTargetYAttractionScalar = 0.1; //How much of the delta is coverd per frame
	//PLATFORMS & LEVEL
	this.floor_y = -5000.0;
	this.ceiling_y = 5000.0;
	this.platform_maxNumber = 25;
	this.platform_createDestroyDistance = 3000.0;
	this.platform_trendChangeScalar = 0.03;
	this.platform_textureSize = 256.0;
	this.platform_lowestHeight = 800.0;
	this.platform_decreasingJumpHeightMin = 50.0;
	this.platform_decreasingJumpHeightMax = 150.0;
	this.platform_skipIslandGapPercentage = 0.25;
	this.probability_scalarForSkipJumpGap = 0.1;
	this.probability_scalarForShortJumpGap = 0.2;
	this.difficulty_shortJumpMaxPercentage = 0.4;
	this.difficulty_maxJumpHeightPercentage = 0.9;
	this.difficulty_baseJumpHeightPercentage = 0.25;
	this.difficulty_additionalJumpHeightPercentage = 0.25;
	this.difficulty_platformMinSize = 80.0;
	this.difficulty_platformMaxSize = 700.0;
	this.difficulty_endJumpBuffer = 10.0;
	//CONSTANTS (DO NOT CHANGE!)
	this.difficulty_exponentialMin = -2.30259;
	this.difficulty_exponentialMax = 0.0;
	//---------------------------------------------------------------------
	//Game Objects and Flow Variables
	//---------------------------------------------------------------------
	this.state;
	this.director = new directorObject(this);
	this.platformBuilder = new platformBuilderObject(this);
	this.scenaryBuilder = new scenaryBuilderObject(this);
	this.additionalScenary = new additionalScenaryObject(this);
	this.character = new characterObject(this);
	this.environment = new environmentObject(this);
	game.sfxControl.assignEnvironment(this.environment);
	//---------------------------------------------------------------------
	//Game Variables
	//---------------------------------------------------------------------
	this.difficulty_currentScalar; //0 to 1
	this.character_SpeedTarget;
	this.justmissedplatform = false; //TO DO:: what is this for?	
	//---------------------------------------------------------------------
	//Menu Properties -> They be for a tweakin' :)
	//---------------------------------------------------------------------
	this.bg_whitebar_thickness = 5.0;
	//bg_grayborder and white piping
	this.bg_grayborder_timebeforeentrance = 2.0;
	this.bg_grayborder_timetoenter = 0.5;
	this.bg_grayborder_percentscreentocover = 0.5;
	this.bg_grayborder_depth = 0.9;
	this.bg_grayborder_opacity = 0.7;
	this.bg_whitebar_opacity = 0.75;
	this.bg_whitebar_depth = 0.89;
	//menu bg frame entrance
	this.bg_frame_borderoffset = 20.0;
	this.bg_frame_stage1time = 0.2;
	this.bg_frame_stage2time = 0.7;
	this.bg_frame_background_opacity = 0.8;
	this.bg_frame_background_depth = 0.88;
	this.bg_frame_border_depth = 0.5;
	this.bg_frame_border_opacity = 0.95;
	this.bg_cornersquare_edgesizemultiplewhitebar = 2.0;
	this.bg_cornersquare_numberRotationsOnEntrance = 2;
	//main
	this.bg_mainIntroTime = 0.5;
	this.bg_logodepth = 0.8;
	this.bg_logoOpacity = 0.9;
	//button
	this.bg_buttondepth = 0.79;
	this.textbox_bg_depth = 0.7;
	this.textbox_txt_depth = 0.6;
	this.togglebox_pic_depth = 0.65;
	this.togglebox_tex_depth = 0.64;
	this.button_warp_size = 400.0;
	this.button_warp_time = 0.5;
	this.key_warp_size = 200.0;
	this.key_warp_time = 0.3;

	//New User Menu
	this.nu_stage;
	this.nu_s1_time = 0.75;
	this.nu_s2_time = 0.75;
	this.nu_s3_time = 0.75;
	this.trans_t_unpass = 0.8;
	this.trans_t_webconnect = 0.5;
	this.trans_t_webdisplayresults = 0.5;
	this.trans_t_webdisplayresults2 = 1.2;
	//Title on text input screens
	this.title_text_depth = 0.8;
	//Keyboard
	this.keyboard_depth = 0.7;
	//web
	this.web_msg_depth = 0.6;
	this.web_msg_textdepth = 0.55;
	this.web_msg_persist_time = 1.0;
	this.web_msg_backtotextentry_time = 1.4;
	this.web_msg_backtomainmenu_time = 1.2;
	//End Game Variables
	this.end_game_min_wait_score_submit = 2.0;
	this.dead_msg_flash_amp = 0.1;
	this.dead_msg_results_submitted_display_time = 1.0;
	this.dead_msg_server_msg_out = 1.0;
	this.end_game_hstable_button_intro_time = 1.0;
	this.end_game_hstable_oscillation_time = 1.0;
	this.end_game_setup_for_restart_time = 1.5;
	this.end_game_setup_for_mainmenuintro_time = 0.75;

	//---------------------------------------------------------------------
	//Game Properties -> They be for a tweakin' :)
	//---------------------------------------------------------------------
	this.g_introTime = 5.0
	this.g_introfrac_stage1 = 0.5;
	this.g_introfrac_stage2 = 0.2;
	this.g_intro_max_speed_scalar = 2.0;
	this.g_intro_speed_end = 0.0; //when games starts and pan to player, this is how fast the camera is travelling
	this.g_introAvDisBetweenPlats = 512.0;
}

mainScreen.prototype.initialise = function() { 
	//Currently first time around happens the same time as the constructor (just after), but split out any non creation dependent code incase future some loop back
	this.state = "first_start";
	this.character_SpeedTarget = this.character_speedBase;
	graphics.setCameraZoom(0.7);
	game.sfxControl.trigger("MainScreen_Start");
}

mainScreen.prototype.update = function() { 
	
	//UPDATE
	switch(this.state) {
		case "first_start":
			this.difficulty_currentScalar = 0.3; //TO DO::Set for the menu so that platforrm trend changes
			this.director.initialise_menu();
			this.platformBuilder.initialise();
			this.state = "run";
			graphics.sfx.setBasePostProcessColour(1.0, 1.0, 1.0, 1.0); //Test
		case "run":
			this.director.update();
			this.character.update();
		break;
	}
	this.scenaryBuilder.update();
	this.additionalScenary.update();
	this.platformBuilder.update();
	this.director.updateCameraBounds();
	this.environment.update();

	//DRAW
	this.scenaryBuilder.draw();
	this.additionalScenary.draw();
	this.platformBuilder.draw();
	this.character.draw();
	this.environment.draw();
}
