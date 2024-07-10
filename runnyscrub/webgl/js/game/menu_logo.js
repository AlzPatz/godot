function menu_logo(main){
	this.main = main;
	this.mainYStartPos = -150.0;
	this.mainYPos = 160.0;
	this.widthStart = 400.0;
	this.scale = this.widthStart / 512.0;
	this.heightStart = this.scale * 256.0;
	this.halfHeight = 0.5 * this.heightStart;
	this.introNumOsc = 3.0;
	this.AmpDivisor = 20.0;
	this.x = graphics.c_halfwidth;
	this.y = this.mainYPos;
	this.Amp;
	this.Angle;
	this.len = this.mainYPos - this.mainYStartPos;
	this.topleft_x = 130;
	this.topleft_y = 95;
	this.topleft_width = 200;

	this.width;
	this.height;
}

menu_logo.prototype.drawIntro = function(fraction) {
	this.x = graphics.c_halfwidth;
	if(fraction > 1.0)
		fraction = 1.0;
	if(fraction < 0.0)
		fraction = 0.0;
	if(fraction == 0.0) {
		this.Amp = 1.0;
	}
	else {
		this.Amp = 1.0 / (this.AmpDivisor * (fraction / (1.0 / this.introNumOsc)));	
	}
	this.Angle = Math.PI + (2.0 * fraction * this.introNumOsc * Math.PI);
	this.y = this.mainYPos + (this.len * this.Amp * Math.cos(this.Angle));

	if(this.y + this.halfHeight < this.main.bg_frame_borderoffset) {
		//Off the top of the screen (no draw)
	}
	else if (this.y - this.halfHeight > this.main.bg_frame_borderoffset) {
		//All on screen	
		graphics.requestDrawGUI("rsLogo_large", this.x , this.y, this.widthStart, this.heightStart,0.0,
									this.main.bg_logodepth,this.main.bg_logoOpacity,this.main.bg_logoOpacity,this.main.bg_logoOpacity,this.main.bg_logoOpacity, 
									0.0, 0.0, 1.0,1.0);
	}
	else {
		//Half on half not
		this.h = this.y + this.halfHeight - this.main.bg_frame_borderoffset;
		this.fracdraw = this.h / this.heightStart;
		this.y = this.main.bg_frame_borderoffset + (0.5 * this.h);
		graphics.requestDrawGUI("rsLogo_large", this.x , this.y, this.widthStart, this.h,0.0,
									this.main.bg_logodepth,this.main.bg_logoOpacity,this.main.bg_logoOpacity,this.main.bg_logoOpacity,this.main.bg_logoOpacity, 
									0.0, 1.0 - this.fracdraw, 1.0,1.0);
	}
}

menu_logo.prototype.drawMoveToTopLeft = function(fraction) {
		this.width = this.widthStart - (fraction * (this.widthStart - this.topleft_width));
		this.scale = this.width / 512.0;
		this.height = this.scale * 256.0;
		this.x = graphics.c_halfwidth - (fraction * (graphics.c_halfwidth - this.topleft_x));
		this.y = this.mainYPos - (fraction * (this.mainYPos - this.topleft_y));
		graphics.requestDrawGUI("rsLogo_large", this.x , this.y, this.width, this.height,0.0,
							this.main.bg_logodepth,this.main.bg_logoOpacity,this.main.bg_logoOpacity,this.main.bg_logoOpacity,this.main.bg_logoOpacity, 
							0.0, 0.0, 1.0,1.0);
	}

menu_logo.prototype.drawAppearInTopLeft = function(fraction) {
	this.width = this.topleft_width;
	this.scale = this.width / 512.0;
	this.height = this.scale * 256.0;
	this.x = this.topleft_x;
	this.y = this.topleft_y;
	this.opac = fraction * this.main.bg_logoOpacity;
	graphics.requestDrawGUI("rsLogo_large", this.x , this.y, this.width, this.height,0.0,
						this.main.bg_logodepth,this.opac,this.opac,this.opac,this.opac, 
						0.0, 0.0, 1.0,1.0);
}
