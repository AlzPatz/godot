function environmentObject(main) {
	//Controls Environmental Effects
	this.main = main;

	this.isRaining = true;
	this.dropletsGenerateWarp = false;
	this.isStorming = true;
	

	this.rainIntensity = 0.5;
	this.stormIntensity = 0.5;

	this.lightningActive = false;
	this.lightningProb = 0.04;
	this.lightningDuration = 1.5; //1.0;

	//Rain
	this.dropsPersist = false;
	this.numFramesDropsPersist = 3;
	this.numDrops = 60;
	this.dropMinLength = 100.0;
	this.dropMaxLength = 200.0;
	this.dropWidth = 1.0;
	this.dropAngle = -40.0;
	
	this.rain_sw_size_min = 20;
	this.rain_sw_size_max = 60;
	this.rain_sw_time = 0.4;

	this.maxSplashes = 400;
	this.numActiveSplashes = 0;
	this.numFramesSplash = 4;
	this.splash_active = new Int8Array(this.maxSplashes);
	this.splash_type = new Int8Array(this.maxSplashes);
	this.splash_x = new Float32Array(this.maxSplashes);
	this.splash_y = new Float32Array(this.maxSplashes);
	this.splash_frame = new Int8Array(this.maxSplashes);
	this.splash_frame_timer = new Float32Array(this.maxSplashes);
	
	this.splash_probability = 0.9;	
	this.splash_frametime = 0.1;
	
	this.splash_dimension = 10;
	this.splash_half_side = 0.5 * this.splash_dimension;

	//Lightning
	this.maxNumForks = 10;
	this.minSegmentsPerFork = 5;
	this.maxSegmentsPerFork = 20;
	this.pathDimensionRatio = 0.5;
	this.chanceOfFork = 0.3;

	this.boltType;
	this.maxAngleForNextFork = Math.PI / 2.0;
	this.closeVerticalStartDelta = 100.0;
	this.maxHorizontalBoltDistance = 300.0;
	this.closeVerticalEndDeltaAroundFloor = 150.0;
	this.closestSegDelta; //Worked out per fork basis
	this.shortestSegmentY = 10.0;
	this.lightning_width_close = 10.0;
	this.lightning_width_far = 6.0;
	this.lightning_width_scalars = [1.0, 0.8, 0.6, 0.3, 0.2, 0.1, 0.09, 0.08, 0.05, 0.02, 0.02, 0.02, 0.02, 0.02];
	//Points - Path Creation
	this.forkStartIndices = new Int8Array(this.maxNumForks);
	this.forkNumIndices = new Int8Array(this.maxNumForks);
	this.forkGeneration = new Int8Array(this.maxNumForks);	
	this.forkPoints_x = new Float32Array(this.maxNumForks * (this.maxSegmentsPerFork + 1));
	this.forkPoints_y = new Float32Array(this.maxNumForks * (this.maxSegmentsPerFork + 1));
	this.forkPoints_w = new Float32Array(this.maxNumForks * (this.maxSegmentsPerFork + 1));
	this.forkPoints_d = new Float32Array(this.maxNumForks * (this.maxSegmentsPerFork + 1));

	//Segments - Display
	this.numSegmentsToDraw;
	this.arraysize = this.maxNumForks * this.maxSegmentsPerFork;
	this.lightSeg_x = new Float32Array(this.arraysize);
	this.lightSeg_y = new Float32Array(this.arraysize);
	this.lightSeg_l = new Float32Array(this.arraysize);
	this.lightSeg_w = new Float32Array(this.arraysize);
	this.lightSeg_r = new Float32Array(this.arraysize);
	this.lightSeg_d = new Float32Array(this.arraysize);

	this.segFracs = new Float32Array(this.maxSegmentsPerFork);

	this.bolt_opacity;
	this.frac_at_max = 0.3;
	this.frac_drop_to_sim_overexposure = 0.7;
	this.bolt_real_frac;
	this.backgroundFlickerPercOfBolt = 0.75;
	this.backgroundFlickerOscillations = 4;
	this.backgroundFlickerIntensity = 15.0;

	//Working
	this.fcount;
	this.pcount;
	this.rndLightning;
	this.boltCount;
	this.boltTime;
	this.boltFrac;
	this.s_x;
	this.s_y;
	this.e_x;
	this.e_y;	
	this.num;
	this.l;
	this.dis;
	this.dbalance;
	this.dfracdis;
	this.dfrac;
	this.s = new vec2(0.0, 0.0);
	this.e = new vec2(0.0, 0.0);
	this.unit = new vec2(0.0, 0.0);
	this.norm = new vec2(0.0, 0.0);
	this.apoint = new vec2(0.0, 0.0);
	this.dpoint = new vec2(0.0, 0.0);
	this.ltest = new vec2(0.0, 0.0);
	this.delta = new vec2(0.0, 0.0);
	this.n_ex;
	this.n_ey;
	this.n_sx;
	this.n_sy;
	this.n_l;
	this.n_n;
	this.istart;
	this.iend;
	this.angle;
	this.scount;
	this.dotcalc;
	this.max_width;
	this.curr_max_width;
	this.bpass = false;
	this.last_width_scalar;
	this.nxt_width_scalar;

	this.initialise();

	//Couple of working variables around the lightning that i think are not declared here so might cause GC
}

environmentObject.prototype.initialise = function() { 
	for(var c = 0; c < this.maxSplashes; c++) { 
		this.splash_active[c] = -1;
		this.splash_frame[c] = 0;
		this.splash_frame_timer[c] = 0.0;
	}
}

environmentObject.prototype.update = function() {
	if(this.isRaining) {
		this.update_rain();
	}
	if(this.isStorming) {
		this.update_storm();
	}
}

environmentObject.prototype.update_storm = function() {
	if(!this.lightningActive) {
		this.rndLightning = Math.random();
		if(this.rndLightning < this.stormIntensity * this.lightningProb) {
			//Trigger lightning effect
			this.lightningActive = true;
			this.boltTime = this.lightningDuration * this.stormIntensity * (0.5 + (0.5 * Math.random()));
			this.boltCount = 0.0;
			this.createLightningBolts();
			graphics.sfx.triggerOverExposureFlicker(this.backgroundFlickerPercOfBolt * this.boltTime, this.backgroundFlickerOscillations, this.backgroundFlickerIntensity) 
		}
	}
	else {
		if(this.boltCount > this.boltTime) {
			this.boltCount = this.boltTime;
			this.lightningActive = false;
		}
		this.boltFrac = this.boltCount / this.boltTime;

		if(this.boltFrac <= this.frac_at_max) {
			this.bolt_opacity = 1.0;
		}
		else {
			this.bolt_real_frac = (this.boltFrac - this.frac_at_max) / (1.0 - this.frac_at_max);
			this.bolt_opacity = 0.7 * (1.0 - this.bolt_real_frac);
		}

		this.boltCount += frameTimer.seconds;
	}
}

environmentObject.prototype.createLightningBolts = function() {
	//console.log("LIGHTNING FORK CREATION START");
	this.fcount = 0; //Keeps track of the number of forks
	this.pcount = 0; //Will always hold the index of where you can put the first point in a fork
	//Two types of lightning: 1. Distance coming from the mid sky layer (clouds?)
	//For this version the y and x positions need to be scaled like the background
	//2. Close lightning which comes from off the top of the screen and can be in 1:1 world space
	this.boltType = Math.random();
	//Test: Force type 1:
	this.boltType = 1.0;
	if(this.boltType > 0.5) {
		this.boltType = 1.0; //Close lightning 
		this.s_x = this.main.director.cameraWorldLeft + (Math.random() * graphics.c_width);
		this.s_y = this.main.director.cameraWorldTop + this.closeVerticalStartDelta;
		this.e_x = this.s_x + (this.maxHorizontalBoltDistance * Math.cos(2.0 * Math.PI * Math.random()));
		this.e_y = this.main.director.cameraWorldBottom - (this.closeVerticalEndDeltaAroundFloor * Math.cos(2.0 * Math.PI * Math.random()));
	}
	else {
		this.boltType = 0.0; //Far lightning
		//Must come out of the mid sky
		if(this.main.scenaryBuilder.skyMidOnScreen) {
			this.s_x = this.main.scenaryBuilder.sky_start_x + (Math.random() * graphics.c_width);
			this.s_y = this.main.scenaryBuilder.skyMidTopY + (Math.random() * (this.main.scenaryBuilder.skyMidBottomY - this.main.scenaryBuilder.skyMidTopY));
			this.e_x = this.s_x + (this.maxHorizontalBoltDistance * Math.cos(2.0 * Math.PI * Math.random()));
			this.e_y = this.s_y + ((0.5 + (0.5 * Math.random())) * graphics.c_height);
		}

	}
	this.num = Math.floor(Math.random() * this.maxSegmentsPerFork);
	if(this.num < this.minSegmentsPerFork) {
		this.num = this.minSegmentsPerFork;
	}
	this.generateForkPoints_Recursive(this.s_x, this.s_y, this.e_x, this.e_y, this.num, this.pcount, 0);	

	/*
	//Test: Print out the recursively generated points
	console.log("Lightning: " + this.fcount + " forks, " + this.pcount + " total points");
	for(var f = 0; f < this.fcount; f++){
		console.log("Fork # " + f);
		var start = this.forkStartIndices[f];
		var num = this.forkNumIndices[f];
		for(var p = 0; p < num; p++) {
			console.log(this.forkPoints_x[start + p] + " , " + this.forkPoints_y[start + p]);
		}
	}
	*/

	//Now create the lightning bolt from points
	this.scount = 0;
	for(var f = 0; f < this.fcount; f++) {
		this.istart = this.forkStartIndices[f];
		this.iend = this.istart + this.forkNumIndices[f] - 1;
		for(var p = this.istart; p < this.iend; p++) {
			this.s.x = this.forkPoints_x[p];
			this.s.y = this.forkPoints_y[p];
			this.e.x = this.forkPoints_x[p+1];
			this.e.y = this.forkPoints_y[p+1];
			//position is half way between the two vectors
			this.apoint.x = 0.5 * (this.s.x + this.e.x);
			this.apoint.y = 0.5 * (this.s.y + this.e.y);
			//No want upwards facing vector (y component is negative)
			this.delta.x = this.e.x - this.s.x;
			this.delta.y = this.e.y - this.s.y;
			
			if(this.delta.y < 0.0) {
				this.delta.x = -this.delta.x;
				this.delta.y = -this.delta.y;
			}
			
			//Rotation from upwards vector (0, 1)
			//Dot product is our friend: A.B = |A||B|cos(Angle)
			//Angle = ACos(A.B / |A||B|)
			this.dotcalc = this.delta.y; //(A.B = Ax.Bx + Ay.By), where B is (0, 1)
			this.l = this.delta.length();
			this.angle = graphics.rad2degs * Math.acos(this.dotcalc / this.l); //|B| is length 1
			if(this.e.x < this.s.x) {
				this.angle = -this.angle;
			}
			this.lightSeg_r[this.scount] = this.angle;
			this.lightSeg_x[this.scount] = this.apoint.x;
			this.lightSeg_y[this.scount] = this.apoint.y;
			this.lightSeg_l[this.scount] = this.l;
			switch(this.boltType) {
				case 0:
				//Far
					this.lightSeg_w[this.scount] = this.lightning_width_far * 
												   this.lightning_width_scalars[this.forkGeneration[f]];
				break;
				case 1:
					if(this.forkGeneration[p] > 0) {
						//console.log("higher fork gen");
					}
					this.lightSeg_w[this.scount] = this.lightning_width_close * 
												   this.lightning_width_scalars[this.forkGeneration[f]];
				//Close
				break;
			}
			this.scount++;
		}
	}
	this.numSegmentsToDraw = this.scount;
	
	//Sort out the draw depths
	this.num_depths = this.numSegmentsToDraw + this.pcount;
	switch(this.boltType) {
		case 0:
		//Far
		//TO DO
		break;
		case 1:
			this.depth_base = this.main.depth_lightning_close_min;
			this.depth_delta = this.main.depth_lightning_close_max - this.main.depth_lightning_close_min;
	}
	this.depth_delta /= this.num_depths;
	for(var s = 0; s < this.numSegmentsToDraw; s++) {
		this.lightSeg_d[s] = this.depth_base + (s * this.depth_delta);
	}
	for(var p = 0; p < this.pcount; p++) {
		this.forkPoints_d[p] = this.depth_base + ((p + this.numSegmentsToDraw) * this.depth_delta);
	}
}

environmentObject.prototype.sortFracs = function(num) {
	//sort the fractions into numerical order (think is bubble sort algorithm, but on plane so no ref to check)
	this.sort_temp;
	do {
		this.sort_pass = true;
		for(var s = 1; s < num - 1; s++) {
			if(this.segFracs[s] >= this.segFracs[s + 1]) {
				this.sort_pass = false;
				this.sort_temp = this.segFracs[s + 1];
				this.segFracs[s + 1] = this.segFracs[s];
				this.segFracs[s] = this.sort_temp;
			}
		}
	} while(!this.sort_pass);
}

environmentObject.prototype.checkAndReTryFracs = function(num) {
	this.sort_pass = true;
	for(var s = 1; s < num; s++) {
		if(Math.abs(this.segFracs[s + 1] - this.segFracs[s]) < this.closestSegDelta) {
			this.segFracs[s] = Math.random();
			this.sort_pass = false;
		}
	}
	return this.sort_pass;
}

environmentObject.prototype.generateForkPoints_Recursive = function(startx, starty, endx, endy, num, startIndex, generation) {
	//Check that average vertical length is not too short. If it is, reduce the number of segments to use
	if(Math.abs((endy - starty) / num) < this.shortestSegmentY) {
		num = Math.floor(Math.abs((endy - starty) / this.shortestSegmentY));
	}
	//console.log("Num: " + num);
	//When distributing the segments make sure the gaps to not fall to less than one quarter of the average delta
	//This means that we may need to drop segments if we get too close to the end
	this.closestSegDelta = 0.2 * (1.0 / num);
	//Populate Random segment fractions
	this.segFracs[0] = 0.0;
	this.segFracs[num - 1] = 1.0;
	for(var s = 1; s < num - 1; s++) {
		this.segFracs[s] = Math.random();
		if(this.segFracs[s] == 0.0 || this.segFracs[s] == 1.0) {
			this.segFracs[s] = 0.5;
		}
	}
	var debug_times = 0;
	var pass = false;
	while(!pass) {
		this.sortFracs(num - 1);
		pass = this.checkAndReTryFracs(num - 1);
		debug_times++;
		//console.log("Sorting Fracs #: " + debug_times + " times");
	}

	//Debug
	/*
	for(var s = 0; s < num; s++) {
		console.log("Seg #: " + s + " , Frac: " + this.segFracs[s]);
	}
	*/

	this.forkStartIndices[this.fcount] = this.pcount;
	this.forkNumIndices[this.fcount] = num;
	this.forkGeneration[this.fcount] = generation;
	this.fcount++;
	this.pcount = startIndex + num;
	this.s.x = startx;
	this.s.y = starty;
	this.e.x = endx;
	this.e.y = endy;
	this.e.subtract(this.s, this.unit);
	this.l = this.unit.length();
	this.max_width = 0.5 * this.pathDimensionRatio * this.l;
	this.unit.normalize();
	this.norm.x = -this.unit.y;
	this.norm.y = this.unit.x;
	this.dis = 0.0;
	this.forkPoints_x[startIndex] = this.s.x;
	this.forkPoints_y[startIndex] = this.s.y;
	switch(this.boltType) {
		case 0:
		//Far
			this.forkPoints_w[startIndex] = this.lightning_width_far * 
										   this.lightning_width_scalars[this.forkGeneration[generation]];
		break;
		case 1:
		//Close
	
			this.forkPoints_w[startIndex] = this.lightning_width_close * 
										   this.lightning_width_scalars[this.forkGeneration[generation]];
		break;
	}
	this.last_width_scalar = 0.0;
	
	this.last_unit_x = 0.0;
	this.last_unit_y = -1.0;

	for(var p = 1; p < num - 1; p++) {
		this.dfrac = this.segFracs[p];
		this.dfracdis = this.dfrac * this.l;

		this.apoint.x = this.unit.x;
		this.apoint.y = this.unit.y;
		this.apoint.scaleSelf(this.dfracdis);
		this.apoint.addSelf(this.s);

		this.curr_max_width = 0.0;
		if(this.dfrac <= 0.5) {
			this.curr_max_width = this.max_width * (2.0 * this.dfrac);
		}
		else {
			this.curr_max_width = this.max_width * (2.0 * (this.dfrac - 0.5));
		}
		this.bpass = false;
		this.temp_count_stop_crash = 0;
		while(!this.bpass) {
			this.temp_count_stop_crash++;
			this.nxt_width_scalar = this.last_width_scalar + ((2.0 * (Math.random() - 0.5)) * (0.5 * this.curr_max_width));
			if(Math.abs(this.nxt_width_scalar) < this.curr_max_width) {
				this.bpass = true;
			}
			this.dpoint.x = this.norm.x;
			this.dpoint.y = this.norm.y;
			this.dpoint.scaleSelf(this.nxt_width_scalar);
			this.apoint.addSelf(this.dpoint);
			this.forkPoints_x[startIndex + p] = this.apoint.x;
			this.forkPoints_y[startIndex + p] = this.apoint.y;
			//Now check we will not end up with too an extreme angle for the next point
			this.unit_x = this.forkPoints_x[startIndex + p] - this.forkPoints_x[startIndex + p - 1];
			this.unit_y = this.forkPoints_y[startIndex + p] - this.forkPoints_y[startIndex + p - 1];
			this.unit_length = Math.sqrt((this.unit_x * this.unit_x) + (this.unit_y * this.unit_y));
			this.unit_x /= this.unit_length;
			this.unit_y /= this.unit_length;
			//Now let's check the angle using the dot product
			/*
			A.B = |A||B|CosA = AxBx + AyBy
			A = Cos^-1(AxBx + AyBy)
			(they are unit vectors)
			*/
			this.dotprod = (this.unit_x * this.last_unit_x) + (this.unit_y * this.last_unit_y);
			this.dotangle = Math.abs(Math.acos(this.dotprod));
			if(this.dotangle === 'NaN') {
				console.log("ERRR WRONG");
			}
			if(this.temp_count_stop_crash < 200 && this.dotangle > this.maxAngleForNextFork) {
				this.bpass = false;
			}
		}
		this.last_unit_x = this.unit_x;
		this.last_unit_y = this.unit_y;

		switch(this.boltType) {
		case 0:
		//Far
			this.forkPoints_w[startIndex + p] = this.lightning_width_far * 
										   this.lightning_width_scalars[this.forkGeneration[generation]];
		break;
		case 1:
		//Close
	
			this.forkPoints_w[startIndex + p] = this.lightning_width_close * 
										   this.lightning_width_scalars[this.forkGeneration[generation]];
		break;
	}
		//console.log("POINT: " + (startIndex + p) + ":: " + this.apoint.x + " , " + this.apoint.y);
		this.dis = this.dfracdis;
	}
	this.forkPoints_x[startIndex + num - 1] = this.e.x;
	this.forkPoints_y[startIndex + num - 1] = this.e.y;
	switch(this.boltType) {
		case 0:
		//Far
			this.forkPoints_w[startIndex + num - 1] = this.lightning_width_far * 
										   this.lightning_width_scalars[this.forkGeneration[generation]];
		break;
		case 1:
		//Close
	
			this.forkPoints_w[startIndex + num - 1] = this.lightning_width_close * 
										   this.lightning_width_scalars[this.forkGeneration[generation]];
		break;
	}

	//Run through points and potentially fork
	for(var p = 1; p < num - 1; p++) {
		if(this.fcount < this.maxNumForks) {
			if(Math.random() < this.chanceOfFork) {
				this.num = Math.floor(Math.random() * this.maxSegmentsPerFork);
				if(this.num < this.minSegmentsPerFork) {
					this.num = this.minSegmentsPerFork;
				}
				if(this.fcount + this.num <= this.maxNumForks) {
					this.n_sx = this.forkPoints_x[startIndex + p];
					this.n_sy = this.forkPoints_y[startIndex + p];
					this.n_ex = this.n_sx + (((Math.random() - 0.5) * 2.0) * this.max_width);
					this.n_ey = this.n_sy - (2.0 * Math.random() * Math.abs(endy - this.n_sy));
					//Ensure we do not have lots of small segments..
					this.ltest.x = this.n_ex - this.n_sx;
					this.ltest.y = this.n_ey - this.n_sy;
					this.n_l = this.ltest.length();
					this.n_n = Math.floor(this.n_l / this.shortestSegment);
					if(this.n_n < 1) { 
						this.n_n = 1;
					}
					if(this.num > this.n_n) {
						this.num = this.n_n;
					}

					this.generateForkPoints_Recursive(this.n_sx, this.n_sy,
							this.n_ex, this.n_ey, this.num, this.pcount, generation + 1);
				}
			}
		}
		else {
			p = num;
		}
	}
}

environmentObject.prototype.update_rain = function() {
//Update current splashes, remove those are finished
	if(this.numActiveSplashes > 0){ 
		for(var s = 0; s < this.maxSplashes; s++) { 
			if(this.splash_active[s] == 1) { 
				this.splash_frame_timer[s] += frameTimer.seconds;
				if(this.splash_frame_timer[s] >= this.splash_frametime) { 
					this.splash_frame[s]++;
					this.splash_frame_timer[s] -= this.splash_frametime;
					if(this.splash_frame[s] >= this.numFramesSplash) { 
						this.splash_active[s] = -1;
						this.numActiveSplashes--;
					}
				}
			}
		}
	}
	
	//Check if add more splashes
	if(this.numActiveSplashes < Math.floor(this.rainIntensity * this.maxSplashes) && this.main.platformBuilder.numActivePlatforms > 0) { 
		var rnd = Math.random();
		if(rnd <= this.splash_probability) { 
			//Create new - find spare slot
			var slot = 0;
			while(this.splash_active[slot] == 1) { 
				slot++;
				//stop infinite loop shouldn't hit
				if(slot == this.maxSplashes) {
				 console.log("Error making droplets!! shouldn't hit this");
				 return;
				 }
			}	
			//Create new - random splash details
			
			//find active platform to add splash too
			var r = 1.0;
			while(r == 1.0) { 
				r = Math.random();
			}
			var plat = Math.floor(r * this.main.platformBuilder.numActivePlatforms) + 1;
			//find the slot for that active platform
			
			var platslot;
			var count = 0;
			for(var c = 0; c < this.main.platform_maxNumber;  c++){
				if(this.main.platformBuilder.platform_active[c] == 1) { 
					count++;
				}
				if(count == plat) {
					platslot = c;
					c = this.main.platform_maxNumber;
				}
			}
			
			//Now have the platform slot create the random splash
			//what type (0 is top, 1 is on right)
			this.numActiveSplashes++;
			r = 1.0;
			while(r == 1.0) { 
				r = Math.random();
			}
			this.splash_active[slot] = 1;
			this.splash_type[slot] = Math.floor(r * 2.0);
			this.splash_frame[slot] = 0;
			this.splash_frame_timer[slot] = 0.0;	
		
			switch(this.splash_type[slot]) { 
				case 0:
					//top splash
					var min = this.main.platformBuilder.platform_left[platslot];
					var max = this.main.platformBuilder.platform_right[platslot];
					
					if(min < this.main.director.cameraWorldLeft) { 
						min = this.main.director.cameraWorldLeft;
					}
					
					if(max >  this.main.director.cameraWorldRight) { 
						max = this.main.director.cameraWorldRight;
					}
					
					this.splash_x[slot] = min + (Math.random() * (this.main.platformBuilder.platform_right[platslot] - min));
					this.splash_y[slot] = this.main.platformBuilder.platform_top[platslot] + this.splash_half_side;
				
				break;
				case 1:
					//right splash
					this.splash_x[slot] = this.main.platformBuilder.platform_right[platslot] + this.splash_half_side;
					var max = this.main.platformBuilder.platform_top[platslot];
					if(max > this.main.director.cameraWorldTop) {
						max = this.main.director.cameraWorldTop;
					}
					var min = this.main.director.cameraWorldBottom;
					if(max < this.main.floor_y + 256.0) {
						max = this.main.floor_y + 256.0;
					}
					this.splash_y[slot] = max - (Math.random() * (max - min));
					//console.log("TOP : " + this.game.camera.worldview_top + " , Bottom : " + this.game.camera.worldview_bottom + " , max is : " + max + " , min is : " + min + " , Y is : " + this.splash_y[slot]);
				break;
			}
			if(this.dropletsGenerateWarp) {	graphics.sfx.triggerRainDropShockWave(this.splash_x[slot], this.splash_y[slot], this.rain_sw_size_min, this.rain_sw_size_max, this.rain_sw_time); }			
		}
	}
}

environmentObject.prototype.draw = function() {
	//graphics.requestDraw(true, true, tex, this.game.platform_x[plat], this.game.platform_y[plat],this.game.platform_w[plat], this.game.platform_h[plat], 0, this.game.depth_level, 1.0, 1.0, 1.0, 1.0, this.game.platform_x0[plat], this.game.platform_y0[plat],this.game.platform_x1[plat],this.game.platform_y1[plat]);
	//validate_parameters, requires_transform, texture_name, x, y, width, height, rotation, depth, col_r, col_g, col_b, col_a, src_x0, src_y0, src_x1, src_y1
	
	/*
	graphics.requestDraw(false, true, "test", 100, 100, 64, 64, 0.0, 0.1, 
							1.0, 1.0, 1.0, 1.0, 
							0.0, 0.0, 1.0, 1.0);
	graphics.requestDraw(false, true, "lightning_seg", 300, 100, 64, 100, 0.0, 0.1, 
						1.0, 1.0, 1.0, 1.0, 
						0.0, 0.0, 1.0, 1.0);

	graphics.requestDraw(false, true, "lightning_point", 500, 100, 64, 64, 0.0, 0.1, 
					1.0, 1.0, 1.0, 1.0, 
					0.0, 0.0, 1.0, 1.0);
	*/

	if(this.isRaining) {
		//Splashes
		var xfrac = 1.0 / (1.0 * this.numFramesSplash);
		if(this.numActiveSplashes > 0) { 
			//console.log("have a splash mate " + this.numActiveSplashes);
			for(var s = 0; s < this.maxSplashes; s++) {
				//console.log("Active : " + this.splash_active[s]);
				if(this.splash_active[s] == 1) { 
					//console.log("active splash type : " + this.splash_type[s]);
					switch(this.splash_type[s]){ 
						case 0:
						//up
						//console.log("Draw");
						graphics.requestDraw(false, false, "rainsplash", this.splash_x[s], this.splash_y[s], this.splash_dimension, this.splash_dimension, 180, this.main.depth_rain, 1.0, 1.0, 1.0, 1.0, this.splash_frame[s] * xfrac, 0.0, (this.splash_frame[s] + 1) * xfrac, 1.0);
						break;
						case 1:
						//right
						graphics.requestDraw(false, false, "rainsplash", this.splash_x[s], this.splash_y[s], this.splash_dimension, this.splash_dimension, -90, this.main.depth_rain, 1.0, 1.0, 1.0, 1.0, this.splash_frame[s] * xfrac, 0.0, (this.splash_frame[s] + 1) * xfrac, 1.0);
						//console.log("Draw2");
						break;
					}
				}
			}
		}
		
		//Drops
		if(!this.dropsPersist) {
			//Simple drops just last for one frame
			var randx;
			var randy;
			var randl;
			var ldelta = this.dropMaxLength - this.dropMinLength;
			for(var c = 0; c < this.numDrops;c++) {
				randx = Math.random() * graphics.c_width;
				randy = Math.random() * graphics.c_height;
				randl = this.dropMinLength + (Math.random() * ldelta);
				
				graphics.requestDraw(false, true, "raindrop", randx, randy, this.dropWidth, randl, this.dropAngle, this.main.depth_rain, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0);
				}
		}
		else {
			//If bother to make persisting drops.. add stuff here, but also i guess in the update too
		}
	}

	//Lightning
	if(this.lightningActive) {
		//Fork Segments
		switch(this.boltType) {
			case 0:
			//Far
			console.log("fail: shouldn't yet be creating far forks");
			break;
			case 1:
			//Close
				for(var s = 0; s < this.numSegmentsToDraw; s++) {
					graphics.requestDraw(false, false, 
										"lightning_seg", 
										this.lightSeg_x[s], this.lightSeg_y[s], 
										this.lightSeg_w[s], this.lightSeg_l[s], 
										this.lightSeg_r[s], this.lightSeg_d[s], 
										this.bolt_opacity, this.bolt_opacity, this.bolt_opacity, this.bolt_opacity, 
										0.0, 0.0, 1.0, 1.0);	
				}
				for(var p = 0; p < this.pcount; p++) {
										graphics.requestDraw(false, false, 
										"lightning_point", 
										this.forkPoints_x[p], this.forkPoints_y[p], 
										this.forkPoints_w[p], this.forkPoints_w[p], 
										0.0, this.forkPoints_d[p], 
										this.bolt_opacity, this.bolt_opacity, this.bolt_opacity, this.bolt_opacity, 
										0.0, 0.0, 1.0, 1.0);	
				}
			break;
		}

		//Fork points
	}
}
