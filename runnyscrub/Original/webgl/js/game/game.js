function gameObject() {
	//Runs early, cannot be sure anything loaded
	this.screen = "clicktoplay";	

	this.sfxControl;	

	this.screen_splash;
	this.splash_time = 3.0;
	this.splash_fadepercent = 0.333;

	this.screen_main;
}

gameObject.prototype.loadAssets = function() {
	//All game assets

	//Fonts
	loadFont("minstrel_22", "assets/fonts/minstrel_22", 22.0, 256.0, 1);
	loadFont("minstrel_28", "assets/fonts/minstrel_28", 28.0, 256.0, 1);
	loadFont("minstrel_36", "assets/fonts/minstrel_36", 36.0, 256.0, 2);
	loadFont("minstrel_96", "assets/fonts/minstrel_96", 96.0, 256.0, 8);
	loadFont("snappy_38", "assets/fonts/snappy_38", 38.0, 256.0, 2);
	loadFont("snappy_64", "assets/fonts/snappy_64", 64.0, 256.0, 4);

	//Textures
	loadTexture("ppsplash", "assets/textures/system/splash1.png");
	loadTexture("platform_1", "assets/textures/platform_1.png");
	loadTexture("platform_2", "assets/textures/platform_2.png");
	loadTexture("platform_3", "assets/textures/platform_3.png");
	loadTexture("platform_4", "assets/textures/platform_4.png");
	loadTexture("spritesheet_1", "assets/textures/spritesheet_1.png");
	loadTexture("rsLogo_large", "assets/textures/rsTitle512x256.png");
	loadTexture("toggle", "assets/textures/toggles.png");
	loadTexture("rainsplash", "assets/textures/droplet.png");
	loadTexture("raindrop", "assets/textures/raindrop.png");
	loadTexture("shadowmask", "assets/textures/crtShadowMask.png");
	loadTexture("lightning_seg", "assets/textures/lightning_segment_new.png");
	loadTexture("lightning_point", "assets/textures/lightning_point_new.png");
	loadTexture("searchlight", "assets/textures/searchlight.png");
	loadTexture("deadmsg" , "assets/textures/deadmsg.png");
	//Test
	loadTexture("test", "assets/textures/test.png");
	//Sounds
}

gameObject.prototype.initialise = function() {
	//Runs after load
	this.sfxControl = new effectsController(graphics.sfx);
	this.screen_splash = new splashScreen();
}

gameObject.prototype.update = function() {
	switch(this.screen) {
		case "clicktoplay":
			graphics.requestDrawGUIString(	"Click To Play", 
											"minstrel_96", 
											96, 
											0.5 * graphics.c_width, 
											(0.5 * graphics.c_height) - 68.0, 
											0.1, 
											"centre", 
											0.0, 0.8, 0.95, 1.0);
			if(input.inputListOfMouseButtonsReleased[0]) { 
				this.screen = "splash";
				this.screen_splash.initialise();
			}
		break;
		case "splash":
			this.screen_splash.update();
		break;
		case "main":
			this.screen_main.update();
		break;
	}
}
