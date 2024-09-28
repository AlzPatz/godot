function additionalScenaryObject(main) {
	this.main = main;

	//Spot Lights
	//These are either in front of the sky, or they are just in front of the final set of buildings
	this.spotlight_height_bg = 1024.0; //Includes the blank bottom part, which was pure laziness fyi
	this.spotlight_width_bg = 0.25 * this.spotlight_height_bg;
	this.spotlight_farscale = 0.7;
	this.spotlight_height_sky = this.spotlight_farscale * this.spotlight_height_bg;
	this.spotlight_width_sky = this.spotlight_farscale * this.spotlight_width_bg;
	this.spotlightSpeedScalar = 3.0;
	this.spotlight_base_period = 4.0;

	this.maxNumSpotLights = 6;
	this.maxAngleFromVertical = 55.0;

	this.numSpotLightActive = 0;

	this.spotlight_probability = 1.0; //0.01;
	this.spotlight_opacity = 1.0;

	this.sl_active = new Int8Array(this.maxNumSpotLights);
	this.sl_type = new Int8Array(this.maxNumSpotLights); //Type 0 SKY, Type 1 BG
	this.sl_x = new Float32Array(this.maxNumSpotLights);
	this.sl_angle = new Float32Array(this.maxNumSpotLights);
	this.sl_speed = new Float32Array(this.maxNumSpotLights);
	this.sl_count = new Float32Array(this.maxNumSpotLights);

	//Initialise these..
	for(var s = 0; s < this.maxNumSpotLights; s++) {
		this.sl_active[s] = -1;
		this.sl_type[s] = 0;
		this.sl_x[s] = 0.0;
		this.sl_angle[s] = 0.0;
		this.sl_speed[s] = 0.0;
		this.sl_count[s] = 0.0;
	}

	//Working
	this.active_count;
	this.bgFar_start_x;
	this.bgNear_start_x;
	this.bgFar_middleTopRow_y;
	this.bgNear_middleTopRow_y;
	this.indexToUse;
	this.sWidth;
	this.frac;
	this.working_x;
	this.working_y;
	this.working_d;
	this.working_w;
	this.working_h;
}

additionalScenaryObject.prototype.update = function() {
	//Grab these from the scenary builder, whose update runs before this. Dirty little cross dependance. but who cares these days

	if(this.main.scenaryBuilder.sky_start_x == 'NaN' || this.main.scenaryBuilder.bgFar_start_x == 'NaN') {
		return; //Drops out as the first frame normally these are not set, this is why this cross thing is dirty boy
	}

	this.bgFar_start_x = this.main.scenaryBuilder.bgFar_start_x;
	this.bgNear_start_x = this.main.scenaryBuilder.bgNear_start_x;

	this.checkForAnySpotLightsToKill();
	this.checkForAnySpotLightsToAdd();

	//Update the spot lights we have
	this.active_count = 0;
	for(var s = 0; s < this.maxNumSpotLights; s++) {
		if(this.sl_active[s] == 1) {
			this.active_count++;

			//Update Motion of the Spotlights
			this.sl_count[s] += frameTimer.seconds * this.sl_speed[s];
			if(this.sl_count[s] > this.spotlight_base_period) {
				this.sl_count[s] -= this.spotlight_base_period;
			}

			this.frac = this.sl_count[s] / this.spotlight_base_period;

			this.frac *= 2.0 * Math.PI;
			this.sl_angle[s] = this.maxAngleFromVertical * Math.sin(this.frac);

			if(this.active_count == this.numSpotLightActive) {
				s = this.maxNumSpotLights; //Fast drop out of loop. However the checking might be slower given the smaller number of spotlights any
			}
		}
	}

}

additionalScenaryObject.prototype.checkForAnySpotLightsToAdd = function() {

	//Another slightly dirty check
	if(this.main.director.cameraWorldLeft == 'undefined' || this.main.director.cameraWorldRight == 'undefined') {
		return;
	}

	if(this.numSpotLightActive < this.maxNumSpotLights) {
		if(Math.random() < this.spotlight_probability) {
			//Add a spotlight, find a free slot
			this.indexToUse = -1;
			for(var s = 0 ; s < this.maxNumSpotLights; s++) {
				if(this.sl_active[s] == -1) {
					this.indexToUse = s;
					s = this.maxNumSpotLights; //Cause loop drop
				}
			}
			if(this.indexToUse == -1) {
				console.log("ERROR: Not finding a spare slot to create a new spotlight");
			}	
	
			this.numSpotLightActive += 1;

			this.sl_active[this.indexToUse] = 1;

			if(Math.random() > 0.5) {
				this.sl_type[this.indexToUse] = 0;
			}
			else {
				this.sl_type[this.indexToUse] = 1;
			}

			this.sWidth = this.main.director.cameraWorldRight - this.main.director.cameraWorldLeft;

			switch(this.sl_type[this.indexToUse]) {
				case 0:
					this.sl_x[this.indexToUse] = this.bgFar_start_x + ((1.0 + Math.random()) * this.sWidth);
				break;
				case 1:
					this.sl_x[this.indexToUse] = this.bgNear_start_x + ((1.0 + Math.random()) * this.sWidth);
				break;
			}

			this.sl_angle[this.indexToUse] = 0.0;

			this.sl_speed[this.indexToUse] = 1.0 + (Math.random() * this.spotlightSpeedScalar);

			this.sl_count[this.indexToUse] = 0.0;
		}
	}
}

additionalScenaryObject.prototype.checkForAnySpotLightsToKill = function() {
	this.active_count = 0;
	for(var s = 0; s < this.maxNumSpotLights; s++) {
		if(this.sl_active[s] == 1) {
			switch(this.sl_type[s]) {
				case 0:
					//Sky
					if(this.sl_x[s] < this.bgFar_start_x - this.spotlight_height_sky) {
						this.sl_active[s] = -1;
						this.numSpotLightActive -= 1;
					}
					else {
						this.active_count++; //we don't add above as we decrease num active count
					}
				break;
				case 1:
					//BG
					if(this.sl_x[s] < this.bgNear_start_x - this.spotlight_height_bg) {
						this.sl_active[s] = -1;
						this.numSpotLightActive -= 1;
					}
					else {
						this.active_count++; //we don't add above as we decrease num active count
					}
				break;;
			}
			if(this.active_count == this.numSpotLightActive) {
				s = this.maxNumSpotLights; //Drop out of the for loop. Minor speed up and probably actually slower given the variable checks required for this. remove at a later date (spotlights only a few in number)
			}
		}
	}
}

additionalScenaryObject.prototype.draw = function() {

	return; //TO DO FIX
	
	//Grab the information about where the middle of the top rows of the far and near buildings are
	this.bgFar_middleTopRow_y = this.main.scenaryBuilder.transfer_world_y_of_top_bgfar_row;
	this.bgNear_middleTopRow_y = this.main.scenaryBuilder.transfer_world_y_of_top_bgnear_row;

	//Draw them spotlights
	this.active_count = 0;
	for(var s = 0; s < this.maxNumSpotLights; s++) {
		if(this.sl_active[s] == 1) {
			switch(this.sl_type[s]) {
				case 0:
					this.working_x = this.main.director.cameraWorldLeft + (this.sl_x[s] - this.bgFar_start_x);
					this.working_y = this.bgFar_middleTopRow_y - 128.0;
					this.working_d = this.main.depth_spotlights_far;
					this.working_w = this.spotlight_width_sky;
					this.working_h = this.spotlight_height_sky;
				break;
				case 1:
					this.working_x = this.main.director.cameraWorldLeft + (this.sl_x[s] - this.bgNear_start_x);
					this.working_y = this.bgNear_middleTopRow_y - 128.0;
					this.working_d = this.main.depth_spotlights_near;
					this.working_w = this.spotlight_width_bg;
					this.working_h = this.spotlight_height_bg;
				break;
			}

			graphics.requestDraw(false, false, 
				"searchlight", 
				this.working_x, this.working_y, 
				this.working_w, this.working_h,
				this.sl_angle[s], this.working_d, 
				this.spotlight_opacity, this.spotlight_opacity, this.spotlight_opacity, this.spotlight_opacity, 
				0.0, 0.0, 1.0, 1.0);

			this.active_count++;
			if(this.active_count == this.numSpotLightActive) {
				s = this.maxNumSpotLights; //Drop out of the for loop. Minor speed up and probably actually slower given the variable checks required for this. remove at a later date (spotlights only a few in number)
			}
		}

	}

}