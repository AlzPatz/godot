/*
frameTimer.js :: Pixel Peasant, Alex Paterson, 2014
* Simple frame timer to calculate FPS
*/

function frameTimerObject() {
	this.lastTime;
	this.currentTime;
	this.rawDelta;
	this.seconds;
	
	this.FPSUpdate_Period = 1.0;
	this.FPSUpdate_FrameCount = 0;
	this.FPSUpdate_TimeCount = 0;
	this.FPS = 0.0;
}

frameTimerObject.prototype.update = function() { 
	if(this.lastTime == undefined) { 
		this.lastTime = Date.now();
	}
	
	this.currentTime = Date.now();
	this.rawDelta = this.currentTime - this.lastTime;
	if(this.rawDelta == 0.0) { 
		this.seconds = 0.0;
	}
	else { 
		this.seconds = this.rawDelta * 0.001;
	}
	
	this.lastTime = this.currentTime;
	
	this.FPSUpdate_TimeCount += this.seconds;
	this.FPSUpdate_FrameCount++;
	if(this.FPSUpdate_TimeCount > this.FPSUpdate_Period) { 
		this.FPS = this.FPSUpdate_FrameCount / this.FPSUpdate_TimeCount;
		this.FPSUpdate_TimeCount = 0.0;
		this.FPSUpdate_FrameCount = 0;
		//console.log("FPS: " + this.FPS);
	}
	//Basic draw to screen each frame
	//graphics.requestDrawGUIString("FPS: " + this.FPS.toFixed(1), "minstrel_36",36, 790, 10, 0.2, "right", 0.0, 1.0, 0.0, 1.0);
}
