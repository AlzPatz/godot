function worldControlObject(main, director) {
	this.main = main;
	this.director = director;

	//Working Variables
	this.menu_scrollspeed = this.main.world_menuScrollSpeed; //Start at defaults
	this.menu_targetY;
	this.x_loop_length = 100.0 * 256.0;

}

worldControlObject.prototype.update_menu = function() {
	//In menu mode the back ground simply scrolls. It is kept with a range of x values to try and ensure no overflow and help set up
	//the "scroll to start" type effect that happens when the game starts

	//Horizontal Motion

	//If scrolling too slowly, accelerate up to speed. Speed and Acc variables defined in main screen
	if(this.menu_scrollSpeed < this.main.world_menuScrollSpeed) {
		this.menu_scrollSpeed += frameTimer.seconds * this.menu.world_menuScrollAcc;
		if(this.menu_scrollSpeed > this.main.world_menuScrollSpeed) {
			this.menu_scrollSpeed = this.main.world_menuScrollSpeed;
		}
	}

	this.director.cameraFocus.x += Math.floor(0.017 * this.main.world_menuScrollSpeed); //TODO: frameTimer causes stutter.. so approx 17ms

	//Vertical Motion

	this.manu_targetY = this.main.platformBuilder.findNearestPlatformHeight(this.director.cameraFocus.x);
	this.deltaY = this.main.world_menuTargetYAttractionScalar * (this.manu_targetY - this.director.cameraFocus.y);
	this.director.cameraFocus.y += this.deltaY;
	this.director.cameraFocus.y = Math.floor(this.director.cameraFocus.y);

}

worldControlObject.prototype.update_game = function() {
	this.update_menu();
}

