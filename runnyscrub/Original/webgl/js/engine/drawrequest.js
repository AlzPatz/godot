function drawRequest(texture_name,
					 pos_x,
					 pos_y,
					 width,
					 height,
					 rotation,
					 depth,
					 colour_r,
					 colour_g,
					 colour_b,
					 colour_a,
					 src_rect_x0,
					 src_rect_y0,
					 src_rect_x1,
					 src_rect_y1
					) {
		this.tex = texture_name;
		this.x = pos_x;
		this.y = pos_y;
		this.w = width;
		this.h = height;
		this.d = depth;
		this.rot = rotation;
		this.col_r = colour_r;
		this.col_g = colour_g;
		this.col_b = colour_b;
		this.col_a = colour_a;
		this.x0 = src_rect_x0;
		this.y0 = src_rect_y0;
		this.x1 = src_rect_x1;
		this.y1 = src_rect_y1;
	}
	
function drawStringRequest(font_name, pos_x, pos_y, justify, size, depth, colour_r, colour_g, colour_b, colour_a) { 
	this.font = font_name;
	this.x = pos_x;
	this.y = pos_y;
	this.justify = justify;
	this.size = size;
	this.d = depth;
	this.r = colour_r;
	this.g = colour_g;
	this.b = colour_b;
	this.a = colour_a;
}