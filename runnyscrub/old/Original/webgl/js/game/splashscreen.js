function splashScreen(){
	this.timeCount;
	this.inTime;
	this.outTime;
	this.alpha;
	this.shockwavetriggered;
}

splashScreen.prototype.initialise = function() { 
	this.timeCount = 0.0;
	this.inTime = game.splash_time * this.splash_fadepercent;
	this.outTime = game.splash_time * (1.0 - this.splash_fadepercent);
	this.shockwavetriggered = false;
	graphics.setCameraZoom(1.0);
	graphics.setCameraPos(0.0, 0.0);
	graphics.setCameraRot(0.0);
	game.sfxControl.trigger("SplashScreen_Start");
}

splashScreen.prototype.update = function() { 
	if(this.timeCount >= game.splash_time) { 
		this.timeCount = game.splash_time;
		game.screen = "main";
		game.screen_main = new mainScreen();
		game.screen_main.initialise();
		this.alpha = 0.0;
	}
	else {
		var percent = this.timeCount / game.splash_time;
		if(!this.shockwavetriggered && percent >= 0.3) {
			this.shockwavetriggered = true;
			//isScreenSpace, x, y, min, max, duration, intensity
			graphics.sfx.triggerShockWave(true, 0.5 * graphics.c_width, 
							0.5 * graphics.c_height, 
							25.0,
							1600.0,
							0.5 * game.splash_time,
							1.0);
		}
		
		if(percent <=  game.splash_fadepercent) {
			this.alpha = percent /  game.splash_fadepercent;
		}
		else { 
			if (percent >= (1.0 -  game.splash_fadepercent)) {
			this.alpha = 1.0 - ((percent - (1.0 -  game.splash_fadepercent)) /  game.splash_fadepercent);

			}
			else { 
				this.alpha = 1.0;
			}
		}
	}
	graphics.sfx.setBasePostProcessColour(this.alpha, this.alpha, this.alpha, this.alpha);
	graphics.requestDraw(	true, 
							false, 
							"ppsplash", 
							0.0, 
							0.0, 
							graphics.c_width, 
							graphics.c_height, 
							0.0, 
							0.5, 
							1.0, 
							1.0, 
							1.0, 
							1.0, 
							0.0, 
							0.0, 
							1.0, 
							1.0)
	this.timeCount += frameTimer.seconds;
}
