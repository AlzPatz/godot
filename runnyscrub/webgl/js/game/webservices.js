function webServicesObject(main, font,font_size,col_txt) {
	this.main = main;

	//Server Side
	this.httpRequest;
	this.requestResponseText = "";

	//Display
	this.x = 400;
	this.y = 300;

	this.tx;
	this.ty;	

	this.base_col = new col4(0.05, 0.3, 0.5, 0.6);
	this.text_col = col_txt;

	this.font = font;
	this.font_size = font_size;
	this.text;

	this.num_letter_rotations = 2;
	this.num_chars;

	this.finalwidth = 700;
	this.finalheight = 120;

	this.intro_min_dimension = 5.0;
	this.intro_max_dimension = 50.0;
	this.intro_num_rotations = 2.0;
	this.intro_totalanglurrot = 360.0 * this.intro_num_rotations;

	//Working
	this.intro_angle = 0.0;
	this.intro_dimension = 0.0;
	this.intro_angularv = 0.0;
	this.intro_col = new col4(0.0, 0.0, 0.0, 0.0);
	this.ww;
	this.wh;
	this.startangle;
	this.angledelta;
	this.timetoallign;
	this.qnum;
	this.numToDraw;
	this.texttodraw;
	this.rndchars;
	this.num_randoms;
	this.textwidth;
}

webServicesObject.prototype.drawMsgIntro = function(fraction, totaltime) {
	//Spinning and Growing square that ends up axis alligned
	this.intro_angularv = this.intro_totalanglurrot / totaltime; //Bad, it's a waste working it out each time, but its just menu code and i dont want to miss some final frames. fraction not controlled here so wary won't hit ==1.0
	this.intro_dimension = this.intro_min_dimension + (fraction * (this.intro_max_dimension - this.intro_min_dimension));
	this.intro_angle = fraction * this.intro_totalanglurrot;
	this.intro_col.r = fraction * this.base_col.r;
	this.intro_col.g = fraction * this.base_col.g;
	this.intro_col.b = fraction * this.base_col.b;
	this.intro_col.a = fraction * this.base_col.a;

	graphics.requestDrawGUI("whitepixel", this.x, this.y, this.intro_dimension, this.intro_dimension,this.intro_angle,
									this.main.web_msg_depth,this.intro_col.r, this.intro_col.g, this.intro_col.b, this.intro_col.a, 
									0.0, 0.0, 1.0,1.0);
}

webServicesObject.prototype.drawMsgWait = function() {
	//Spinning Square waiting
	this.intro_angle += frameTimer.seconds * this.intro_angularv;
	graphics.requestDrawGUI("whitepixel", this.x, this.y,this.intro_max_dimension, this.intro_max_dimension,this.intro_angle,
									this.main.web_msg_depth,this.base_col.r, this.base_col.g, this.base_col.b, this.base_col.a, 
									0.0, 0.0, 1.0,1.0);
}

webServicesObject.prototype.setUpSpinToAxisAllign = function() {
	this.startangle = this.intro_angle;
	this.wnum = this.startangle / Math.PI;
	this.wnum = Math.floor(this.wnum);
	this.angledelta = this.startangle = (this.wnum * Math.PI);
	this.angledelta = Math.PI - this.angledelta;
	this.timetoallign = this.angledelta / this.intro_angularv; 
}

webServicesObject.prototype.drawSpinToAxisAllign = function() {
	this.intro_angle += frameTimer.seconds * this.intro_angularv;
	var pass = false;
	if(this.intro_angle >= this.startangle + this.angledelta) {
		this.intro_angle = this.startangle + this.angledelta;
		pass = true;
	}
	graphics.requestDrawGUI("whitepixel", this.x, this.y,this.intro_max_dimension, this.intro_max_dimension, this.intro_angle,
							this.main.web_msg_depth,this.base_col.r, this.base_col.g, this.base_col.b, this.base_col.a, 
							0.0, 0.0, 1.0,1.0);
	if(pass) {
		return true;
	}
	else {
		return false;
	}
}

webServicesObject.prototype.drawMsgResultIntro = function(fraction) {
	//We assume here that the angle that comes in is axis allgined, so can assume start angle is zero
	if(fraction <= 0.5) {
		//Squeeze and extend vertical
		fraction *= 2.0;
		fraction = this.main.director.fractionModifier(fraction);
		this.ww = this.intro_max_dimension - (fraction * (this.intro_max_dimension - this.intro_min_dimension));
		this.wh = this.intro_max_dimension + (fraction * (this.finalheight - this.intro_max_dimension));
	}
	else {
		fraction = 2.0 * (fraction - 0.5);;
		fraction = this.main.director.fractionModifier(fraction);
		this.ww = this.intro_min_dimension + (fraction * (this.finalwidth - this.intro_min_dimension));
		this.wh = this.finalheight;
	}
	graphics.requestDrawGUI("whitepixel", this.x, this.y,this.ww, this.wh, 0.0,
								this.main.web_msg_depth,this.base_col.r, this.base_col.g, this.base_col.b, this.base_col.a, 
								0.0, 0.0, 1.0,1.0);
}

webServicesObject.prototype.setupMsgResultText = function(text) {
	this.textwidth = graphics.measureString(text, this.font, this.font_size);
	this.tx = this.x - (0.5 * this.textwidth);
	this.ty = this.y - (0.5 * this.font_size);
	this.text = text;
	this.num_chars = this.text.length;
	this.num_randoms = this.num_letter_rotations * this.num_chars;
	this.rndchars = new Int32Array(this.num_randoms);
	this.letcount = 0;
	this.letter = 0;
	for(var i = 0; i < this.num_randoms; i++) {
		this.letcount++;
		if(i != 0) {
			var pass = false;
			while(!pass) {
				this.rndchars[i] = Math.floor(Math.random() * this.num_chars);
				if(this.rndchars[i] != this.rndchars[i - 1]) {
					if(this.letcount == this.num_letter_rotations) {
						if(this.text.charAt(this.rndchars[i]) != this.text.charAt(this.letter)){
							pass = true;
							this.letter++;
							this.letcount = 0;
						}
					}
					else {
						pass = true;
					}
				}
			}
		}
		else {
			this.rndchars[i] = Math.floor(Math.random() * this.num_chars);
		}
	}
}

webServicesObject.prototype.drawMsgResult = function(fraction) {
	//Background shape
	graphics.requestDrawGUI("whitepixel", this.x, this.y,this.finalwidth, this.finalheight, 0.0,
								this.main.web_msg_depth,this.base_col.r, this.base_col.g, this.base_col.b, this.base_col.a, 
								0.0, 0.0, 1.0,1.0);
	//Draw in text
	this.numToDraw = Math.floor(fraction * this.num_chars); 
	this.texttodraw = "";
	for(var i = 1; i <= this.numToDraw; i++) {
		this.texttodraw += this.text.charAt(i - 1);
	}
	if(fraction != 1.0) {
		this.texttodraw += this.text.charAt(this.rndchars[Math.floor(fraction * this.num_randoms)]);
	}

	graphics.requestDrawGUIString(this.texttodraw, this.font,this.font_size, this.tx, this.ty, this.main.web_msg_textdepth, "left", 
								this.text_col.r, this.text_col.g, this.text_col.b, this.text_col.a);
}