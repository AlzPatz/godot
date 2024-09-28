function menu_toggle(main, on, p_x, p_y, p_w, p_h, texture, on_x0, on_x1, on_y0, on_y1, off_x0, off_x1, off_y0, off_y1) {
	this.main = main;
	this.on = on;

	this.pic_x = p_x;
	this.pic_y = p_y;
	this.pic_w = p_w;
	this.pic_h = p_h;

	this.texture = texture;

	this.on_x0 = on_x0;
	this.on_x1 = on_x1;
	this.on_y0 = on_y0;
	this.on_y1 = on_y1;
	this.off_x0 = off_x0;
	this.off_x1 = off_x1;
	this.off_y0 = off_y0;
	this.off_y1 = off_y1;

	this.col_pic = new col4(0.8, 0.8, 0.8, 0.8);
	this.col_temp = new col4(0.0, 0.0, 0.0, 0.0);
}

menu_toggle.prototype.draw_intro= function(fraction) {
	this.col_pic.scale(fraction, this.col_temp);

	switch(this.on)
	{
		case true:
			graphics.requestDrawGUI(this.texture, this.pic_x, this.pic_y, this.pic_w, this.pic_h, 0.0, 
									this.main.togglebox_pic_depth,this.col_temp.r, this.col_temp.g, this.col_temp.b, this.col_temp.a, 
									this.on_x0, this.on_y0, this.on_x1, this.on_y1);
		break;
		case false:
			graphics.requestDrawGUI(this.texture, this.pic_x, this.pic_y, this.pic_w, this.pic_h, 0.0, 
									this.main.togglebox_pic_depth,this.col_temp.r, this.col_temp.g, this.col_temp.b, this.col_temp.a, 
									this.off_x0, this.off_y0, this.off_x1, this.off_y1);
		break;
	}
}