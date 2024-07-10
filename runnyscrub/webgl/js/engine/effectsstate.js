function EffectsState() {
	this.effects; //[0.0, 0.0, 0.0, 0.0] (NEGATIVE, GRAYSCALE, COLOURISE, PIXELATTE)
	this.mixColour; //[0.0, 0.0, 0.0, 0.0] (R,G,B,A)
	this.pixDivX; //INT
	this.pixDivY; //INT
	this.blur; //FLOAT 0.0 to 1.0 (one of the extremes makes it invisible, think it's 1.0)
	this.oldmovie; //BOOL 
}