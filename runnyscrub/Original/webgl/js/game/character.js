function characterObject(main) {
	this.main = main;
	this.platform = this.main.platformBuilder;
	//Active Toggle
	this.active = false;

	//Dynamics Vectors
	this.position = new vec2(0.0, 0.0);
	this.speed = new vec2(0.0, 0.0);
	
	//Control Booleans
	this.jumpHeldInAir = false;
	this.isDead = false;
	
	//Collision Helper
	this.left;
	this.right;
	this.bottom;
	
	//Platform Tracking
	this.platform_current;
	this.platform_next;
	
	//Animation
	this.h_delta = 1.0 / 16.0;
	this.v_delta = 1.0 / 8.0;

	this.texture_name = "spritesheet_1";
	this.state = "standing";
	this.state_jump = "starting";

	this.animation_frame = 0;
	this.animation_frametimecount = 0.0;

	this.useTexCordEdgeSoftening = true;
	this.texCoordEdge = 0.002; //Removes sampling that encroaches another sprite. Causes small aritfacts but better than lines..

	this.animation_stand_numFrames = 2;
	this.animation_stand_frameTime = 0.5;
	this.animation_stand_x0 = new Float32Array(this.animation_stand_numFrames);
	this.animation_stand_x1 = new Float32Array(this.animation_stand_numFrames);
	this.animation_stand_y0 = new Float32Array(this.animation_stand_numFrames);
	this.animation_stand_y1 = new Float32Array(this.animation_stand_numFrames);
	
	for(var f = 0; f < this.animation_stand_numFrames; f++) { 
		this.animation_stand_x0[f] = (f + 14.0) * this.h_delta;
		this.animation_stand_x1[f] = (f + 15.0) * this.h_delta;
		this.animation_stand_y0[f] = 0.0; //1.0;
		this.animation_stand_y1[f] = this.v_delta; //1.0 - this.v_delta;

		if(this.useTexCordEdgeSoftening) {
			this.animation_stand_x0[f] += this.texCoordEdge;
			this.animation_stand_x1[f] -= this.texCoordEdge;
			this.animation_stand_y0[f] += this.texCoordEdge;
			this.animation_stand_y1[f] -= this.texCoordEdge;
		}
	}
	
	this.animation_running_numFrames = 14;
	this.animation_running_frameTime = 0.05;
	this.animation_running_x0 = new Float32Array(this.animation_running_numFrames);
	this.animation_running_y0 = new Float32Array(this.animation_running_numFrames);	
	this.animation_running_x1 = new Float32Array(this.animation_running_numFrames);
	this.animation_running_y1 = new Float32Array(this.animation_running_numFrames);	
	

	for(var f = 0; f < this.animation_running_numFrames; f++) { 
		this.animation_running_x0[f] = f * this.h_delta;
		this.animation_running_x1[f] = (f + 1.0) * this.h_delta;
		this.animation_running_y0[f] = 0.0; //1.0;
		this.animation_running_y1[f] = this.v_delta;; //1.0 - this.v_delta;

		if(this.useTexCordEdgeSoftening) {
			this.animation_running_x0[f] += this.texCoordEdge;
			this.animation_running_x1[f] -= this.texCoordEdge;
			this.animation_running_y0[f] += this.texCoordEdge;
			this.animation_running_y1[f] -= this.texCoordEdge;
		}
	}
	
	this.animation_jump_start_numFrames = 4;
	this.animation_jump_start_frameTime = 0.04;
	this.animation_jump_start_x0 = new Float32Array(this.animation_jump_start_numFrames);
	this.animation_jump_start_y0 = new Float32Array(this.animation_jump_start_numFrames);	
	this.animation_jump_start_x1 = new Float32Array(this.animation_jump_start_numFrames);
	this.animation_jump_start_y1 = new Float32Array(this.animation_jump_start_numFrames);	
	
	for(var f = 0; f < this.animation_jump_start_numFrames; f++) { 
		this.animation_jump_start_x0[f] = f * this.h_delta;
		this.animation_jump_start_x1[f] = (f + 1.0) * this.h_delta;
		this.animation_jump_start_y0[f] = this.v_delta; //1.0 - this.v_delta;
		this.animation_jump_start_y1[f] = 2.0 * this.v_delta; //1.0 - (2.0 * this.v_delta);

		if(this.useTexCordEdgeSoftening) {
			this.animation_jump_start_x0[f] += this.texCoordEdge;
			this.animation_jump_start_x1[f] -= this.texCoordEdge;
			this.animation_jump_start_y0[f] += this.texCoordEdge;
			this.animation_jump_start_y1[f] -= this.texCoordEdge;
		}
	}
	
	this.animation_jump_up_numFrames = 3;
	this.animation_jump_up_frameTime = 0.2;
	this.animation_jump_up_x0 = new Float32Array(this.animation_jump_up_numFrames);
	this.animation_jump_up_y0 = new Float32Array(this.animation_jump_up_numFrames);	
	this.animation_jump_up_x1 = new Float32Array(this.animation_jump_up_numFrames);
	this.animation_jump_up_y1 = new Float32Array(this.animation_jump_up_numFrames);	
	for(var f = 0; f < this.animation_jump_up_numFrames; f++) { 
		this.animation_jump_up_x0[f] = (4.0 + f) * this.h_delta;
		this.animation_jump_up_x1[f] = (5.0 + f) * this.h_delta;
		this.animation_jump_up_y0[f] = this.v_delta; //1.0 - this.v_delta;
		this.animation_jump_up_y1[f] = 2.0 * this.v_delta; //1.0 - (2.0 * this.v_delta);

		if(this.useTexCordEdgeSoftening) {
			this.animation_jump_up_x0[f] += this.texCoordEdge;
			this.animation_jump_up_x1[f] -= this.texCoordEdge;
			this.animation_jump_up_y0[f] += this.texCoordEdge;
			this.animation_jump_up_y1[f] -= this.texCoordEdge;
		}
	}
	
	this.animation_jump_peak_numFrames = 3;
	this.animation_jump_peak_frameTime = 0.1;
	this.animation_jump_peak_x0 = new Float32Array(this.animation_jump_peak_numFrames);
	this.animation_jump_peak_y0 = new Float32Array(this.animation_jump_peak_numFrames);	
	this.animation_jump_peak_x1 = new Float32Array(this.animation_jump_peak_numFrames);
	this.animation_jump_peak_y1 = new Float32Array(this.animation_jump_peak_numFrames);	
	
	for(var f = 0; f < this.animation_jump_peak_numFrames; f++) { 
		this.animation_jump_peak_x0[f] = (7.0 + f) * this.h_delta;
		this.animation_jump_peak_x1[f] = (f + 8.0) * this.h_delta;
		this.animation_jump_peak_y0[f] = this.v_delta; //1.0 - this.v_delta;
		this.animation_jump_peak_y1[f] = 2.0 * this.v_delta; //1.0 - (2.0 * this.v_delta);

		if(this.useTexCordEdgeSoftening) {
			this.animation_jump_peak_x0[f] += this.texCoordEdge;
			this.animation_jump_peak_x1[f] -= this.texCoordEdge;
			this.animation_jump_peak_y0[f] += this.texCoordEdge;
			this.animation_jump_peak_y1[f] -= this.texCoordEdge;
		}
	}
	
	this.animation_jump_down_numFrames = 3;
	this.animation_jump_down_frameTime = 0.2;
	this.animation_jump_down_x0 = new Float32Array(this.animation_jump_down_numFrames);
	this.animation_jump_down_y0 = new Float32Array(this.animation_jump_down_numFrames);	
	this.animation_jump_down_x1 = new Float32Array(this.animation_jump_down_numFrames);
	this.animation_jump_down_y1 = new Float32Array(this.animation_jump_down_numFrames);	
	
	for(var f = 0; f < this.animation_jump_down_numFrames; f++) { 
		this.animation_jump_down_x0[f] = (f + 10.0 ) * this.h_delta;
		this.animation_jump_down_x1[f] = (f + 11.0) * this.h_delta;
		this.animation_jump_down_y0[f] = this.v_delta; //1.0 - this.v_delta;
		this.animation_jump_down_y1[f] = 2.0 * this.v_delta; //1.0 - (2.0 * this.v_delta);

		if(this.useTexCordEdgeSoftening) {
			this.animation_jump_down_x0[f] += this.texCoordEdge;
			this.animation_jump_down_x1[f] -= this.texCoordEdge;
			this.animation_jump_down_y0[f] += this.texCoordEdge;
			this.animation_jump_down_y1[f] -= this.texCoordEdge;
		}
	}
	
	this.animation_fall_numFrames = 3;
	this.animation_fall_frameTime = 0.2;
	this.animation_fall_x0 = new Float32Array(this.animation_fall_numFrames);
	this.animation_fall_y0 = new Float32Array(this.animation_fall_numFrames);	
	this.animation_fall_x1 = new Float32Array(this.animation_fall_numFrames);
	this.animation_fall_y1 = new Float32Array(this.animation_fall_numFrames);	
	
	for(var f = 0; f < this.animation_fall_numFrames; f++) { 
		this.animation_fall_x0[f] = (f + 13.0) * this.h_delta;
		this.animation_fall_x1[f] = (f + 14.0) * this.h_delta;
		this.animation_fall_y0[f] = this.v_delta; //1.0 - this.v_delta;
		this.animation_fall_y1[f] = 2.0 * this.v_delta; //1.0 - (2.0 * this.v_delta);

		if(this.useTexCordEdgeSoftening) {
			this.animation_fall_x0[f] += this.texCoordEdge;
			this.animation_fall_x1[f] -= this.texCoordEdge;
			this.animation_fall_y0[f] += this.texCoordEdge;
			this.animation_fall_y1[f] -= this.texCoordEdge;
		}
	}
	
	this.animation_dead_numFrames = 8;
	this.animation_dead_frameTime = 0.1;
	this.animation_dead_x0 = new Float32Array(this.animation_dead_numFrames);
	this.animation_dead_y0 = new Float32Array(this.animation_dead_numFrames);
	this.animation_dead_x1 = new Float32Array(this.animation_dead_numFrames);
	this.animation_dead_y1 = new Float32Array(this.animation_dead_numFrames);
	
	for(var f = 0; f < this.animation_dead_numFrames; f++) { 
		this.animation_dead_x0[f] =  2.0 * f * this.h_delta;
		this.animation_dead_x1[f] =  2.0 * (f + 1.0) * this.h_delta;
		this.animation_dead_y0[f] = 2.0 * this.v_delta; //1.0 - (2.0 * this.v_delta);
		this.animation_dead_y1[f] = 3.0 * this.v_delta; //1.0 - (3.0 * this.v_delta);

		if(this.useTexCordEdgeSoftening) {
			this.animation_fall_x0[f] += this.texCoordEdge;
			this.animation_fall_x1[f] -= this.texCoordEdge;
			this.animation_fall_y0[f] += this.texCoordEdge;
			this.animation_fall_y1[f] -= this.texCoordEdge;
		}
	}
}

characterObject.prototype.initialise = function(pos_x, pos_y, plat_current) {
	this.speed.x = 0.0;
	this.speed.y = 0.0;
	this.position.x = pos_x;
	this.position.y = pos_y;
	this.state = "standing";
	this.platform_current = plat_current;
	this.platform_next = -1;
}

characterObject.prototype.update = function() {
	if(!this.active) {
		return;
	}

	if(this.state == "jumping") { 
		//TO DO:: this.main.score += frameTimer.seconds * 500 * this.main.difficultyscalar;
	}
	switch(this.state) { 
		case "standing":
			//TO DO: Add some sort of animation
		break;
		case "running":
			this.updateX(); //comment to stop him running
			this.updatePlayerCollisionBox(); 
			//Check still over the current platform
			if((this.left > this.platform.platform_right[this.platform_current] ||
				 this.right < this.platform.platform_left[this.platform_current])) {
					this.state = "jumping";
					this.state_jump = "downwards";
					this.animation_frametimecount = 0.0;
					this.animation_frame = 0; 
					var c = this.platform_current;
					this.platform_current = -1;
					this.platform_next = this.findNextPlatform();
					//console.log("fell from current:" + c + " onto " + this.platform_next);
				 }
				 else {
					if(this.checkJumpInput()) { 
						this.speed.y = +this.main.character_jumpSpeed;
						this.state = "jumping";
						this.state_jump = "starting";
						this.animation_frametimecount = 0.0;
						this.animation_frame = 0;
						this.platform_next = -1; 
						this.jumpHeldInAir = true;
						//console.log("jumped from running : current platform " + this.platform_current);			
					}
				 }
		break;
		case "jumping":
			this.updateX();
			this.updateY();
			this.updatePlayerCollisionBox();
			if(this.platform_current != -1) { 
				//Currently over a platform
				if((this.left > this.platform.platform_right[this.platform_current] ||
				 this.right < this.platform.platform_left[this.platform_current])) {
					//Not over platform 
					var k = this.platform_current;
					this.platform_current = -1;
					this.platform_next = this.findNextPlatform();
					//console.log("left current " + k + " in mid air, next will be " + this.platform_next);
				 }
				 else {
					//Check for collision with platform
					if(this.bottom < this.platform.platform_top[this.platform_current]) { 
						//Have collided with platform
						this.state = "running";
						this.animation_frame = 0;
						this.animation_frametimecount = 0.0;
						this.position.y += (this.platform.platform_top[this.platform_current] - this.bottom);
						this.speed.y = 0.0;
						//console.log("landed on current platform " + this.platform_current);
					}
				 }
			}
			else { 
				//Currently between platforms
				if(!(this.left > this.platform.platform_right[this.platform_next] ||
					 this.right < this.platform.platform_left[this.platform_next])) {
						//Have entered new platform area
						if(this.bottom < this.platform.platform_top[this.platform_next]) {
							//Hit a wall
							this.state = "falling";
							this.animation_frame = 0;
							this.animation_frametimecount = 0.0;
							//console.log("flew into a wall of next platform " + this.platform_next);
							this.speed.x = -(this.speed.x * this.main.character_collision_sidewaysbounce);
							//Adjust position
							this.position.x -= this.right - this.platform.platform_left[this.platform_next];
				
							this.platform_current = -1;
							this.platform_next = -1;
							this.main.justmissedplatform = true;
						}
						else {
							//Over a platform
							this.platform_current = this.platform_next;
							this.platform_next = -1;
							//console.log("flew over onto a new platform - not landed on " + this.platform_current);	
						}
					 }
			}	
		break;		
		case "falling":
			this.updateX();
			this.updateY();
			this.updatePlayerCollisionBox();
			this.detectFallingCollisions();	
			//Check update with the floor
			if(this.bottom < (this.main.floor_y + 256.0)) { 
				this.state = "dead";
				this.speed.x = 0.0;
				this.speed.y = 0.0;
				this.position.y += ((this.main.floor_y + 256.0) - this.bottom);
			}
		break;
		case "dead":
		this.updatePlayerCollisionBox();
		if(this.bottom < (this.main.floor_y + 256.0)) { 
			this.position.y += ((this.main.floor_y + 256.0) - this.bottom);
		}
		this.speed.x = 0.0;
		this.speed.y = 0.0;
		break;
	}
	this.updateAnimationState();	
}

characterObject.prototype.updateX = function() { 
	if(this.state != "falling") { 
		if(this.speed.x < this.main.character_SpeedTarget) { 
				this.speed.x += this.main.character_acc * frameTimer.seconds;
				if(this.speed.x > this.main.character_SpeedTarget) { 
					this.speed.x = this.main.character_SpeedTarget;
				}
		}
	}
	this.position.x += this.speed.x * frameTimer.seconds;
}

characterObject.prototype.updateY = function() { 
	if(this.jumpHeldInAir) { 
		this.jumpHeldInAir = this.checkJumpInput();
	}
	if(this.state == "jumping" & (this.state_jump == "starting" || this.state_jump == "upwards") & this.jumpHeldInAir) { 
			this.speed.y -= this.main.character_longjumpgravfactor * this.main.gravity * frameTimer.seconds;		
			//graphics.requestDraw(false, false, "textures_1", 10, 10, 5, 5, 0, this.main.depth_player, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0);		
		}
		else { 
			this.speed.y -= this.main.gravity * frameTimer.seconds;		
		}
		
	this.position.y += this.speed.y * frameTimer.seconds;
}

characterObject.prototype.updatePlayerCollisionBox = function() { 
	//Character collision AABB
	this.left = this.position.x - (0.5 * this.main.character_width);
	this.right = this.position.x + (0.5 * this.main.character_width);
	this.bottom = this.position.y - (0.5 * this.main.character_height);
}	

characterObject.prototype.findNextPlatform = function() { 
	var closest = -1;
	var distance = 0.0;
	for(var p = 0; p < this.main.platform_maxNumber; p++) {		
		if(this.platform.platform_active[p] === 1) {
				var dis = this.platform.platform_left[p] - this.right;
				if(dis > 0.0) {
					if(dis < distance || closest === -1) { 
					closest = p;
					distance = dis;
					}
				}
		}
	}
	if(closest === -1) {
		console.log("Error, could not find another platform"); 
		closest = 0;
	}
	return closest;
}

characterObject.prototype.detectFallingCollisions = function() { 
	for(var plat = 0; plat < this.main.platform_maxNumber; plat++) { 
		if(this.platform.platform_active[plat] === 1) { 
			if(!(this.left > this.platform.platform_right[plat] ||
				 this.right < this.platform.platform_left[plat])) { 
		    			//console.log("flew into another wall while falling");
						if(this.speed.x < 0.0) { 
							this.position.x += this.platform.platform_right[plat] - this.left;
						}
						else { 
							this.position.x -= this.right - this.platform.platform_left[plat];
						}
						this.speed.x = -(this.speed.x * this.main.character_collision_sidewaysbounce);
				 }
		}
	}
}

characterObject.prototype.checkJumpInput = function() { 
	return input.inputListOfMouseButtonsDown[0];
}

characterObject.prototype.updateAnimationState = function() { 
	this.animation_frametimecount += frameTimer.seconds;
	switch(this.state) { 
		case "standing":
			if(this.animation_frametimecount > this.animation_stand_frameTime) { 
				this.animation_frametimecount = 0.0;
				this.animation_frame++;
				if(this.animation_frame >= this.animation_stand_numFrames) { 
					this.animation_frame = 0;
				}
			}
		break;
		case "running":
			if(this.animation_frametimecount > this.animation_running_frameTime) { 
				this.animation_frametimecount = 0.0;
				this.animation_frame++;
				if(this.animation_frame >= this.animation_running_numFrames) { 
					this.animation_frame = 0;
				}
			}
			break;
		case "jumping":
			switch (this.state_jump) { 
				case "starting": 
					if(this.animation_frametimecount > this.animation_jump_start_frameTime) { 
						this.animation_frametimecount = 0.0;
						this.animation_frame++;
						if(this.animation_frame >= this.animation_jump_start_numFrames) { 
							this.state_jump = "upwards";
							this.animation_frame = 0;
						}
					}
					if(this.speed.y < 0.0) { 
						this.state_jump = "peak";
						this.animation_frame = 0;
						this.animation_frametimecount = 0.0;
					}
				break;
				case "upwards":
					if(this.animation_frametimecount > this.animation_jump_up_frameTime) { 
						this.animation_frametimecount = 0.0;
						this.animation_frame++;
						if(this.animation_frame >= this.animation_jump_up_numFrames) { 
							this.animation_frame = 0;
						}
					}
					if(this.speed.y < 0.0) { 
						this.state_jump = "peak";
						this.animation_frame = 0;
						this.animation_frametimecount = 0.0;
					}
				break;
				case "peak":
					if(this.animation_frametimecount > this.animation_jump_peak_frameTime) { 
						this.animation_frametimecount = 0.0;
						this.animation_frame++;
						if(this.animation_frame >= this.animation_jump_peak_numFrames) { 
							this.state_jump = "downwards";
							this.animation_frame = 0;
						} 
					}
				break;
				case "downwards":
					if(this.animation_frametimecount > this.animation_jump_down_frameTime) { 
						this.animation_frametimecount = 0.0;
						this.animation_frame++;
						if(this.animation_frame >= this.animation_fall_numFrames) { 
							this.animation_frame = 0;
						}
					}
				break;
			}
			break;
		case "falling":
			if(this.animation_frametimecount > this.animation_fall_frameTime) { 
				this.animation_frametimecount = 0.0;
				this.animation_frame++;
				if(this.animation_frame >= this.animation_fall_numFrames) { 
					this.animation_frame = 0;
				}
			}
			break;
		case "dead":
			if(this.animation_frametimecount > this.animation_dead_frameTime) { 
				this.animation_frametimecount = 0.0;
				this.animation_frame++;
				if(this.animation_frame >= this.animation_dead_numFrames) { 
					this.isDead = true;
					this.animation_frame = this.animation_dead_numFrames - 1;
				}
			}
		break;
	}
}

characterObject.prototype.draw = function() { 
	if(!this.active) {
		return;
	}

	var x0;
	var x1;
	var y0;
	var y1;

	var g_width = this.main.character_width;
	var g_height = this.main.character_height;

	switch(this.state) { 
		case "standing":
			x0 = this.animation_stand_x0[this.animation_frame];
			x1 = this.animation_stand_x1[this.animation_frame];
			y0 = this.animation_stand_y0[this.animation_frame];
			y1 = this.animation_stand_y1[this.animation_frame];
		break;
		case "running":
			x0 = this.animation_running_x0[this.animation_frame];
			x1 = this.animation_running_x1[this.animation_frame];
			y0 = this.animation_running_y0[this.animation_frame];
			y1 = this.animation_running_y1[this.animation_frame];
		break;
		case "jumping":
			switch(this.state_jump) { 
				case "starting":
					x0 = this.animation_jump_start_x0[this.animation_frame];
					x1 = this.animation_jump_start_x1[this.animation_frame];
					y0 = this.animation_jump_start_y0[this.animation_frame];
					y1 = this.animation_jump_start_y1[this.animation_frame];
					//console.log("starting: " + this.animation_frame + "x0,y0,x1,y1:" + x0 + ","+y0+","+x1+","+y1);
				break;
				case "upwards":
					x0 = this.animation_jump_up_x0[this.animation_frame];
					x1 = this.animation_jump_up_x1[this.animation_frame];
					y0 = this.animation_jump_up_y0[this.animation_frame];
					y1 = this.animation_jump_up_y1[this.animation_frame];				
				break;
				case "peak":
					x0 = this.animation_jump_peak_x0[this.animation_frame];
					x1 = this.animation_jump_peak_x1[this.animation_frame];
					y0 = this.animation_jump_peak_y0[this.animation_frame];
					y1 = this.animation_jump_peak_y1[this.animation_frame];					
				break;
				case "downwards":
					x0 = this.animation_jump_down_x0[this.animation_frame];
					x1 = this.animation_jump_down_x1[this.animation_frame];
					y0 = this.animation_jump_down_y0[this.animation_frame];
					y1 = this.animation_jump_down_y1[this.animation_frame];					
				break;
			}
		break;
		case "falling":
			x0 = this.animation_fall_x0[this.animation_frame];
			x1 = this.animation_fall_x1[this.animation_frame];
			y0 = this.animation_fall_y0[this.animation_frame];
			y1 = this.animation_fall_y1[this.animation_frame];		
		break; 
		case "dead":
			g_width = 2.0 * g_width;
			x0 = this.animation_dead_x0[this.animation_frame];
			x1 = this.animation_dead_x1[this.animation_frame];
			y0 = this.animation_dead_y0[this.animation_frame];
			y1 = this.animation_dead_y1[this.animation_frame];		
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
						 this.texture_name, 
						 this.position.x, 
						 this.position.y,
						 g_width, 
						 g_height, 
						 0, 
						 this.main.depth_character, 
						 1.0, 1.0, 1.0, 1.0, 
						 x0, 
						 y0,
						 x1,
						 y1);
}
