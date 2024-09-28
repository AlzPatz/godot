/*
Effects.js :: Pixel Peasant, Alex Paterson 2015
* This object helps control the settings for the graphics.js render pathway to implement and interpolate between shader effects
* It also manages the effects permissioning that comes with changing graphics settings
*
* Graphics Quality Levels: (Sets Permissioning. Implementation does not need to use them)
* MAX
* 	Basic Effects: Negative, Grayscale, Colourise, Pixelate
* 	Advanced Effects: Old Movie
* 	Blur: Yes
* 	Effect Mixing: Yes
* 	CRT: Yes
* 	Shockwave: Yes
* MED+
* 	Basic Effects: Negative, Grayscale, Colourise, Pixelate
* 	Advanced Effects: None
* 	Blur: No
* 	Effect Mixing: Yes
* 	CRT: Yes
* 	Shockwave: Yes
* MED
* 	Basic Effects: Negative, Grayscale, Colourise, Pixelate
* 	Advanced Effects: None
* 	Blur: No
* 	Effect Mixing: Yes
* 	CRT: No
* 	Shocwave: Yes
* MIN
* 	Basic Effects: Negative, Grayscale, Colourise
* 	Advanced Effects: None
* 	Blur: No
* 	Effect Mixing: No
* 	CRT: No
* 	Shockwave: No
*
* Additional Effect Options
*
* 	RenderGUIOverEfects
* 	ShockWave_TargetGamePlayOnly (Actual implementation is stored in graphics as a string)
* 
* Note that both the Old Movie, CRT and Shockwave effects have additional toggles / values that can be tailored
*/

function effects(gfx) {
	this.gfx = gfx;
	this.quality; //Max, Med+, Med, Min
	
	this.renderGUIOverEffects = true;
	
	this.effectState_Init = new EffectsState();
	this.effectState_Target = new EffectsState();
	this.effectState_Queued = new EffectsState(); //Only one effect is potentially queued. New calls to queue an effect overwrite the one queued already

	this.isEffectQueued = false;
	this.queuedDuration;
	this.isEffectTransistioning = false;
	this.timecount;
	this.duration;
	this.percentage;

	this.isOverExposureFlickering = false;
	this.initBasePPColour;
	this.OverExposureFlickerTime;
	this.OverExposureFlickerCount;
	this.OverExposureFlickerFrac;
	this.OverExposureOpacity;
	this.OverExposureAngle;
	this.OverExposureTotalAngle;
	this.OverExposureFlickerOscillations;
	this.OverExposureFlickerIntensity;
}

effects.prototype.setSfxDefaults = function() {
	//TO DO : losing a little the reason not to have this in the constructor or atleast harmonise and bring all the other bits across
	//Not really used.. not much of an effect just the wipe values
	this.gfx.clearColour = [0.0, 0.0, 0.0, 1.0];
	//Set default
	this.gfx.baseGUIColour = [1.0, 1.0, 1.0, 1.0];
	this.gfx.basePPColour = [1.0, 1.0, 1.0, 1.0];
	
	this.changeGfxQuality("Max");
	
	//Set defaults
	this.initEffects();

	//Movie Defaults. Normally not modified during runtime (although wouldn't matter too much)
	this.shader_movie_scratch = 0.01;
	this.shader_movie_noise = 0.009;
	this.shader_movie_rndLine1 = 0.2;
	this.shader_movie_rndLine2 = 0.3;
	this.shader_movie_frame = 0.2;
	this.shader_movie_cpuShift = 0.001;
	this.shader_movie_rndShiftCutOff = 0.6;
	this.shader_movie_rndShiftScalar = 0.3;
	this.shader_movie_dim = 0.1;
	this.shader_movie_rollprob = 0.006;
	this.shader_movie_probrollends = 0.04;
	this.shader_movie_rollspeed = 0.0;
	this.shader_movie_rollspeedMIN = 0.00016;
	this.shader_movie_rollspeedMAX = 0.0008;
	this.shader_movie_rollacc = 0.0;
	this.shader_movie_rollaccMIN = 0.0004;
	this.shader_movie_rollaccMAX = 0.0008;
	this.shader_movie_rollpos = 0.0;
	this.shader_movie_rolloverallscale = 1.0;
	this.shader_movie_rollshakefactor = 0.001;
	this.shader_movie_isrolling = false;

	//Combine 
	this.blur_isTwoStage = false;
	this.blur_TwoStageShare = 0.65;
	this.blur_isTint = true;

	//CRT 
	this.pointLightPosition = [-400.0, 300.0, 1000.0];
	this.pointLightColour = [0.8, 0.8, 0.8];
	this.ambientColour = [0.2, 0.2, 0.2];
	this.specularShininess = 200.0;

	this.crt_isLighting = true;

	this.crt_isBrightnessMultiplier = true;
	this.crt_brightnessScalar = 1.7;
	this.crt_isShadowMask = true;
	this.crt_shadowMaskIntensity = 0.07;
	this.crt_shadowMaskSizeScalar = 0.3;
	this.crt_curvature = 0.18;
	this.crt_edge_curvature = 0.28;
	this.crt_depth = 100.0;
	this.crt_mesh_num_divs = 100; //Defines how dense the mesh is 

	//ShockWave (we store the basic data about how these are evolving and active in effects. graphics.js parse that info into data for the graphics card)
	this.swav_max_number = 100;
	this.swav_num_active = 0;
	this.swav_active = new Int8Array(this.swav_max_number);
	this.swav_is_screen_space = new Int8Array(this.swav_max_number);

	this.swav_x = new Float32Array(this.swav_max_number);
	this.swav_y = new Float32Array(this.swav_max_number);
	this.swav_s = new Float32Array(this.swav_max_number);
	this.swav_i = new Float32Array(this.swav_max_number);
	this.swav_count = new Float32Array(this.swav_max_number);

	this.swav_min = new Float32Array(this.swav_max_number);
	this.swav_max = new Float32Array(this.swav_max_number);
	this.swav_duration = new Float32Array(this.swav_max_number);
	this.swav_intensity = new Float32Array(this.swav_max_number);

	this.resetShockWave();

	//Working Variables
	this.w_count;
	this.w_frac;
	this.indexToUse;
}

effects.prototype.changeGfxQuality = function(quality) {
	if(!(quality == "Max" || quality == "Med" || quality == "Min" ||
		 quality == "MAX" || quality == "MED" || quality == "MIN" ||
		 quality == "max" || quality == "med" || quality == "min")) {
		console.log("Change Shader Quality Failed: Non-valid quality/shader name");
		return false;
	}
	else {
		switch(quality) {
			case "Max":
			case "MAX":
			case "max":
				this.quality = "Max";
				break;
			case "Med":
			case "MED":
			case "med":
				this.quality = "Med";
				break;
			case "Min":
			case "MIN":
			case "min":
				this.quality = "Min";
				break;
		}
		return true;
	}
}

//Hard Blur Override. Will Take Initial State Settings, change blur and instant transition
effects.prototype.setBlur = function(blur) {
	if(blur != undefined) {
		if(blur < 0.0) { blur = 0.0; }
		if(blur > 1.0) { blur = 1.0; } //Not really needed as exists a natural limited in the graphics rendering code to just below 1.0
		this.setCurrentEffectsState(this.effectState_Init.effects, 
									this.effectState_Init.mixColour, 
									this.effectState_Init.pixDivX, 
									this.effectState_Init.pixDivY, 
									blur, 
									this.effectState_Init.movie);
	}
	else {
		console.log("Could not set blur, invalid input");
	}
}

//Base shader colours work irrespective of effects and transitions. Can change at will
effects.prototype.setBasePostProcessColour = function(r, g, b, a) {
	if((r != undefined) && (g != undefined) && (b != undefined)&& (a != undefined)) {
		if(r < 0.0) { r = 0.0; }
		if(r > 1.0) { r = 1.0; } 
		if(g < 0.0) { g = 0.0; }
		if(g > 1.0) { g = 1.0; } 
		if(b < 0.0) { b = 0.0; }
		if(b > 1.0) { b = 1.0; } 
		if(a < 0.0) { a = 0.0; }
		if(a > 1.0) { a = 1.0; } 
		this.gfx.basePPColour = [r, g, b, a];
		return;
	}
	console.log("Could not set base Post Process colour, invalid input");;
}

//Base Shader Colour. GUI currently has no customisable effects except the colourisation here
effects.prototype.setBaseGUIColour = function(r, g, b, a) {
	if((r != undefined) && (g != undefined) && (b != undefined)&& (a != undefined)) {
		if(r < 0.0) { r = 0.0; }
		if(r > 1.0) { r = 1.0; } 
		if(g < 0.0) { g = 0.0; }
		if(g > 1.0) { g = 1.0; } 
		if(b < 0.0) { b = 0.0; }
		if(b > 1.0) { b = 1.0; } 
		if(a < 0.0) { a = 0.0; }
		if(a > 1.0) { a = 1.0; } 
		this.gfx.baseGUIColour = [r, g, b, a];
		return;
	}
	console.log("Could not set base GUI colour, invalid input");;
}

effects.prototype.initEffects = function() {
	this.effectState_Init.effects = [0.0, 0.0, 0.0, 0.0]; 
	this.effectState_Init.mixColour = [1.0, 1.0, 1.0, 1.0]; 
	this.effectState_Init.pixDivX = 100;
	this.effectState_Init.pixDivY = 75; 
	this.effectState_Init.blur = 0.6;
	this.effectState_Init.oldmovie = false;
	
	this.effectState_Target.effects = [0.0, 0.0, 0.0, 0.0]; 
	this.effectState_Target.mixColour = [1.0, 1.0, 1.0, 1.0]; 
	this.effectState_Target.pixDivX = 100;
	this.effectState_Target.pixDivY = 75; 
	this.effectState_Target.blur = 0.6;
	this.effectState_Target.oldmovie = false;

	this.gfx.shaderEffectsBlend = 0.0; 

	if(this.effectState_Init.blur > 0.0) { 
		this.gfx.cmbActive = true;
	}
	else {
		this.gfx.cmbActive = false;
	}

	this.gfx.bluramount = this.effectState_Init.blur;
}

effects.prototype.setCurrentEffectsState = function(effectToggles, mixColour, pixDivX, pixDivY, blurAmount, oldmovie) {
	this.effectState_Init.effects = effectToggles; 
	this.effectState_Init.mixColour = mixColour;
	this.effectState_Init.pixDivX = pixDivX;
	this.effectState_Init.pixDivY = pixDivY; 
	this.effectState_Init.blur = blurAmount;
	this.effectState_Init.oldmovie = oldmovie;
	this.gfx.shaderEffectsBlend = 0.0; //Setting state effects, no blending and no auto transition to target state
	this.gfx.pixellate_Divions_X = this.effectState_Init.pixDivX;
	this.gfx.pixellate_Divions_Y = this.effectState_Init.pixDivY;

	if(this.effectState_Init.blur > 0.0) { 
		this.gfx.cmbActive = true;
	}
	else {
		this.gfx.cmbActive = false;
	}
	this.gfx.bluramount = this.effectState_Init.blur;

	this.isEffectTransistioning = false;
}

effects.prototype.setAndTriggerEffectsTarget = function(interupt, duration, sfxToggles, mixColour, pixDivX, pixDivY, blur, oldmovie) {
	if(interupt || !this.isEffectTransistioning) {
		this.effectState_Target.effects = sfxToggles;
		this.effectState_Target.mixColour = mixColour;
		this.effectState_Target.pixDivX = pixDivX;
		this.effectState_Target.pixDivY = pixDivY;
		this.effectState_Target.blur = blur;
		this.effectState_Target.oldmovie = oldmovie;
		this.gfx.shaderEffectsBlend = 0.0; 

		if(this.effectState_Init.blur > 0.0 || this.effectState_Target.blur  > 0.0) { 
			this.gfx.cmbActive = true;
		}
		else {
			this.gfx.cmbActive = false;
		}
		this.gfx.bluramount = this.effectState_Init.blur;

		this.timecount = 0.0;
		this.duration = duration;
		this.isEffectTransistioning = true;

		if(this.quality == "Min") {
			this.duration = 0.00001; //Zero would cause / by zero issues. There is no transition so effect near-instant change (1 frame)
		}
	}
	else {
		this.effectState_Queued.effects = sfxToggles;
		this.effectState_Queued.mixColour = mixColour;
		this.effectState_Queued.pixDivX = pixDivX;
		this.effectState_Queued.pixDivY = pixDivY;
		this.effectState_Queued.blur = blur;
		this.effectState_Queued.oldmovie = oldmovie;
		this.queuedDuration = this.duration;
		this.isEffectQueued = true;
	}
}

effects.prototype.setExplicitEffectsMix = function(blend, effects1, effects2) {
	this.effectState_Init = effects1;
	this.effectState_Target = effects2;
	this.gfx.bluramount = ((1.0 - blend) * this.effectState_Init.blur) + (blend * this.effectState_Target.blur);
	this.gfx.pixellate_Divions_X = ((1.0 - blend) * this.effectState_Init.pixDivX) + (blend * this.effectState_Target.pixDivX);
	this.gfx.pixellate_Divions_Y = ((1.0 - blend) * this.effectState_Init.pixDivY) + (blend * this.effectState_Target.pixDivY);
	if(this.effectState_Init.blur > 0.0 || this.effectState_Target.blur  > 0.0) { 
		this.gfx.cmbActive = true;
	}
	else {
		this.gfx.cmbActive = false;
	}
	this.gfx.bluramount = this.effectState_Init.blur;
}

effects.prototype.triggerOverExposureFlicker = function(time, oscillations, intensity) {
	if(!this.isOverExposureFlickering) {
		this.initBasePPColour = [this.gfx.basePPColour[0], this.gfx.basePPColour[1], this.gfx.basePPColour[2], this.gfx.basePPColour[3]];
	}
	this.OverExposureFlickerTime = time;
	this.OverExposureFlickerOscillations = oscillations;
	this.OverExposureFlickerIntensity = intensity;
	this.OverExposureFlickerCount = 0.0;
	this.isOverExposureFlickering = true;
	this.OverExposureTotalAngle = 2.0 * Math.PI * this.OverExposureFlickerOscillations;
}

effects.prototype.setRenderGuiOverEffects = function(toggle) {
	this.renderGUIOverEffects = toggle;
}

effects.prototype.resetShockWave = function() {
	for(var s = 0; s < this.swav_max_number; s++) {
		this.swav_active[s] = -1;
		this.swav_is_screen_space[s] = -1;
		this.swav_x[s] = 0.0;
		this.swav_y[s] = 0.0;
		this.swav_s[s] = 0.0;
		this.swav_i[s] = 0.0;
		this.swav_count[s] = 0.0;
		this.swav_min[s] = 0.0;
		this.swav_max[s] = 0.0;
		this.swav_intensity[s] = 0.0;
		this.swav_duration[s] = 0.0;
	}
}

effects.prototype.setShockWaveActive = function(active) {
	if(allowShockWave && active) {
		graphics.swavActive = true;
		this.resetShockWave();
	}
	else {
		graphics.swavActive = false;
	}
}

effects.prototype.setShockWaveTargetGameOnly = function(targetGameOnly) {
	if(targetGameOnly) {
		graphics.swavType = "GAMEONLY";
	}
	else {
		graphics.swavType = "ALL";
	}
}

effects.prototype.setCrtActive = function(active) {
	if(allowCRT && active) {
		graphics.crtActive = true;
	}
	else {
		graphics.crtActive = false;
	}
}

effects.prototype.triggerShockWave = function(isScreenSpace, x, y, min, max, duration, intensity) {
	if(!allowShockWave || !graphics.swavActive) {
		return;
	}

	if(this.swav_num_active == this.swav_max_number) {
		console.log("Max Number of ShockWaves reached (remove this in final)");
		return;
	}

	//Find empty
	this.indexToUse = -1;
	for(var s = 0 ; s < this.swav_max_number; s++) {
		if(this.swav_active[s] === -1) {
			this.indexToUse = s;
			s = this.swav_max_number; //Cause loop drop
		}
	}

	this.swav_active[this.indexToUse] = 1;
	this.swav_is_screen_space[this.indexToUse] = isScreenSpace ? 1 : -1;
	this.swav_x[this.indexToUse] = x;
	this.swav_y[this.indexToUse] = y;
	this.swav_min[this.indexToUse] = min;
	this.swav_max[this.indexToUse] = max;
	this.swav_intensity[this.indexToUse] = intensity;
	this.swav_duration[this.indexToUse] = duration;
	//TO DO :: need to set any of the variables dirst in case we do not update before we hit this part (shouldnt be the case, can prob ignore but in case some sort of error found look here. this is too long lol)
	this.swav_count[this.indexToUse] = 0.0;
	this.swav_num_active++;
}

effects.prototype.triggerSimpleScreenSpaceShockWave = function(x, y, size, duration) {
	this.triggerShockWave(true, x, y, 100.0, size, duration, 1.0);
}

effects.prototype.triggerRainDropShockWave = function(x, y, min, max, duration) {
	this.triggerShockWave(false, x, y, min, max, duration, 1.0);
}

effects.prototype.update_shockWave = function() {
	if(this.swav_num_active === 0) {
		return;
	}

	this.w_count = 0;
	for(var s = 0; s < this.swav_max_number; s++) {
		if(this.swav_active[s] === 1) {
			this.w_count++;
			this.swav_count[s] += frameTimer.seconds;

			if(this.swav_count[s] > this.swav_duration[s]){
				this.swav_active[s] = -1;
				this.swav_num_active--;
				this.w_count--;
			}
			else {
				this.w_frac = this.swav_count[s] / this.swav_duration[s];
				this.swav_s[s] = this.swav_min[s] + (this.w_frac * (this.swav_max[s] - this.swav_min[s]));
				this.w_frac = 1.0 - this.w_frac;
				this.swav_i[s] = this.w_frac * this.swav_intensity[s];
			}

			if(this.w_count === this.swav_num_active) {
				s = this.swav_max_number; //Early loop drop out
			}
		}
	}
}

effects.prototype.update = function() {
	if(allowShockWave && graphics.swavActive) {
		this.update_shockWave();
	}

	if(this.isOverExposureFlickering) {
		if(this.OverExposureFlickerCount > this.OverExposureFlickerTime) {
			this.OverExposureFlickerCount = this.OverExposureFlickerTime;
			this.isOverExposureFlickering = false;
			this.gfx.basePPColour = [this.initBasePPColour[0], this.initBasePPColour[1], this.initBasePPColour[2], this.initBasePPColour[3]];			
		}

		if(this.isOverExposureFlickering) {
			this.OverExposureFlickerFrac = this.OverExposureFlickerCount / this.OverExposureFlickerTime;

			this.OverExposureAngle = this.OverExposureTotalAngle * this.OverExposureFlickerFrac; 
			this.OverExposureOpacity = (1.0 - this.OverExposureFlickerFrac) * (this.OverExposureFlickerIntensity * (0.5 * (Math.sin(this.OverExposureAngle) + 1.0)));

			this.gfx.basePPColour = [this.initBasePPColour[0] * this.OverExposureOpacity, 
									 this.initBasePPColour[1] * this.OverExposureOpacity,
									 this.initBasePPColour[2] * this.OverExposureOpacity,
									 this.initBasePPColour[3] * this.OverExposureOpacity];

			this.OverExposureFlickerCount += frameTimer.seconds;
		}
	}

	if(this.isEffectTransistioning) {
		this.timecount += frameTimer.seconds;
		if(this.timecount >= this.duration) {
			this.timecount = 0.0;
			this.isEffectTransistioning = false;
			this.gfx.shaderEffectsBlend = 0.0;
			this.effectState_Init.effects = this.effectState_Target.effects;
			this.effectState_Init.mixColour = this.effectState_Target.mixColour;
			this.effectState_Init.pixDivX = this.effectState_Target.pixDivX;
			this.effectState_Init.pixDivY = this.effectState_Target.pixDivY;
			this.effectState_Init.blur = this.effectState_Target.blur;
			this.effectState_Init.oldmovie = this.effectState_Target.oldmovie;
			if(this.isEffectQueued) {
				this.isEffectQueued = false;
				this.setAndTriggerEffectsTarget(true, 
												this.queuedDuration, 
												this.effectState_Queued.effects, 
												this.effectState_Queued.mixColour, 
												this.effectState_Queued.pixDivX, 
												this.effectState_Queued.pixDivY,
												this.effectState_Queued.blur, 
												this.effectState_Queued.oldmovie);
			}
		} 
		else {
			this.percentage = this.timecount / this.duration;
			this.gfx.bluramount = this.effectState_Init.blur + (this.percentage * (this.effectState_Target.blur - this.effectState_Init.blur));
			this.gfx.pixellate_Divions_X = this.effectState_Init.pixDivX + (this.percentage * (this.effectState_Target.pixDivX - this.effectState_Init.pixDivX));
			this.gfx.pixellate_Divions_Y = this.effectState_Init.pixDivY + (this.percentage * (this.effectState_Target.pixDivY - this.effectState_Init.pixDivY));
			if(this.gfx.bluramount > 0.0) {
				this.gfx.cmbActive = true;
			}
			else {
				this.gfx.cmbActive = false;
			}
			this.gfx.shaderEffectsBlend = this.percentage;
		}
	}

	if(this.effectState_Init.oldmovie || this.effectState_Target.oldmovie) {
		this.shader_movie_frame += 0.05 + (Math.random() * 0.03);
			if(this.shader_movie_frame > 20.0) {
				this.shader_movie_frame -= 20.0;
			}
			this.shader_movie_rndLine1 = Math.random();
			this.shader_movie_rndLine2 = Math.random();
			if(this.shader_movie_isrolling) { 
				if(Math.random() < this.shader_movie_probrollends) { 
					this.shader_movie_isrolling = false;
					this.shader_movie_cpuShift = 0.0;
				}
				else { 
					this.shader_movie_rollspeed += this.shader_movie_rollacc;
					this.shader_movie_rollpos += this.shader_movie_rollspeed;
					var shake = Math.random() * this.shader_movie_rollshakefactor;
					var finalmove = this.shader_movie_rolloverallscale * (shake + this.shader_movie_rollpos);
					if(finalmove >= 1.0) { 
						finalmove = 1.0;
						this.shader_movie_isrolling = false;
						this.shader_movie_cpuShift = 0.0;
					}
					else { 
						this.shader_movie_cpuShift = finalmove;
					}
				}
			}
			else { 
				this.shader_movie_cpuShift = 0.0;
				var prb = Math.random();
				if(prb  < this.shader_movie_rollprob) { 
					this.shader_movie_isrolling = true;
					this.shader_movie_rollspeed = this.shader_movie_rollspeedMIN + (Math.random() * (this.shader_movie_rollspeedMAX - this.shader_movie_rollspeedMIN));
					this.shader_movie_rollacc = this.shader_movie_rollaccMIN = (Math.random() * (this.shader_movie_rollaccMAX - this.shader_movie_rollaccMIN));
					this.shader_movie_rollpos = 0.0;
				}
			}	
	}
}



