function menu_textbox(main, font, font_size, x, y, w, h, text, col_bg, col_txt) {
	this.main = main;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.font = font;
	this.font_size = font_size;

	this.txt;
	this.col_bg = col_bg;
	this.col_txt = col_txt;

	this.tempcol_bg = new col4(1.0,1.0,1.0,1.0);
	this.tempcol_txt = new col4(1.0,1.0,1.0,1.0);

	this.col_textbase = new col4(0.01, 0.2, 0.8, 0.9);
	this.col_text = new col4(0.0, 0.0, 0.0, 0.0);

	this.start_x = x;
	this.start_y = y;
	this.start_h = h;
	this.start_w = w;
	this.textinput_x = x;
	this.textinput_y = 185.0;
	this.textinput_h = 50.0;

	this.tabledisplay_shift = 66.0;
	this.tabledisplay_x = this.start_x + (0.25 * this.start_w) - (0.5 * this.tabledisplay_shift);
	this.tabledisplay_y = 359.0;
	this.tabledisplay_h = 398.0;
	this.tabledisplay_w = (0.5 * this.start_w) + this.tabledisplay_shift;
	
	this.wlength = 0.0;
	this.wfrac = 0.0;
	this.flicker_speed = 50.0;
	this.flicker_count = 0.0;

	this.len_dash = graphics.measureString("_", this.font, this.font_size);
}

menu_textbox.prototype.draw_text_input = function() {
		//Measure the string to help us to be able to place the cursor
		this.wlength = graphics.measureString(this.txt, this.font, this.font_size);
		this.flicker_count += this.flicker_speed * frameTimer.seconds;
		if(this.flicker_count > 2.0 * Math.PI) {
			this.flicker_count -= 2.0 * Math.PI;
		}
		this.wfrac = 0.25 + (0.75 * (0.5 * (Math.sin(this.flicker_count) + 1.0)));
		this.col_text.r = this.wfrac * this.col_textbase.r;
		this.col_text.g = this.wfrac * this.col_textbase.g;
		this.col_text.b = this.wfrac * this.col_textbase.b;
		this.col_text.a = this.col_textbase.a;
		
		graphics.requestDrawGUIString(this.txt, this.font, this.font_size, this.x, this.y - (this.font_size * 0.5), this.main.textbox_txt_depth,
										"centre",
										this.col_text.r, this.col_text.g, this.col_text.b, this.col_text.a);
		if(this.wfrac > 0.8) {
			graphics.requestDrawGUIString("_", this.font, this.font_size, this.x + (0.5 * this.wlength) + (0.5 * this.len_dash), this.y - (this.font_size * 0.5), this.main.textbox_txt_depth,
										"centre",
										this.col_textbase.r, this.col_textbase.g, this.col_textbase.b, this.col_textbase.a);
		}
}

menu_textbox.prototype.draw_intro= function(fraction) {
		this.col_bg.scale(fraction, this.tempcol_bg);
		graphics.requestDrawGUI("whitepixel", this.x, this.y, fraction * this.w, this.start_h ,0.0,
									this.main.textbox_bg_depth,this.tempcol_bg.r, this.tempcol_bg.g, this.tempcol_bg.b, this.tempcol_bg.a, 
									0.0, 0.0, 1.0,1.0);
} 

menu_textbox.prototype.move_to_text_input= function(fraction) {
	this.x = this.start_x - (fraction * (this.start_x - this.textinput_x));
	this.y = this.start_y - (fraction * (this.start_y - this.textinput_y));
	this.h = this.start_h - (fraction * (this.start_h - this.textinput_h));
	graphics.requestDrawGUI("whitepixel", this.x, this.y, this.w, this.h,0.0,
									this.main.textbox_bg_depth,this.tempcol_bg.r, this.tempcol_bg.g, this.tempcol_bg.b, this.tempcol_bg.a, 
									0.0, 0.0, 1.0,1.0);
}

menu_textbox.prototype.move_to_table_display = function(fraction) {
	this.x = this.start_x - (fraction * (this.start_x - this.tabledisplay_x));
	this.y = this.start_y - (fraction * (this.start_y - this.tabledisplay_y));
	this.h = this.start_h - (fraction * (this.start_h - this.tabledisplay_h));
	this.w = this.start_w - (fraction * (this.start_w - this.tabledisplay_w));
	graphics.requestDrawGUI("whitepixel", this.x, this.y, this.w, this.h,0.0,
									this.main.textbox_bg_depth,this.tempcol_bg.r, this.tempcol_bg.g, this.tempcol_bg.b, this.tempcol_bg.a, 
									0.0, 0.0, 1.0,1.0);
}

menu_textbox.prototype.draw_textinput_openclose = function(fraction) {
	this.x = this.textinput_x;
	this.y = this.textinput_y;
	this.h = this.textinput_h;
	this.w = fraction * this.start_w;
	graphics.requestDrawGUI("whitepixel", this.x, this.y, this.w, this.h,0.0,
									this.main.textbox_bg_depth,this.tempcol_bg.r, this.tempcol_bg.g, this.tempcol_bg.b, this.tempcol_bg.a, 
									0.0, 0.0, 1.0,1.0);
}

menu_textbox.prototype.draw_end_game_highscorebox_from_nothing = function(fraction) {
	graphics.requestDrawGUI("whitepixel", this.tabledisplay_x, this.tabledisplay_y , fraction * this.tabledisplay_w, fraction * this.tabledisplay_h, 0.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0);
}