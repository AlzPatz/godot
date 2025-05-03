function menu_button(main, font, font_size, text, x, y, w, h, t, col_edge, col_txt, active) {
	this.main = main;
	this.active = active;
	this.font = font;
	this.font_size = font_size;
	this.txt = text;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.thickness = t;
	this.half_thick = 0.5 * this.thickness;

	this.col_edge_base = new col4(col_edge.r, col_edge.g, col_edge.b, col_edge.a);
	this.col_txt_base = new col4(col_txt.r, col_txt.g, col_txt.b, col_txt.a);
	
	this.col_edge = new col4(col_edge.r, col_edge.g_col, col_edge.b, col_edge.a);
	this.col_txt = new col4(col_txt.r, col_txt.g, col_txt.b, col_txt.a);

	this.col_inactive = new col4(0.3, 0.3, 0.3, 0.8);
	this.col_highlight = new col4(0.8, 0.1, 0.0, 0.8);
	this.flashduration = 0.5;
	this.numflashes = 4;

	this.isflashing = false;
	this.flashcount = 0.0;

	this.flashfrac = 0.0;

	this.tl = new vec2(this.x - (0.5 * this.w), this.y - (0.5 * this.h));
	this.br = new vec2(this.x + (0.5 * this.w), this.y + (0.5 * this.h));

	this.totl = 2.0 * (this.w + this.h);
	this.f0 = this.w / this.totl;
	this.f1 = this.f0 + (this.h / this.totl);
	this.f2 = this.f1 + this.f0;

	this.percent;

	this.hw = w * 0.5;
	this.hh = h * 0.5;
	this.x0 = x - this.hw;
	this.x1 = x + this.hw;
	this.y0 = y - this.hh;
	this.y1 = y + this.hh;
}

menu_button.prototype.update = function() {
	if(!this.active) { 
		this.col_edge.r = this.col_inactive.r;
		this.col_edge.g = this.col_inactive.g;
		this.col_edge.b = this.col_inactive.b;
		this.col_edge.a = this.col_inactive.a;

		this.col_txt.r = this.col_inactive.r;
		this.col_txt.g = this.col_inactive.g;
		this.col_txt.b = this.col_inactive.b;
		this.col_txt.a = this.col_inactive.a;
		this.flashcount = 0.0;//jsut so alwasy 0 when come out of inactive
	} 
	else {
		if(this.isflashing) {
			this.flashcount += frameTimer.seconds;
			if(this.flashcount > this.flashduration) {
				this.isflashing = false;
				this.flashcount = 0.0;
			}
			this.flashfrac = this.flashcount / this.flashduration;
			this.flashfrac = Math.sin(this.flashfrac * Math.PI * this.numflashes * 2.0);
			this.flashfrac = 1.0 - this.flashfrac;
			this.col_edge.r = this.col_edge_base.r * this.flashfrac;
			this.col_edge.g = this.col_highlight.g * this.flashfrac;
			this.col_edge.b = this.col_highlight.b * this.flashfrac;
			this.col_edge.a = this.col_highlight.a * this.flashfrac;
			this.col_txt.r = this.col_highlight.r * this.flashfrac;
			this.col_txt.g = this.col_highlight.g * this.flashfrac;
			this.col_txt.b = this.col_highlight.b * this.flashfrac;
			this.col_txt.a = this.col_highlight.a * this.flashfrac;
		}
		else {
			this.col_edge.r = this.col_edge_base.r;
			this.col_edge.g = this.col_edge_base.g;
			this.col_edge.b = this.col_edge_base.b;
			this.col_edge.a = this.col_edge_base.a;
			this.col_txt.r = this.col_txt_base.r;
			this.col_txt.g = this.col_txt_base.g;
			this.col_txt.b = this.col_txt_base.b;
			this.col_txt.a = this.col_txt_base.a;
		}
	}
}

menu_button.prototype.check_collision = function(x, y) {
	if(this.active && !this.isflashing) { //the check for flashing will stop multiple presses, but might turn out not nice feeling
		if(x >= this.x0 && x <= this.x1 && y >= this.y0 && y <= this.y1) {
			this.isflashing = true;
			return true;
		}
	}
	return false;
}

menu_button.prototype.draw_intro = function(fraction) {
	this.update();
	fraction = Math.min(Math.max(fraction, 0.0), 1.0); //Clamp

	if(fraction <= this.f0){
		this.percent = fraction / this.f0;
		this.draw_top(this.percent);
	}
	else if(fraction <= this.f1) {
		this.percent = (fraction - this.f0) / (this.f1 - this.f0);
		this.draw_top(1.0);
		this.draw_right(this.percent);
	}
	else if (fraction <= this.f2) {
		this.percent = (fraction - this.f1) / (this.f2 - this.f1);
		this.draw_top(1.0);
		this.draw_right(1.0);
		this.draw_bottom(this.percent);
	}
	else {
		this.percent = (fraction - this.f2) / (1.0 - this.f2);
		this.draw_top(1.0);
		this.draw_right(1.0);
		this.draw_bottom(1.0);
		this.draw_left(this.percent);
	}

	this.draw_text(fraction);
}

menu_button.prototype.draw_top = function(fraction) {
	this.len = fraction * this.w;
	this.sy = this.tl.y + this.half_thick;
	this.sx = this.tl.x + (0.5 * this.len);
	graphics.requestDrawGUI("whitepixel", this.sx, this.sy, this.len, this.thickness,0.0,
									this.main.bg_buttondepth,this.col_edge.r, this.col_edge.g, this.col_edge.b, this.col_edge.a, 
									0.0, 0.0, 1.0,1.0);
}

menu_button.prototype.draw_right = function(fraction) {
	this.len = fraction * (this.h - this.thickness);
	this.sy = this.tl.y + this.thickness + (0.5 * this.len);
	this.sx = this.br.x - this.half_thick;
	graphics.requestDrawGUI("whitepixel", this.sx, this.sy, this.thickness, this.len, 0.0,
									this.main.bg_buttondepth,this.col_edge.r, this.col_edge.g, this.col_edge.b, this.col_edge.a, 
									0.0, 0.0, 1.0,1.0);
}

menu_button.prototype.draw_bottom = function(fraction) {
	this.len = fraction * (this.w - this.thickness);
	this.sy = this.br.y - this.half_thick;
	this.sx = this.br.x - this.thickness - (0.5 * this.len);
	graphics.requestDrawGUI("whitepixel", this.sx, this.sy, this.len, this.thickness,0.0,
									this.main.bg_buttondepth,this.col_edge.r, this.col_edge.g, this.col_edge.b, this.col_edge.a, 
									0.0, 0.0, 1.0,1.0);
}

menu_button.prototype.draw_left = function(fraction) {
	this.len = fraction * (this.h - (2.0 * this.thickness));
	this.sy = this.br.y - this.thickness - (0.5 * this.len);
	this.sx = this.tl.x + this.half_thick;
	graphics.requestDrawGUI("whitepixel", this.sx, this.sy, this.thickness, this.len, 0.0,
									this.main.bg_buttondepth,this.col_edge.r, this.col_edge.g, this.col_edge.b, this.col_edge.a, 
									0.0, 0.0, 1.0,1.0);
}

menu_button.prototype.draw_text = function(fraction) {
	this.colnew = new col4(this.col_txt.r, this.col_txt.g, this.col_txt.b, this.col_txt.a);
	this.colnew.scaleSelf(fraction);
	graphics.requestDrawGUIString(this.txt, this.font,this.font_size, this.x, this.y - 20.0, this.main.bg_buttondepth, "centre", 
									this.colnew.r, this.colnew.g, this.colnew.b, this.colnew.a);
}