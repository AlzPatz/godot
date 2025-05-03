/*
scenarybuilder.js :: Pixel Peasant, Alex Paterson, 2014
*/
function scenaryBuilderObject(main) {
	this.main = main;

	//Helper information for the lightening / weather effects later
	this.skyMidOnScreen;
	this.skyMidTopY;
	this.skyMidBottomY;

	this.texCoordEdge = 0.001; //Removes sampling that encroaches another sprite. Causes small aritfacts but better than lines..

	//This remains pretty rigidly set up for the sprite tilesheet that I have been using
	this.delta_128 = 128.0 / 1024.0;
	this.delta_256 = 256.0 / 1024.0;
	
	//Sky :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	this.sky_numDark = 1;
	this.sky_numLight = 6;
	this.sky_horizontal_scalar = 0.1; //Must be 2.d.p only to ensure the wrap when starting game back at zero
	this.sky_vertical_256_equiv_tiles = this.sky_numDark + ((this.sky_numLight + 1) / 2);
	this.sky_total_height = this.sky_vertical_256_equiv_tiles * 256.0;
	this.sky_vertical_ratio = this.sky_total_height / (this.main.ceiling_y - this.main.floor_y);
	
	this.sky_dark_x0 = 0.0 + this.texCoordEdge;
	this.sky_dark_x1 = this.delta_256 - this.texCoordEdge;
	this.sky_dark_y0 = (1.0 - this.delta_256) + this.texCoordEdge;
	this.sky_dark_y1 = 1.0 - this.texCoordEdge;
		
	this.sky_grad_x0 = (1.0 * this.delta_128) + this.texCoordEdge;
	this.sky_grad_x1 = (2.0 * this.delta_128) - this.texCoordEdge;
	this.sky_grad_y0 = (4.0 * this.delta_128) + this.texCoordEdge;
	this.sky_grad_y1 = (5.0 * this.delta_128) - this.texCoordEdge;
	
	this.sky_light_x0 = (1.0 * this.delta_128) + this.texCoordEdge;
	this.sky_light_x1 = (2.0 * this.delta_128) - this.texCoordEdge;
	this.sky_light_y0 = (5.0 * this.delta_128) + this.texCoordEdge;
	this.sky_light_y1 = (6.0 * this.delta_128) - this.texCoordEdge;
	
	this.floor_x0 = (0.0 * this.delta_128) + this.texCoordEdge;
	this.floor_x1 = (1.0 * this.delta_128) - this.texCoordEdge;
	this.floor_y0 = (4.0 * this.delta_128) + this.texCoordEdge;
	this.floor_y1 = (6.0 * this.delta_128) - this.texCoordEdge;
	
	this.first = true;
		
	//Far background :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	this.bgFar_numBlank = 3;
	this.bgFar_numMiddle = 3;
	this.bgFar_horizontal_scalar = 0.15; //Must be 2.d.p only to ensure the wrap when starting game back at zero
	this.bgFar_vertical_256_equiv_tiles = 1 + this.bgFar_numBlank + this.bgFar_numMiddle;
	this.bgFar_total_height = this.bgFar_vertical_256_equiv_tiles * 256.0;
	this.bgFar_vertical_ratio = this.bgFar_total_height / (this.main.ceiling_y - this.main.floor_y);
	
	this.bgFar_buildingTops1_x0 = (1.0 * this.delta_256) + this.texCoordEdge;
	this.bgFar_buildingTops1_x1 = (2.0 * this.delta_256) - this.texCoordEdge;
	this.bgFar_buildingTops1_y0 = (3.0 * this.delta_256) + this.texCoordEdge;
	this.bgFar_buildingTops1_y1 = (4.0 * this.delta_256) - this.texCoordEdge;
	
	this.bgFar_buildingTops2_x0 = (2.0 * this.delta_256) + this.texCoordEdge;
	this.bgFar_buildingTops2_x1 = (3.0 * this.delta_256) - this.texCoordEdge;
	this.bgFar_buildingTops2_y0 = (3.0 * this.delta_256) + this.texCoordEdge;
	this.bgFar_buildingTops2_y1 = (4.0 * this.delta_256) - this.texCoordEdge;	
	
	this.bgFar_buildingMiddle_x0 = (3.0 * this.delta_256) + this.texCoordEdge;
	this.bgFar_buildingMiddle_x1 = (4.0 * this.delta_256) - this.texCoordEdge;
	this.bgFar_buildingMiddle_y0 = (3.0 * this.delta_256) + this.texCoordEdge;
	this.bgFar_buildingMiddle_y1 = (4.0 * this.delta_256) - this.texCoordEdge;
	
	//Near background :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	this.bgNear_numBlank = 4;
	this.bgNear_numMiddle = 7;
	this.bgNear_horizontal_scalar = 0.2; //Must be 2.d.p only to ensure the wrap when starting game back at zero
	this.bgNear_vertical_256_equiv_tiles = 1 + this.bgNear_numBlank + this.bgNear_numMiddle;
	this.bgNear_total_height = this.bgNear_vertical_256_equiv_tiles * 256.0;
	this.bgNear_vertical_ratio = this.bgNear_total_height / (this.main.ceiling_y - this.main.floor_y);

	this.bgNear_buildingTops1_x0 = (1.0 * this.delta_256) + this.texCoordEdge;
	this.bgNear_buildingTops1_x1 = (2.0 * this.delta_256) - this.texCoordEdge;
	this.bgNear_buildingTops1_y0 = (2.0 * this.delta_256) + this.texCoordEdge;
	this.bgNear_buildingTops1_y1 = (3.0 * this.delta_256) - this.texCoordEdge;
	
	this.bgNear_buildingTops2_x0 = (2.0 * this.delta_256) + this.texCoordEdge;
	this.bgNear_buildingTops2_x1 = (3.0 * this.delta_256) - this.texCoordEdge;
	this.bgNear_buildingTops2_y0 = (2.0 * this.delta_256) + this.texCoordEdge;
	this.bgNear_buildingTops2_y1 = (3.0 * this.delta_256) - this.texCoordEdge;	
	
	this.bgNear_buildingMiddle_x0 = (3.0 * this.delta_256) + this.texCoordEdge;
	this.bgNear_buildingMiddle_x1 = (4.0 * this.delta_256) - this.texCoordEdge;
	this.bgNear_buildingMiddle_y0 = (2.0 * this.delta_256) + this.texCoordEdge;
	this.bgNear_buildingMiddle_y1 = (3.0 * this.delta_256) - this.texCoordEdge;
	
	//Working Variables :::::::::::::::::::::::::::::::::::::::::::
	this.bottomfound;
	this.current_x;
	this.current_y;
	this.row_bottom;
	this.isFloorVisible;
	this.sky_start_x;
	this.sky_start_y;
	this.sky_extra_top;
	this.absolute_vertical_distance_to_ceiling;
	this.sky_vertical_distance_to_top;
	this.left_edge_horizontal_sky;
	this.divisor_float;
	this.divisor_int;
	this.bgFar_vertical_distance_to_ceiling;
	this.bgFar_start_x;
	this.bgFar_start_y;
	this.bgFar_start_int;
	this.bgNear_vertical_distance_to_ceiling;
	this.bgNear_start_x;
	this.bgNear_start_y;
	this.bgNear_start_int;
	this.floor_start_x;
	this.floor_start_y;

	this.bgFar_Shift = 4;
	this.bgNear_Shift = 37;
	this.lengthOfPsuedoSequence = 100;
	this.pseudoRandomBinaryResult = new Float32Array([3,1,4,1,5,9,2,6,5,3,5,8,9,7,9,3,2,3,8,4,6,2,6,4,3,
													  3,8,3,2,7,9,5,0,2,8,8,4,1,9,7,1,6,9,3,9,9,3,7,5,1,
													  0,5,8,2,0,9,7,4,9,4,4,5,9,2,3,0,7,8,1,6,4,0,6,2,8,
													  6,2,0,8,9,9,8,6,2,8,0,3,4,8,2,5,3,4,2,1,1,7,0,6,7]);
	//Note. As it turns out, although the Fibonnaci sequence is psuedo random, in fact it goes 1 even, 2 odd, on repeat
	//So now I am using the first 100 digits of PI to make my psuedo random binary pattern...
	//Now turn it into 0 and 1s based on odd or even digits
	for(var i = 0; i < this.lengthOfPsuedoSequence; i++) {
		this.pseudoRandomBinaryResult[i] = this.pseudoRandomBinaryResult[i] %2;
	}

	this.transfer_world_y_of_top_bgfar_row;
	this.transfer_world_y_of_top_bgnear_row;
}

scenaryBuilderObject.prototype.returnBGTopPartFromTileCount = function(x) {
	x = Math.floor(x);
	if(x < 0) x = 0;
	while(x >= this.lengthOfPsuedoSequence) { 
			x-= this.lengthOfPsuedoSequence;
		}
	return this.pseudoRandomBinaryResult[x];
}

scenaryBuilderObject.prototype.update = function() {
	this.absolute_vertical_distance_to_ceiling = this.main.ceiling_y - this.main.director.cameraFocus.y;
	this.updateSky();
	this.updateBGFar();
	this.updateBGNear();
	this.updateFloor();
}

scenaryBuilderObject.prototype.updateSky = function() {
	//Need to calculate the equivalent world coordinates at which to start drawing the sky from. Vertical first
	this.sky_vertical_distance_to_top = this.absolute_vertical_distance_to_ceiling * this.sky_vertical_ratio;
	//Calculate the world coords that the top of sky falls on currently (moves due to ratio with absolute world)
	this.sky_start_y = this.main.director.cameraFocus.y + this.sky_vertical_distance_to_top; 
	this.sky_start_y = Math.floor(this.sky_start_y);
	//As the sky is the only layer that needs to reach all the way to the top of the screen, add additional top rows if needed
	this.sky_extra_top = 0;
	while(this.sky_start_y < this.main.director.cameraWorldTop) {
		this.sky_start_y += 256.0;
		this.sky_extra_top++;
	}
	//Now for the horizontal Start Point
	this.sky_start_x = this.main.director.cameraWorldLeft * this.sky_horizontal_scalar;
	this.divisor_float = this.sky_start_x / 256.0;
	this.divisor_int = Math.floor(this.divisor_float);
	this.sky_start_x = this.main.director.cameraWorldLeft -((this.divisor_float - this.divisor_int) * 256.0);
	this.sky_start_x = Math.floor(this.sky_start_x);
}

scenaryBuilderObject.prototype.updateBGFar = function() {
	//Vertical start point
	this.bgFar_vertical_distance_to_ceiling = this.absolute_vertical_distance_to_ceiling * this.bgFar_vertical_ratio;
	this.bgFar_start_y = this.main.director.cameraFocus.y + this.bgFar_vertical_distance_to_ceiling;
	this.bgFar_start_y = Math.floor(this.bgFar_start_y);
	//Horizontal
	this.bgFar_start_x = this.main.director.cameraWorldLeft * this.bgFar_horizontal_scalar;
	this.divisor_float = this.bgFar_start_x / 256.0;
	this.divisor_int = Math.floor(this.divisor_float);
	this.bgFar_start_int = this.divisor_int;
	this.bgFar_start_x =  this.main.director.cameraWorldLeft - ((this.divisor_float - this.divisor_int) * 256.0);
	this.bgFar_start_x = Math.floor(this.bgFar_start_x);
}

scenaryBuilderObject.prototype.updateBGNear = function() {
	//Vertical start point
	this.bgNear_vertical_distance_to_ceiling = this.absolute_vertical_distance_to_ceiling * this.bgFar_vertical_ratio;
	this.bgNear_start_y = this.main.director.cameraFocus.y + this.bgNear_vertical_distance_to_ceiling;
	this.bgNear_start_y = Math.floor(this.bgNear_start_y);
	//Horizontal
	this.bgNear_start_x = this.main.director.cameraWorldLeft * this.bgNear_horizontal_scalar;
	this.divisor_float = this.bgNear_start_x / 256.0;
	this.divisor_int = Math.floor(this.divisor_float);
	this.bgNear_start_int = this.divisor_int;
	this.bgNear_start_x = this.main.director.cameraWorldLeft - ((this.divisor_float - this.divisor_int) * 256.0);
	this.bgNear_start_x = Math.floor(this.bgNear_start_x);
}

scenaryBuilderObject.prototype.updateFloor = function() {
	this.isFloorVisible = false;
	if(this.main.director.cameraWorldBottom < this.main.floor_y + 256.0) {
		this.isFloorVisible = true;
		//Vertical Start Point
		this.floor_start_y = this.main.floor_y + 256.0;
		//Horizontal Start Point
		this.origin_finder = this.main.director.cameraWorldLeft;
		this.divisor_float = this.origin_finder / 128.0;
		this.divisor_int = Math.floor(this.divisor_float);
		this.floor_start_x = this.main.director.cameraWorldLeft- ( (this.divisor_float - this.divisor_int) * 128.0);
		this.floor_start_x = Math.floor(this.floor_start_x);
	}
}

scenaryBuilderObject.prototype.draw = function() {
	this.drawSky();
	this.drawBGFar();
	this.drawBGNear();
	this.drawFloor();
}

scenaryBuilderObject.prototype.drawSky = function() {
	this.skyMidOnScreen = false; // Set to true if we draw sky mid
	this.bottomfound = false;
	this.current_y = this.sky_start_y;
	//Draw any additional rows need at the top to ensure there are no areas that the sky does not cover 
	if(this.sky_extra_top > 0) { 
		for(var row = 0; row < this.sky_extra_top; row++) { 
			this.row_bottom = this.current_y - 256.0;
			if(this.row_bottom < this.main.director.cameraWorldTop) {
				this.current_x = this.sky_start_x;
				this.row_middle = 0.5 * (this.current_y + this.row_bottom);
				while(this.current_x <= this.main.director.cameraWorldRight) {
					this.column_middle = this.current_x + 128.0;
							graphics.requestDraw(true, 
												 false, 
												 "spritesheet_1", 
												 this.column_middle, 
												 this.row_middle,
												 256.0, 
												 256.0, 
												 0, 
												 this.main.depth_sky, 
												 1.0, 1.0, 1.0, 1.0, 
												 this.sky_dark_x0, 
												 this.sky_dark_y0,
												 this.sky_dark_x1,
												 this.sky_dark_y1);
					this.current_x += 256.0;
				}
				if(this.row_bottom < this.main.director.cameraWorldBottom) {
					this.bottomfound = true;
					row = this.sky_extra_top;
				}
			}
			this.current_y -= 256.0;
		}
	}
	if(this.bottomfound) {
		return;
	}
	//Draw # of dark rows at the top
	for(var row = 0; row < this.sky_numDark && !this.bottomfound; row++){
			this.row_bottom = this.current_y - 256.0;
			this.row_middle = 0.5 * (this.current_y + this.row_bottom);
			this.current_x = this.sky_start_x;
			while(this.current_x <= this.main.director.cameraWorldRight) {
				this.column_middle = this.current_x + 128.0;
				graphics.requestDraw(true, 
									 false, 
									 "spritesheet_1", 
									 this.column_middle, 
									 this.row_middle,
									 256.0, 
									 256.0, 
									 0, 
									 this.main.depth_sky, 
									 1.0, 1.0, 1.0, 1.0, 
									 this.sky_dark_x0, 
									 this.sky_dark_y0,
									 this.sky_dark_x1,
									 this.sky_dark_y1);
					this.current_x += 256.0;
			}
			if(this.row_bottom < this.main.director.cameraWorldBottom) {
				this.bottomfound = true;
			}		
			this.current_y -= 256.0;	
	}
	if(this.bottomfound) {
		return;
	}
	//Draw the sky gradient
	this.row_bottom = this.current_y - 128.0;
	//Lightening Helper
	this.skyMidOnScreen = true;
	this.skyMidTopY = this.current_y;
	this.skyMidBottomY = this.row_bottom;

	if(this.row_bottom < this.main.director.cameraWorldBottom) {
		this.bottomfound = true;
	}
	this.row_middle = 0.5 * (this.current_y + this.row_bottom);
	this.current_x = this.sky_start_x;
	while(this.current_x <= this.main.director.cameraWorldRight) {
		this.column_middle = this.current_x + 64.0;
		graphics.requestDraw(true, 
							 false, 
							 "spritesheet_1", 
							 this.column_middle, 
							 this.row_middle,
							 128.0, 
							 128.0, 
							 0, 
							 this.main.depth_sky, 
							 1.0, 1.0, 1.0, 1.0, 
							 this.sky_grad_x0, 
							 this.sky_grad_y0,
							 this.sky_grad_x1,
							 this.sky_grad_y1);	
		this.current_x += 128.0;
	}
	this.current_y -= 128.0;	
	if(this.bottomfound) {
		return;
	}
	//Draw light bottom part of the sky
	for(var row = 0; row < this.sky_numLight && !this.bottomfound; row++){
			this.row_bottom = this.current_y - 128.0;
			this.row_middle = 0.5 * (this.row_bottom + this.current_y);
			this.current_x = this.sky_start_x;
			while(this.current_x <= this.main.director.cameraWorldRight) {
				this.column_middle = this.current_x + 64.0;
				graphics.requestDraw(true, 
									 false, 
									 "spritesheet_1", 
									 this.column_middle, 
									 this.row_middle,
									 128.0, 
									 128.0, 
									 0, 
									 this.main.depth_sky, 
									 1.0, 1.0, 1.0, 1.0, 
									 this.sky_light_x0, 
									 this.sky_light_y0,
									 this.sky_light_x1,
									 this.sky_light_y1);
				this.current_x += 128.0;
			}
			if(this.row_bottom < this.main.director.cameraWorldBottom) {
				this.bottomfound = true;
			}
			this.current_y -= 128.0;
	}
	if(this.bottomfound) {
		return;
	}
	//Ensure that we have drawn down to the bottom of the screen
	while(!this.bottomfound) {
		this.row_bottom = this.current_y -= 128.0;
		this.row_middle = 0.5 * (this.current_y + this.row_bottom);
		this.current_x = this.sky_start_x;
		while(this.current_x <= this.main.director.cameraWorldRight) {
			this.column_middle = this.current_x + 64.0;
			graphics.requestDraw(true, 
									 false, 
									 "spritesheet_1", 
									 this.column_middle, 
									 this.row_middle,
									 128.0, 
									 128.0, 
									 0, 
									 this.main.depth_sky, 
									 1.0, 1.0, 1.0, 1.0, 
									 this.sky_light_x0, 
									 this.sky_light_y0,
									 this.sky_light_x1,
									 this.sky_light_y1);
				this.current_x += 128.0;
		}
		if(this.row_bottom < this.main.director.cameraWorldBottom) {
			this.bottomfound = true;
		}
		this.current_y -= 128.0;
	}
}

scenaryBuilderObject.prototype.drawBGFar = function() {
	this.bottomfound  = false;
	this.current_y = this.bgFar_start_y;
	//Skip blank rows at the top
	for(var row = 0; row < this.bgFar_numBlank; row++){
		this.current_y -= 256.0;
	}
	this.row_bottom = this.current_y - 256.0;

	this.row_middle = 0.5 * (this.row_bottom + this.current_y);
	this.transfer_world_y_of_top_bgfar_row = this.row_middle;
	//Draw the building tops
	var FARccount = 0;
	this.current_x = this.bgFar_start_x;
	while(this.current_x <= this.main.director.cameraWorldRight) {
		var top_to_draw = this.returnBGTopPartFromTileCount(this.bgFar_start_int + FARccount + this.bgFar_Shift); //# at end randoms between near and far :)
		this.column_middle = this.current_x + 128.0;
		switch(top_to_draw) {
			case 0:
				graphics.requestDraw(true, 
									 false, 
									 "spritesheet_1", 
									 this.column_middle, 
									 this.row_middle,
									 256.0, 
									 256.0, 
									 0, 
									 this.main.depth_background_far, 
									 1.0, 1.0, 1.0, 1.0, 
									 this.bgFar_buildingTops1_x0, 
									 this.bgFar_buildingTops1_y0,
									 this.bgFar_buildingTops1_x1,
									 this.bgFar_buildingTops1_y1);
			break;
			case 1:
				graphics.requestDraw(true, 
									 false, 
									 "spritesheet_1", 
									 this.column_middle, 
									 this.row_middle,
									 256.0, 
									 256.0, 
									 0, 
									 this.main.depth_background_far, 
									 1.0, 1.0, 1.0, 1.0, 
									 this.bgFar_buildingTops2_x0, 
									 this.bgFar_buildingTops2_y0,
									 this.bgFar_buildingTops2_x1,
									 this.bgFar_buildingTops2_y1);
			break;
		}
		this.current_x += 256.0;
		FARccount++;
	}
	if(this.row_bottom < this.main.director.cameraWorldBottom) {
		this.bottomfound = true;
	}
	if(this.bottomfound) {
		return;
	}
	this.current_y -= 256.0;
	//Draw middle parts of the buildings all the way down to the bottom of the screen (why split them up into middle and excess??)
	while(!this.bottomfound) {
		this.current_x = this.bgFar_start_x;
		this.row_bottom = this.current_y - 256.0;
		this.row_middle = 0.5 * (this.current_y + this.row_bottom);
		while(this.current_x <= this.main.director.cameraWorldRight) {
			this.column_middle = this.current_x + 128.0;
				graphics.requestDraw(true, 
									 false, 
									 "spritesheet_1", 
									 this.column_middle, 
									 this.row_middle,
									 256.0, 
									 256.0, 
									 0, 
									 this.main.depth_background_far, 
									 1.0, 1.0, 1.0, 1.0, 
									 this.bgFar_buildingMiddle_x0, 
									 this.bgFar_buildingMiddle_y0,
									 this.bgFar_buildingMiddle_x1,
									 this.bgFar_buildingMiddle_y1);
				this.current_x += 256.0;
		}
		if(this.row_bottom < this.main.director.cameraWorldBottom) {
			this.bottomfound = true;
		}
		if(this.bottomfound) {
			return;
		}
		this.current_y -= 256.0;
	}
}

scenaryBuilderObject.prototype.drawBGNear = function() {
	this.bottomfound  = false;
	this.current_y = this.bgNear_start_y;
	//Skip blank rows at the top
	for(var row = 0; row < this.bgNear_numBlank; row++){
		this.current_y -= 256.0;
	}
	this.row_bottom = this.current_y - 256.0;
	this.row_middle = 0.5 * (this.row_bottom + this.current_y);
	this.transfer_world_y_of_top_bgnear_row = this.row_middle;
	//Draw the building tops
	var NEARccount = 0;
	this.current_x = this.bgNear_start_x;
	while(this.current_x <= this.main.director.cameraWorldRight) {
		var top_to_draw = this.returnBGTopPartFromTileCount(this.bgNear_start_int + NEARccount + this.bgNear_Shift); //# at end randoms between near and far :)
		this.column_middle = this.current_x + 128.0;
		switch(top_to_draw) {
			case 0:
				graphics.requestDraw(true, 
									 false, 
									 "spritesheet_1", 
									 this.column_middle, 
									 this.row_middle,
									 256.0, 
									 256.0, 
									 0, 
									 this.main.depth_background_near, 
									 1.0, 1.0, 1.0, 1.0, 
									 this.bgNear_buildingTops1_x0, 
									 this.bgNear_buildingTops1_y0,
									 this.bgNear_buildingTops1_x1,
									 this.bgNear_buildingTops1_y1);
			break;
			case 1:
				graphics.requestDraw(true, 
									 false, 
									 "spritesheet_1", 
									 this.column_middle, 
									 this.row_middle,
									 256.0, 
									 256.0, 
									 0, 
									 this.main.depth_background_near, 
									 1.0, 1.0, 1.0, 1.0, 
									 this.bgNear_buildingTops2_x0, 
									 this.bgNear_buildingTops2_y0,
									 this.bgNear_buildingTops2_x1,
									 this.bgNear_buildingTops2_y1);
			break;
		}
		this.current_x += 256.0;
		NEARccount++;
	}
	if(this.row_bottom < this.main.director.cameraWorldBottom) {
		this.bottomfound = true;
	}
	if(this.bottomfound) {
		return;
	}
	this.current_y -= 256.0;
	//Draw middle parts of the buildings all the way down to the bottom of the screen (why split them up into middle and excess??)
	while(!this.bottomfound) {
		this.current_x = this.bgNear_start_x;
		this.row_bottom = this.current_y - 256.0;
		this.row_middle = 0.5 * (this.current_y + this.row_bottom);
		while(this.current_x <= this.main.director.cameraWorldRight) {
			this.column_middle = this.current_x + 128.0;
				graphics.requestDraw(true, 
									 false, 
									 "spritesheet_1", 
									 this.column_middle, 
									 this.row_middle,
									 256.0, 
									 256.0, 
									 0, 
									 this.main.depth_background_near, 
									 1.0, 1.0, 1.0, 1.0, 
									 this.bgNear_buildingMiddle_x0, 
									 this.bgNear_buildingMiddle_y0,
									 this.bgNear_buildingMiddle_x1,
									 this.bgNear_buildingMiddle_y1);
				this.current_x += 256.0;
		}
		if(this.row_bottom < this.main.director.cameraWorldBottom) {
			this.bottomfound = true;
		}
		if(this.bottomfound) {
			return;
		}
		this.current_y -= 256.0;
	}
}


scenaryBuilderObject.prototype.drawFloor = function() { 
	//Now draw the floor if visible
	if(this.isFloorVisible) { 
		this.current_y = this.floor_start_y;
		while(this.current_y > this.main.director.cameraWorldBottom) {
			this.current_x = this.floor_start_x;
			this.row_middle = this.current_y - 128.0;
			while(this.current_x<= this.main.director.cameraWorldRight) {
				this.column_middle = this.current_x + 64.0;
				graphics.requestDraw(true, 
									 false, 
									 "spritesheet_1", 
									 this.column_middle, 
									 this.row_middle,
									 128.0, 
									 256.0, 
									 0, 
									 this.main.depth_floor, 
									 1.0, 1.0, 1.0, 1.0, 
									 this.floor_x0, 
									 this.floor_y0,
									 this.floor_x1,
									 this.floor_y1);
				this.current_x += 128.0;
			}
			this.current_y -= 256.0;
		}
	}
}

