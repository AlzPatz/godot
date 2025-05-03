/*
platformbuilder.js :: Pixel Peasant, Alex Paterson, 2014
*/

//CREATION & INITIALISATION
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function platformBuilderObject(main) {
	this.main = main;

	//Platform Variables
	//---------------------------------------------------------------------
	this.numActivePlatforms;
	this.platform_active = new Int8Array(this.main.platform_maxNumber);
	this.platform_visualtype = new Int8Array(this.main.platform_maxNumber); //0,1,2,3 (the different textures)
	this.platform_jumptype = new Int8Array(this.main.platform_maxNumber); //the jump needed to land on them, 0 (end jump posible), 1 (shortjump), 2 (part of skip sequence)
	this.platform_left = new Float32Array(this.main.platform_maxNumber);
	this.platform_right = new Float32Array(this.main.platform_maxNumber);
	this.platform_top = new Float32Array(this.main.platform_maxNumber);
	this.platform_x = new Float32Array(this.main.platform_maxNumber);
	this.platform_y = new Float32Array(this.main.platform_maxNumber);
	this.platform_w = new Float32Array(this.main.platform_maxNumber);
	this.platform_h = new Float32Array(this.main.platform_maxNumber);
	this.platform_x0 = new Float32Array(this.main.platform_maxNumber);
	this.platform_x1 = new Float32Array(this.main.platform_maxNumber);
	this.platform_y0 = new Float32Array(this.main.platform_maxNumber);
	this.platform_y1 = new Float32Array(this.main.platform_maxNumber);	
	this.platform_furthest_right;
	this.platform_furthest_top;
	this.level_lastPlatformIndex; 
	this.level_lastplatformdifficulty; 
	this.level_currentplatformtrend;
	this.level_lastplatformtype;
	//---------------------------------------------------------------------

	//Working Variables (save on garbage collection)
	//---------------------------------------------------------------------
	this.working_trendChange;
	this.working_pass;
	this.working_heightchange;
	this.minjump_peak_x;
	this.minjump_peak_y;
	this.minjump_max_x_at_heightchange;
	this.maxjump_peak_x;
	this.maxjump_peak_y;
	this.maxjump_max_x_at_heightchange;
	this.working_time2peak_max;
	this.working_time2peak_min;
	this.working_jumpscaledgrav;
	this.working_minjumppossible;
	this.working_difficultyboost;
	this.working_randomjumpheightrange;
	this.working_jumpheightresult;
	this.working_randdirection;
	this.working_falltime;
	this.working_next_platform_jump_type;
	this.working_rand;
	this.working_nextIndex0;
	this.working_nextIndex1;
	this.working_top0;
	this.working_top1;
	this.working_left0;
	this.working_left1;
	this.working_right0;
	this.working_right1;
	this.working_shortjumpstart;
	this.working_platfound;
	this.working_closestdistance;
	this.working_closestheight;
	this.working_leftdis;
	this.working_rightdis;
	this.working_dis;
	this.count_valid;
	this.sort_pass;
	this.w_furthest_right;
	this.w_furthest_top;
	this.w_intro_x_dis;
	this.w_intro_y_dis;
	this.w_num_poss_to_fill;
	this.w_target_num_to_fill;
	//---------------------------------------------------------------------
}

//EXTERNAL HELPER METHODS
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
platformBuilderObject.prototype.setUpForIntro = function(startx){
	//Remove all platforms that are off the screen
	this.count_valid = 0;
	for(var p = 0; p < this.main.platform_maxNumber; p++) {
		if(this.platform_active[p] == 1) {
			if(this.platform_left[p] > this.main.director.cameraWorldRight || 
			   this.platform_right[p] < this.main.director.cameraWorldLeft) {
				this.platform_active[p] = -1;
			}
			else {
				this.count_valid++;
			}
		}
	}

	//Bubble sort the array so that any left as valid are at the beginning
	this.w_furthest_right = this.main.director.cameraFocus.x;
	this.numActivePlatforms = this.count_valid;
	if(this.count_valid > 0) {
		this.sort_pass = false;

		//Sort the actives to the start
		while(!this.sort_pass) {
			this.sort_pass = true;
			for(var i = 0; i < this.main.platform_maxNumber - 1; i++) {
				for(var j = i + 1; j < this.main.platform_maxNumber; j++){
					if(this.platform_active[j]  == 1 && this.platform_active[i] == -1) {
						this.sort_pass = -1;
						//Switch em up
						this.temp_active = this.platform_active[i];
						this.temp_visualtype = this.platform_visualtype[i];
						this.temp_jumptype = this.platform_jumptype[i];
						this.temp_left = this.platform_left[i];
						this.temp_right = this.platform_right[i];
						this.temp_top = this.platform_top[i];
						this.temp_x = this.platform_x[i];
						this.temp_y = this.platform_y[i];
						this.temp_w = this.platform_w[i];
						this.temp_h = this.platform_h[i];
						this.temp_x0 = this.platform_x0[i];
						this.temp_x1 = this.platform_x1[i];
						this.temp_y0 = this.platform_y0[i];
						this.temp_y1 = this.platform_y1[i];

						this.platform_active[i] = this.platform_active[j];
						this.platform_visualtype[i] = this.platform_visualtype[j];
						this.platform_jumptype[i] = this.platform_jumptype[j];
						this.platform_left[i] = this.platform_left[j];
						this.platform_right[i] = this.platform_right[j];
						this.platform_top[i] = this.platform_top[j];
						this.platform_x[i] = this.platform_x[j];
						this.platform_y[i] = this.platform_y[j];
						this.platform_w[i] = this.platform_w[j];
						this.platform_h[i] = this.platform_h[j];
						this.platform_x0[i] = this.platform_x0[j];
						this.platform_x1[i] = this.platform_x1[j];
						this.platform_y0[i] = this.platform_y0[j];
						this.platform_y1[i] = this.platform_y1[j];

						this.platform_active[j] = this.temp_active;
						this.platform_visualtype[j] = this.temp_visualtype;
						this.platform_jumptype[j] = this.temp_jumptype;
						this.platform_left[j] = this.temp_left;
						this.platform_right[j] = this.temp_right;
						this.platform_top[j] = this.temp_top;
						this.platform_x[j] = this.temp_x;
						this.platform_y[j] = this.temp_y;;
						this.platform_w[j] = this.temp_w;
						this.platform_h[j] = this.temp_h;
						this.platform_x0[j] = this.temp_x0;
						this.platform_x1[j] = this.temp_x1;
						this.platform_y0[j] = this.temp_y0;
						this.platform_y1[j] = this.temp_y1;
					}
				}
			}
		}

		//Sort by position
		while(!this.sort_pass) {
			this.sort_pass = true;
			for(var i = 0; i < this.main.platform_maxNumber - 1; i++) {
				for(var j = i + 1; j < this.main.platform_maxNumber; j++){
					if(this.platform_left[j] < this.platform_left[i] && (this.platform_active[j]  == 1 && this.platform_active[i]  == 1)) {
						this.sort_pass = -1;
						//Switch em up
						this.temp_active = this.platform_active[i];
						this.temp_visualtype = this.platform_visualtype[i];
						this.temp_jumptype = this.platform_jumptype[i];
						this.temp_left = this.platform_left[i];
						this.temp_right = this.platform_right[i];
						this.temp_top = this.platform_top[i];
						this.temp_x = this.platform_x[i];
						this.temp_y = this.platform_y[i];
						this.temp_w = this.platform_w[i];
						this.temp_h = this.platform_h[i];
						this.temp_x0 = this.platform_x0[i];
						this.temp_x1 = this.platform_x1[i];
						this.temp_y0 = this.platform_y0[i];
						this.temp_y1 = this.platform_y1[i];

						this.platform_active[i] = this.platform_active[j];
						this.platform_visualtype[i] = this.platform_visualtype[j];
						this.platform_jumptype[i] = this.platform_jumptype[j];
						this.platform_left[i] = this.platform_left[j];
						this.platform_right[i] = this.platform_right[j];
						this.platform_top[i] = this.platform_top[j];
						this.platform_x[i] = this.platform_x[j];
						this.platform_y[i] = this.platform_y[j];
						this.platform_w[i] = this.platform_w[j];
						this.platform_h[i] = this.platform_h[j];
						this.platform_x0[i] = this.platform_x0[j];
						this.platform_x1[i] = this.platform_x1[j];
						this.platform_y0[i] = this.platform_y0[j];
						this.platform_y1[i] = this.platform_y1[j];

						this.platform_active[j] = this.temp_active;
						this.platform_visualtype[j] = this.temp_visualtype;
						this.platform_jumptype[j] = this.temp_jumptype;
						this.platform_left[j] = this.temp_left;
						this.platform_right[j] = this.temp_right;
						this.platform_top[j] = this.temp_top;
						this.platform_x[j] = this.temp_x;
						this.platform_y[j] = this.temp_y;;
						this.platform_w[j] = this.temp_w;
						this.platform_h[j] = this.temp_h;
						this.platform_x0[j] = this.temp_x0;
						this.platform_x1[j] = this.temp_x1;
						this.platform_y0[j] = this.temp_y0;
						this.platform_y1[j] = this.temp_y1;
					}
				}
			}
		}


		this.w_furthest_right = this.platform_right[this.count_valid - 1];
		this.w_furthest_top = this.platform_top[this.count_valid -1];
	}

	this.w_intro_x_dis = startx - this.w_furthest_right;
	this.w_intro_y_dis = 0.0 - this.w_furthest_top; //0.0 to remind me that default starting y is 0

	this.w_num_poss_to_fill = this.main.platform_maxNumber - 1; //-1 as we need to create the default starting platform

	if(this.w_intro_x_dis / (2.0 * this.main.g_introAvDisBetweenPlats) > this.w_num_poss_to_fill) {
		this.w_target_num_to_fill = this.w_num_poss_to_fill;
	}
	else {
		this.w_target_num_to_fill = Math.floor(this.w_intro_x_dis / (2.0 *this.main.g_introAvDisBetweenPlats));
	}

	//console.log("Target Num to Fill: " + this.w_target_num_to_fill);

	//Linear height normalisation..
	this.w_ydelta = this.w_intro_y_dis / this.w_target_num_to_fill;

	this.w_curr_right = this.w_furthest_right + (0.5 * this.main.g_introAvDisBetweenPlats);

	this.w_num_filled = 0;
	this.curr_top = this.w_furthest_top;
	while(this.w_curr_right < startx - 256.0 - (0.5 * this.main.g_introAvDisBetweenPlats) &&
			this.w_num_filled < this.w_target_num_to_fill) {

			this.w_sl = this.w_curr_right + this.main.g_introAvDisBetweenPlats + ((-0.5 + Math.random()) * this.main.g_introAvDisBetweenPlats);
			if(startx - 128.0 - this.w_sl < 0.5 * this.main.g_introAvDisBetweenPlats) {
				//Ignore this one
				this.w_curr_right = startx; //force loop cancel
			}
			else {
				//We can make the platform
				var n = this.numActivePlatforms; //convenience
				this.platform_left[n] = this.w_sl;

				//Check if a limit on the edged 
				if(startx - 128.0 - this.platform_left[n] < 256.0) {
					this.platform_right[n] = this.platform_left[n] + (0.5 * (startx - 128.0 - this.platform_left[n]));
				}
				else {
					this.w_w = (0.1 * this.main.g_introAvDisBetweenPlats) + (Math.random() * 2.0 * this.main.g_introAvDisBetweenPlats);
					this.platform_right[n] = this.platform_left[n] + this.w_w;
				}
				this.w_curr_right = this.platform_right[n];

				this.platform_jumptype[n] = 0; //Doesn't matter here

				this.platwidth = this.platform_right[n] - this.platform_left[n];
				var twofivesixthree = this.main.platform_textureSize / 3.0;

				if(this.platwidth < 256.0 / 2.0) {
				this.platform_visualtype[n] = 3; //Checkered only
				}
				else
				{
					//Can use all apart from 3 [Checkered]
					this.platform_visualtype[n] = Math.floor(2.9999 * Math.random());
				}

				this.platform_x[n] = this.platform_left[n] + (0.5 * (this.platform_right[n] - this.platform_left[n]));
				this.platform_y[n] = this.platform_top[n] - (0.5 * (this.platform_top[n] - this.main.floor_y));
				
				this.platform_w[n] = this.platform_right[n] - this.platform_left[n];
				this.platform_h[n] = this.platform_top[n] - this.main.floor_y;
				
				this.platform_x0[n] = 0.0;
				this.platform_x1[n] = Math.floor(this.platwidth /  this.main.platform_textureSize) + 1;

				this.platform_y0[n] = 0.0;
				this.platform_y1[n] = (this.platform_top[n] - this.main.floor_y) / this.main.platform_textureSize;

				this.curr_top += this.w_ydelta;
				this.platform_top[n] = this.curr_top;
					
				this.platform_active[this.numActivePlatforms] = 1;
				this.w_num_filled++;
				this.numActivePlatforms++;

				//console.log("PLAT|  Left: " + this.platform_left[n] + " Right: " + this.platform_right[n] + " Top: " + this.platform_top[n]);
			}
	}
	//console.log("Num to Filled: " + this.w_num_filled);

	//Fill the final starting ledge
	this.platform_active[this.numActivePlatforms] = 1;
	this.platform_visualtype[this.numActivePlatforms] = 2;
	this.platform_jumptype[this.numActivePlatforms] = 0;
	this.platform_left[this.numActivePlatforms] = startx - 128.0;
	this.platform_right[this.numActivePlatforms] = this.platform_left[this.numActivePlatforms] + 256.0;
	this.platform_top[this.numActivePlatforms] = 0.0;
	this.platform_x[this.numActivePlatforms] = startx;
	this.platform_y[this.numActivePlatforms] = 0.5 * (this.main.floor_y - this.platform_top[this.numActivePlatforms]);
	this.platform_w[this.numActivePlatforms] = 256.0;
	this.platform_h[this.numActivePlatforms] = (this.platform_top[this.numActivePlatforms] - this.main.floor_y);
	this.platform_x0[this.numActivePlatforms] = this.platform_w[this.numActivePlatforms] / this.main.platform_textureSize;
	this.platform_x1[this.numActivePlatforms] = 1.0;
	this.platform_y0[this.numActivePlatforms] = 0.0;
	this.platform_y1[this.numActivePlatforms] = this.platform_h[this.numActivePlatforms] / this.main.platform_textureSize;

	//Set up the variables used to help create next platforms
	this.platform_furthest_right = this.platform_right[this.numActivePlatforms];
	this.platform_furthest_top = this.platform_top[this.numActivePlatforms];
	this.level_lastPlatformIndex = this.numActivePlatforms; 
	this.level_lastplatformdifficulty = 1.0; //1.0 is base difficulty.. allows max random upside to start
	this.level_currentplatformtrend = "flat";
	this.level_lastplatformtype = "endpossible";

	/*
	console.log("FINAL PLAT|  Left: " + this.platform_left[this.numActivePlatforms] + 
						" Right: " + this.platform_right[this.numActivePlatforms] + 
						" Top: " + this.platform_top[this.numActivePlatforms]);
	*/

	this.numActivePlatforms++;
}	


platformBuilderObject.prototype.findNearestPlatformHeight = function(x) {
	this.working_platfound = false;
	this.working_closestdistance = -1;

	var closestIndex = -1;

	for(var f = 0; f < this.main.platform_maxNumber; f++) {
		if(this.platform_active[f] == 1) {
			this.working_leftdis = Math.abs(x - this.platform_left[f]);
			this.working_rightdis = Math.abs(x - this.platform_right[f]);
			this.working_dis = this.working_leftdis;
			if(this.working_rightdis < this.working_leftdis) {
				this.working_dis = this.working_rightdis;
			}
			if(!this.working_platfound || this.working_dis < this.working_closestdistance) {
				closestIndex = f;
				this.working_platfound = true;
				this.working_closestdistance = this.working_dis;
				this.working_closestheight = this.platform_top[f];
			}
		}
	}
	if(!this.working_platfound) {
		this.working_closestheight = 0.5 * (this.main.ceiling_y + this.main.floor_y);	
	}
	if(this.working_closestheight != 0 && !this.working_closestheight) {
		console.log("shit23");
	}
	//console.log("Height: " + this.working_closestheight);
	return this.working_closestheight;
}

platformBuilderObject.prototype.initialise = function() { 
	//Reset
	for(var f = 0; f < this.main.platform_maxNumber; f++) { 
		this.platform_active[f] = -1;
		this.platform_visualtype[f] = 0;
		this.platform_jumptype[f] = 0;
		this.platform_left[f] = 0.0;
		this.platform_right[f] = 0.0;
		this.platform_top[f] = 0.0;
		this.platform_x[f] = 0.0;
		this.platform_y[f] = 0.0;
		this.platform_w[f] = 0.0;
		this.platform_h[f] = 0.0;
		this.platform_x0[f] = 0.0;
		this.platform_x1[f] = 0.0;
		this.platform_y0[f] = 0.0;
		this.platform_y1[f] = 0.0;
	}
	//Create a first platform in index 0. Can be anything
	this.platform_active[0] = 1;
	this.platform_visualtype[0] = 0;
	this.platform_jumptype[0] = 0;
	this.platform_left[0] = 0.0;
	this.platform_right[0] = 256.0;
	this.platform_top[0] = 0.0;
	this.platform_x[0] = 128.0;
	this.platform_y[0] = 0.5 * (this.main.floor_y - this.platform_top[0]);
	this.platform_w[0] = 256.0;
	this.platform_h[0] = (this.platform_top[0] - this.main.floor_y);
	this.platform_x0[0] = this.platform_w[0] / this.main.platform_textureSize;
	this.platform_x1[0] = 1.0;
	this.platform_y0[0] = 0.0;
	this.platform_y1[0] = this.platform_h[0] / this.main.platform_textureSize;
	this.numActivePlatforms = 1;
	//Set up the variables used to help create next platforms
	this.platform_furthest_right = this.platform_right[0];
	this.platform_furthest_top = this.platform_top[0];
	this.level_lastPlatformIndex = 0; 
	this.level_lastplatformdifficulty = 1.0; //1.0 is base difficulty.. allows max random upside to start
	this.level_currentplatformtrend = "flat";
	this.level_lastplatformtype = "endpossible";
}

//UPDATE METHODS
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
platformBuilderObject.prototype.update = function() {
	this.destroyDistantPlatforms();
	this.checkAndCreateNewPlatform();
}

platformBuilderObject.prototype.destroyDistantPlatforms = function() {
	var destructionCount = 0;
	var activeCount = 0;
	for(var p = 0; p < this.main.platform_maxNumber; p++) { 
		if(this.platform_active[p] == 1) { 
			activeCount++;
			if(this.platform_right[p] < this.main.director.cameraFocus.x - this.main.platform_createDestroyDistance) { 
				this.platform_active[p] = -1;
				this.numActivePlatforms--;
				//console.log("DUMPED: " + this.platform_left[p] + " , " + this.platform_right[p]);
			}
		}
		if(activeCount >= this.numActivePlatforms) { 
			//We've hit enough active platforms to mean we don't need to search anymore
			break;
		}
	}
}

platformBuilderObject.prototype.checkAndCreateNewPlatform = function() { 
	if(this.platform_furthest_right < this.main.director.cameraFocus.x + this.main.platform_createDestroyDistance && 
		this.numActivePlatforms < this.main.platform_maxNumber - 1) { 
			this.buildNextPlatform();
	}
}

//PLATFORM BUILDER METHODS
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
platformBuilderObject.prototype.buildNextPlatform = function() { 
	this.checkForTrendChange();
	this.calculateInitJumpPeaks();
	this.chooseGapCharacteristics();
	this.calculateJumpExtremities();
	this.createRandomPlatform();
}

platformBuilderObject.prototype.checkForTrendChange = function() { 
	this.working_trendChange = Math.random();
	if(this.working_trendChange < (this.main.difficulty_currentScalar * this.main.platform_trendChangeScalar)) { 
		this.working_lastTrend = this.level_currentplatformtrend;
		this.working_pass = false;
		while(!this.working_pass) { 
			this.working_trendChange = Math.random();
			if(this.working_trendChange < 0.25 & this.working_lastTrend != "increasing") { 
				this.level_currentplatformtrend = "increasing";
				this.working_pass = true;
				continue;
			}
			if(this.working_trendChange < 0.5 & this.working_lastTrend != "decreasing") { 
				this.level_currentplatformtrend = "decreasing";
				this.working_pass = true;
				continue;
			}
			if(this.working_trendChange < 0.75 & this.working_lastTrend != "random") { 
				this.level_currentplatformtrend = "random";
				this.working_pass = true;
				continue;
			}
			if(this.working_trendChange <= 1.00 & this.working_lastTrend != "flat") { 
				this.level_currentplatformtrend = "flat";
				this.working_pass = true;
				continue;
			}
		}	
	}
}

platformBuilderObject.prototype.calculateInitJumpPeaks = function() { 
	this.working_jumpscaledgrav = this.main.gravity * this.main.character_longJumpGravFactor;
	this.working_time2peak_min = this.main.character_jumpSpeed / this.main.gravity;
	this.working_time2peak_max = this.main.character_jumpSpeed / this.working_jumpscaledgrav;
	this.minjump_peak_x = this.working_time2peak_min * this.main.character_SpeedTarget;
	this.maxjump_peak_x = this.working_time2peak_max * this.main.character_SpeedTarget;
	this.minjump_peak_y = (this.main.character_jumpSpeed * this.working_time2peak_min) - (0.5 * this.main.gravity * this.working_time2peak_min * this.working_time2peak_min);
	this.maxjump_peak_y = (this.main.character_jumpSpeed * this.working_time2peak_max) - (0.5 * this.working_jumpscaledgrav * this.working_time2peak_max * this.working_time2peak_max);
}

platformBuilderObject.prototype.chooseGapCharacteristics = function() { 
	//Add an exponential curve into the difficult used to create the gaps to jump (rate of increasing difficulty accelerates)
	var exponent = this.main.difficulty_exponentialMin + 
				  (this.main.difficulty_currentScalar * (this.main.difficulty_exponentialMax - this.main.difficulty_exponentialMin));
	this.working_difficultyboost = Math.exp(exponent);
	
	switch(this.level_currentplatformtrend) { 
		case "increasing":
			this.calculateRandomHeightChange_Up();
		break;
		case "decreasing":
			this.calculateRandomHeightChange_Down();
		break;
		case "random":
			this.working_randdirection = Math.random();
			if(this.working_randdirection > 0.5) { 
				this.woringranddirection = 1;
				this.calculateRandomHeightChange_Up();
			}
			else { 
				this.workingranddirection = -1;
				this.calculateRandomHeightChange_Down();
			}
		break;
		case "flat":
			this.working_heightchange = 0.0;
		break;
	}
	//Now pick the type of gap going from. If the last platformwas the landing for a short jump or part of a skip sequnce, then the next is a normal end point possible.
	if(this.platform_jumptype[this.level_lastPlatformIndex] > 0) { //I.e. is anything but a quick end
		this.working_next_platform_jump_type = "endpossible";
	}
	else {
		this.working_rand = Math.random();
		if(this.working_rand < this.main.probability_scalarForSkipJumpGap * this.main.difficulty_currentScalar) { 
			this.working_next_platform_jump_type = "skip";
		}
		else { 
			if (this.working_rand < (this.main.probability_scalarForSkipJumpGap * this.main.difficulty_currentScalar) +
									(this.main.probability_scalarForShortJumpGap * this.main.difficulty_currentScalar)) { 
				this.working_next_platform_jump_type = "short";
			}
			else {
				this.working_next_platform_jump_type = "endpossible";
			}
		}
	}
}

platformBuilderObject.prototype.calculateRandomHeightChange_Up = function() { 
		this.working_randomjumpheightrange = this.main.difficulty_maxJumpHeightPercentage - this.main.difficulty_baseJumpHeightPercentage - this.main.difficulty_additionalJumpHeightPercentage +
											(this.main.difficulty_additionalJumpHeightPercentage * this.working_difficultyboost);
		this.working_jumpheightresult = Math.random() * (this.main.difficulty_baseJumpHeightPercentage + this.working_randomjumpheightrange);
		this.working_jumpheightresult = this.working_jumpheightresult * Math.PI * 0.5;
		this.working_jumpheightresult = Math.sin(this.working_jumpheightresult); 
		this.working_heightchange = this.working_jumpheightresult * this.maxjump_peak_y;

		//Now we just check that we are not hitting thresholds of high level, if we do, then we switch to a downwards trend
		if(this.platform_top[this.level_lastPlatformIndex] - this.working_heightchange > this.main.ceiling_y) { 
			this.level_currentplatformtrend = "decreasing";
			this.calculateRandomHeightChange_Down();
			this.workingranddirection = -1;
		}	
}

platformBuilderObject.prototype.calculateRandomHeightChange_Down = function() { 
		this.working_heightchange = this.main.platform_decreasingJumpHeightMin + (Math.random() * (this.main.platform_decreasingJumpHeightMax - this.main.platform_decreasingJumpHeightMin));
		//Now we just check that we are not hitting thresholds of low level, if we do, then we switch to an upwards trend
		if(this.platform_top[this.level_lastPlatformIndex] + this.working_heightchange < this.main.floor_y + this.main.platform_lowestHeight) { 
			this.level_currentplatformtrend = "increasing";
			this.calculateRandomHeightChange_Up();
			this.workingranddirection = +1;
		}
}

platformBuilderObject.prototype.calculateJumpExtremities = function() {	
		switch(this.level_currentplatformtrend) { 
			case "increasing":
				this.calcExtUp();
			break;
			case "decreasing":
				this.calcExtDown();
				this.working_heightchange = -this.working_heightchange;
			break;
			case "random":
				if(this.working_randdrection == 1) { 
					this.calcExtUp();
				}
				else { 
					this.calcExtDown();
					this.working_heightchange = -this.working_heightchange;
				}				
			break;
			case "flat":
				this.maxjump_max_x_at_heightchange = 2.0 * this.maxjump_peak_x;
				this.minjump_max_x_at_heightchange = 2.0 * this.minjump_peak_x;
			break;
	}
}

platformBuilderObject.prototype.calcExtUp = function() { 
		if(this.working_heightchange > this.minjump_peak_y) { 
			this.minjumppossible = false;
		}
		else { this.minjumppossible = true; }
		
		this.workingfalltime = Math.sqrt(((2.0 * (this.maxjump_peak_y - this.working_heightchange)) / this.main.gravity));
		this.maxjump_max_x_at_heightchange = this.maxjump_peak_x + (this.workingfalltime * this.main.character_SpeedTarget);
		
		if(this.minjumppossible) { 
			this.workingfalltime = Math.sqrt(((2.0 * (this.minjump_peak_y - this.working_heightchange)) / this.main.gravity));
			this.minjump_max_x_at_heightchange = this.minjump_peak_x + (this.workingfalltime * this.main.character_SpeedTarget);
		}
		else { this.minjump_max_x_at_heightchange = this.minjump_peak_x; } //this jump is not min, it is a part held
}

platformBuilderObject.prototype.calcExtDown = function() { 
		this.workingfalltime = Math.sqrt(((2.0 * (this.maxjump_peak_y + this.working_heightchange)) / this.main.gravity));
		this.maxjump_max_x_at_heightchange = this.maxjump_peak_x + (this.workingfalltime * this.main.character_SpeedTarget);
		this.workingfalltime = Math.sqrt(((2.0 * (this.minjump_peak_y + this.working_heightchange)) / this.main.gravity));
		this.minjump_max_x_at_heightchange = this.minjump_peak_x + (this.workingfalltime * this.main.character_SpeedTarget);
}

platformBuilderObject.prototype.createRandomPlatform = function() { 
	switch(this.working_next_platform_jump_type) { 
			//reuse difficulty boost which should be 0.25 to 0.9..
			case "endpossible":
				this.calcEndPossible();
				//Make sure gap is enough for player to cross
				var delta = this.working_left0 - this.platform_furthest_right;
					if(delta < 1.1 * this.main.character_width) { 
						var additional = (1.1 * this.main.character_width) - delta;
						this.working_left0 += delta;
						this.working_right0 += delta;
					}
				this.createPlatform(this.working_left0, this.working_right0, this.working_top0);				
			break;
			case "short":
				this.working_shortjumpstart = (this.main.difficulty_shortJumpMaxPercentage * this.working_difficultyboost) * (this.platform_right[this.level_lastPlatformIndex] - this.platform_left[this.level_lastPlatformIndex]);
					this.working_top0 = this.platform_furthest_top + this.working_heightchange;
					if(this.working_heightchange > 0.0) { 
						this.working_left0 = this.platform_furthest_right - this.working_shortjumpstart + this.maxjump_peak_x;
						this.working_right0 = this.working_left0 + (this.main.difficulty_platformMinSize + (Math.random() * (this.main.difficulty_platformMaxSize - this.main.difficulty_platformMinSize)));
					}
					else {
						this.working_right0 =  this.platform_furthest_right - this.working_shortjumpstart + this.minjump_max_x_at_heightchange;
						this.working_left0 = this.working_right0 - (this.main.difficulty_platformMinSize + (Math.random() * (this.main.difficulty_platformMaxSize - this.main.difficulty_platformMinSize)));
						if(this.working_left0 <= this.platform_furthest_right) { 
							this.working_left0 = this.platform_furthest_right + (0.25 * (this.working_right0 - this.platform_furthest_right));
						}
					}
					//Make sure gap is enough for player to cross
					var delta = this.working_left0 - this.platform_furthest_right;
					if(delta < 1.1 * this.main.character_width) { 
						var additional = (1.1 * this.main.character_width) - delta;
						this.working_left0 += delta;
						this.working_right0 += delta;
					}
					this.createPlatform(this.working_left0, this.working_right0, this.working_top0);	
			break;
			case "skip":
				this.calcEndPossible();
				//Add a random in between
				var delta = this.working_left0 - this.platform_furthest_right;
				
				//If too skinny, just forget it
				if(delta < 3 * this.main.character_width) { 
					if(delta < 1.1 * this.main.character_width) { 
						var add = (1.1 * this.main.character_width) - delta;
						this.working_left0 += add;
						this.working_right0 += add;
						this.createPlatform(this.working_left0, this.working_right0, this.working_top0);	
					}
					else {
						this.createPlatform(this.working_left0, this.working_right0, this.working_top0);		
					}
				} else {
					//Ok gap is big enough.. either put a big ol island in there as percentage size change, or if too big, put a player's width in there
					var prop_width = this.main.platform_skipIslandGapPercentage * delta;
					if(delta - prop_width > 2 * this.main.character_width) {
						this.working_left1 = this.platform_furthest_right + (0.5 * delta) - (0.5 * this.main.platform_skipIslandGapPercentage * delta);
						this.working_right1 = this.platform_furthest_right + (0.5 * delta) + (0.5 * this.main.platform_skipIslandGapPercentage * delta);
					}
					else { 
						this.working_left1 = this.platform_furthest_right + (0.5 * delta) - (0.5 * this.main.character_width * delta);
						this.working_right1 = this.platform_furthest_right + (0.5 * delta) + (0.5 * this.main.character_width * delta);
					}
	
					if(this.working_heightchange >= 0.0) { 
						this.working_top1 = this.working_top0 - ((2.0 * (Math.random() -0.5)) * this.minjump_peak_y);
					}
					else { 
						this.working_top1 = this.working_top0 + (Math.random()* this.minjump_peak_y);
					}		
					this.createPlatform(this.working_left1, this.working_right1, this.working_top1);		
					this.createPlatform(this.working_left0, this.working_right0, this.working_top0);	
				}
			break;
	}
}

platformBuilderObject.prototype.calcEndPossible = function() { 
		this.working_top0 = this.platform_furthest_top + this.working_heightchange;
				if(this.working_heightchange > 0.0) { 
					if(this.minjumppossible) { 
						this.working_left0 = (this.platform_furthest_right - this.main.difficulty_endJumpBuffer) + 
											 (this.minjump_peak_x + (this.working_difficultyboost * (this.maxjump_max_x_at_heightchange - this.minjump_peak_x)));
					}
					else { 
						this.working_left0 = (this.platform_furthest_right - this.main.difficulty_endJumpBuffer) + 
											 (this.maxjump_peak_x + (this.working_difficultyboost * (this.maxjump_max_x_at_heightchange - this.maxjump_peak_x)));
					}
				}
				else {
					this.working_left0 = (this.platform_furthest_right - this.main.difficulty_endJumpBuffer) + 
										 (this.minjump_max_x_at_heightchange + (this.working_difficultyboost * (this.maxjump_max_x_at_heightchange - this.minjump_max_x_at_heightchange)));
				}
				this.working_right0 = this.working_left0 + (this.main.difficulty_platformMinSize + 
									  (Math.random() * (this.main.difficulty_platformMaxSize - this.main.difficulty_platformMinSize)));
}

platformBuilderObject.prototype.createPlatform = function(left, right, top) { 
	//Quick last check that we definitely have the gap we need
	if(left - this.platform_furthest_right < this.main.character_width * 1.2) { 
		var fixc = (this.main.character_width * 1.2) - (left - this.platform_furthest_right);
		left += fixc;
		right += fixc;
	}
	//as we may have pushed jump back. make sure if an upwards jump, then is still possible..
	//Only care if an upwards jump (remember y is POSITIVE going up)
	if(top > this.platform_furthest_top) { 
		//Two scenarios.. distance is pre-peak or post peak
		if(left - this.platform_furthest_right > this.maxjump_peak_x) { 
			//Further than peak - check if possible to make it. if not, bring it down to 90% possible
			var extra_distance = (left - this.platform_furthest_right) - this.maxjump_peak_x;
			var time_for_distance = extra_distance / this.main.character_SpeedTarget;
			var jumpheightatdistance = this.maxjump_peak_y - (0.5 * time_for_distance * time_for_distance * this.main.gravity);
			if(top - this.platform_furthest_top > 0.9 * jumpheightatdistance) { 
				top -= (top - this.platform_furthest_top) - (jumpheightatdistance);
			}
		}
		else {
			//Closer than peak
			if(top - this.platform_furthest_top > 0.9 * this.maxjump_peak_y) { 
				top -= (top - this.platform_furthest_top) - (0.9 * this.maxjump_peak_y);
			}
		}
	}
	
	var slot;
	for(s = 0; s < this.main.platform_maxNumber; s++) { 
		if(this.platform_active[s] == -1){ 
			slot = s;
			break;
		}
	}
	this.numActivePlatforms++;
	this.platform_active[slot] = 1;
	/*
	Choose the texture at random based on width
	Scale the coords to ensure complete wraps
	*/
	var platwidth = right - left;	
	var twofivesixthree = this.main.platform_textureSize / 3.0;
	
	if(platwidth < 256.0 / 2.0) {
		this.platform_visualtype[slot] = 3; //Checkered only
	}
	else
	{
		//Can use all apart from 3 [Checkered]
		this.platform_visualtype[slot] = Math.floor(2.9999 * Math.random());
	}
	
	switch(this.working_next_platform_jump_type) { 
		case "endpossible":
			this.platform_jumptype[slot] = 0;
		break;
		case "short":
			this.platform_jumptype[slot] = 1;
		break;
		case "skip":
			this.platform_jumptype[slot] = 2;
		break;
	}
	this.platform_left[slot] = left;
	this.platform_right[slot] = right;
	this.platform_top[slot] = top;
	
	this.platform_x[slot] = this.platform_left[slot] + (0.5 * (this.platform_right[slot] - this.platform_left[slot]));
	this.platform_y[slot] = this.platform_top[slot] - (0.5 * (this.platform_top[slot] - this.main.floor_y));
	
	this.platform_w[slot] = this.platform_right[slot] - this.platform_left[slot];
	this.platform_h[slot] = this.platform_top[slot] - this.main.floor_y;
	
	this.platform_x0[slot] = 0.0;
	this.platform_x1[slot] = Math.floor(platwidth /  this.main.platform_textureSize) + 1;

	this.platform_y0[slot] = 0.0;
	this.platform_y1[slot] = (this.platform_top[slot] - this.main.floor_y) / this.main.platform_textureSize;

	if(right > this.platform_furthest_right) { 
		this.platform_furthest_right = right;
		this.platform_furthest_top = top;
		this.level_lastPlatformIndex = slot;
	}
}

//RENDERING
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
platformBuilderObject.prototype.draw = function() { 
		for(var plat = 0; plat < this.main.platform_maxNumber; plat++) { 
			if(this.platform_active[plat] === 1) { 
				//is visible
				if(! (this.platform_left[plat] > this.main.director.cameraWorldRight ||
					  this.platform_right[plat] < this.main.director.cameraWorldLeft ||
					  this.platform_top[plat] < this.main.director.cameraWorldBottom || 
					  this.main.floor_y > this.main.director.cameraWorldTop) ) { 
							var tex;
							switch(this.platform_visualtype[plat]) { 
								case 0:
									tex = "platform_1";
								break;
								case 1:
									tex = "platform_2";
								break;
								case 2:
									tex = "platform_3";
								break;
								case 3:
									tex = "platform_4";
								break;
							}
							/*requestDraw = function(validate_parameters, 
								convert_to_screen_space, 
								texture_name, 
								x, 
								y, 
								width, 
								height, 
								rotation, 
								depth, 
								col_r, 
								col_g, 
								col_b, 
								col_a, 
								src_x0, 
								src_y0, 
								src_x1, 
								src_y1)
							*/
							graphics.requestDraw(false, 
												 false, 
												 tex, 
												 this.platform_x[plat], 
												 this.platform_y[plat],
												 this.platform_w[plat], 
												 this.platform_h[plat], 
												 0, 
												 this.main.depth_platform, 
												 1.0, 1.0, 1.0, 1.0, 
												 this.platform_x0[plat], 
												 this.platform_y0[plat],
												 this.platform_x1[plat],
												 this.platform_y1[plat]);
					  }
				  }
		}
}
