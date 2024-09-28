function font(name, size, pageWidth) { 
	this.name = name;
	this.size = parseFloat(size);
	this.pageWidth =  parseFloat(pageWidth); //must be the same as height
	this.characters;
}

function char(font, x, y, width, height, xoffset, yoffset, xadvance, page) { 
	//Assumes font tile sheets are 256x256 as created by bmFont tool
	this.font = font;
	this.x0 = this.returnGLtexCoordsX(parseFloat(x), this.font.pageWidth);
	this.x1 = this.returnGLtexCoordsX(parseFloat(x) + parseFloat(width), this.font.pageWidth);
	this.y0 = this.returnGLtexCoordsY(parseFloat(y), this.font.pageWidth);
	this.y1 = this.returnGLtexCoordsY(parseFloat(y) + parseFloat(height), this.font.pageWidth);
	this.xoffset = parseFloat(xoffset);
	this.yoffset = parseFloat(yoffset);
	this.width = parseFloat(width);
	this.height = parseFloat(height);
	this.xadvance = parseFloat(xadvance);
	this.page = parseInt(page);
	
}

char.prototype.returnGLtexCoordsX = function(xt, wt) { 
	return xt / wt;
}

char.prototype.returnGLtexCoordsY = function(yt, ht) { 
	return yt / ht; //Correct for directx format (0,0 in topleft), but for openGL we leave it to the drawRequest to y = 1 -y;
}

//bmFont tool provides x, y (topleft and topRight) of font position as you would expect in a texture, 0,0 is top left.
//WebGL (and openGL) use 0,0 as the bottom left coordinate