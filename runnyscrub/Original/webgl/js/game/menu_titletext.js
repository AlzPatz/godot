function menu_titletext(main, font, font_size, text, x, y, col_txt) {
	this.main = main;
	this.font = font;
	this.font_size = font_size;
	this.text = text;
	this.x = x;
	this.y = y;
	this.col = col_txt;
	this.num_letter_rotations = 3;
	this.num_chars;
	this.setText(this.text);
	this.numToDraw;
	this.texttodraw;
	this.rndchars;
	this.num_randoms;
}

menu_titletext.prototype.setText= function(text) {
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

menu_titletext.prototype.draw = function(fraction) {
	this.numToDraw = Math.floor(fraction * this.num_chars); 
	this.texttodraw = "";
	for(var i = 1; i <= this.numToDraw; i++) {
		this.texttodraw += this.text.charAt(i - 1);
	}
	if(fraction != 1.0) {
		this.texttodraw += this.text.charAt(this.rndchars[Math.floor(fraction * this.num_randoms)]);
	}
	this.colnew = new col4(this.col.r, this.col.g, this.col.b, this.col.a);
	//this.colnew.scaleSelf(fraction);
	graphics.requestDrawGUIString(this.texttodraw, this.font,this.font_size, this.x, this.y, this.main.bg_buttondepth, "left", 
								this.colnew.r, this.colnew.g, this.colnew.b, this.colnew.a);
}