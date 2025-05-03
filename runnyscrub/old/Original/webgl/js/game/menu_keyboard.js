function key(keyboard, txt, font, font_size, x, y, fx0, fx1, fy0, fy1, x0, x1, y0, y1, hori, vert, letter, col, thickness) {
	this.keyboard = keyboard;
	this.txt = txt;
	this.x = x;
	this.y = y;
	this.font = font;
	this.font_size = font_size;
	this.fx0 = fx0;
	this.fx1 = fx1;
	this.fy0 = fy0;
	this.fy1 = fy1;
	this.x0 = x0;
	this.x1 = x1;
	this.y0 = y0;
	this.y1 = y1;
	this.hori = hori;
	this.vert = vert;
	this.letter = letter;
	this.col = col;
	this.thickness = thickness;
	this.brightness = 1.0;
	this.col_flash = new col4(0.8, 0.1, 0.0, 0.8);//not sure if those overloadsd in right order..
	this.col_current = new col4(0.0, 0.0, 0.0, 0.0);

	this.bool = false; //random working
	//Animate flashing
	this.isAnimating;
	this.aniCount = 0.0;
	this.aniTime = 0.6; //seconds for effect
	this.aniFrac = 0.0; //working frac variable
	this.aniNumPulses = 4;
}

key.prototype.checktouch = function(x, y) {

	this.bool = x > this.x0 && y > this.y0 && x < this.x1 && y < this.y1;
	if(this.bool) {
		this.isAnimating = true;
		this.aniCount = 0.0;
		graphics.sfx.triggerSimpleScreenSpaceShockWave(this.x, this.y, this.keyboard.main.key_warp_size, this.keyboard.main.key_warp_time);
		return true;
	}
	return false;
}

key.prototype.draw = function(fraction) {
	if(this.hori) {
		if(this.fx1 <= fraction) {
			this.keyboard.working_kfx = 1.0;
		} 
		else {
			if(fraction > this.fx0) {
				this.keyboard.working_kfx = (fraction - this.fx0) / (this.fx1 - this.fx0);
			}
			else {	
				this.keyboard.working_kfx = 0.0;
			}
		}
	}

	if(this.vert){
		if(this.fy1 <= fraction) {
			this.keyboard.working_kfy = 1.0;
		} 
		else {
			if(fraction > this.fy0) {
				this.keyboard.working_kfy = (fraction - this.fy0) / (this.fy1 - this.fy0);
			}
			else {
				this.keyboard.working_kfy = 0.0;
			}
		}
	}
	this.keyboard.working_kf = this.keyboard.working_kfx;
	if(this.keyboard.working_kfx < this.keyboard.working_kfy) {
		this.keyboard.working_kf = this.keyboard.working_kfy;
	}
	if(this.keyboard.working_kf < 0.1) {
		this.keyboard.working_kf = 0.1;
	}

	this.col_current.r = this.col.r;
	this.col_current.g = this.col.g;
	this.col_current.b = this.col.b;
	this.col_current.a = this.col.a;
	this.col_current.scaleSelf(this.keyboard.working_kf);

	//Horizontal Line
	if(this.hori) {
		this.keyboard.working_len = this.keyboard.working_kfx * (this.x1 - this.x0);
		this.keyboard.working_x = this.x1 - (0.5 * this.keyboard.working_len);
		this.keyboard.working_y = this.y0;
		graphics.requestDrawGUI("whitepixel", this.keyboard.working_x,this.keyboard.working_y, this.keyboard.working_len, this.thickness, 0.0,
								this.keyboard.main.keyboard_depth,this.col_current.r, this.col_current.g, this.col_current.b, this.col_current.a, 
								0.0, 0.0, 1.0,1.0);
	}

	//Vertical Line
	if(this.vert) {
		this.keyboard.working_x = this.x0 
		if(this.letter && this.txt == "A") {
			this.keyboard.working_x += 0.5 * this.keyboard.keywidth;
		}

		this.keyboard.working_len = this.keyboard.working_kfy * (this.y1 - this.y0);
		this.keyboard.working_y = this.y1 - (0.5 * this.keyboard.working_len);
		graphics.requestDrawGUI("whitepixel", this.keyboard.working_x,this.keyboard.working_y, this.thickness, this.keyboard.working_len, 0.0,
							this.keyboard.main.keyboard_depth,this.col_current.r, this.col_current.g, this.col_current.b, this.col_current.a, 
							0.0, 0.0, 1.0,1.0);
	}

	this.col_current.r = this.col.r;
	this.col_current.g = this.col.g;
	this.col_current.b = this.col.b;
	this.col_current.a = this.col.a;
	this.keyboard.working_kf = this.keyboard.working_kfx * this.keyboard.working_kfy;
	this.col_current.scaleSelf(this.keyboard.working_kf);

	if(this.isAnimating) {
		this.aniCount += frameTimer.seconds;
		if(this.aniCount > this.aniTime){
			this.aniCount = this.aniTime;
			this.isAnimating = false;
		}
		this.aniFrac = this.aniCount / this.aniTime;
		//animate this.col by using store this.col_base
		this.aniFrac *= 2.0 * this.aniNumPulses * Math.PI;
		this.aniFrac = 1.0 - (0.5 * (Math.sin(this.aniFrac) + 1.0));
		this.col_current.r = this.aniFrac * this.col_flash.r;
		this.col_current.g = this.aniFrac * this.col_flash.g;
		this.col_current.b = this.aniFrac * this.col_flash.b;
		this.col_current.a = this.aniFrac * this.col_flash.a;
	}

	if(this.letter) {
		graphics.requestDrawGUIString(this.txt, this.font,this.font_size, this.x, this.y - (this.font_size * 0.5), this.keyboard.main.keyboard_depth, "centre", 
										this.col_current.r, this.col_current.g, this.col_current.b, this.col_current.a);
	}
}

function menu_keyboard(main, topleftx, toplefty, bottomrightx, bottomrighty, font, font_size, base_col, thickness) {
	this.main = main;
	this.x0 = topleftx;
	this.x1 = bottomrightx;
	this.y0 = toplefty;
	this.y1 = bottomrighty;
	this.font = font;
	this.font_size = font_size;
	this.col = base_col;
	this.thickness = thickness;

	this.width = this.x1 - this.x0;
	this.height = this.y1 - this.y0;
	this.keywidth = this.width / 10.0;
	this.keyheight = this.height / 4.0;

	this.modwidth = 11.0 * this.keywidth;
	this.modheight = 5.0 * this.keyheight;
	this.mx1 = this.x0 + this.modwidth;
	this.my1 = this.y0 + this.modheight;

	//Used by the keys to avoid lots of variables created
	this.working_kfx;
	this.working_kfy;
	this.working_kf;
	this.working_len;
	this.working_x;
	this.working_y;
	//for keyboard
	this.wx;
	this.xy;
	this.l;
	this.wx0;
	this.wy0;
	this.wx1;
	this.wy1;
	this.wfx0;
	this.wfx1;
	this.wfy0;
	this.wfy1;
	this.whori;
	this.wvert;
	this.wletter;
	this.wshift;
	//Set up the keyboard
	this.total_num_keys = 11 + 11 + 10 + 10 + 10;//Includes an extra blank on each row, and an extra blank row
	this.keys = [];
	this.createkeyboard();
	this.wstring = ""; 
}

menu_keyboard.prototype.checktouch = function(x, y) {
	//returns a string, either contiaining a character or the string "NONE";
	this.wstring = "NONE";
	for(var k = 0; k < this.total_num_keys; k++) {
		if(this.keys[k].letter) {
			if(this.keys[k].checktouch(x, y)) {
				this.wstring = this.keys[k].txt;
				k = this.total_num_keys;
			}
		}
	}
	return this.wstring;
}

menu_keyboard.prototype.createkeyboard = function() {
	//------------------------------------------------------------------------------------------------------------------------
	//Keys [0 - 10] are the top row (coincidently of the same char..except the blank end)
	//key(keyboard, txt, font, font_size, x, y, fx0, fx1, fy0, fy1, x0, x1, y0, y1, hori, vert, letter, col, thickness)
	for(var i = 0; i < 11; i++) {
		this.wx = this.x0 + ((i + 0.5) * this.keywidth);
		this.wy = this.y0 + (0.5 * this.keyheight);
		switch(i) {
			case 0:
			this.l = "0";
			break;
			case 1:
			this.l = "1";
			break;
			case 2:
			this.l = "2";
			break;
			case 3:
			this.l = "3";
			break;
			case 4:
			this.l = "4";
			break;
			case 5:
			this.l = "5";
			break;
			case 6:
			this.l = "6";
			break;
			case 7:
			this.l = "7";
			break;
			case 8:
			this.l = "8";
			break;
			case 9:
			this.l = "9";
			break;
		}

		this.wx0 = this.x0 + (i * this.keywidth);
		this.wx1 = this.x0 + ((i + 1) * this.keywidth);
		this.wy0 = this.y0;
		this.wy1 = this.y0 + this.keyheight;

		this.wfx0 = (this.wx0 - this.x0) / this.modwidth;
		this.wfx1 = (this.wx1 - this.x0) / this.modwidth;
		this.wfy0 = (this.wy0 - this.y0) / this.modheight;
		this.wfy1 = (this.wy1 - this.y0)/ this.modheight;

		if(i == 10) { //Final Blank
			this.l = "";
			this.whori = false;
			this.wvert = true;
			this.wletter = false;
		}
		else {
			this.whori = true;
			this.wvert = true;
			this.wletter = true;
		}

		this.keys[i] = new key(this, this.l, this.font, this.font_size, 
							   this.wx, this.wy, 
							   this.wfx0, this.wfx1, this.wfy0, this.wfy1, 
							   this.wx0, this.wx1, this.wy0, this.wy1, 
							   this.whori, this.wvert, this.wletter, 
							   this.col, this.thickness);
	}

	//------------------------------------------------------------------------------------------------------------------------
	//Keys 11 - 21 are the second row "QWERTYUIOP" plus a blank
	//key(keyboard, txt, font, font_size, x, y, fx0, fx1, fy0, fy1, x0, x1, y0, y1, hori, vert, letter, col, thickness)
	this.wshift = 11;
	for(var i = 0; i < 11; i++) {
		this.wx = this.x0 + ((i + 0.5) * this.keywidth);
		this.wy = this.y0 + (1.5 * this.keyheight);
		switch(i) {
			case 0:
			this.l = "Q";
			break;
			case 1:
			this.l = "W";
			break;
			case 2:
			this.l = "E";
			break;
			case 3:
			this.l = "R";
			break;
			case 4:
			this.l = "T";
			break;
			case 5:
			this.l = "Y";
			break;
			case 6:
			this.l = "U";
			break;
			case 7:
			this.l = "I";
			break;
			case 8:
			this.l = "O";
			break;
			case 9:
			this.l = "P";
			break;
			case 10: 
			this.l = "";
			break;
		}

		this.wx0 = this.x0 + (i * this.keywidth);
		this.wx1 = this.x0 + ((i + 1) * this.keywidth);
		this.wy0 = this.y0 + this.keyheight;
		this.wy1 = this.y0 + (2.0 * this.keyheight);

		this.wfx0 = (this.wx0 - this.x0) / this.modwidth;
		this.wfx1 = (this.wx1- this.x0) / this.modwidth;
		this.wfy0 = (this.wy0 - this.y0) / this.modheight;
		this.wfy1 = (this.wy1 - this.y0)/ this.modheight;

		if(i == 10) { //Final Blank
			this.whori = false;
			this.wvert = true;
			this.wletter = false;
		}
		else {
			this.whori = true;
			this.wvert = true;
			this.wletter = true;
		}

		this.keys[i + this.wshift] = new key(this, this.l, this.font, this.font_size, 
							   this.wx, this.wy, 
							   this.wfx0, this.wfx1, this.wfy0, this.wfy1, 
							   this.wx0, this.wx1, this.wy0, this.wy1, 
							   this.whori, this.wvert, this.wletter, 
							   this.col, this.thickness);
	}

	//------------------------------------------------------------------------------------------------------------------------
	//Keys 22 - 31 are the third row "ASDFGHJKL" plus a blank. this is shift over half a key as is one key shorter than row above
	//key(keyboard, txt, font, font_size, x, y, fx0, fx1, fy0, fy1, x0, x1, y0, y1, hori, vert, letter, col, thickness)
	this.wshift = 22;
	for(var i = 0; i < 10; i++) {
		this.wx = this.x0 + ((i + 1.0) * this.keywidth);
		this.wy = this.y0 + (2.5 * this.keyheight);
		switch(i) {
			case 0:
			this.l = "A";
			break;
			case 1:
			this.l = "S";
			break;
			case 2:
			this.l = "D";
			break;
			case 3:
			this.l = "F";
			break;
			case 4:
			this.l = "G";
			break;
			case 5:
			this.l = "H";
			break;
			case 6:
			this.l = "J";
			break;
			case 7:
			this.l = "K";
			break;
			case 8:
			this.l = "L";
			break;
			case 9:
			this.l = "";
			break;
		}

		if(i == 0 || i == 8) {
			if(i== 0) {
				this.wx0 = this.x0;
				this.wx1 = this.x0 + (1.5 * this.keywidth);
			}
			else {
				this.wx0 = this.x0 + ((i + 0.5) * this.keywidth);
				this.wx1 = this.x0 + ((i + 2.0) * this.keywidth);
			}
		}
		else {
			this.wx0 = this.x0 + ((i + 0.5) * this.keywidth);
			this.wx1 = this.x0 + ((i + 1.5) * this.keywidth);
		}

		this.wy0 = this.y0 + (2.0 * this.keyheight);
		this.wy1 = this.y0 + (3.0 * this.keyheight);

		this.wfx0 = (this.wx0 - this.x0) / this.modwidth;
		this.wfx1 = (this.wx1- this.x0) / this.modwidth;
		this.wfy0 = (this.wy0 - this.y0) / this.modheight;
		this.wfy1 = (this.wy1 - this.y0)/ this.modheight;

		if(i == 9) { //Final Blank
			this.whori = false;
			this.wvert = true;
			this.wletter = false;
		}
		else {
			this.whori = true;
			this.wvert = true;
			this.wletter = true;
		}

		this.keys[i + this.wshift] = new key(this, this.l, this.font, this.font_size, 
							   this.wx, this.wy, 
							   this.wfx0, this.wfx1, this.wfy0, this.wfy1, 
							   this.wx0, this.wx1, this.wy0, this.wy1, 
							   this.whori, this.wvert, this.wletter, 
							   this.col, this.thickness);
	}

	//------------------------------------------------------------------------------------------------------------------------
	//Keys 31 - 40 are the fourth row "DELZXCVBNMDEL" plus a blank. this is shift over half a key as is one key shorter than row above
	//key(keyboard, txt, font, font_size, x, y, fx0, fx1, fy0, fy1, x0, x1, y0, y1, hori, vert, letter, col, thickness)
	this.wshift = 32;
	for(var i = 0; i < 10; i++) {

		switch(i) {
			case 0:
				this.wx = this.x0 + (0.75 * this.keywidth);
			break;
			case 8:
				this.wx = this.x0 + (9.25 * this.keywidth);
			break;
			case 9:
				this.wx = this.x0 + (10.5 * this.keywidth);
			break;
			default:
				this.wx = this.x0 + ((i + 1.0) * this.keywidth);
			break;
		}
		this.wy = this.y0 + (3.5 * this.keyheight);

		switch(i) {
			case 0:
			this.l = "_";
			break;
			case 1:
			this.l = "Z";
			break;
			case 2:
			this.l = "X";
			break;
			case 3:
			this.l = "C";
			break;
			case 4:
			this.l = "V";
			break;
			case 5:
			this.l = "B";
			break;
			case 6:
			this.l = "N";
			break;
			case 7:
			this.l = "M";
			break;
			case 8:
			this.l = "DEL";
			break;
			case 9:
			this.l = "";
			break;
		}

		switch(i) {
			case 0:
				this.wx0 = this.x0;
				this.wx1 = this.wx0 + (1.5 * this.keywidth);
			break;
			case 8:
				this.wx0 = this.x0 + (8.5 * this.keywidth);
				this.wx1 = this.wx0 + (1.5 * this.keywidth);
			break;
			case 9:
				this.wx0 = this.x0 + (10.0 * this.keywidth);
				this.wx1 = this.wx0 + (0.5 * this.keywidth);
			break;
			default:
				this.wx0 = this.x0 + ((0.5 + i) * this.keywidth);
				this.wx1 = this.wx0 + this.keywidth;
			break;
		}

		
		this.wy0 = this.y0 + (3.0 * this.keyheight);
		this.wy1 = this.y0 + (4.0 * this.keyheight);

		this.wfx0 = (this.wx0 - this.x0) / this.modwidth;
		this.wfx1 = (this.wx1- this.x0) / this.modwidth;
		this.wfy0 = (this.wy0 - this.y0) / this.modheight;
		this.wfy1 = (this.wy1 - this.y0)/ this.modheight;

		if(i == 9) { //Final Blank
			this.whori = false;
			this.wvert = true;
			this.wletter = false;
		}
		else {
			this.whori = true;
			this.wvert = true;
			this.wletter = true;
		}

		this.keys[i + this.wshift] = new key(this, this.l, this.font, this.font_size, 
							   this.wx, this.wy, 
							   this.wfx0, this.wfx1, this.wfy0, this.wfy1, 
							   this.wx0, this.wx1, this.wy0, this.wy1, 
							   this.whori, this.wvert, this.wletter, 
							   this.col, this.thickness);
	}

	//------------------------------------------------------------------------------------------------------------------------
	//Keys 44 - 54 are the fith row BLANKS plus a blank. this is shift over half a key as is one key shorter than row above
	//key(keyboard, txt, font, font_size, x, y, fx0, fx1, fy0, fy1, x0, x1, y0, y1, hori, vert, letter, col, thickness)
	this.wshift = 42;
	for(var i = 0; i < 10; i++) {

		switch(i) {
			case 0:
				this.wx = this.x0 + (0.75 * this.keywidth);
			break;
			case 8:
				this.wx = this.x0 + (9.25 * this.keywidth);
			break;
			case 9:
				this.wx = this.x0 + (10.5 * this.keywidth);
			break;
			default:
				this.wx = this.x0 + ((i + 1.0) * this.keywidth);
			break;
		}
		this.wy = this.y0 + (4.5 * this.keyheight);

		this.l = "";

		switch(i) {
			case 0:
				this.wx0 = this.x0;
				this.wx1 = this.wx0 + (1.5 * this.keywidth);
			break;
			case 8:
				this.wx0 = this.x0 + (8.5 * this.keywidth);
				this.wx1 = this.wx0 + (1.5 * this.keywidth);
			break;
			case 9:
				this.wx0 = this.x0 + (10 * this.keywidth);
				this.wx1 = this.wx0 + (1.5 * this.keywidth);
			break;
			default:
				this.wx0 = this.x0 + ((0.5 + i) * this.keywidth);
				this.wx1 = this.wx0 + this.keywidth;
			break;
		}

		
		this.wy0 = this.y0 + (4.0 * this.keyheight);
		this.wy1 = this.y0 + (5.0 * this.keyheight);

		this.wfx0 = (this.wx0 - this.x0) / this.modwidth;
		this.wfx1 = (this.wx1- this.x0) / this.modwidth;
		this.wfy0 = (this.wy0 - this.y0) / this.modheight;
		this.wfy1 = (this.wy1 - this.y0)/ this.modheight;

		if(i == 9) { //Final Blank
			this.whori = false;
			this.wvert = false;
			this.wletter = false;
		}
		else {
			this.whori = true;
			this.wvert = false;
			this.wletter = false;
		}

		this.keys[i + this.wshift] = new key(this, this.l, this.font, this.font_size, 
							   this.wx, this.wy, 
							   this.wfx0, this.wfx1, this.wfy0, this.wfy1, 
							   this.wx0, this.wx1, this.wy0, this.wy1, 
							   this.whori, this.wvert, this.wletter, 
							   this.col, this.thickness);
	}
}

menu_keyboard.prototype.update = function() {
	//not even sure if this is called
}

menu_keyboard.prototype.drawintro = function(fraction) {
	for(var k = 0; k < this.total_num_keys; k++) {
		this.keys[k].draw(fraction);
	}
}


