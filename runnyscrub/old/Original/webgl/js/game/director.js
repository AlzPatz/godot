function directorObject(main){
	this.main = main;

	this.gamelogic = new gameLogicObject(main, this);
	this.user = new userObject(main);
	this.server = new webServicesObject(main, "minstrel_36", 32, new col4(0.7, 0.6, 0.1, 0.8));
	var httpRequest;

	this.cameraFocus = new vec2(0.0, 0.0);
	this.cameraWorldLeft;
	this.cameraWorldRight;
	this.cameraWorldTop;
	this.cameraWorldBottom;

	//WORKING VARIABLES

	//Menus
	this.state;
	this.menuSubState;
	this.stageTimer;
	this.stageTimerMod;
	this.fraction;
	this.truefrac;
	this.discalc;
	this.totalTime;
	this.menuFrameWidth;
	this.menuFrameHeight;
	this.cornerSquareSize;
	this.workingSquareSize;
	this.workingOS;
	this.totSquareAngRot;
	this.workingSquareAngRot;
	this.squareTLPos;
	this.squareTRPos;
	this.squareBLPos;
	this.squareBRPos;
	this.squareTLDelta = new vec2(0.0,0.0);
	this.squareTRDelta = new vec2(0.0,0.0);
	this.squareBLDelta = new vec2(0.0,0.0);
	this.squareBRDelta = new vec2(0.0,0.0);
	this.workingSquareTLPos = new vec2(0.0,0.0);
	this.workingSquareTRPos = new vec2(0.0,0.0);
	this.workingSquareBLPos = new vec2(0.0,0.0);
	this.workingSquareBRPos = new vec2(0.0,0.0);
	this.centreScreen;
	this.tempFrac;
	//to enable drawing of the white frame borders
	this.bg_fb_totalOuterDistance;
	this.bg_fb_horiDis;
	this.bg_fb_vertDis;
	this.bg_fb_hori_fracPercentage;
	this.bg_fb_vert_fracPercentage;
	this.bg_fb_hori_stage1frac;
	this.bg_fb_hori_stage2frac;
	this.bg_fb_hori_stage3frac;
	this.bg_fb_vert_stage1frac;
	this.bg_fb_vert_stage2frac;
	this.bg_fb_vert_stage3frac;
	//Distances for each section of the frame border creation
	//'Horizontal' section
	this.bg_fb_hori_s1_innerlength;
	this.bg_fb_hori_s1_outerlength;
	this.bg_fb_hori_s2_innerlength;
	this.bg_fb_hori_s2_outerlength_i;
	this.bg_fb_hori_s2_outerlength_o;
	this.bg_fb_hori_s3_innerlength;
	this.bg_fb_hori_s3_outerlength_i;
	this.bg_fb_hori_s3_outerlength_o;
	//'Vertical' section
	this.bg_fb_vert_s1_innerlength;
	this.bg_fb_vert_s1_outerlength;
	this.bg_fb_vert_s2_innerlength;
	this.bg_fb_vert_s2_outerlength_i;
	this.bg_fb_vert_s2_outerlength_o;
	this.bg_fb_vert_s3_innerlength;
	this.bg_fb_vert_s3_outerlength_i;
	this.bg_fb_vert_s3_outerlength_o;
	//Used to store the stage percentages that should be used
	this.bg_fb_s1_percent;
	this.bg_fb_s2_percent;
	this.bg_fb_s3_percent;
	this.workLength;
	this.workPositionX;
	this.workPositionY;
	//logo
	this.logo = new menu_logo(this.main);
	//Buttons
	this.buttons_play;
	this.buttons_login;
	this.buttons_new;
	this.buttons_highscore;
	this.buttons_info;
	this.buttons_back;
	this.buttons_retry;
	this.buttons_quittomain;
	//Textbox
	this.textbox_main = new menu_textbox(this.main, "minstrel_36", 52, graphics.c_halfwidth, 285.0, 662.0, 36.0, "HAPPY", new col4(0.7, 0.7, 0.7, 0.7), new col4(0.0, 0.8, 0.8, 0.8));
	//Toggles
	this.toggle_speaker = new menu_toggle(this.main, true, 650.0, 152.0, 64.0, 64.0, "toggle", 
											0.0, 0.125, 0.0, 0.125, 
											0.25, 0.375, 0.0, 0.125);
	this.toggle_barebones = new menu_toggle(this.main, false, 190.0, 505.0, 192.0, 72.0, "toggle", 
											0.5, 0.875, 0.25, 0.390625, 
											0.0, 0.375, 0.25, 0.390625);
	this.toggle_halfsparkly = new menu_toggle(this.main, false, 395.0, 505.0, 192.0, 72.0, "toggle", 
											0.5, 0.875, 0.5, 0.640625, 
											0.0, 0.375, 0.5, 0.640625);
	this.toggle_bellsnwhistles = new menu_toggle(this.main, true, 610.0, 505.0, 192.0, 72.0, "toggle", 
											0.5, 0.875, 0.75, 0.890625, 
											0.0, 0.375, 0.75, 0.890625);
	//Onscreen Keyboard
	this.keyboard = new menu_keyboard(this.main, 70, 219, 730, 482, "snappy_38", 38, new col4(0.8, 0.8, 0.8, 0.8), 2.0);

	this.wstring = ""; //working string
	this.wbtoggle = false;
	this.wbtoggle2 = false;
	//network bool
	this.bGoodToGo = false;
}

directorObject.prototype.updateCameraBounds = function() {

	graphics.camera_x = this.cameraFocus.x; 
	graphics.camera_y = this.cameraFocus.y;
	//Update bounds, used by game to try and cut down on off screen rendering
	//This is not safe for non AABB viewport. That would require a larger 'safe' rectangle area to be used
	this.cameraWorldLeft = this.cameraFocus.x - (graphics.c_halfwidth * graphics.camera_one_over_zoom);
	this.cameraWorldRight = this.cameraFocus.x + (graphics.c_halfwidth * graphics.camera_one_over_zoom);
	this.cameraWorldTop = this.cameraFocus.y + (graphics.c_halfheight * graphics.camera_one_over_zoom);
	this.cameraWorldBottom = this.cameraFocus.y - (graphics.c_halfheight * graphics.camera_one_over_zoom);
	this.centreScreen = new vec2(graphics.c_halfwidth, graphics.c_halfheight);
}

directorObject.prototype.initialise_menu = function() { 
	this.state = "start";
}

directorObject.prototype.update = function() { 
	//Test for Shock Wave...
	/*
	if(Math.random() < 0.5) {
		if(Math.random() < 0.5) {
			graphics.sfx.triggerShockWave(true, Math.random() * graphics.c_width, 
										Math.random() * graphics.c_height, 
										1.0 + (Math.random() * 49.0),
										50.0 + (Math.random() * 800.0),
										0.1 + (Math.random() * 1.0),
										0.01 + (Math.random() * 0.99));
		}
		else {
			graphics.sfx.triggerShockWave(true, this.main.director.cameraWorldLeft + (Math.random() * graphics.c_width), 
							this.main.director.cameraWorldBottom + (Math.random() * graphics.c_height), 
							1.0 + (Math.random() * 49.0),
							50.0 + (Math.random() * 800.0),
							0.1 + (Math.random() * 1.0),
							0.001 + (Math.random() * 0.999));
		}										
	}
	//End Test
	*/

	switch(this.state) {
		case "start":
			this.cameraFocus.x = 0.0;
			this.cameraFocus.y = 0.0;
			this.stageTimer = 0.0;
			this.changestate_menu("bg_grayborder_in");
			this.menuFrameWidth = graphics.c_width - (2.0 * this.main.bg_frame_borderoffset);
			this.menuFrameHeight = graphics.c_height - (2.0 * this.main.bg_frame_borderoffset);
		break;
		case "game_in":
			this.draw_BgGrayBorders();
			this.changestate_menu("game");
			game.sfxControl.trigger("Game_Start");
		break;
		case "game":
			this.gamelogic.update();
		break;
		case "game_out":
		break;
		case "bg_grayborder_in":
			if(this.stageTimer >= this.main.bg_grayborder_timebeforeentrance) {
				this.truefrac = (this.stageTimer - this.main.bg_grayborder_timebeforeentrance) / this.main.bg_grayborder_timetoenter;
				if(this.truefrac > 1.0) {
					this.truefrac = 1.0;
					this.changestate_menu("bg_frame_in");
				}

				this.fraction = this.truefrac * this.truefrac; //Make the entrance quadratic acceleration rather than linear

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
			}
			else {
				//Time before the gray border bars come down
				//Need to do something like, pixel peasant presents.. RunnyScrub
			}
		break;
		case "bg_grayborder_out":
		break;
		case "bg_frame_in":
			this.draw_BgGrayBorders();
			if(this.stageTimer <= this.main.bg_frame_stage1time) {
				this.fraction = this.stageTimer / this.main.bg_frame_stage1time;
				this.drawFrameIn(this.fraction);
				/*
				this.truefrac = this.fraction * this.fraction; //Quad behaviour
				//Draw black/gray background 
				graphics.requestDrawGUI("blackpixel", graphics.c_halfwidth, graphics.c_halfheight, this.menuFrameWidth * this.truefrac, this.menuFrameHeight * this.truefrac,0.0,
										this.main.bg_frame_background_depth,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity, 
										0.0, 0.0, 1.0,1.0);
				this.workingSquareSize = this.truefrac * this.cornerSquareSize;
				this.workingSquareAngRot = this.totSquareAngRot * this.truefrac;
				this.squareTLDelta.scale(this.truefrac, this.workingSquareTLPos);
				this.workingSquareTLPos.addSelf(this.centreScreen);
				this.squareTRDelta.scale(this.truefrac, this.workingSquareTRPos);
				this.workingSquareTRPos.addSelf(this.centreScreen);
				this.squareBLDelta.scale(this.truefrac, this.workingSquareBLPos);
				this.workingSquareBLPos.addSelf(this.centreScreen);
				this.squareBRDelta.scale(this.truefrac, this.workingSquareBRPos);
				this.workingSquareBRPos.addSelf(this.centreScreen);
				//Draw the corner squares in motion
				//TL
				graphics.requestDrawGUI("whitepixel", this.workingSquareTLPos.x, this.workingSquareTLPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
				//TR
				graphics.requestDrawGUI("whitepixel", this.workingSquareTRPos.x, this.workingSquareTRPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
				//BL
				graphics.requestDrawGUI("whitepixel", this.workingSquareBLPos.x, this.workingSquareBLPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
				//BR
				graphics.requestDrawGUI("whitepixel", this.workingSquareBRPos.x, this.workingSquareBRPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
				*/
			}
			else {
				if(this.stageTimer > this.totalTime) {
					this.stageTime = this.totalTime;
					this.changestate_menu("main_in");
				}
				this.draw_BgFrameBackground();
				this.fraction = (this.stageTimer - this.main.bg_frame_stage1time) / this.main.bg_frame_stage2time;
				this.draw_BgFrameBorder(this.fraction);
			}
		break;
		case "bg_frame_out":
			this.draw_BgGrayBorders();
			this.stageTimerMod = this.totalTime - this.stageTimer;
			if(this.stageTimerMod <= this.main.bg_frame_stage1time) {
				if(this.stageTimerMod < 0.0) {
					this.stageTime = 0.0;
					this.changestate_menu("game_in");
				}
				this.fraction = this.stageTimerMod / this.main.bg_frame_stage1time;
				this.truefrac = this.fraction * this.fraction; //Quad behaviour
				//Draw black/gray background 
				graphics.requestDrawGUI("blackpixel", graphics.c_halfwidth, graphics.c_halfheight, this.menuFrameWidth * this.truefrac, this.menuFrameHeight * this.truefrac,0.0,
										this.main.bg_frame_background_depth,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity, 
										0.0, 0.0, 1.0,1.0);
				this.workingSquareSize = this.truefrac * this.cornerSquareSize;
				this.workingSquareAngRot = this.totSquareAngRot * this.truefrac;
				this.squareTLDelta.scale(this.truefrac, this.workingSquareTLPos);
				this.workingSquareTLPos.addSelf(this.centreScreen);
				this.squareTRDelta.scale(this.truefrac, this.workingSquareTRPos);
				this.workingSquareTRPos.addSelf(this.centreScreen);
				this.squareBLDelta.scale(this.truefrac, this.workingSquareBLPos);
				this.workingSquareBLPos.addSelf(this.centreScreen);
				this.squareBRDelta.scale(this.truefrac, this.workingSquareBRPos);
				this.workingSquareBRPos.addSelf(this.centreScreen);
				//Draw the corner squares in motion
				//TL
				graphics.requestDrawGUI("whitepixel", this.workingSquareTLPos.x, this.workingSquareTLPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
				//TR
				graphics.requestDrawGUI("whitepixel", this.workingSquareTRPos.x, this.workingSquareTRPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
				//BL
				graphics.requestDrawGUI("whitepixel", this.workingSquareBLPos.x, this.workingSquareBLPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
				//BR
				graphics.requestDrawGUI("whitepixel", this.workingSquareBRPos.x, this.workingSquareBRPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
			}
			else {
				this.draw_BgFrameBackground();
				this.fraction = (this.stageTimerMod - this.main.bg_frame_stage1time) / this.main.bg_frame_stage2time;
				this.draw_BgFrameBorder(this.fraction);
			}
		break;
		case "main_in":
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);
			this.fraction = this.stageTimer / this.main.bg_mainIntroTime;
			if(this.fraction > 1.0) {
				this.fraction = 1.0;
				this.changestate_menu("main");
			}
			this.fraction = this.fractionModifier(this.fraction);
			this.logo.drawIntro(this.fraction);
			this.draw_menubuttons_intro(this.fraction);
			this.textbox_main.draw_intro(this.fraction);
			
			this.toggle_speaker.draw_intro(this.fraction);
			this.toggle_barebones.draw_intro(this.fraction); 
			this.toggle_halfsparkly.draw_intro(this.fraction); 
			this.toggle_bellsnwhistles.draw_intro(this.fraction);
			this.checkAndSetButtons();
		break;
		case "main":
			//Drawing - Static Parts
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);
			this.logo.drawIntro(1.0);
			this.draw_menubuttons_intro(1.0);
			this.textbox_main.draw_intro(1.0);
			this.toggle_speaker.draw_intro(1.0);
			this.toggle_barebones.draw_intro(1.0); 
			this.toggle_halfsparkly.draw_intro(1.0); 
			this.toggle_bellsnwhistles.draw_intro(1.0);
			//Check for input
			if(input.inputListOfMouseButtonsReleased[0] && input.inputMouse_isOverCanvas)  {
				if(this.buttons_new.check_collision(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
					this.changestate_menu("newuser_in");
					graphics.sfx.triggerSimpleScreenSpaceShockWave(this.buttons_new.x, this.buttons_new.y, this.main.button_warp_size, this.main.button_warp_time);
				}
				if(this.buttons_login.check_collision(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
					this.changestate_menu("login_in");
					graphics.sfx.triggerSimpleScreenSpaceShockWave(this.buttons_login.x, this.buttons_login.y, this.main.button_warp_size, this.main.button_warp_time);
				}
				if(this.buttons_play.check_collision(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
					this.changestate_menu("main_out");
					graphics.sfx.triggerSimpleScreenSpaceShockWave(this.buttons_play.x, this.buttons_play.y, this.main.button_warp_size, this.main.button_warp_time);
				}
				if(this.buttons_highscore.check_collision(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
					this.changestate_menu("highscore_in");
					graphics.sfx.triggerSimpleScreenSpaceShockWave(this.buttons_highscore.x, this.buttons_highscore.y, this.main.button_warp_size, this.main.button_warp_time);
				}
				if(this.buttons_info.check_collision(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
					this.changestate_menu("info_in");
					graphics.sfx.triggerSimpleScreenSpaceShockWave(this.buttons_info.x, this.buttons_info.y, this.main.button_warp_size, this.main.button_warp_time);
				}
			}
		break;
		case "main_out":
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);
			this.fraction = this.stageTimer / this.main.bg_mainIntroTime;
			if(this.fraction > 1.0) {
				this.fraction = 1.0;
				this.changestate_menu("bg_frame_out");
			}
			this.fraction = 1.0 - (this.fractionModifier(this.fraction));
			this.logo.drawIntro(this.fraction);
			this.draw_menubuttons_intro(this.fraction);
			this.textbox_main.draw_intro(this.fraction);
			
			this.toggle_speaker.draw_intro(this.fraction);
			this.toggle_barebones.draw_intro(this.fraction); 
			this.toggle_halfsparkly.draw_intro(this.fraction); 
			this.toggle_bellsnwhistles.draw_intro(this.fraction);
			this.checkAndSetButtons();
		break;
		case "login_in":
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);
			switch(this.main.nu_stage) {
				case 0:
					this.fraction = this.stageTimer / this.main.nu_s1_time;
					if(this.fraction > 1.0) {
						this.fraction = 1.0;
						this.main.nu_stage = 1;
						this.stageTimer = 0.0;
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.toggle_speaker.draw_intro(1.0 - this.fraction);
					this.toggle_barebones.draw_intro(1.0 - this.fraction); 
					this.toggle_halfsparkly.draw_intro(1.0 - this.fraction); 
					this.toggle_bellsnwhistles.draw_intro(1.0 - this.fraction);
					this.draw_menubuttons_intro(1.0 - this.fraction);
					this.logo.drawMoveToTopLeft(this.fraction);
					this.textbox_main.move_to_text_input(this.fraction);
				break;
				case 1:
					this.fraction = this.stageTimer / this.main.nu_s2_time;
					if(this.fraction > 1.0) {
						this.fraction = 1.0;
						this.main.nu_stage = 2;
						this.stageTimer = 0.0;
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.draw_textentrybuttons(this.fraction);
					this.titletext.draw(this.fraction);
					this.keyboard.drawintro(this.fraction);
				break;
				case 2:
					//Currently doesn't do anything on this third stage
					//Drawing
					this.draw_BgGrayBorders();
					this.draw_BgFrameBackground();
					this.draw_BgFrameBorder(1.0);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.keyboard.drawintro(1.0);
					this.draw_textentrybuttons(1.0);
					this.titletext.draw(1.0);
					this.changestate_menu("login");
				break;
			}
		break;
		case "login":
			//Drawing
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);

			switch(this.menuSubState) {
				case "username_entry":
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.keyboard.drawintro(1.0);
					this.titletext.draw(1.0);
					this.textbox_main.draw_text_input();
					this.draw_textentrybuttons(1.0);
					//Check for menu input
					if(input.inputListOfMouseButtonsReleased[0] && input.inputMouse_isOverCanvas)  {
						//OK & Cancel Buttons
						switch(this.input_textentrybuttons(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
							case 0:
								//No input
							break;
							case 1:
								//Cancel Pressed
								this.changestate_menu("login_out");
							break
							case 2:
								//OK Pressed
								if(this.textbox_main.txt.length > 0) {
									this.menuSubState = "trans_username_password";
									this.stageTimer = 0.0;
									this.user.username = this.textbox_main.txt;
									this.textbox_main.txt = "";
								}
							break;
						}
						//Keyboard
						this.wstring = this.keyboard.checktouch(input.inputMouseX_Canvas, input.inputMouseY_Canvas);
						if(this.wstring != "NONE") {
							if(this.wstring == "DEL") {
								if(this.textbox_main.txt.length > 0) {
									this.textbox_main.txt = this.textbox_main.txt.slice(0, -1);
								}
							}
							else {
								this.textbox_main.txt += this.wstring;
							}
						}
					}
				break;
				case "trans_username_password":
					this.draw_textentrybuttons(1.0);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.fraction = this.stageTimer / this.main.trans_t_unpass;
					if(this.fraction > 1.0) {
						this.fraction = 1.0;
						this.menuSubState = "password_entry";
						this.user.password = "";
						this.stageTimer = 0.0;
					}
					if(this.fraction <= 0.5) {
						this.fraction = this.fractionModifier(2.0 * this.fraction);
						this.fraction = 1.0 - this.fraction;
					}
					else
					{
						if(this.titletext.txt != "ENTER PASSWORD") {
							this.titletext.setText("ENTER PASSWORD");
						}
						this.fraction = this.fractionModifier(2.0 * (this.fraction - 0.5));;
					}
					this.textbox_main.draw_textinput_openclose(this.fraction);
					this.titletext.draw(this.fraction);
					this.keyboard.drawintro(this.fraction);

				break;
				case "password_entry":
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.draw_textentrybuttons(1.0);
					this.keyboard.drawintro(1.0);
					this.titletext.draw(1.0);
					this.textbox_main.draw_text_input();
					//Check for menu input
					if(input.inputListOfMouseButtonsReleased[0] && input.inputMouse_isOverCanvas)  {
						//OK & Cancel Buttons
						switch(this.input_textentrybuttons(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
							case 0:
								//No input
							break;
							case 1:
								//Cancel Pressed
								this.changestate_menu("newuser_out");
							break
							case 2:
								//OK Pressed
								if(this.user.password.length > 0) {
									this.menuSubState = "waiting";
									this.wbtoggle = false;
									this.stageTimer = 0.0;
									this.textbox_main.txt = "";
									this.bGoodToGo = false;

									if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
										this.server.httpRequest=new XMLHttpRequest();
									}
									else {// code for IE6, IE5
										this.server.httpRequest=new ActiveXObject("Microsoft.XMLHTTP");
									}
									
									this.server.httpRequest.onreadystatechange=function() {
										if (game.screen_main.director.server.httpRequest.readyState==4 && game.screen_main.director.server.httpRequest.status==200) {
											game.screen_main.director.server.requestResponseText = game.screen_main.director.server.httpRequest.responseText;
											//console.log(game.screen_main.director.server.requestResponseText);
											game.screen_main.director.bGoodToGo = true;
										}
									  }
									this.server.httpRequest.open("GET","php/checklogin.php?name="+this.user.username+"&password="+this.user.password,true);
									this.server.httpRequest.send();

								}
							break;
						}
						//Keyboard
						this.wstring = this.keyboard.checktouch(input.inputMouseX_Canvas, input.inputMouseY_Canvas);
						if(this.wstring != "NONE") {
							if(this.wstring == "DEL") {
								if(this.user.password.length > 0) {
									this.user.password = this.user.password.slice(0, -1);
								}
							}
							else {
								this.user.password += this.wstring;
							}
							this.textbox_main.txt = "";
							for(var c = 0; c < this.user.password.length; c++) {
								this.textbox_main.txt += "*";
								
							}
						}
					}
				break;
				case "waiting":
					if(!this.wbtoggle) {
						//Setting up
						this.fraction = this.stageTimer / this.main.trans_t_webconnect;
						if(this.fraction > 1.0) {
							this.wbtoggle = true;
							this.wbtoggle2 = false;
							this.fraction = 1.0;
							this.server.intro_angle = 0.0;
						}
						this.server.drawMsgIntro(this.fraction, this.main.trans_t_webconnect);
						this.fraction = this.fractionModifier(this.fraction);
						var omfrac = 1.0 - this.fraction;
						this.keyboard.drawintro(omfrac);
						this.titletext.draw(omfrac);
						this.textbox_main.draw_textinput_openclose(omfrac);
						this.draw_textentrybuttons(omfrac);
					}
					else {
						//Displaying results
						if(!this.wbtoggle2) {
							this.server.drawMsgWait();
							if(this.bGoodToGo) {
								this.wbtoggle2 = true;
								this.server.setUpSpinToAxisAllign();
							}
						}
						else {
							if(this.server.drawSpinToAxisAllign()) {
								this.menuSubState = "displaymsgintro";
								this.stageTimer = 0.0;
							}
						}
					}
				break;
				case "displaymsgintro":
					this.fraction = this.stageTimer / this.main.trans_t_webdisplayresults;
						if(this.fraction > 1.0) {
							this.fraction = 1.0;
							this.menuSubState = "displaymsg";
							this.stageTimer = 0.0;
							var text = "";
							switch(this.server.requestResponseText) {
								case "Login Failed!":
									this.server.setupMsgResultText("::NAK:: ERROR!... Login Failed... ::EOT::");
									this.user.valid = false;
									this.user.username = "None";
									this.user.password = "None";
									this.checkAndSetButtons();
								break;
								case "Success!":
									this.server.setupMsgResultText("::ACK:: Login Successful... ::EOT::");
									this.user.valid = true;
									this.checkAndSetButtons();
								break;
								default:
									this.server.setupMsgResultText("::NAK:: Major System Fault... Please Report... ::EOT::")
									console.log(this.server.requestResponseText);
									this.user.valid = false;
									this.user.username = "None";
									this.user.password = "None";
									this.checkAndSetButtons();
								break;
							}
							this.wbtoggle = false;
						}
						this.server.drawMsgResultIntro(this.fraction);
				break;
				case "displaymsg":
					if(!this.wbtoggle) {
						this.fraction = this.stageTimer / this.main.trans_t_webdisplayresults2;
						if(this.fraction > 1.0) {
							this.fraction = 1.0;
							this.wbtoggle = true;
							this.stageTimer = 0.0;
						}
						this.server.drawMsgResult(this.fraction);
					}
					else {
						//Wait sometime then exit
						this.server.drawMsgResult(1.0);
						if(this.stageTimer > this.main.web_msg_persist_time) {
							switch(this.server.requestResponseText) {
								case "Success!":
									//Back to main menu
									this.menuSubState = "trans_back_to_main_menu";
									this.stageTimer = 0.0;
								break;
								default:
									//Back to username entry
									this.menuSubState = "trans_back_to_username_input";
									this.stageTimer = 0.0;
									this.titletext.setText("ENTER USERNAME");
								break;
							}
						}
					}
				break;
				case "trans_back_to_main_menu":
					this.fraction = this.stageTimer / this.main.web_msg_backtomainmenu_time;
					if(this.fraction >= 1.0) {
						this.fraction = 1.0;
						this.changestate_menu("main");
					}
					var smallfrac;
					if(this.fraction <= 0.5) {
						smallfrac = 2.0 * this.fraction;
						var modfrac;
						if(smallfrac <= 0.333333) {
							modfrac = 1.0 - ( this.fractionModifier(3.0 * smallfrac));
							this.server.drawMsgResult(modfrac);
						}
						else {
							if(smallfrac <= 0.666666) {
								modfrac = 1.0 - (this.fractionModifier(3.0 * (smallfrac - 0.333333)));
								this.server.drawMsgResultIntro(modfrac);
							}
							else {
								modfrac = 1.0 - (this.fractionModifier(3.0 * (smallfrac - 0.666666)));
								this.server.drawMsgIntro(modfrac, 0.333333 * this.main.web_msg_backtotextentry_time);
							}
						}
						this.textbox_main.draw_textinput_openclose(this.fractionModifier(smallfrac));
					}
					else {
						smallfrac = 2.0 * (this.fraction - 0.5);
						smallfrac = this.fractionModifier(smallfrac);
						this.toggle_speaker.draw_intro(smallfrac);
						this.toggle_barebones.draw_intro(smallfrac); 
						this.toggle_halfsparkly.draw_intro(smallfrac); 
						this.toggle_bellsnwhistles.draw_intro(smallfrac);
						this.draw_menubuttons_intro(smallfrac);
						this.logo.drawMoveToTopLeft(1.0 - smallfrac);
						this.textbox_main.move_to_text_input(1.0 - smallfrac);
					}
				break;
				case "trans_back_to_username_input":
					this.fraction = this.stageTimer / this.main.web_msg_backtotextentry_time;
					if(this.fraction >= 1.0) {
						this.fraction = 1.0;
						this.changestate_menu("login");
					}
					var modfrac;
					if(this.fraction <= 0.333333) {
						modfrac = 1.0 - ( this.fractionModifier(3.0 * this.fraction));
						this.server.drawMsgResult(modfrac);
					}
					else {
						if(this.fraction <= 0.666666) {
							modfrac = 1.0 - (this.fractionModifier(3.0 * (this.fraction - 0.333333)));
							this.server.drawMsgResultIntro(modfrac);
						}
						else {
							modfrac = 1.0 - (this.fractionModifier(3.0 * (this.fraction - 0.666666)));
							this.server.drawMsgIntro(modfrac, 0.333333 * this.main.web_msg_backtotextentry_time);
						}
					}
					if(this.fraction > 0.5) {
						modfrac = this.fractionModifier(2.0 * (this.fraction - 0.5));
						this.textbox_main.draw_textinput_openclose(modfrac);
						this.keyboard.drawintro(modfrac);
						this.titletext.draw(modfrac);
						this.draw_textentrybuttons(modfrac);
					}
				break;
			}

		break;
		case "login_out":
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);

			//work through the stages of the intro backwards
			switch(this.main.nu_stage) {
				case 2:
					//Currently does nothing
					this.draw_BgGrayBorders();
					this.draw_BgFrameBackground();
					this.draw_BgFrameBorder(1.0);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.keyboard.drawintro(1.0);
					this.draw_textentrybuttons(1.0);
					this.titletext.draw(1.0);
					this.main.nu_stage = 1;
					this.stageTimer = 0.0;
				break;
				case 1:
					this.fraction = 1.0 - (this.stageTimer / this.main.nu_s2_time);
					if(this.fraction < 0.0) {
						this.fraction = 0.0;
						this.main.nu_stage = 0;
						this.stageTimer = 0.0;
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.draw_textentrybuttons(this.fraction);
					this.titletext.draw(this.fraction);
					this.keyboard.drawintro(this.fraction);
				break;
				case 0:
					this.fraction = 1.0 - (this.stageTimer / this.main.nu_s1_time);
					if(this.fraction < 0.0) {
						this.fraction = 0.0;
						this.changestate_menu("main");
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.toggle_speaker.draw_intro(1.0 - this.fraction);
					this.toggle_barebones.draw_intro(1.0 - this.fraction); 
					this.toggle_halfsparkly.draw_intro(1.0 - this.fraction); 
					this.toggle_bellsnwhistles.draw_intro(1.0 - this.fraction);
					this.draw_menubuttons_intro(1.0 - this.fraction);
					this.logo.drawMoveToTopLeft(this.fraction);
					this.textbox_main.move_to_text_input(this.fraction);
				break;
			}
		break;
		case "newuser_in":
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);
			switch(this.main.nu_stage) {
				case 0:
					this.fraction = this.stageTimer / this.main.nu_s1_time;
					if(this.fraction > 1.0) {
						this.fraction = 1.0;
						this.main.nu_stage = 1;
						this.stageTimer = 0.0;
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.toggle_speaker.draw_intro(1.0 - this.fraction);
					this.toggle_barebones.draw_intro(1.0 - this.fraction); 
					this.toggle_halfsparkly.draw_intro(1.0 - this.fraction); 
					this.toggle_bellsnwhistles.draw_intro(1.0 - this.fraction);
					this.draw_menubuttons_intro(1.0 - this.fraction);
					this.logo.drawMoveToTopLeft(this.fraction);
					this.textbox_main.move_to_text_input(this.fraction);
				break;
				case 1:
					this.fraction = this.stageTimer / this.main.nu_s2_time;
					if(this.fraction > 1.0) {
						this.fraction = 1.0;
						this.main.nu_stage = 2;
						this.stageTimer = 0.0;
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.draw_textentrybuttons(this.fraction);
					this.titletext.draw(this.fraction);
					this.keyboard.drawintro(this.fraction);
				break;
				case 2:
					//Currently doesn't do anything on this third stage
					//Drawing
					this.draw_BgGrayBorders();
					this.draw_BgFrameBackground();
					this.draw_BgFrameBorder(1.0);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.keyboard.drawintro(1.0);
					this.draw_textentrybuttons(1.0);
					this.titletext.draw(1.0);
					this.changestate_menu("newuser");
				break;
			}
		break;
		case "newuser":
			//Drawing
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);


			switch(this.menuSubState) {
				case "username_entry":
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.keyboard.drawintro(1.0);
					this.titletext.draw(1.0);
					this.textbox_main.draw_text_input();
					this.draw_textentrybuttons(1.0);
					//Check for menu input
					if(input.inputListOfMouseButtonsReleased[0] && input.inputMouse_isOverCanvas)  {
						//OK & Cancel Buttons
						switch(this.input_textentrybuttons(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
							case 0:
								//No input
							break;
							case 1:
								//Cancel Pressed
								this.changestate_menu("newuser_out");
							break
							case 2:
								//OK Pressed
								if(this.textbox_main.txt.length > 0) {
									this.menuSubState = "trans_username_password";
									this.stageTimer = 0.0;
									this.user.username = this.textbox_main.txt;
									this.textbox_main.txt = "";
								}
							break;
						}
						//Keyboard
						this.wstring = this.keyboard.checktouch(input.inputMouseX_Canvas, input.inputMouseY_Canvas);
						if(this.wstring != "NONE") {
							if(this.wstring == "DEL") {
								if(this.textbox_main.txt.length > 0) {
									this.textbox_main.txt = this.textbox_main.txt.slice(0, -1);
								}
							}
							else {
								this.textbox_main.txt += this.wstring;
							}
						}
					}
				break;
				case "trans_username_password":
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.draw_textentrybuttons(1.0);
					this.fraction = this.stageTimer / this.main.trans_t_unpass;
					if(this.fraction > 1.0) {
						this.fraction = 1.0;
						this.menuSubState = "password_entry";
						this.user.password = "";
						this.stageTimer = 0.0;
					}
					if(this.fraction <= 0.5) {
						this.fraction = this.fractionModifier(2.0 * this.fraction);
						this.fraction = 1.0 - this.fraction;
					}
					else
					{
						if(this.titletext.txt != "CREATE PASSWORD") {
							this.titletext.setText("CREATE PASSWORD");
						}
						this.fraction = this.fractionModifier(2.0 * (this.fraction - 0.5));;
					}
					this.textbox_main.draw_textinput_openclose(this.fraction);
					this.titletext.draw(this.fraction);
					this.keyboard.drawintro(this.fraction);

				break;
				case "password_entry":
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.draw_textentrybuttons(1.0);
					this.keyboard.drawintro(1.0);
					this.titletext.draw(1.0);
					this.textbox_main.draw_text_input();
					//Check for menu input
					if(input.inputListOfMouseButtonsReleased[0] && input.inputMouse_isOverCanvas)  {
						//OK & Cancel Buttons
						switch(this.input_textentrybuttons(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
							case 0:
								//No input
							break;
							case 1:
								//Cancel Pressed
								this.changestate_menu("newuser_out");
							break
							case 2:
								//OK Pressed
								if(this.user.password.length > 0) {
									this.menuSubState = "waiting";
									this.wbtoggle = false;
									this.stageTimer = 0.0;
									this.textbox_main.txt = "";
									this.bGoodToGo = false;

									if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
										this.server.httpRequest=new XMLHttpRequest();
									}
									else {// code for IE6, IE5
										this.server.httpRequest=new ActiveXObject("Microsoft.XMLHTTP");
									}
									
									this.server.httpRequest.onreadystatechange=function() {
										if (game.screen_main.director.server.httpRequest.readyState==4 && game.screen_main.director.server.httpRequest.status==200) {
											game.screen_main.director.server.requestResponseText = game.screen_main.director.server.httpRequest.responseText;
											//console.log(game.screen_main.director.server.requestResponseText);
											game.screen_main.director.bGoodToGo = true;
										}
									  }
									this.server.httpRequest.open("GET","php/createuser.php?name="+this.user.username+"&password="+this.user.password,true);
									this.server.httpRequest.send();

								}
							break;
						}
						//Keyboard
						this.wstring = this.keyboard.checktouch(input.inputMouseX_Canvas, input.inputMouseY_Canvas);
						if(this.wstring != "NONE") {
							if(this.wstring == "DEL") {
								if(this.user.password.length > 0) {
									this.user.password = this.user.password.slice(0, -1);
								}
							}
							else {
								this.user.password += this.wstring;
							}
							this.textbox_main.txt = "";
							for(var c = 0; c < this.user.password.length; c++) {
								this.textbox_main.txt += "*";
								
							}
						}
					}
				break;
				case "waiting":
					if(!this.wbtoggle) {
						//Setting up
						this.fraction = this.stageTimer / this.main.trans_t_webconnect;
						if(this.fraction > 1.0) {
							this.wbtoggle = true;
							this.wbtoggle2 = false;
							this.fraction = 1.0;
							this.server.intro_angle = 0.0;
						}
						this.server.drawMsgIntro(this.fraction, this.main.trans_t_webconnect);
						this.fraction = this.fractionModifier(this.fraction);
						var omfrac = 1.0 - this.fraction;
						this.keyboard.drawintro(omfrac);
						this.titletext.draw(omfrac);
						this.textbox_main.draw_textinput_openclose(omfrac);
						this.draw_textentrybuttons(omfrac);
					}
					else {
						//Displaying results
						if(!this.wbtoggle2) {
							this.server.drawMsgWait();
							if(this.bGoodToGo) {
								this.wbtoggle2 = true;
								this.server.setUpSpinToAxisAllign();
							}
						}
						else {
							if(this.server.drawSpinToAxisAllign()) {
								this.menuSubState = "displaymsgintro";
								this.stageTimer = 0.0;
							}
						}
					}
				break;
				case "displaymsgintro":
					this.fraction = this.stageTimer / this.main.trans_t_webdisplayresults;
						if(this.fraction > 1.0) {
							this.fraction = 1.0;
							this.menuSubState = "displaymsg";
							this.stageTimer = 0.0;
							var text = "";
							switch(this.server.requestResponseText) {
								case "Failed - Username in use, please log in!":
									this.server.setupMsgResultText("::NAK:: ERROR!... Sorry... Username in use... ::EOT::");
									this.user.valid = false;
									this.user.username = "None";
									this.user.password = "None";
									this.checkAndSetButtons();
								break;
								case "Success!":
									this.server.setupMsgResultText("::ACK:: Create user request complete... ::EOT::");
									this.user.valid = true;
									this.checkAndSetButtons();
								break;
								default:
									this.server.setupMsgResultText("::NAK:: Major System Fault... Please Report... ::EOT::");
									console.log(this.server.requestResponseText);
									this.user.valid = false;
									this.user.username = "None";
									this.user.password = "None";
									this.checkAndSetButtons();
								break;
							}
							this.wbtoggle = false;
						}
						this.server.drawMsgResultIntro(this.fraction);
				break;
				case "displaymsg":
					if(!this.wbtoggle) {
						this.fraction = this.stageTimer / this.main.trans_t_webdisplayresults2;
						if(this.fraction > 1.0) {
							this.fraction = 1.0;
							this.wbtoggle = true;
							this.stageTimer = 0.0;
						}
						this.server.drawMsgResult(this.fraction);
					}
					else {
						//Wait sometime then exit
						this.server.drawMsgResult(1.0);
						if(this.stageTimer > this.main.web_msg_persist_time) {
							switch(this.server.requestResponseText) {
								case "Success!":
									//Back to main menu
									this.menuSubState = "trans_back_to_main_menu";
									this.stageTimer = 0.0;
								break;
								default:
									//Back to username entry
									this.menuSubState = "trans_back_to_username_input";
									this.stageTimer = 0.0;
									this.titletext.setText("CREATE USERNAME");
								break;
							}
						}
					}
				break;
				case "trans_back_to_main_menu":
					this.fraction = this.stageTimer / this.main.web_msg_backtomainmenu_time;
					if(this.fraction >= 1.0) {
						this.fraction = 1.0;
						this.changestate_menu("main");
					}
					var smallfrac;
					if(this.fraction <= 0.5) {
						smallfrac = 2.0 * this.fraction;
						var modfrac;
						if(smallfrac <= 0.333333) {
							modfrac = 1.0 - ( this.fractionModifier(3.0 * smallfrac));
							this.server.drawMsgResult(modfrac);
						}
						else {
							if(smallfrac <= 0.666666) {
								modfrac = 1.0 - (this.fractionModifier(3.0 * (smallfrac - 0.333333)));
								this.server.drawMsgResultIntro(modfrac);
							}
							else {
								modfrac = 1.0 - (this.fractionModifier(3.0 * (smallfrac - 0.666666)));
								this.server.drawMsgIntro(modfrac, 0.333333 * this.main.web_msg_backtotextentry_time);
							}
						}
						this.textbox_main.draw_textinput_openclose(this.fractionModifier(smallfrac));
					}
					else {
						smallfrac = 2.0 * (this.fraction - 0.5);
						smallfrac = this.fractionModifier(smallfrac);
						this.toggle_speaker.draw_intro(smallfrac);
						this.toggle_barebones.draw_intro(smallfrac); 
						this.toggle_halfsparkly.draw_intro(smallfrac); 
						this.toggle_bellsnwhistles.draw_intro(smallfrac);
						this.draw_menubuttons_intro(smallfrac);
						this.logo.drawMoveToTopLeft(1.0 - smallfrac);
						this.textbox_main.move_to_text_input(1.0 - smallfrac);
					}

				break;
				case "trans_back_to_username_input":
					this.fraction = this.stageTimer / this.main.web_msg_backtotextentry_time;
					if(this.fraction >= 1.0) {
						this.fraction = 1.0;
						this.changestate_menu("newuser");
					}
					var modfrac;
					if(this.fraction <= 0.333333) {
						modfrac = 1.0 - ( this.fractionModifier(3.0 * this.fraction));
						this.server.drawMsgResult(modfrac);
					}
					else {
						if(this.fraction <= 0.666666) {
							modfrac = 1.0 - (this.fractionModifier(3.0 * (this.fraction - 0.333333)));
							this.server.drawMsgResultIntro(modfrac);
						}
						else {
							modfrac = 1.0 - (this.fractionModifier(3.0 * (this.fraction - 0.666666)));
							this.server.drawMsgIntro(modfrac, 0.333333 * this.main.web_msg_backtotextentry_time);
						}
					}
					if(this.fraction > 0.5) {
						modfrac = this.fractionModifier(2.0 * (this.fraction - 0.5));
						this.textbox_main.draw_textinput_openclose(modfrac);
						this.keyboard.drawintro(modfrac);
						this.titletext.draw(modfrac);
						this.draw_textentrybuttons(modfrac);
					}
				break;
			}

		break;
		case "newuser_out":
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);

			//work through the stages of the intro backwards
			switch(this.main.nu_stage) {
				case 2:
					//Currently does nothing
					this.draw_BgGrayBorders();
					this.draw_BgFrameBackground();
					this.draw_BgFrameBorder(1.0);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.keyboard.drawintro(1.0);
					this.draw_textentrybuttons(1.0);
					this.titletext.draw(1.0);
					this.main.nu_stage = 1;
					this.stageTimer = 0.0;
				break;
				case 1:
					this.fraction = 1.0 - (this.stageTimer / this.main.nu_s2_time);
					if(this.fraction < 0.0) {
						this.fraction = 0.0;
						this.main.nu_stage = 0;
						this.stageTimer = 0.0;
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_text_input(1.0);
					this.draw_textentrybuttons(this.fraction);
					this.titletext.draw(this.fraction);
					this.keyboard.drawintro(this.fraction);
				break;
				case 0:
					this.fraction = 1.0 - (this.stageTimer / this.main.nu_s1_time);
					if(this.fraction < 0.0) {
						this.fraction = 0.0;
						this.changestate_menu("main");
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.toggle_speaker.draw_intro(1.0 - this.fraction);
					this.toggle_barebones.draw_intro(1.0 - this.fraction); 
					this.toggle_halfsparkly.draw_intro(1.0 - this.fraction); 
					this.toggle_bellsnwhistles.draw_intro(1.0 - this.fraction);
					this.draw_menubuttons_intro(1.0 - this.fraction);
					this.logo.drawMoveToTopLeft(this.fraction);
					this.textbox_main.move_to_text_input(this.fraction);
				break;
			}	
		break;
		case "highscore_in":
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);
			switch(this.main.nu_stage) {
				case 0:
					this.fraction = this.stageTimer / this.main.nu_s1_time;
					if(this.fraction > 1.0) {
						this.fraction = 1.0;
						this.main.nu_stage = 1;
						this.stageTimer = 0.0;
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.toggle_speaker.draw_intro(1.0 - this.fraction);
					this.toggle_barebones.draw_intro(1.0 - this.fraction); 
					this.toggle_halfsparkly.draw_intro(1.0 - this.fraction); 
					this.toggle_bellsnwhistles.draw_intro(1.0 - this.fraction);
					this.draw_menubuttons_intro(1.0 - this.fraction);
					this.logo.drawMoveToTopLeft(this.fraction);
					this.textbox_main.move_to_table_display(0.0);
				break;
				case 1:
					this.fraction = this.stageTimer / this.main.nu_s2_time;
					if(this.fraction > 1.0) {
						this.fraction = 1.0;
						this.main.nu_stage = 2;
						this.stageTimer = 0.0;
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_table_display(this.fraction);
					this.draw_highscorebuttons(this.fraction);
					this.titletext.draw(this.fraction);
					//TO DO
				break;
				case 2:
					//Currently doesn't do anything on this third stage
					//Drawing
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_table_display(1.0);
					this.draw_highscorebuttons(1.0);
					this.titletext.draw(1.0);
					this.changestate_menu("highscore");
				break;
			}
		break;
		case "highscore":
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);
			this.logo.drawMoveToTopLeft(1.0);
			this.textbox_main.move_to_table_display(1.0);
			this.draw_highscorebuttons(1.0);
			this.titletext.draw(1.0);

			//Look for input to go back to main menu
			if(input.inputListOfMouseButtonsReleased[0] && input.inputMouse_isOverCanvas)  {
				if(this.buttons_back.check_collision(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
					graphics.sfx.triggerSimpleScreenSpaceShockWave(this.buttons_back.x, this.buttons_back.y, this.main.button_warp_size, this.main.button_warp_time);
					this.changestate_menu("highscore_out");
				}
			}

		break
		case "highscore_out":
			this.draw_BgGrayBorders();
			this.draw_BgFrameBackground();
			this.draw_BgFrameBorder(1.0);

			//work through the stages of the intro backwards
			switch(this.main.nu_stage) {
				case 2:
					//Currently does nothing
					this.draw_BgGrayBorders();
					this.draw_BgFrameBackground();
					this.draw_BgFrameBorder(1.0);
					this.logo.drawMoveToTopLeft(1.0);
					this.textbox_main.move_to_table_display(1.0);

					this.draw_highscorebuttons(1.0);
					this.titletext.draw(1.0);
					this.main.nu_stage = 1;
					this.stageTimer = 0.0;
				break;
				case 1:
					this.fraction = 1.0 - (this.stageTimer / this.main.nu_s2_time);
					if(this.fraction < 0.0) {
						this.fraction = 0.0;
						this.main.nu_stage = 0;
						this.stageTimer = 0.0;
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.logo.drawMoveToTopLeft(1.0);
					this.draw_highscorebuttons(this.fraction);
					this.textbox_main.move_to_table_display(this.fraction);
					this.titletext.draw(this.fraction);

				break;
				case 0:
					this.fraction = 1.0 - (this.stageTimer / this.main.nu_s1_time);
					if(this.fraction < 0.0) {
						this.fraction = 0.0;
						this.changestate_menu("main");
					}
					this.fraction = this.fractionModifier(this.fraction);
					this.toggle_speaker.draw_intro(1.0 - this.fraction);
					this.toggle_barebones.draw_intro(1.0 - this.fraction); 
					this.toggle_halfsparkly.draw_intro(1.0 - this.fraction); 
					this.toggle_bellsnwhistles.draw_intro(1.0 - this.fraction);
					this.draw_menubuttons_intro(1.0 - this.fraction);
					this.logo.drawMoveToTopLeft(this.fraction);
					this.textbox_main.move_to_table_display(0.0);
				break;
			}
		break;
		case "info_in":
		break;
		case "info":
		break
		case "info_out":
		break;		
	}


	if(this.state != "game") {
		this.applyStandardMenuBackgroundScroll();
	}

	this.stageTimer += frameTimer.seconds;
}

directorObject.prototype.applyStandardMenuBackgroundScroll = function() {
		//In menu mode the back ground simply scrolls. It is kept with a range of x values to try and ensure no overflow and help set up
		//the "scroll to start" type effect that happens when the game starts

		//Horizontal Motio
		this.cameraFocus.x += Math.floor(0.016666667 * this.main.world_menuScrollSpeed); //TODO: frameTimer causes stutter.. so approx 17ms

		//Vertical Motion
		this.manu_targetY = this.main.platformBuilder.findNearestPlatformHeight(this.cameraFocus.x);
		this.deltaY = this.main.world_menuTargetYAttractionScalar * (this.manu_targetY - this.cameraFocus.y);
		this.cameraFocus.y += this.deltaY;
		this.cameraFocus.y = Math.floor(this.cameraFocus.y);
}

directorObject.prototype.drawFrameIn = function(fraction) {
				this.truefrac = fraction * fraction; //Quad behaviour
				//Draw black/gray background 
				graphics.requestDrawGUI("blackpixel", graphics.c_halfwidth, graphics.c_halfheight, this.menuFrameWidth * this.truefrac, this.menuFrameHeight * this.truefrac,0.0,
										this.main.bg_frame_background_depth,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity, 
										0.0, 0.0, 1.0,1.0);
				this.workingSquareSize = this.truefrac * this.cornerSquareSize;
				this.workingSquareAngRot = this.totSquareAngRot * this.truefrac;
				this.squareTLDelta.scale(this.truefrac, this.workingSquareTLPos);
				this.workingSquareTLPos.addSelf(this.centreScreen);
				this.squareTRDelta.scale(this.truefrac, this.workingSquareTRPos);
				this.workingSquareTRPos.addSelf(this.centreScreen);
				this.squareBLDelta.scale(this.truefrac, this.workingSquareBLPos);
				this.workingSquareBLPos.addSelf(this.centreScreen);
				this.squareBRDelta.scale(this.truefrac, this.workingSquareBRPos);
				this.workingSquareBRPos.addSelf(this.centreScreen);
				//Draw the corner squares in motion
				//TL
				graphics.requestDrawGUI("whitepixel", this.workingSquareTLPos.x, this.workingSquareTLPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
				//TR
				graphics.requestDrawGUI("whitepixel", this.workingSquareTRPos.x, this.workingSquareTRPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
				//BL
				graphics.requestDrawGUI("whitepixel", this.workingSquareBLPos.x, this.workingSquareBLPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
				//BR
				graphics.requestDrawGUI("whitepixel", this.workingSquareBRPos.x, this.workingSquareBRPos.y,this.workingSquareSize, this.workingSquareSize,this.workingSquareAngRot,
										this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
										0.0, 0.0, 1.0,1.0);
}

directorObject.prototype.draw_EndGame_HighScoreTableAndButtonIntro = function(fraction) {
	this.textbox_main.draw_end_game_highscorebox_from_nothing(fraction);
	this.titletext.draw(fraction);
	this.logo.drawAppearInTopLeft(fraction);

	this.buttons_retry.draw_intro(fraction);
	this.buttons_quittomain.draw_intro(fraction);

	//White bar under title
	this.blen = fraction * 662.0;
	this.tempcol_edge = new col4(0.9, 0.9, 0.9, 0.9);
	graphics.requestDrawGUI("whitepixel", 400, 150, this.blen, this.main.bg_whitebar_thickness,0.0,
									this.main.bg_buttondepth, this.tempcol_edge.r, this.tempcol_edge.g, this.tempcol_edge.b, this.tempcol_edge.a, 
									0.0, 0.0, 1.0,1.0);

}

directorObject.prototype.draw_EndGame_HighScoreContentIntro = function(fraction) {
	this.textbox_main.draw_end_game_highscorebox_from_nothing(1.0);
}

directorObject.prototype.draw_EndGame_HighScoreTableContent = function(fraction) {
	//Nothing for now, fraction repeats itself
}

directorObject.prototype.input_endgamebuttons = function(fraction) {
	if(input.inputListOfMouseButtonsReleased[0] && input.inputMouse_isOverCanvas) {
		if(this.buttons_retry.check_collision(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
			graphics.sfx.triggerSimpleScreenSpaceShockWave(this.buttons_retry.x, this.buttons_retry.y, this.main.button_warp_size, this.main.button_warp_time);
			return 1;
		}
		if(this.buttons_quittomain.check_collision(input.inputMouseX_Canvas, input.inputMouseY_Canvas)) {
			graphics.sfx.triggerSimpleScreenSpaceShockWave(this.buttons_quittomain.x, this.buttons_quittomain.y, this.main.button_warp_size, this.main.button_warp_time);
			return 2;
		}
	}
	return 0;
}

directorObject.prototype.changestate_menu = function(state) { 
	//These change states do not happen too often so there are some optimisations / duplicate calculations i havent yet refactored out as not that important for performance
	this.state = state;
	switch(this.state) {
		case "start":
		break;
		case "bg_grayborder_in":
			this.state = "bg_grayborder_in";
		break;
		case "bg_grayborder_out":
		break;
		case "bg_frame_in":
			this.stageTimer = 0.0;
			this.totalTime = this.main.bg_frame_stage1time + this.main.bg_frame_stage2time;
			this.totSquareAngRot = this.main.bg_cornersquare_numberRotationsOnEntrance * 360.0;
			this.cornerSquareSize = this.main.bg_cornersquare_edgesizemultiplewhitebar * this.main.bg_whitebar_thickness;
			this.workingOS = this.main.bg_frame_borderoffset + (2.0 * this.main.bg_whitebar_thickness) + (0.5 * this.cornerSquareSize);
			this.squareTLPos = new vec2(this.workingOS, this.workingOS);
			this.squareTRPos = new vec2(graphics.c_width - this.workingOS, this.workingOS);
			this.squareBLPos = new vec2(this.workingOS, graphics.c_height - this.workingOS);
			this.squareBRPos = new vec2(graphics.c_width - this.workingOS, graphics.c_height - this.workingOS);
			this.squareTLPos.subtract(this.centreScreen, this.squareTLDelta);
			this.squareTRPos.subtract(this.centreScreen, this.squareTRDelta);
			this.squareBLPos.subtract(this.centreScreen, this.squareBLDelta);
			this.squareBRPos.subtract(this.centreScreen, this.squareBRDelta);
			//Frame Border Helper Figures
			this.bg_fb_totalOuterDistance = (2.0 * graphics.c_width) + (2.0 * graphics.c_height) - (8.0 * this.main.bg_frame_borderoffset);
			this.bg_fb_hori_fracPercentage = ((2.0 * graphics.c_width) - (4.0 * this.main.bg_frame_borderoffset)) / this.bg_fb_totalOuterDistance;
			this.bg_fb_vert_fracPercentage = 1.0 - this.bg_fb_hori_fracPercentage;
			this.bg_fb_horiDis = graphics.c_width - (2.0 * this.main.bg_frame_borderoffset) - this.main.bg_whitebar_thickness;
			this.bg_fb_vertDis = graphics.c_height - (2.0 * this.main.bg_frame_borderoffset) - this.main.bg_whitebar_thickness;
			//Grab the length of the individual sections, work out the fractional amount of time they deserve to ensure linear growth motion
			//'Horizontal' section
			this.bg_fb_hori_s1_innerlength = this.menuFrameWidth - (2.0 * this.cornerSquareSize) - (11.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_hori_s1_outerlength = this.menuFrameWidth - (2.0 * this.cornerSquareSize) - (7.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_hori_s2_innerlength = this.cornerSquareSize + (3.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_hori_s2_outerlength_i = this.cornerSquareSize + (3.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_hori_s2_outerlength_o = this.cornerSquareSize + (3.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_hori_s3_innerlength = this.cornerSquareSize + (3.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_hori_s3_outerlength_i = this.cornerSquareSize + (2.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_hori_s3_outerlength_o = this.cornerSquareSize + (3.0 * this.main.bg_whitebar_thickness);
			if(this.bg_fb_horiDis != this.bg_fb_hori_s1_outerlength + this.bg_fb_hori_s2_outerlength_o + this.bg_fb_hori_s3_outerlength_o) {
				console.log("Calculated hori bg frame border lengths are not equal, please check the fuck up");
			}
			this.bg_fb_hori_stage1frac = this.bg_fb_hori_s1_outerlength  / this.bg_fb_horiDis;
			this.bg_fb_hori_stage2frac = this.bg_fb_hori_s2_outerlength_o  / this.bg_fb_horiDis;
			this.bg_fb_hori_stage3frac = this.bg_fb_hori_s3_outerlength_o  / this.bg_fb_horiDis;
			//'Vertical' section
			this.bg_fb_vert_s1_innerlength = this.menuFrameHeight - (2.0 * this.cornerSquareSize) - (11.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_vert_s1_outerlength = this.menuFrameHeight - (2.0 * this.cornerSquareSize) - (7.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_vert_s2_innerlength = this.cornerSquareSize + (3.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_vert_s2_outerlength_i = this.cornerSquareSize + (3.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_vert_s2_outerlength_o = this.cornerSquareSize + (3.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_vert_s3_innerlength = this.cornerSquareSize + (3.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_vert_s3_outerlength_i = this.cornerSquareSize + (2.0 * this.main.bg_whitebar_thickness);
			this.bg_fb_vert_s3_outerlength_o = this.cornerSquareSize + (3.0 * this.main.bg_whitebar_thickness);
			if(this.bg_fb_vertDis != this.bg_fb_vert_s1_outerlength + this.bg_fb_vert_s2_outerlength_o + this.bg_fb_vert_s3_outerlength_o) {
				console.log("Calculated vert bg frame border lengths are not equal, please check the fuck up");
			}
			this.bg_fb_vert_stage1frac = this.bg_fb_vert_s1_outerlength  / this.bg_fb_vertDis;
			this.bg_fb_vert_stage2frac = this.bg_fb_vert_s2_outerlength_o  / this.bg_fb_vertDis;
			this.bg_fb_vert_stage3frac = this.bg_fb_vert_s3_outerlength_o  / this.bg_fb_vertDis;
		break;
		case "bg_frame_out":
			this.stageTimer = 0.0;
		break;
		case "main_in":
			this.stageTimer = 0.0;
			this.create_menu_buttons();
		break;
		case "main":
			this.stageTimer = 0.0;
		break;
		case "main_out":
			this.stageTimer = 0.0;
		break;
		case "login_in":
			this.stageTimer = 0.0;
			this.main.nu_stage = 0;
			this.titletext.setText("ENTER USERNAME");
			this.textbox_main.txt = "";
		break;
		case "login":
			this.stageTimer = 0.0;
			this.menuSubState = "username_entry";
		break;
		case "login_out":
			this.stageTimer = 0.0;
			this.main.nu_stage = 2;
		break;
		case "newuser_in":
			this.stageTimer = 0.0;
			this.main.nu_stage = 0;
			this.titletext.setText("CREATE USERNAME");
			this.textbox_main.txt = "";
		break;
		case "newuser":
			this.stageTimer = 0.0;
			this.menuSubState = "username_entry";
		break;
		case "newuser_out":
			this.stageTimer = 0.0;
			this.main.nu_stage = 2;
		break;
		case "game_in":
			this.stageTimer = 0.0;
		break;
		case "game":
			this.gamelogic.initialise();
			this.stageTimer = 0.0; //not sure if needed so putting in anyway in case
		break;
		case "game_out":
			this.stageTimer = 0.0;
		break;
		case "info_in":
		break;
		case "info":
		break
		case "info_out":
		break;
		case "highscore_in":
			this.stageTimer = 0.0;
			this.main.nu_stage = 0;
			this.titletext.setText("HIGHSCORE TABLE");
			this.textbox_main.txt = "";
		break;
		case "highscores":
			this.stageTimer = 0.0;
		break
		case "highscores_out":
			this.stageTimer = 0.0;
			this.main.nu_stage = 2;
		break;		
	}
}

directorObject.prototype.draw_BgGrayBorders_Frac = function(fraction) { 
		fraction = fraction * fraction; //quadratic the motion
		//fraction = 1.0 - fraction;		

		this.discalc = 0.5 * fraction * this.main.bg_grayborder_percentscreentocover * graphics.c_height;
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
}

directorObject.prototype.draw_BgGrayBorders = function() { 
		this.discalc = 0.5 * this.main.bg_grayborder_percentscreentocover * graphics.c_height;
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
}

directorObject.prototype.draw_BgFrameBackground = function() { 
		graphics.requestDrawGUI("blackpixel", graphics.c_halfwidth, graphics.c_halfheight, this.menuFrameWidth, this.menuFrameHeight,0.0,
										this.main.bg_frame_background_depth,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity,this.main.bg_frame_background_opacity, 
										0.0, 0.0, 1.0,1.0);
	}
directorObject.prototype.draw_BgFrameBorder = function(fraction) { 
			//TL
			graphics.requestDrawGUI("whitepixel", this.squareTLPos.x, this.squareTLPos.y,this.cornerSquareSize, this.cornerSquareSize,0.0,
									this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
									0.0, 0.0, 1.0,1.0);
			//TR
			graphics.requestDrawGUI("whitepixel", this.squareTRPos.x, this.squareTRPos.y,this.cornerSquareSize, this.cornerSquareSize,0.0,
									this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
									0.0, 0.0, 1.0,1.0);
			//BL
			graphics.requestDrawGUI("whitepixel", this.squareBLPos.x, this.squareBLPos.y,this.cornerSquareSize, this.cornerSquareSize,0.0,
									this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
									0.0, 0.0, 1.0,1.0);
			//BR
			graphics.requestDrawGUI("whitepixel", this.squareBRPos.x, this.squareBRPos.y,this.cornerSquareSize, this.cornerSquareSize,0.0,
									this.main.bg_frame_border_depth,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
									0.0, 0.0, 1.0,1.0);
			//Split this into two groups with their own fractional value
			if(fraction > 1.0) {
				fraction = 1.0;
			}
			else {
				if(fraction < 0.0) {
					fraction = 0.0;
				}
			}
			//The length of each of the groups (drawing horizontal lines then vertical) is scaled by the total length of the outer line to ensure
			//constant speed of line drawing
			if(fraction <=this.bg_fb_hori_fracPercentage ) {
				this.tempFrac = fraction / this.bg_fb_hori_fracPercentage ;
				this.draw_bgFrameBorder_BL(this.tempFrac);
				this.draw_bgFrameBorder_TR(this.tempFrac);
			}
			else {
				this.tempFrac = (fraction - this.bg_fb_hori_fracPercentage) / this.bg_fb_vert_fracPercentage;
				this.draw_bgFrameBorder_BR(this.tempFrac);
				this.draw_bgFrameBorder_TL(this.tempFrac);
				this.draw_bgFrameBorder_BL(1.0);
				this.draw_bgFrameBorder_TR(1.0);
			}
	}	

directorObject.prototype.draw_bgFrameBorder_TL = function(fraction) { 
	//This is a 'vertical' part of the border
	if(fraction < 0.0) fraction = 0.0; //probably surplus as bounds check the fraction a level above
	if(fraction > 1.0) fraction = 1.0;
	if(fraction <= this.bg_fb_vert_stage1frac) {
		this.bg_fb_s1_percent = fraction / this.bg_fb_vert_stage1frac;
		this.bg_fb_s2_percent = 0.0;
		this.bg_fb_s3_percent = 0.0;
	} 
	else if (fraction <= this.bg_fb_vert_stage1frac + this.bg_fb_vert_stage2frac) {
		this.bg_fb_s1_percent = 1.0;
		this.bg_fb_s2_percent = (fraction - this.bg_fb_vert_stage1frac) / this.bg_fb_vert_stage2frac;
		this.bg_fb_s3_percent = 0.0;
	}
	else {
		this.bg_fb_s1_percent = 1.0;
		this.bg_fb_s2_percent = 1.0;
		this.bg_fb_s3_percent = (fraction - this.bg_fb_vert_stage1frac - this.bg_fb_vert_stage2frac) / this.bg_fb_vert_stage3frac;
	}
	//Draw stage by stage
	if(this.bg_fb_s1_percent > 0.0) {
		//Outer
		this.workLength = this.bg_fb_vert_s1_outerlength * this.bg_fb_s1_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + (0.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - this.cornerSquareSize -(4.0 * this.main.bg_whitebar_thickness) - (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_vert_s1_innerlength * this.bg_fb_s1_percent;
		this.workPositionX =  this.main.bg_frame_borderoffset + (2.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - this.cornerSquareSize - (6.0 * this.main.bg_whitebar_thickness) - (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
	if(this.bg_fb_s2_percent > 0.0) {
		//Outer - Outer
		this.workLength = this.bg_fb_vert_s2_outerlength_o * this.bg_fb_s2_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + (0.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = this.main.bg_frame_borderoffset + this.bg_fb_vert_s2_outerlength_o - (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness,this.workLength,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Outer - Inner 
		this.workLength = this.bg_fb_vert_s2_outerlength_i * this.bg_fb_s2_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + this.main.bg_whitebar_thickness + (0.5 * this.workLength);
		this.workPositionY = this.main.bg_frame_borderoffset + this.cornerSquareSize + (3.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength,this.main.bg_whitebar_thickness,  0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_vert_s2_innerlength * this.bg_fb_s2_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + (3.0 * this.main.bg_whitebar_thickness) + (0.5 * this.workLength);
		this.workPositionY = this.main.bg_frame_borderoffset + this.cornerSquareSize + (5.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
	if(this.bg_fb_s3_percent > 0.0) {
		//Outer - Outer
		this.workLength = this.bg_fb_vert_s3_outerlength_o * this.bg_fb_s3_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + this.main.bg_whitebar_thickness + (0.5 * this.workLength);
		this.workPositionY = this.main.bg_frame_borderoffset + (0.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Outer-Inner
		this.workLength = this.bg_fb_vert_s3_outerlength_i * this.bg_fb_s3_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + this.cornerSquareSize + (3.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = this.main.bg_frame_borderoffset + this.main.bg_whitebar_thickness + this.bg_fb_vert_s3_outerlength_i - (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_vert_s3_innerlength * this.bg_fb_s3_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + this.cornerSquareSize + (5.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = this.main.bg_frame_borderoffset + (2.0 * this.main.bg_whitebar_thickness) + this.bg_fb_vert_s3_innerlength - (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
}

directorObject.prototype.draw_bgFrameBorder_TR = function(fraction) { 
	//This is a 'horizontal' part of the border
	if(fraction < 0.0) fraction = 0.0; //probably surplus as bounds check the fraction a level above
	if(fraction > 1.0) fraction = 1.0;
	if(fraction <= this.bg_fb_hori_stage1frac) {
		this.bg_fb_s1_percent = fraction / this.bg_fb_hori_stage1frac;
		this.bg_fb_s2_percent = 0.0;
		this.bg_fb_s3_percent = 0.0;
	} 
	else if (fraction <= this.bg_fb_hori_stage1frac + this.bg_fb_hori_stage2frac) {
		this.bg_fb_s1_percent = 1.0;
		this.bg_fb_s2_percent = (fraction - this.bg_fb_hori_stage1frac) / this.bg_fb_hori_stage2frac;
		this.bg_fb_s3_percent = 0.0;
	}
	else {
		this.bg_fb_s1_percent = 1.0;
		this.bg_fb_s2_percent = 1.0;
		this.bg_fb_s3_percent = (fraction - this.bg_fb_hori_stage1frac - this.bg_fb_hori_stage2frac) / this.bg_fb_hori_stage3frac;
	}
	//Draw stage by stage
	if(this.bg_fb_s1_percent > 0.0) {
		//Outer
		this.workLength = this.bg_fb_hori_s1_outerlength * this.bg_fb_s1_percent;
		this.workPositionX = (this.main.bg_frame_borderoffset + this.cornerSquareSize + (4.0 * this.main.bg_whitebar_thickness)) +
							 (0.5 * this.workLength);
		this.workPositionY = this.main.bg_frame_borderoffset + (0.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_hori_s1_innerlength * this.bg_fb_s1_percent;
		this.workPositionX = (this.main.bg_frame_borderoffset + this.cornerSquareSize + (6.0 * this.main.bg_whitebar_thickness)) +
							 (0.5 * this.workLength);
		this.workPositionY = this.main.bg_frame_borderoffset + (2.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
	if(this.bg_fb_s2_percent > 0.0) {
		//Outer - Outer
		this.workLength = this.bg_fb_hori_s2_outerlength_o * this.bg_fb_s2_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - this.bg_fb_hori_s2_outerlength_o + (0.5 * this.workLength);
		this.workPositionY = this.main.bg_frame_borderoffset + (0.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Outer - Inner 
		this.workLength = this.bg_fb_hori_s2_outerlength_i * this.bg_fb_s2_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - this.cornerSquareSize - (3.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = this.main.bg_frame_borderoffset + this.main.bg_whitebar_thickness + (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_hori_s2_innerlength * this.bg_fb_s2_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - this.cornerSquareSize - (5.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = this.main.bg_frame_borderoffset + (3.0 * this.main.bg_whitebar_thickness) + (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
	if(this.bg_fb_s3_percent > 0.0) {
		//Outer - Outer
		this.workLength = this.bg_fb_hori_s3_outerlength_o * this.bg_fb_s3_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - (0.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = this.main.bg_frame_borderoffset + this.main.bg_whitebar_thickness + (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Outer-Inner
		this.workLength = this.bg_fb_hori_s3_outerlength_i * this.bg_fb_s3_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - this.main.bg_whitebar_thickness - this.bg_fb_hori_s3_outerlength_i + (0.5 * this.workLength);
		this.workPositionY = this.main.bg_frame_borderoffset + this.cornerSquareSize + (3.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_hori_s3_innerlength * this.bg_fb_s3_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - (2.0 * this.main.bg_whitebar_thickness) - this.bg_fb_hori_s3_innerlength + (0.5 * this.workLength);
		this.workPositionY = this.main.bg_frame_borderoffset + this.cornerSquareSize + (5.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
}

directorObject.prototype.draw_bgFrameBorder_BL = function(fraction) { 
	//This is a 'horizontal' part of the border
	if(fraction < 0.0) fraction = 0.0; //probably surplus as bounds check the fraction a level above
	if(fraction > 1.0) fraction = 1.0;
	if(fraction <= this.bg_fb_hori_stage1frac) {
		this.bg_fb_s1_percent = fraction / this.bg_fb_hori_stage1frac;
		this.bg_fb_s2_percent = 0.0;
		this.bg_fb_s3_percent = 0.0;
	} 
	else if (fraction <= this.bg_fb_hori_stage1frac + this.bg_fb_hori_stage2frac) {
		this.bg_fb_s1_percent = 1.0;
		this.bg_fb_s2_percent = (fraction - this.bg_fb_hori_stage1frac) / this.bg_fb_hori_stage2frac;
		this.bg_fb_s3_percent = 0.0;
	}
	else {
		this.bg_fb_s1_percent = 1.0;
		this.bg_fb_s2_percent = 1.0;
		this.bg_fb_s3_percent = (fraction - this.bg_fb_hori_stage1frac - this.bg_fb_hori_stage2frac) / this.bg_fb_hori_stage3frac;
	}
	//Draw stage by stage
	if(this.bg_fb_s1_percent > 0.0) {
		//Outer
		this.workLength = this.bg_fb_hori_s1_outerlength * this.bg_fb_s1_percent;
		this.workPositionX = (graphics.c_width - this.main.bg_frame_borderoffset - this.cornerSquareSize - (4.0 * this.main.bg_whitebar_thickness)) -
								0.5 * this.workLength;
		this.workPositionY = (graphics.c_height - this.main.bg_frame_borderoffset - (0.5 * this.main.bg_whitebar_thickness));
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_hori_s1_innerlength * this.bg_fb_s1_percent;
		this.workPositionX = (graphics.c_width - this.main.bg_frame_borderoffset - this.cornerSquareSize - (6.0 * this.main.bg_whitebar_thickness)) -
								0.5 * this.workLength;
		this.workPositionY = (graphics.c_height - this.main.bg_frame_borderoffset - (2.5 * this.main.bg_whitebar_thickness));
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
	if(this.bg_fb_s2_percent > 0.0) {
		//Outer - Outer
		this.workLength = this.bg_fb_hori_s2_outerlength_o * this.bg_fb_s2_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + this.bg_fb_hori_s2_outerlength_o - (0.5 * this.workLength);
		this.workPositionY = (graphics.c_height - this.main.bg_frame_borderoffset - (0.5 * this.main.bg_whitebar_thickness));
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Outer - Inner 
		this.workLength = this.bg_fb_hori_s2_outerlength_i * this.bg_fb_s2_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + this.cornerSquareSize + (3.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - this.main.bg_whitebar_thickness - (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_hori_s2_innerlength * this.bg_fb_s2_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + this.cornerSquareSize + (5.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - (3.0 * this.main.bg_whitebar_thickness) - (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
	if(this.bg_fb_s3_percent > 0.0) {
		//Outer - Outer
		this.workLength = this.bg_fb_hori_s3_outerlength_o * this.bg_fb_s3_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + (0.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - this.main.bg_whitebar_thickness - (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Outer-Inner
		this.workLength = this.bg_fb_hori_s3_outerlength_i * this.bg_fb_s3_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + this.main.bg_whitebar_thickness + this.bg_fb_hori_s3_outerlength_i - (0.5 * this.workLength);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - this.cornerSquareSize - (3.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_hori_s3_innerlength * this.bg_fb_s3_percent;
		this.workPositionX = this.main.bg_frame_borderoffset + (2.0 * this.main.bg_whitebar_thickness) + this.bg_fb_hori_s3_innerlength - (0.5 * this.workLength);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - this.cornerSquareSize - (5.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
}

directorObject.prototype.draw_bgFrameBorder_BR = function(fraction) { 
	//This is a 'vertical' part of the border
	if(fraction < 0.0) fraction = 0.0; //probably surplus as bounds check the fraction a level above
	if(fraction > 1.0) fraction = 1.0;
	if(fraction <= this.bg_fb_vert_stage1frac) {
		this.bg_fb_s1_percent = fraction / this.bg_fb_vert_stage1frac;
		this.bg_fb_s2_percent = 0.0;
		this.bg_fb_s3_percent = 0.0;
	} 
	else if (fraction <= this.bg_fb_vert_stage1frac + this.bg_fb_vert_stage2frac) {
		this.bg_fb_s1_percent = 1.0;
		this.bg_fb_s2_percent = (fraction - this.bg_fb_vert_stage1frac) / this.bg_fb_vert_stage2frac;
		this.bg_fb_s3_percent = 0.0;
	}
	else {
		this.bg_fb_s1_percent = 1.0;
		this.bg_fb_s2_percent = 1.0;
		this.bg_fb_s3_percent = (fraction - this.bg_fb_vert_stage1frac - this.bg_fb_vert_stage2frac) / this.bg_fb_vert_stage3frac;
	}
	//Draw stage by stage
	if(this.bg_fb_s1_percent > 0.0) {
		//Outer
		this.workLength = this.bg_fb_vert_s1_outerlength * this.bg_fb_s1_percent;
		this.workPositionX = graphics.c_width - (this.main.bg_frame_borderoffset + (0.5 * this.main.bg_whitebar_thickness));
		this.workPositionY = this.main.bg_frame_borderoffset + this.cornerSquareSize + (4.0 * this.main.bg_whitebar_thickness) + (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_vert_s1_innerlength * this.bg_fb_s1_percent;
		this.workPositionX = graphics.c_width - (this.main.bg_frame_borderoffset + (2.5 * this.main.bg_whitebar_thickness));
		this.workPositionY = this.main.bg_frame_borderoffset + this.cornerSquareSize + (6.0 * this.main.bg_whitebar_thickness) + (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
	if(this.bg_fb_s2_percent > 0.0) {
		//Outer - Outer
		this.workLength = this.bg_fb_vert_s2_outerlength_o * this.bg_fb_s2_percent;
		this.workPositionX = graphics.c_width - (this.main.bg_frame_borderoffset + (0.5 * this.main.bg_whitebar_thickness));
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - this.bg_fb_vert_s2_outerlength_o + (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness,this.workLength,0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Outer - Inner 
		this.workLength = this.bg_fb_vert_s2_outerlength_i * this.bg_fb_s2_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - this.main.bg_whitebar_thickness - (0.5 * this.workLength);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - this.cornerSquareSize - (3.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength,this.main.bg_whitebar_thickness,  0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_vert_s2_innerlength * this.bg_fb_s2_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - (3.0 * this.main.bg_whitebar_thickness) - (0.5 * this.workLength);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - this.cornerSquareSize - (5.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
	if(this.bg_fb_s3_percent > 0.0) {
		//Outer - Outer
		this.workLength = this.bg_fb_vert_s3_outerlength_o * this.bg_fb_s3_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - this.main.bg_whitebar_thickness - (0.5 * this.workLength);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - (0.5 * this.main.bg_whitebar_thickness);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.workLength, this.main.bg_whitebar_thickness, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Outer-Inner
		this.workLength = this.bg_fb_vert_s3_outerlength_i * this.bg_fb_s3_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - this.cornerSquareSize - (3.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - this.main.bg_whitebar_thickness - this.bg_fb_vert_s3_outerlength_i + (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
		//Inner
		this.workLength = this.bg_fb_vert_s3_innerlength * this.bg_fb_s3_percent;
		this.workPositionX = graphics.c_width - this.main.bg_frame_borderoffset - this.cornerSquareSize - (5.5 * this.main.bg_whitebar_thickness);
		this.workPositionY = graphics.c_height - this.main.bg_frame_borderoffset - (2.0 * this.main.bg_whitebar_thickness) - this.bg_fb_vert_s3_innerlength + (0.5 * this.workLength);
		graphics.requestDrawGUI("whitepixel", this.workPositionX, this.workPositionY,
								this.main.bg_whitebar_thickness, this.workLength, 0.0,
								this.main.bg_frame_border_depth,
								this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity,this.main.bg_frame_border_opacity, 
								0.0, 0.0, 1.0,1.0);
	}
}

directorObject.prototype.create_menu_buttons = function() { 
	this.tempcol_edge = new col4(0.7, 0.7, 0.7, 0.7);
	this.tempcol_txt = new col4(0.8, 0.8, 0.8, 0.8);
	this.buttons_play = new menu_button(this.main, "snappy_38", 38, "Play", 401, 373, 92, 56, 5, this.tempcol_edge, this.tempcol_txt, false);
	this.buttons_login = new menu_button(this.main, "snappy_38", 38, "Punch In", 197, 340, 256, 56, 5,  this.tempcol_edge, this.tempcol_txt, true);
	this.buttons_new = new menu_button(this.main, "snappy_38", 38, "New Recruit", 603, 340, 256, 56, 5,  this.tempcol_edge, this.tempcol_txt, true);
	this.buttons_highscore = new menu_button(this.main, "snappy_38", 38, "View Champions", 197, 412, 256, 56, 5,  this.tempcol_edge, this.tempcol_txt, true);
	this.buttons_info = new menu_button(this.main, "snappy_38", 38, "What is this?", 603, 412, 256, 56, 5,  this.tempcol_edge, this.tempcol_txt, false);
	this.buttons_ok = new menu_button(this.main, "snappy_38", 38, "O.K.", 603, 530, 256, 56, 5,  this.tempcol_edge, this.tempcol_txt, true);
	this.buttons_cancel = new menu_button(this.main, "snappy_38", 38, "Cancel", 197, 530, 256, 56, 5,  this.tempcol_edge, this.tempcol_txt, true);
	this.buttons_back = new menu_button(this.main, "snappy_38", 38, "Back", 197, 530, 256, 56, 5,  this.tempcol_edge, this.tempcol_txt, true);
	
	this.buttons_retry = new menu_button(this.main, "snappy_38", 38, "Re-Try", 197, 458, 256, 56, 5,  this.tempcol_edge, this.tempcol_txt, true);
	this.buttons_quittomain = new menu_button(this.main, "snappy_38", 38, "Quit", 197, 530, 256, 56, 5,  this.tempcol_edge, this.tempcol_txt, true);

	//titletext thing
	this.col_title = new col4(0.9, 0.9, 0.9, 0.9);
	this.titletext = new menu_titletext(this.main, "snappy_64", 64.0, "TITLE", 250, 60, this.col_title);
	//Keyboard 

}

directorObject.prototype.draw_menubuttons_intro = function(fraction) { 
	this.buttons_play.draw_intro(fraction);
	this.buttons_login.draw_intro(fraction);
	this.buttons_new.draw_intro(fraction);
	this.buttons_highscore.draw_intro(fraction);
	this.buttons_info.draw_intro(fraction);

	this.llen = fraction * 256.0;
	this.tempcol_edge = new col4(0.9, 0.9, 0.9, 0.9);
	graphics.requestDrawGUI("whitepixel", 197, 451, this.llen, this.main.bg_whitebar_thickness,0.0,
									this.main.bg_buttondepth, this.tempcol_edge.r, this.tempcol_edge.g, this.tempcol_edge.b, this.tempcol_edge.a, 
									0.0, 0.0, 1.0,1.0);
	graphics.requestDrawGUI("whitepixel", 603, 451, this.llen, this.main.bg_whitebar_thickness,0.0,
									this.main.bg_buttondepth, this.tempcol_edge.r, this.tempcol_edge.g, this.tempcol_edge.b, this.tempcol_edge.a, 
									0.0, 0.0, 1.0,1.0);
	graphics.requestDrawGUIString(frameTimer.FPS.toFixed(0) + " FPS", "minstrel_36",36, 400, 432, 0.5, "centre", 0.0, fraction, 0.0, fraction);

}

directorObject.prototype.draw_textentrybuttons = function(fraction) { 
	this.buttons_ok.draw_intro(fraction);
	this.buttons_cancel.draw_intro(fraction);

	this.llen = fraction * 256.0;
	this.blen = fraction * 662.0;
	this.tempcol_edge = new col4(0.9, 0.9, 0.9, 0.9);
	graphics.requestDrawGUI("whitepixel", 197, 493, this.llen, this.main.bg_whitebar_thickness,0.0,
									this.main.bg_buttondepth, this.tempcol_edge.r, this.tempcol_edge.g, this.tempcol_edge.b, this.tempcol_edge.a, 
									0.0, 0.0, 1.0,1.0);
	graphics.requestDrawGUI("whitepixel", 603, 493, this.llen, this.main.bg_whitebar_thickness,0.0,
									this.main.bg_buttondepth, this.tempcol_edge.r, this.tempcol_edge.g, this.tempcol_edge.b, this.tempcol_edge.a, 
									0.0, 0.0, 1.0,1.0);
	graphics.requestDrawGUI("whitepixel", 400, 150, this.blen, this.main.bg_whitebar_thickness,0.0,
									this.main.bg_buttondepth, this.tempcol_edge.r, this.tempcol_edge.g, this.tempcol_edge.b, this.tempcol_edge.a, 
									0.0, 0.0, 1.0,1.0);
	//FPS Timer
	//Manually moving from y= 432 to target
	this.y = 432 - (fraction * (432 - 505));
	graphics.requestDrawGUIString(frameTimer.FPS.toFixed(0) + " FPS", "minstrel_36",36, 400, this.y, 0.5, "centre", 0.0, fraction, 0.0, fraction);
}

directorObject.prototype.draw_highscorebuttons = function(fraction) { 
	this.buttons_back.draw_intro(fraction);
	
	this.llen = fraction * 256.0;
	this.blen = fraction * 662.0;
	this.tempcol_edge = new col4(0.9, 0.9, 0.9, 0.9);
	graphics.requestDrawGUI("whitepixel", 197, 493, this.llen, this.main.bg_whitebar_thickness,0.0,
									this.main.bg_buttondepth, this.tempcol_edge.r, this.tempcol_edge.g, this.tempcol_edge.b, this.tempcol_edge.a, 
									0.0, 0.0, 1.0,1.0);

	graphics.requestDrawGUI("whitepixel", 400, 150, this.blen, this.main.bg_whitebar_thickness,0.0,
									this.main.bg_buttondepth, this.tempcol_edge.r, this.tempcol_edge.g, this.tempcol_edge.b, this.tempcol_edge.a, 
									0.0, 0.0, 1.0,1.0);
}



directorObject.prototype.input_textentrybuttons = function(x, y) {
	if(this.buttons_ok.check_collision(x, y)) {
		graphics.sfx.triggerSimpleScreenSpaceShockWave(this.buttons_ok.x, this.buttons_ok.y, this.main.button_warp_size, this.main.button_warp_time);
		return 2;
	}
	if(this.buttons_cancel.check_collision(x, y)) {
		graphics.sfx.triggerSimpleScreenSpaceShockWave(this.buttons_cancel.x, this.buttons_cancel.y, this.main.button_warp_size, this.main.button_warp_time);
		return 1;
	}
	return 0;
}

directorObject.prototype.fractionModifier = function(fraction) {
	fraction = (-0.5 * Math.PI) + (fraction * Math.PI);
	fraction = 0.5 * (Math.sin(fraction) + 1.0);
	return fraction;
}

directorObject.prototype.checkAndSetButtons = function() {
	if(this.user.valid) {
		this.buttons_play.active = true;
		this.buttons_login.txt = "Change User";
		this.buttons_new.txt = "New User";
	}
	else {
		this.buttons_play.active = false;
		this.buttons_login.txt = "Login User";;
		this.buttons_new.txt = "Create User";
	}
}
