/*
Graphics.js :: Pixel Peasant, Alex Paterson, 2015 (UPDATE THIS)
Inialisation
* Shader source code is loaded by core.js during the asset load stage as HttpRequest response text
* This source is compiled and linked to create shader programs
Render pipeline
* Draw requests (sprite and font) are submitted to graphics by the wider game / engine during an update
* These draw requests are ordered by z depth, and then by texture for render speed
* The vertex and vert indices buffers are built and send to graphics card for rendering
* This first render step is onto an offscreen framebuffer
* This offscreen buffer is then rendered to the backbuffer using a full screen effect shader
* There runs a final GUI rendering pass for sprites and fonts over the backbuffer
* There is a final possible effect, of a CRT screen, this requires use of one more back buffer stage and two buffer switch
Request Draw Functions (found at bottom)
* Used externally to add draw requets to the various queues
* requestDraw, requestDrawString, requestDrawGUI, requestDrawStringGUI
* drawString (font rendering) is just a layer over noraml texture/sprite rendering (sprite fonts) so drawString calls Draw...
* Note: Only requestDraw has a validate parameters option (String AND GUI versions do not) was initially just for debug
SFX/Shaders
* Effects are managed by the effects object. Include graphical quality levels and shader transitions
* TO DO: Dig into some of the other presets such as AA, Texture Sampler quality (etc). Implement change on fly and into GFX quality levels
* Implement optional anti aliasing and other GL texture / quality filters into the pipeline
*/

function graphicsObject() {
	this.sfx = new effects(this);
	this.animRequestID;
	this.gl;
	this.canvas;

	this.c_width;
	this.c_height;
	this.c_halfwidth;
	this.c_halfheight;

	this.camera_x;
	this.camera_y;
	this.camera_zoom;
	this.camera_one_over_zoom;
	this.camera_rotation;
	this.deg2rads;

	this.textures;
	this.num_textures = 0;
	this.fonts;
	this.num_fonts = 0;
	this.shadersFragment;
	this.num_shadersFragment = 0;
	this.shadersVertex;
	this.num_shadersVertex = 0;

	this.offScreenFrameBuffer = [];
	this.offScreenRenderBuffer = [];
	this.offScreenTexture = [];

	this.alternatingFrameBuffer = [];
	this.alternatingRenderBuffer = [];
	this.alternatingTexture = [];

	this.shockWaveBufferScale = 0.5;
	this.shockWaveFrameBuffer;
	this.shockWaveRenderBuffer;
	this.shockWaveTexture;
	this.shockWaveWidth;
	this.shockWaveHeight;

	this.cmbActive;
	this.crtActive = true;
	this.swavActive = true;
	this.swavType = "ALL";

	this.waslastframealternating = false;
	this.alternating_buffer = 0;

	this.bluramount;

	//Render & Sprite Engine
	this.numDrawRequests = 0;
	this.numDrawGUIRequests = 0;
	this.drawRequests; //Array
	this.drawGUIRequests;//Array
	this.numDrawBatches = 0;
	this.drawBatches; //Array
	this.numDrawBatches_Render = 0;
	this.numDrawBatches_GUI = 0; //In thhe end i think unused

	this.offset_LocalPosition;
	this.offset_SpritePosition;
	this.offset_TexCoord;
	this.offset_Rotation;
	this.offset_Colour;

	//ShockWave
	this.swav_Vertices;
	this.swav_Indices;
	this.swav_ViewPosition;
	this.swav_ViewTexCoord;
	this.swav_ViewIntensity;
	this.swav_offset_Pos;
	this.swav_offset_Tex;
	this.swav_offset_Int;

	//Shader Programs (Compiled Vertex and Fragment Shaders)
	this.shaderProgSprite = null;
	this.shaderProgPostProcess_Max = null;
	this.shaderProgPostProcess_Med = null;
	this.shaderProgPostProcess_Min = null;
	this.shaderProgGUI = null;
	this.shaderProgCombine = null;
	this.shaderProgCRT = null;
	this.shaderProgShockWave = null;

	this.vertexBuffer;
	this.vertexBuffer_Quad;
	this.vertexBuffer_CRT;

	this.indexBuffer;
	this.indexBuffer_CRT;

	this.vertexBuffer_ShockWave;
	this.indexBuffer_ShockWave;

	//Shader variables
	this.clearColour = [0.0, 0.0, 0.0, 1.0];
	this.clearColour_CRT = [0.05, 0.05, 0.05, 1.0];
	this.shockWaveClearColour = [0.5, 0.5, 0.5, 1.0];
	this.basePPColour;
	this.baseGUIColour;

	//Shader Uniforms (these 3 are interpolated between effect states in effect.js)
	this.shaderEffectsBlend;
	this.pixellate_Divions_X;
	this.pixellate_Divions_Y;

	this.noiseImage;
	this.noiseTexture;

	this.blackPixelImage;
	this.whitePixelImage;

	this.shockWaveImage;
	this.shockWaveTexture;

	this.sfx.setSfxDefaults();

	this.crt_angular_range;
	this.crt_divs_per_axis;
	this.crt_vertex_size_in_floats;
	this.crt_vertex_size_in_bytes;
	this.offset_CRT_Position;
	this.offset_CRT_Normal;
	this.offset_CRT_TexCoord;
	this.num_indices_CRT;
	this.CRT_camera_position;

	//Matrices
	this.cameraMatrixOrthoSprite;
	this.CRT_Matrix_MV;
	this.CRT_Matrix_P;
	this.CRT_Matrix_N;

	//working variables
	this.wlength = 0.0;
	this.blurvalue; //Array of one needed for uniform transfer to gfx card
	this.blurtoggles; //Array for uploading
	this.crttoggles // Arrray for uploading
	this.vCount;
	this.fOffset;
	this.halfs;
	this.sx;
	this.sy;
	this.o_left;
	this.o_right;
	this.o_top;
	this.o_bottom;
	this.o_rotation;
	this.o_translate = [];
}

//Helper functions
//---------------------------------------------------------------------------------------------
//Screen point within the reference frame of top left being (0,0), bottom right being (c_width, c_height)
graphicsObject.prototype.returnWorldPoint = function(screenpoint) {
	var worldpoint = new vec2(screenpoint.x, screenpoint.y);
	worldpoint.x -= this.c_halfwidth;
	worldpoint.y -= this.c_halfheight;
	worldpoint.y = -worldpoint.y;
	worldpoint.scaleSelf(this.camera_one_over_zoom);
	worldpoint.rotateSelf(this.camera_rotation * this.deg2rads);
	worldpoint.x += this.camera_x;
	worldpoint.y += this.camera_y;
	return worldpoint;
}

//Screen point within the reference frame of top left being (0,0), bottom right being (c_width, c_height)
graphicsObject.prototype.returnScreenPoint = function(worldpoint) {
	var screenpoint = new vec2(worldpoint.x, worldpoint.y);
	screenpoint.x -= this.camera_x;
	screenpoint.y -= this.camera_y;
	screenpoint.rotateSelf(-this.camera_rotation * this.deg2rads);
	screenpoint.scaleSelf(this.camera_zoom);
	screenpoint.y = -screenpoint.y;
	screenpoint.x += this.c_halfwidth;
	screenpoint.y += this.c_halfheight;
	return screenpoint;
}

graphicsObject.prototype.measureString = function(string, font, font_size) {
	this.wlength = 0.0;
	for(var c = 0; c < string.length; c++) {
		if(this.fonts[font].characters[string[c]]) {
			this.wlength += this.fonts[font].characters[string[c]].xadvance;
		}
	}
	this.wlength = this.wlength * (font_size / this.fonts[font].size);
	return this.wlength;
}

graphicsObject.prototype.setCameraPos = function(x, y) { 
	if((x != undefined) && (y != undefined)) {
		this.camera_x = x;
		this.camera_y = y;
	} 
}

graphicsObject.prototype.setCameraRot = function(r) { 
	if(r != undefined) {
		this.camera_rotation = r;
	} 
}

//Camera zoom helper (use to set, limits and calcs one over values)
graphicsObject.prototype.setCameraZoom = function(zoom) { 
	if(zoom < 0.000001) { zoom = 0.00001; } 
	this.camera_zoom = zoom;
	this.camera_one_over_zoom = 1.0 / this.camera_zoom;
}

//Shader Load
//---------------------------------------------------------------------------------------------
graphicsObject.prototype.loadShaders = function() { 
	//Add Shader Load Code Here
	loadShader("sprite", "fx/sprite.vert", "vertex");
	loadShader("sprite", "fx/sprite.frag", "fragment");
	loadShader("postprocess", "fx/postprocess.vert", "vertex");
	loadShader("combine", "fx/combine.frag", "fragment");
	loadShader("max", "fx/ppMax.frag", "fragment"); 
	loadShader("med", "fx/ppMed.frag", "fragment");
	loadShader("min", "fx/ppMin.frag", "fragment");
	loadShader("gui", "fx/spriteGUI.vert", "vertex");
	loadShader("gui", "fx/spriteGUI.frag", "fragment");
	loadShader("crt", "fx/crt.vert", "vertex");
	loadShader("crt", "fx/crt_blinnphong.frag", "fragment");
	loadShader("shockwave", "fx/shockwave.vert", "vertex");
	loadShader("shockwave", "fx/shockwave.frag", "fragment");
}

//Initialisation Cycle
//---------------------------------------------------------------------------------------------
graphicsObject.prototype.initCanvas = function(canvas_id_name) { 
	this.canvas = document.getElementById(canvas_id_name);
	if(this.canvas == null) {
		alert("There is no canvas on this page");
	}
	else {
		this.c_width = this.canvas.width;
		this.c_height = this.canvas.height;
		this.c_halfwidth = 0.5 * this.c_width;
		this.c_halfheight = 0.5 * this.c_height;
		this.canvas.addEventListener('webglcontextlost', handleContextLost, false);
		this.canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
	}
}
		//Context Handlers
		//==
		function handleContextLost(ev) { 
			alert("Context Lost");
			cancelAnimationFrame(this.animRequestID);
			ev.preventDefault();
		}

		function handleContextRestored(ev) { 
			alert("Context Restored");
			graphics.initGLContextAndRendering();
		}
		//==

//Arrive here from Core.js once assets are loaded, return to programLoop once complete
graphicsObject.prototype.initGLContextAndRendering = function() { 
		this.initCamera();
		this.getGLContext();
		this.initContext();
		this.initTextures();
		this.initFonts();
		this.initShaders();
		this.initRenderPipeline();
		game.initialise(); //best place for this?
		//Hand back to core.js, programLoop()
		requestAnimFrame(programLoop);
}

graphicsObject.prototype.initCamera = function() {
	//Default settings for camera is no zoom, pointing at world origin (0,0)
	this.camera_x = 0.0;
	this.camera_y = 0.0;
	this.camera_zoom = 1.0;
	this.camera_one_over_zoom = 1.0;
	this.camera_rotation = 0.0;
	this.deg2rads = (2.0 * Math.PI) / 360.0;
	this.rad2degs = 1.0 / this.deg2rads;
}

graphicsObject.prototype.getGLContext = function(){
	var ctx = null; //temp name for context
	var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	for(var i=0; i<names.length;i++) {
		try {
			ctx = this.canvas.getContext(names[i], {premultipliedAlpha:true});
		}
		catch(e){ }
		if(ctx) {
			break;
		}
	}
	if(ctx === null) {
		alert("Could not initialise WebGL");
		this.gl =  null;
	}
	else {
		this.gl =  ctx;
	}	
}

graphicsObject.prototype.initContext = function() {
	//Ensure images are unpacked upside down to work with webGL
	this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
	//Ensure images are unpacked with pre-multiplied alpha
	this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	//Set up blend and depth state				
	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.BLEND);
	//Strangely... this blend function is the one I expect for using non-premultiplied alpha colours..
	//http://www.html5rocks.com/en/tutorials/webgl/webgl_fundamentals/
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	//This other option being.. 
	//this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
	//Triangle culling.. none as should always draw ok. Perrhaps add later when want to cull ClockWise winding triangles
	//gl.frontFace(gl.CW);
	//gl.frontFace(gl.CCW);
	//gl.enable(gl.CULL_FACE);
	//gl.cullFace(gl.FRONT);
	//gl.cullFace(gl.BACK);		
	this.gl.disable(this.gl.CULL_FACE);
}

graphicsObject.prototype.initFonts = function() { 
	this.fonts = [];
	for(var f = 0; f < numLoadedFontTextFiles; f++) { 
		var name = loadedFontTextFiles[f].str_name_pass;
		var fsize =  loadedFontTextFiles[f].font_size_pass;
		var pwidth =  loadedFontTextFiles[f].font_pwidth_pass;
		//console.log(name);
		var txt = loadedFontTextFiles[f].responseText;
		var lines = txt.split("\n");
		var numLines = lines.length;
		var isChar = false;
			
		this.fonts[name] = new font(name, fsize, pwidth);	
		this.fonts[name].characters = [];
						
		var id;
		var x;
		var y;
		var width;
		var height;
		var xoffset;
		var yoffset;
		var xadvance;
		var page;
		
		for(var l = 0; l < numLines; l++) { 
			var line = lines[l];
			if(isChar) { 
				var bits = line.split(" ");
				
				for(var c = 0; c < bits.length; c++) { 
					if(bits[c].indexOf("id=") != -1) { 
						id = bits[c].substr(3, bits[c].length - 3);
						//console.log(id);
						continue;
					}
					if(bits[c].indexOf("x=") != -1) { 
						x = bits[c].substr(2, bits[c].length - 2);
						//console.log(x);
						continue;
					}
					if(bits[c].indexOf("y=") != -1) { 
						y = bits[c].substr(2, bits[c].length - 2);
						//console.log(y);
						continue;
					}
					if(bits[c].indexOf("width=") != -1) { 
						width = bits[c].substr(6, bits[c].length - 6);
						//console.log(width);
						continue;
					}
					if(bits[c].indexOf("height=") != -1) { 
						height = bits[c].substr(7, bits[c].length - 7);
						//console.log(height);
						continue;
					}
					if(bits[c].indexOf("xoffset=") != -1) { 
						xoffset = bits[c].substr(8, bits[c].length - 8);
						//console.log(xoffset);
						continue;
					}
					if(bits[c].indexOf("yoffset=") != -1) { 
						yoffset = bits[c].substr(8, bits[c].length - 8);
						//console.log(yoffset);
						continue;
					}
					if(bits[c].indexOf("xadvance=") != -1) { 
						xadvance = bits[c].substr(9, bits[c].length - 9);
						//console.log(xadvance);
						continue;
					}
					if(bits[c].indexOf("page=") != -1) { 
						page = bits[c].substr(5, bits[c].length - 5);
						//console.log(page);
						continue;
					}
				}
				
				//Create character
				this.fonts[name].characters[String.fromCharCode(parseInt(id))] = new char(this.fonts[name], x, y, width, height, xoffset, yoffset, xadvance, page);
			}
			else { 
				if(line.indexOf("chars count=") != -1) { 
					isChar = true;
				}
			}
		}
	}
}

graphicsObject.prototype.initShaders = function() {
	//Create shader arrays
	this.shadersFragment = [];
	this.shadersVertex = [];

	//Create and compile fragment shaders
	for(var f = 0; f < numLoadedFragmentShaderFiles; f++) {
		var name = loadedFragmentShaderFiles[f].str_name_pass;
		var script = loadedFragmentShaderFiles[f].responseText;
		this.shadersFragment[name] = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(this.shadersFragment[name], script);
		this.gl.compileShader(this.shadersFragment[name]);
		if(!this.gl.getShaderParameter(this.shadersFragment[name], this.gl.COMPILE_STATUS)) {
			alert("Fragment Shader " + name + " Load Fail ::> " + this.gl.getShaderInfoLog(this.shadersFragment[name]));
		return null;
		}
		this.num_shadersFragment++; //No current use for this
	}

	//Create and compile vertex shaders
	for(var v = 0; v < numLoadedVertexShaderFiles; v++) {
		var name = loadedVertexShaderFiles[v].str_name_pass;
		var script = loadedVertexShaderFiles[v].responseText;
		this.shadersVertex[name] = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(this.shadersVertex[name], script);
		this.gl.compileShader(this.shadersVertex[name]);
		if(!this.gl.getShaderParameter(this.shadersVertex[name], this.gl.COMPILE_STATUS)) {
			alert("Vertex Shader " + name + " Load Fail ::> " + this.gl.getShaderInfoLog(this.shadersVertex[name]));
		return null;
		}
		this.num_shadersVertex++; //No current use forr this
	}
}

graphicsObject.prototype.initTextures = function() { 
	//create texture array
	this.textures = [];
	for(var t = 0; t < numloadedImages; t++) { 
		var name = loadedImagesTextureNames[t];
		this.textures[name] = this.gl.createTexture();
		this.num_textures++;		
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[name]);
		//Load different if power or 2 or not
		if(isPowerOfTwo(loadedImages[t].width) & isPowerOfTwo(loadedImages[t].height)) { 
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT); 
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, loadedImages[t]);
     		this.gl.generateMipmap(this.gl.TEXTURE_2D);
		}
		else { 
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST); 
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST); 
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE); 
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, loadedImages[t]);
		}
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
	
	//Add the White and Black Pixel textures to the avaliable list
	if(!this.textures["blackpixel"]) {
		this.textures["blackpixel"] = this.gl.createTexture();
		this.num_textures++;		
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures["blackpixel"]);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT); 
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.blackPixelImage);
     	this.gl.generateMipmap(this.gl.TEXTURE_2D);
	}
	else {
		console.log("The user has loaded their own image called blackpixel");
	}

	if(!this.textures["whitepixel"]) {
		this.textures["whitepixel"] = this.gl.createTexture();
		this.num_textures++;		
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures["whitepixel"]);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT); 
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.whitePixelImage);
     	this.gl.generateMipmap(this.gl.TEXTURE_2D);
	}
	else {
		console.log("The user has loaded their own image called whitepixel");
	}
	
	//Create noise texture for shader
	this.noisetexture = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.noisetexture);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST); 
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR); 
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT); 
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.noiseImage);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);

	//Create shockwave texture for shader
	this.shockWaveTexture = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.shockWaveTexture);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST); 
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR); 
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT); 
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.shockWaveImage);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);
}

		var isPowerOfTwo = function(n) { 
			var ns = n.toString();
			switch(ns) { 
				case "2":
					return true;
				break;
				case "2":
					return true;
				break;
				case "4":
					return true;
				break;
				case "8":
					return true;
				break;
				case "16":
					return true;
				break;
				case "32":
					return true;
				break;
				case "64":
					return true;
				break;
				case "128":
					return true;
				break;
				case "256":
					return true;
				break;
				case "512":
					return true;
				break;
				case "1024":
					return true;
				break;
				case "2048":
					return true;
				break;
				case "4096":
					return true;
				break;
				case "8192":
					return true;
				break;
			}
			return false;
		}

graphicsObject.prototype.initRenderPipeline = function() {
	
	//Create Off Screen rendering frameBuffers from textures and renderBuffers
	//=============================================================================================================================================
	if(allowCombineEffects || allowCRT) { //TO DO:: this looks like it has some code dependent even when those effecs are not happening.. chec, prob crash at low gfx level
		for(var i = 0; i < 2; i++) {
			//Texture
			this.offScreenTexture[i] = this.gl.createTexture();
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.offScreenTexture[i]);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST); 
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST); 
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.c_width, this.c_height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);	

			//Renderbuffer
			this.offScreenRenderBuffer[i] = this.gl.createRenderbuffer();
			this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.offScreenRenderBuffer[i]);
			this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.c_width, this.c_height);

			//FrameBuffer
			this.offScreenFrameBuffer[i] = this.gl.createFramebuffer();
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.offScreenFrameBuffer[i]);
			this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.offScreenTexture[i], 0);
			this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.offScreenRenderBuffer[i]);

			//If we use any effects that combine colour information from previous frames (such as blur) then we need an alternating buffer
			//As webGL controls the backbuffer/flips - preserve backbuffer is notsuitable for us (slow to retrieve as I understand)
			if(allowCombineEffects) {

				//Texture 0
				this.alternatingTexture[i] = this.gl.createTexture();
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.alternatingTexture[i]);
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST); 
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST); 
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
				this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.c_width, this.c_height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);	

				//Renderbuffer 0
				this.alternatingRenderBuffer[i] = this.gl.createRenderbuffer();
				this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.alternatingRenderBuffer[i]);
				this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.c_width, this.c_height);

				//FrameBuffer 0
				this.alternatingFrameBuffer[i] = this.gl.createFramebuffer();
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.alternatingFrameBuffer[i]);
				this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.alternatingTexture[i], 0);
				this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.alternatingRenderBuffer[i]);
			}
		}
	}

	this.shockWaveWidth = Math.floor(this.shockWaveBufferScale * this.c_width);
	this.shockWaveHeight = Math.floor(this.shockWaveBufferScale * this.c_height);

	if(allowShockWave) {
		//Texture
		this.shockWaveTexture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.shockWaveTexture);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST); 
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST); 
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.shockWaveWidth, tthis.shockWaveHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);	

		//Renderbuffer
		this.shockWaveRenderBuffer = this.gl.createRenderbuffer();
		this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.shockWaveRenderBuffer);
		this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.c_width, this.c_height);

		//FrameBuffer
		this.shockWaveFrameBuffer = this.gl.createFramebuffer();
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.shockWaveFrameBuffer);
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.shockWaveTexture, 0);
		this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.shockWaveRenderBuffer);
	}

	//Link Shader Programs from Compiled Vertex and Pixel data
	//=============================================================================================================================================

	//Render
	//--------------------------------------------------------------------------------------------------
	this.shaderProgSprite = this.gl.createProgram();
	this.gl.attachShader(this.shaderProgSprite, this.shadersVertex["sprite"]);
	this.gl.attachShader(this.shaderProgSprite, this.shadersFragment["sprite"]);
	this.gl.linkProgram(this.shaderProgSprite);
	if(!this.gl.getProgramParameter(this.shaderProgSprite, this.gl.LINK_STATUS)) {
			alert("Failed to initalise and link shaders : RENDER");
		}
	this.gl.useProgram(this.shaderProgSprite);
	
	this.shaderProgSprite.uniform_CameraMatrix = this.gl.getUniformLocation(this.shaderProgSprite, "uCameraMatrix");
	this.shaderProgSprite.attribute_LocalPosition = this.gl.getAttribLocation(this.shaderProgSprite, "aLocalPosition");	
	this.shaderProgSprite.attribute_SpritePosition = this.gl.getAttribLocation(this.shaderProgSprite, "aSpritePosition");
	this.shaderProgSprite.attribute_TexCoord = this.gl.getAttribLocation(this.shaderProgSprite, "aTexCoord");
	this.shaderProgSprite.attribute_Rotation = this.gl.getAttribLocation(this.shaderProgSprite, "aRotation");
	this.shaderProgSprite.attribute_aColour = this.gl.getAttribLocation(this.shaderProgSprite, "aColour");
	this.shaderProgSprite.uniform_Sampler = this.gl.getUniformLocation(this.shaderProgSprite, "uSampler");
	
	//Combine effects pass
	//--------------------------------------------------------------------------------------------------
	if(allowCombineEffects){
		this.shaderProgCombine = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgCombine, this.shadersVertex["postprocess"]);
		this.gl.attachShader(this.shaderProgCombine, this.shadersFragment["combine"]);
		this.gl.linkProgram(this.shaderProgCombine);
		if(!this.gl.getProgramParameter(this.shaderProgCombine, this.gl.LINK_STATUS)) {
			alert("Failed to initalise and link shaders : COMBINE");
		}	
		this.shaderProgCombine.attribute_VertexPosition = this.gl.getAttribLocation(this.shaderProgCombine, "aVertexPosition");
		this.shaderProgCombine.attribute_TexCoord = this.gl.getAttribLocation(this.shaderProgCombine, "aTexCoord");
		this.shaderProgCombine.uniform_SamplerOld = this.gl.getUniformLocation(this.shaderProgCombine, "uSamplerOld");
		this.shaderProgCombine.uniform_SamplerNew = this.gl.getUniformLocation(this.shaderProgCombine, "uSamplerNew");
		this.shaderProgCombine.uniform_Blur = this.gl.getUniformLocation(this.shaderProgCombine, "uBlur");
		this.shaderProgCombine.uniform_TwoStageShare = this.gl.getUniformLocation(this.shaderProgCombine, "uBlurStageShare");
		this.shaderProgCombine.uniform_BlurToggles = this.gl.getUniformLocation(this.shaderProgCombine, "uBlurToggles");
	}

	//CRT pass
	//--------------------------------------------------------------------------------------------------
	if(allowCRT){
		this.shaderProgCRT = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgCRT, this.shadersVertex["crt"]);
		this.gl.attachShader(this.shaderProgCRT, this.shadersFragment["crt"]);
		this.gl.linkProgram(this.shaderProgCRT);
		if(!this.gl.getProgramParameter(this.shaderProgCRT, this.gl.LINK_STATUS)) {
			alert("Failed to initalise and link shaders : CRT");
		}	
		this.shaderProgCRT.attribute_VertexPosition = this.gl.getAttribLocation(this.shaderProgCRT, "aVertexPosition");
		this.shaderProgCRT.attribute_VertexNormal = this.gl.getAttribLocation(this.shaderProgCRT, "aVertexNormal");
		this.shaderProgCRT.attribute_TexCoord = this.gl.getAttribLocation(this.shaderProgCRT, "aTexCoord");
		this.shaderProgCRT.uniform_MVMatrix= this.gl.getUniformLocation(this.shaderProgCRT, "uMV_Matrix");
		this.shaderProgCRT.uniform_PMatrix= this.gl.getUniformLocation(this.shaderProgCRT, "uP_Matrix");
		this.shaderProgCRT.uniform_NMatrix= this.gl.getUniformLocation(this.shaderProgCRT, "uN_Matrix");
		this.shaderProgCRT.uniform_SamplerMain = this.gl.getUniformLocation(this.shaderProgCRT, "uSamplerMain");
		this.shaderProgCRT.uniform_SamplerShadowMask = this.gl.getUniformLocation(this.shaderProgCRT, "uSamplerShadowMask");
		this.shaderProgCRT.uniform_ShadowMaskIntensity = this.gl.getUniformLocation(this.shaderProgCRT, "uShadowMaskIntensity");
		this.shaderProgCRT.uniform_ShadowMaskSizeScaler = this.gl.getUniformLocation(this.shaderProgCRT, "uShadowMaskSizeScalar");
		this.shaderProgCRT.uniform_BrightnessMultiplier = this.gl.getUniformLocation(this.shaderProgCRT, "uSampleBrightnessMultiplier");
		this.shaderProgCRT.uniform_CrtToggles = this.gl.getUniformLocation(this.shaderProgCRT, "uCrtToggles");
		this.shaderProgCRT.uniform_AmbientColour = this.gl.getUniformLocation(this.shaderProgCRT, "uAmbientColour");
		this.shaderProgCRT.uniform_PointLightPosition = this.gl.getUniformLocation(this.shaderProgCRT, "uPointLightPosition");
		this.shaderProgCRT.uniform_PointLightColour = this.gl.getUniformLocation(this.shaderProgCRT, "uPointLightColour");
		this.shaderProgCRT.uniform_CameraPosition = this.gl.getUniformLocation(this.shaderProgCRT, "uCameraPosition");
		this.shaderProgCRT.uniform_SpecularShininess = this.gl.getUniformLocation(this.shaderProgCRT, "uSpecularShininess");
	}

	//Post Process : MAX
	//--------------------------------------------------------------------------------------------------
	this.shaderProgPostProcess_Max = this.gl.createProgram();
	this.gl.attachShader(this.shaderProgPostProcess_Max, this.shadersVertex["postprocess"]);
	this.gl.attachShader(this.shaderProgPostProcess_Max, this.shadersFragment["max"]);
	this.gl.linkProgram(this.shaderProgPostProcess_Max);
	if(!this.gl.getProgramParameter(this.shaderProgPostProcess_Max, this.gl.LINK_STATUS)) {
			alert("Failed to initalise and link shaders : POST_PROCESS MAX_QUALITY");
		}	
	this.gl.useProgram(this.shaderProgPostProcess_Max);
	//Attributes (Vertex Shader)
	this.shaderProgPostProcess_Max.attribute_VertexPosition = this.gl.getAttribLocation(this.shaderProgPostProcess_Max, "aVertexPosition");
	this.shaderProgPostProcess_Max.attribute_TexCoord = this.gl.getAttribLocation(this.shaderProgPostProcess_Max, "aTexCoord");
	//Uniforms (Pixel Shader)
	this.shaderProgPostProcess_Max.uniform_TextureSampler = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "uTextureSampler");
	this.shaderProgPostProcess_Max.uniform_NoiseSampler = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "uNoiseSampler");
	this.shaderProgPostProcess_Max.uniform_baseColour = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "basic.uBaseColour");
	this.shaderProgPostProcess_Max.uniform_mixColour_Current = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "basic.uMixColourCurrent");
	this.shaderProgPostProcess_Max.uniform_mixColour_Next = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "basic.uMixColourNext");
	this.shaderProgPostProcess_Max.uniform_effects_Current = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "basic.uEffectsCurrent");
	this.shaderProgPostProcess_Max.uniform_effects_Next = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "basic.uEffectsNext");
	this.shaderProgPostProcess_Max.uniform_effects_Blend = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "basic.uEffectsBlend");
	this.shaderProgPostProcess_Max.uniform_pixellateDivX = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "basic.uPixellateDivisionsX");
	this.shaderProgPostProcess_Max.uniform_pixellateDivY = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "basic.uPixellateDivisionsY");
	this.shaderProgPostProcess_Max.uniform_oldmovie_Current = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.active_Current");
	this.shaderProgPostProcess_Max.uniform_oldmovie_Next = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.active_Next");
	this.shaderProgPostProcess_Max.uniform_scratch = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.scratch");
	this.shaderProgPostProcess_Max.uniform_noise = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.noise");
	this.shaderProgPostProcess_Max.uniform_rndLine1 = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.rndLine1");						
	this.shaderProgPostProcess_Max.uniform_rndLine2 = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.rndLine2");
	this.shaderProgPostProcess_Max.uniform_frame = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.frame");
	this.shaderProgPostProcess_Max.uniform_cpuShift = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.cpuShift");
	this.shaderProgPostProcess_Max.uniform_rndShiftCutOff = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.rndShiftCutOff");
	this.shaderProgPostProcess_Max.uniform_rndShiftScalar = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.rndShiftScalar");
	this.shaderProgPostProcess_Max.uniform_dim = this.gl.getUniformLocation(this.shaderProgPostProcess_Max, "movie.dim");

	//Post Process : MED
	//--------------------------------------------------------------------------------------------------
	this.shaderProgPostProcess_Med = this.gl.createProgram();
	this.gl.attachShader(this.shaderProgPostProcess_Med, this.shadersVertex["postprocess"]);
	this.gl.attachShader(this.shaderProgPostProcess_Med, this.shadersFragment["med"]);
	this.gl.linkProgram(this.shaderProgPostProcess_Med);
	if(!this.gl.getProgramParameter(this.shaderProgPostProcess_Med, this.gl.LINK_STATUS)) {
			alert("Failed to initalise and link shaders : POST_PROCESS MED_QUALITY");
		}	
	this.gl.useProgram(this.shaderProgPostProcess_Med);
	//Attributes (Vertex Shader)
	this.shaderProgPostProcess_Med.attribute_VertexPosition = this.gl.getAttribLocation(this.shaderProgPostProcess_Med, "aVertexPosition");
	this.shaderProgPostProcess_Med.attribute_TexCoord = this.gl.getAttribLocation(this.shaderProgPostProcess_Med, "aTexCoord");
	//Uniforms (Pixel Shader)
	this.shaderProgPostProcess_Med.uniform_TextureSampler = this.gl.getUniformLocation(this.shaderProgPostProcess_Med, "uTextureSampler");
	this.shaderProgPostProcess_Med.uniform_baseColour = this.gl.getUniformLocation(this.shaderProgPostProcess_Med, "basic.uBaseColour");
	this.shaderProgPostProcess_Med.uniform_mixColour_Current = this.gl.getUniformLocation(this.shaderProgPostProcess_Med, "basic.uMixColourCurrent");
	this.shaderProgPostProcess_Med.uniform_mixColour_Next = this.gl.getUniformLocation(this.shaderProgPostProcess_Med, "basic.uMixColourNext");
	this.shaderProgPostProcess_Med.uniform_effects_Current = this.gl.getUniformLocation(this.shaderProgPostProcess_Med, "basic.uEffectsCurrent");
	this.shaderProgPostProcess_Med.uniform_effects_Next = this.gl.getUniformLocation(this.shaderProgPostProcess_Med, "basic.uEffectsNext");
	this.shaderProgPostProcess_Med.uniform_effects_Blend = this.gl.getUniformLocation(this.shaderProgPostProcess_Med, "basic.uEffectsBlend");
	this.shaderProgPostProcess_Med.uniform_pixellateDivX = this.gl.getUniformLocation(this.shaderProgPostProcess_Med, "basic.uPixellateDivisionsX");
	this.shaderProgPostProcess_Med.uniform_pixellateDivY = this.gl.getUniformLocation(this.shaderProgPostProcess_Med, "basic.uPixellateDivisionsY");

	//Post Process : MIN
	//--------------------------------------------------------------------------------------------------
	this.shaderProgPostProcess_Min = this.gl.createProgram();
	this.gl.attachShader(this.shaderProgPostProcess_Min, this.shadersVertex["postprocess"]);
	this.gl.attachShader(this.shaderProgPostProcess_Min, this.shadersFragment["min"]);
	this.gl.linkProgram(this.shaderProgPostProcess_Min);
	if(!this.gl.getProgramParameter(this.shaderProgPostProcess_Min, this.gl.LINK_STATUS)) {
			alert("Failed to initalise and link shaders : POST_PROCESS MIN_QUALITY");
		}	
	this.gl.useProgram(this.shaderProgPostProcess_Min);
	//Attributes (Vertex Shader)
	this.shaderProgPostProcess_Min.attribute_VertexPosition = this.gl.getAttribLocation(this.shaderProgPostProcess_Min, "aVertexPosition");
	this.shaderProgPostProcess_Min.attribute_TexCoord = this.gl.getAttribLocation(this.shaderProgPostProcess_Min, "aTexCoord");
	//Uniforms (Pixel Shader)
	this.shaderProgPostProcess_Min.uniform_TextureSampler = this.gl.getUniformLocation(this.shaderProgPostProcess_Min, "uTextureSampler");
	this.shaderProgPostProcess_Min.uniform_baseColour = this.gl.getUniformLocation(this.shaderProgPostProcess_Min, "basic.uBaseColour");
	this.shaderProgPostProcess_Min.uniform_mixColour = this.gl.getUniformLocation(this.shaderProgPostProcess_Min, "basic.uMixColour");
	this.shaderProgPostProcess_Min.uniform_effects = this.gl.getUniformLocation(this.shaderProgPostProcess_Min, "basic.uEffects");
	
	//GUI Renderring Pass
	//--------------------------------------------------------------------------------------------------
	this.shaderProgGUI  = this.gl.createProgram();
	this.gl.attachShader(this.shaderProgGUI , this.shadersVertex["gui"]);
	this.gl.attachShader(this.shaderProgGUI , this.shadersFragment["gui"]);
	this.gl.linkProgram(this.shaderProgGUI );
	if(!this.gl.getProgramParameter(this.shaderProgGUI , this.gl.LINK_STATUS)) {
			alert("Failed to initalise and link shaders : GUI");
		}
	this.gl.useProgram(this.shaderProgGUI);
	
	this.shaderProgGUI.uniform_CameraMatrix = this.gl.getUniformLocation(this.shaderProgGUI , "uCameraMatrix");
	this.shaderProgGUI.attribute_LocalPosition = this.gl.getAttribLocation(this.shaderProgGUI , "aLocalPosition");	
	this.shaderProgGUI.attribute_SpritePosition = this.gl.getAttribLocation(this.shaderProgGUI , "aSpritePosition");
	this.shaderProgGUI.attribute_TexCoord = this.gl.getAttribLocation(this.shaderProgGUI , "aTexCoord");
	this.shaderProgGUI.attribute_Rotation = this.gl.getAttribLocation(this.shaderProgGUI , "aRotation");
	this.shaderProgGUI.attribute_aColour = this.gl.getAttribLocation(this.shaderProgGUI , "aColour");
	this.shaderProgGUI.uniform_Sampler = this.gl.getUniformLocation(this.shaderProgGUI , "uSampler");
	this.shaderProgGUI.uniform_baseGUIColour = this.gl.getUniformLocation(this.shaderProgGUI , "uBaseGUIColour");
	
	//Shockwave rendering pass
	if(allowShockWave) {
		this.shaderProgShockWave  = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgShockWave , this.shadersVertex["shockwave"]);
		this.gl.attachShader(this.shaderProgShockWave , this.shadersFragment["shockwave"]);
		this.gl.linkProgram(this.shaderProgShockWave );
		if(!this.gl.getProgramParameter(this.shaderProgShockWave , this.gl.LINK_STATUS)) {
			alert("Failed to initalise and link shaders : ShockWave");
		}
		this.gl.useProgram(this.shaderProgShockWave);
		this.shaderProgShockWave.uniform_Sampler = this.gl.getUniformLocation(this.shaderProgShockWave , "uSampler");
		this.shaderProgShockWave.uniform_CameraMatrix = this.gl.getUniformLocation(this.shaderProgShockWave , "uCameraMatrix");
		this.shaderProgShockWave.attribute_Position = this.gl.getAttribLocation(this.shaderProgShockWave , "aPosition");	
		this.shaderProgShockWave.attribute_TexCoord = this.gl.getAttribLocation(this.shaderProgShockWave , "aTexCoord");
		this.shaderProgShockWave.attribute_Intensity = this.gl.getAttribLocation(this.shaderProgShockWave , "aIntensity");
	}

	//Create Buffers
	//=============================================================================================================================================

	//Rendering buffers
	this.vertexBuffer = this.gl.createBuffer();
	if(!this.vertexBuffer ) { 
		alert("Vertex Buffer Creation Failed");
	}
	
	this.indexBuffer = this.gl.createBuffer();
	if(!this.indexBuffer) { 
		alert("Index Buffer Creation Failed");
	}

	//Full Screen Quad Buffer
	this.vertexBuffer_Quad = this.gl.createBuffer();
	if(!this.vertexBuffer_Quad) {
		alert("Quad Vertex Buffer Creation Failed");
	}

	if(allowShockWave) {
		//Buffers
		this.vertexBuffer_ShockWave = this.gl.createBuffer();
		if(!this.vertexBuffer_ShockWave ) { 
			alert("Vertex Buffer (ShockWave) Creation Failed");
		}
		
		this.indexBuffer_ShockWave = this.gl.createBuffer();
		if(!this.indexBuffer_ShockWave) { 
			alert("Index Buffer (ShockWave) Creation Failed");
		}

		this.createShockWaveDrawBuffer();
	}

	//We can load the fullscreen quad buffer vertices now as they don't change. No indices, two triangles, 6 vertices. Data as x,y,texX,texY
	//OpenGL NDC Space (-1 to +1 left to right and -1 to +1 bottom to top)
	//OpenGL TexCorrd (0,0 is bottom left)
		var verts = [
		-1.0,-1.0, 0.0, 0.0,
		-1.0,1.0, 0.0, 1.0,
		 1.0, 1.0, 1.0, 1.0,
		-1.0,-1.0, 0.0, 0.0,
		 1.0, 1.0, 1.0, 1.0,
		 1.0, -1.0, 1.0, 0.0,
	];

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_Quad, this.gl.STATIC_DRAW);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verts), this.gl.STATIC_DRAW);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

	//CRT Full Screen Buffer
	if(allowCRT) {
		this.vertexBuffer_CRT = this.gl.createBuffer();
		if(!this.vertexBuffer_CRT) {
			alert("CRT Vertex Buffer Creation Failed");
		}

		var verts_crt = this.createCRTMesh_Vertices();
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_CRT, this.gl.STATIC_DRAW);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verts_crt), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

		this.indexBuffer_CRT = this.gl.createBuffer();
		if(!this.indexBuffer_CRT) { 
			alert("CRT Index Buffer Creation Failed");
		}

		var indices_crt = this.createCRTMesh_Indices();

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_CRT, this.gl.STATIC_DRAW);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_crt), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
	}

	//Create any fixed cameras (sprite camera updates so needs to happen in render code)
	//=============================================================================================================================================

	//GUI render matrix. Unchanging so can create here
	//mat4.ortho(left, right, bottom, top, near, far, dest (dest optional))
	// GUI pass coordinates
	//The topleft of the screen is (0,0), the bottom right of the screen is (c_width, c_height)
	//Please note that the game world has a different coordinate system (y is positive upwards instead)
	this.cameraMatrixOrthoGUI = mat4.ortho(0.0, this.c_width, this.c_height, 0.0, 0.0, 1.0);  
	//These depth ranges work as in the shader the z is flipped. 
	//Due to open GL assuming camera is facing down the negative z axis. with 0,0 to c_width, c_height this is not the case
	//To follow up here as a double check

	//CRT Camera Matrices
	if(allowCRT) {
		this.CRT_camera_position = [0.0, 0.0, this.sfx.crt_depth + (0.935 * this.c_width)];//Not sure why I can't use trig to work out how far back to push camera...
		this.CRT_Matrix_MV = mat4.lookAt(this.CRT_camera_position, [0, 0, 0], [0, 1, 0]); 
		this.CRT_Matrix_MV = mat4.scale(this.CRT_Matrix_MV, [this.c_width, this.c_height, 1.0]);
		this.CRT_Matrix_P = mat4.perspective(45.0, this.c_width / this.c_height, 0.1, 1000.0);
		this.CRT_Matrix_N = mat4.toInverseMat3(this.CRT_Matrix_MV);
	}
}

//Update - Used for non graphical calcs such has shader updates
//---------------------------------------------------------------------------------------------
graphicsObject.prototype.update = function(){
	this.sfx.update();
}

//Render Pipeline
//---------------------------------------------------------------------------------------------

graphicsObject.prototype.prepareRenderPipelineForFrame = function() { 
	this.numDrawRequests = 0;
	this.numDrawGUIRequests = 0;
	this.drawRequests = [];
	this.drawGUIRequests = [];
	
	this.numDrawBatches = 0;
	this.drawBatches = [];
	
	this.numDrawBatches_Render = 0;
	this.numDrawBatches_GUI = 0;
}

graphicsObject.prototype.render = function(){

	/* RENDER PIPELINE OVERVIEW
	* Tested under the following iterations manually:
	SHOCKWAVE NONE, COMBINE FALSE, CRT FALSE, RGOE FALSE
	SHOCKWAVE GAME, COMBINE FALSE, CRT FALSE, RGOE FALSE
	SHOCKWAVE ALL, COMBINE FALSE, CRT FALSE, RGOE FALSE
	SHOCKWAVE NONE, COMBINE TRUE, CRT FALSE, RGOE FALSE
	SHOCKWAVE GAME, COMBINE TRUE, CRT FALSE, RGOE FALSE
	SHOCKWAVE ALL, COMBINE TRUE, CRT FALSE, RGOE FALSE
	SHOCKWAVE NONE, COMBINE FALSE, CRT TRUE, RGOE FALSE
	SHOCKWAVE GAME, COMBINE FALSE, CRT TRUE, RGOE FALSE
	SHOCKWAVE ALL, COMBINE FALSE, CRT TRUE, RGOE FALSE
	SHOCKWAVE NONE, COMBINE TRUE, CRT TRUE, RGOE FALSE
	SHOCKWAVE GAME, COMBINE TRUE, CRT TRUE, RGOE FALSE
	SHOCKWAVE ALL, COMBINE TRUE, CRT TRUE, RGOE FALSE
	SHOCKWAVE NONE, COMBINE FALSE, CRT FALSE, RGOE TRUE
	SHOCKWAVE GAME, COMBINE FALSE, CRT FALSE, RGOE TRUE
	SHOCKWAVE ALL, COMBINE FALSE, CRT FALSE, RGOE TRUE
	SHOCKWAVE NONE, COMBINE TRUE, CRT FALSE, RGOE TRUE
	SHOCKWAVE GAME, COMBINE TRUE, CRT FALSE, RGOE TRUE
	SHOCKWAVE ALL, COMBINE TRUE, CRT FALSE, RGOE TRUE
	SHOCKWAVE NONE, COMBINE FALSE, CRT TRUE, RGOE TRUE
	SHOCKWAVE GAME, COMBINE FALSE, CRT TRUE, RGOE TRUE
	SHOCKWAVE ALL, COMBINE FALSE, CRT TRUE, RGOE TRUE
	SHOCKWAVE NONE, COMBINE TRUE, CRT TRUE, RGOE TRUE
	SHOCKWAVE GAME, COMBINE TRUE, CRT TRUE, RGOE TRUE
	SHOCKWAVE ALL, COMBINE TRUE, CRT TRUE, RGOE TRUE
	----------------------------------------------------------------------------------------------------------------------------
	*/

	//-1. Create the Camera Matrices used in steps 0 and 1
	this.calcOrthogonalCameraMatrix();

	//0. (IF SHOCKWAVE) Render ShockWave -> Gradient Map ::> ShockWave Buffer
	if(allowShockWave && this.swavActive && this.sfx.swav_num_active > 0) {
		this.renderShockWaveGradient();
	}

	//1. Render Sprites -> ::> OFFSCREEN BUFFER 1 	
	this.renderGame();

	/* 2. Post Process -> 	IF(COMBINE || CRT) ::>  (USE QUALITY LEVEL SHADER)
								IF (SHOCKWAVE)
									::> IF (SHOCKWAVE == GAMEONLY)
											RENDER OFFSCREEN BUFFER 1 WITH SHOCKWAVE ::> OFFSCREEN BUFFER 2 
										ELSE 
											RENDER OFFSCREEN BUFFER 1 WITHOUT  SHOCKWAVE ::> OFFSCREEN BUFFER 2 
								ELSE 
									RENDER OFFSCREEN BUFFER 1 WITHOUT SHOCKWAVE ::> OFFSCREEN BUFFER 2 	

	|					ELSE 
							::>  IF (SHOCKWAVE)
									::>  IF (SHOCKWAVE == GAMEONLY)
													RENDER  OFFSCREEN BUFFER 1 WITH SHOCK WAVE ::> BACKBUFFER
												ELSE
													RENDER  OFFSCREEN BUFFER 1  WITHOUT SHOCK WAVE ::> OFFSCREEN BUFFER 2
									ELSE 
										RENDER  OFFSCREEN BUFFER 1 WITHOUT SHOCK WAVE ::> BACKBUFFER
	*/
	if((allowCombineEffects && this.cmbActive) || (allowCRT && this.crtActive)) {
		if(allowShockWave && this.swavActive && this.sfx.swav_num_active > 0) {
			if(this.swavType === "GAMEONLY") {
				this.renderPostProcess("OFFSCREENBUFFER1", "OFFSCREENBUFFER2", true);
			}
			else {
				this.renderPostProcess("OFFSCREENBUFFER1", "OFFSCREENBUFFER2", false);
			}
		}
		else {
			this.renderPostProcess("OFFSCREENBUFFER1", "OFFSCREENBUFFER2", false);
		}
	}
	else {
		if(allowShockWave && this.swavActive && this.sfx.swav_num_active > 0) {
			if(this.swavType === "GAMEONLY") {
				this.renderPostProcess("OFFSCREENBUFFER1", "BACKBUFFER", true);
			}
			else {
				this.renderPostProcess("OFFSCREENBUFFER1", "OFFSCREENBUFFER2", false);
			}
		}
		else {
			this.renderPostProcess("OFFSCREENBUFFER1", "BACKBUFFER", false);
		}
	}

	/*
	3.	IF(COMBINE || CRT)
				IF (!RENDER GUI OVER EFFECTS)
					IF (SHOCKWAVE && SHOCKWAVE == ALL)
						:: RENDER GUI TO OFFSCREEN BUFFER 2
						:: RENDER OFFSCREEN BUFFER 2 WITH SHOCKWAVE TO OFFSCREEN BUFFER 1 (BOOL OF1 = TRUE)
					ELSE 
						:: RENDER GUI TO OFFSCREEN BUFFER 2
				ELSE 
					DON'T RENDER GUI HERE 	
		ELSE
				IF (SHOCKWAVE && SHOCKWAVE == ALL)
					::> RENDER GUI TO OFFSCREEN BUFFER 2
					::> RENDER OFFSCREEN BUFFER 2 with SHOCKWAVE to BACKBUFFER
				ELSE
					:: RENDER GUI TO BACK BUFFER
	*/
	this.OF1 = false;
	if((allowCombineEffects && this.cmbActive) || (allowCRT && this.crtActive)) {
		if(!this.renderGUIOverEffects) {
			this.renderGUI("OFFSCREENBUFFER2");
			if(allowShockWave && this.swavActive && this.swavType === "ALL" && this.sfx.swav_num_active > 0) {
				this.renderShockWaveOnly("OFFSCREENBUFFER2" , "OFFSCREENBUFFER 1");
				this.OF1 = true;
			}
		}
	}
	else {
		if(allowShockWave && this.swavActive && this.swavType === "ALL" && this.sfx.swav_num_active > 0) {
			this.renderGUI("OFFSCREENBUFFER2");
			this.renderShockWaveOnly("OFFSCREENBUFFER2" , "BACKBUFFER");
		}
		else {
			this.renderGUI("BACKBUFFER");
		}
	}

	/*
	4. IF (COMBINE)
				RENDER COMBINE LAST ALTERNATING BUFFER WITH (OF1 ? OFB1 : OFB2) to...
								RENDER NEW ALTERNATING
	*/
	if(allowCombineEffects && this.cmbActive) {
		if(this.OF1) {
			this.renderCombine("LASTALTERNATING", "OFB1", "NEWALTERNATING");
		}
		else {
			this.renderCombine("LASTALTERNATING", "OFB2", "NEWALTERNATING");
		}
	}

	/*
	5.	IF(CRT) 
				IF (COMBINE) 
					IF(SHOCKWAVE && SHOCKWAVE == ALL)
						RENDER NEW ALTERNATING ::> SHOCKWAVE ADDITIONAL BUFFER
					ELSE
						RENDER NEW ALTERNATING ::> BACKBUFFER
				ELSE
					IF(SHOCKWAVE && SHOCKWAVE == ALL)
						RENDER (OF1 ? OFB1 : OFB2) TO SHOCKWAVE ADDITIONAL BUFFER
					ELSE 
						RENDER (OF1 ? OFB1 : OFB2) TO BACKBUFFER
	*/
	if (allowCRT && this.crtActive) {
		if(allowCombineEffects && this.cmbActive) {
			if(allowShockWave && this.swavActive && this.swavType === "ALL" && this.sfx.swav_num_active > 0) {
				this.renderShockWaveOnly("NEWALTERNATING" , "SHOCKWAVEADDITIONAL");
			}
			else {
				this.renderTransfer("NEWALTERNATING" , "BACKBUFFER");
			}
		}
		else {
			if(allowShockWave && this.swavActive && this.swavType === "ALL" && this.sfx.swav_num_active > 0) {
				if(this.OF1) {
					this.renderShockWaveOnly("OFFSCREENBUFFER1" , "SHOCKWAVEADDITIONAL");
				}
				else {
					this.renderShockWaveOnly("OFFSCREENBUFFER2" , "SHOCKWAVEADDITIONAL");
				}
			}
			else {
				if(this.OF1) {
					this.renderTransfer("OFFSCREENBUFFER1" , "BACKBUFFER");
				}
				else {
					this.renderTransfer("OFFSCREENBUFFER2" , "BACKBUFFER");
				}
			}
		}
	}


	/*
	6.	IF (COMBINE || CRT) 
				IF (CRT)
					IF (RENDER GUI OVER EFFECTS)
							IF(SHOCKWAVE && SHOCKWAVE == ALL)
								::> RENDER GUI TO SHOCKWAVE ADDITIONAL BUFFER
								::> RENDER SHOCKWAVE ADDITIONAL BUFFER with SHOCKWAVE to BACKBUFFER
							ELSE
								::> RENDER GUI TO BACKBUFFER
					ELSE
							IF(SHOCKWAVE && SHOCKWAVE == ALL)
								::> RENDER SHOCKWAVE ADDITIONAL BUFFER with SHOCKWAVE to BACKBUFFER
							ELSE
								DO NOTHING
				ELSE
					IF (RENDER GUI OVER EFFECTS)
							IF(SHOCKWAVE && SHOCKWAVE == ALL)
								::> RENDER GUI TO NEW ALTERNATING
								::> RENDER NEW ALTERNATING with SHOCKWAVE to BACKBUFFER
							ELSE
								::> RENDER NEW ALTERNATING without SHOCKWAVE to BACKBUFFER
								::> RENDER GUI TO BACK BUFFER
								
					ELSE
						;;> RENDER NEW ALTERNATING to BACK BUFFER

	*/
	if((allowCombineEffects && this.cmbActive) || (allowCRT && this.crtActive)) {
		if (allowCRT && this.crtActive) {
			if(this.renderGUIOverEffects) {
				if(allowShockWave && this.swavActive && this.swavType === "ALL" && this.sfx.swav_num_active > 0) {
					this.renderGUI("SHOCKWAVEADDITIONAL");		
					this.renderShockWaveOnly("SHOCKWAVEADDITIONAL" , "BACKBUFFER");
				}
				else {
					this.renderGUI("BACKBUFFER");
				}
			}
			else {
				if(allowShockWave && this.swavActive && this.swavType === "ALL" && this.sfx.swav_num_active > 0) {
						this.renderShockWaveOnly("SHOCKWAVEADDITIONAL" , "BACKBUFFER");
				}
				else {
					//NOTHING
				}
			}
		}	
		else {
			if(this.renderGUIOverEffects) { 
				if(allowShockWave && this.swavActive && this.swavType === "ALL" && this.sfx.swav_num_active > 0) {
					this.renderGUI("NEWALTERNATING");		
					this.renderShockWaveOnly("SHOCKWAVEADDITIONAL" , "BACKBUFFER");
				}
				else {
					this.renderTransfer("NEWALTERNATING" , "BACKBUFFER");
					this.renderGUI("BACKBUFFER");
				}
			}
			else {
				this.renderTransfer("NEWALTERNATING" , "BACKBUFFER");
			}
		}
	}

	if(allowCombineEffects && this.cmbActive) {
		this.renderSwapBuffers();
	}

	/*
	7. SWAP BUFFERS IF (COMBINE)
	----------------------------------------------------------------------------------------------------------------------------
	*/

	/* RENDER PIPELINE OVERVIEW
	* Tested under the following iterations manually:
	SHOCKWAVE NONE, COMBINE FALSE, CRT FALSE, RGOE FALSE
	SHOCKWAVE GAME, COMBINE FALSE, CRT FALSE, RGOE FALSE
	SHOCKWAVE ALL, COMBINE FALSE, CRT FALSE, RGOE FALSE
	SHOCKWAVE NONE, COMBINE TRUE, CRT FALSE, RGOE FALSE
	SHOCKWAVE GAME, COMBINE TRUE, CRT FALSE, RGOE FALSE
	SHOCKWAVE ALL, COMBINE TRUE, CRT FALSE, RGOE FALSE
	SHOCKWAVE NONE, COMBINE FALSE, CRT TRUE, RGOE FALSE
	SHOCKWAVE GAME, COMBINE FALSE, CRT TRUE, RGOE FALSE
	SHOCKWAVE ALL, COMBINE FALSE, CRT TRUE, RGOE FALSE
	SHOCKWAVE NONE, COMBINE TRUE, CRT TRUE, RGOE FALSE
	SHOCKWAVE GAME, COMBINE TRUE, CRT TRUE, RGOE FALSE
	SHOCKWAVE ALL, COMBINE TRUE, CRT TRUE, RGOE FALSE
	SHOCKWAVE NONE, COMBINE FALSE, CRT FALSE, RGOE TRUE
	SHOCKWAVE GAME, COMBINE FALSE, CRT FALSE, RGOE TRUE
	SHOCKWAVE ALL, COMBINE FALSE, CRT FALSE, RGOE TRUE
	SHOCKWAVE NONE, COMBINE TRUE, CRT FALSE, RGOE TRUE
	SHOCKWAVE GAME, COMBINE TRUE, CRT FALSE, RGOE TRUE
	SHOCKWAVE ALL, COMBINE TRUE, CRT FALSE, RGOE TRUE
	SHOCKWAVE NONE, COMBINE FALSE, CRT TRUE, RGOE TRUE
	SHOCKWAVE GAME, COMBINE FALSE, CRT TRUE, RGOE TRUE
	SHOCKWAVE ALL, COMBINE FALSE, CRT TRUE, RGOE TRUE
	SHOCKWAVE NONE, COMBINE TRUE, CRT TRUE, RGOE TRUE
	SHOCKWAVE GAME, COMBINE TRUE, CRT TRUE, RGOE TRUE
	SHOCKWAVE ALL, COMBINE TRUE, CRT TRUE, RGOE TRUE
	----------------------------------------------------------------------------------------------------------------------------
	0. (IF SHOCKWAVE) Render ShockWave -> Gradient Map ::> ShockWave Buffer
	|
	1. Render Sprites -> ::> OFFSCREEN BUFFER 1 	
	|
	*
	2. Post Process -> 	IF!(COMBINE || CRT) ::>  (USE QUALITY LEVEL SHADER)
									IF (SHOCKWAVE)
										::>  	IF (SHOCKWAVE == GAMEONLY)
													RENDER  OFFSCREEN BUFFER 1 WITH SHOCK WAVE ::> BACKBUFFER
												ELSE
													RENDER  OFFSCREEN BUFFER 1  WITHOUT SHOCK WAVE ::> OFFSCREEN BUFFER 2
									ELSE 
										RENDER  OFFSCREEN BUFFER 1 WITHOUT SHOCK WAVE ::> BACKBUFFER
	|					ELSE 
							::>  IF (SHOCKWAVE)
									::> IF (SHOCKWAVE == GAMEONLY)
											RENDER OFFSCREEN BUFFER 1 WITH SHOCKWAVE ::> OFFSCREEN BUFFER 2 
										ELSE 
											RENDER OFFSCREEN BUFFER 1 WITHOUT  SHOCKWAVE ::> OFFSCREEN BUFFER 2 
								ELSE 
									RENDER OFFSCREEN BUFFER 1 WITHOUT SHOCKWAVE ::> OFFSCREEN BUFFER 2 	
	|
	*

	3. 	IF!(COMBINE || CRT)
				IF (SHOCKWAVE && SHOCKWAVE == ALL)
					::> RENDER GUI TO OFFSCREEN BUFFER 2
					::> RENDER OFFSCREEN BUFFER 2 with SHOCKWAVE to BACKBUFFER
				ELSE
					:: RENDER GUI TO BACK BUFFER
		ELSE
				IF (!RENDER GUI OVER EFFECTS)
					IF (SHOCKWAVE && SHOCKWAVE == ALL)
						:: RENDER GUI TO OFFSCREEN BUFFER 2
						:: RENDER OFFSCREEN BUFFER 2 WITH SHOCKWAVE TO OFFSCREEN BUFFER 1 (BOOL OF1 = TRUE)
					ELSE 
						:: RENDER GUI TO OFFSCREEN BUFFER 2
				ELSE 
					DON'T RENDER GUI HERE
	|
	4. IF (COMBINE)
				RENDER COMBINE LAST ALTERNATING BUFFER WITH (OF1 ? OFB1 : OFB2) to...
								RENDER NEW ALTERNATING

	5.	IF(CRT) 
				IF (COMBINE) 
					IF(SHOCKWAVE && SHOCKWAVE == ALL)
						RENDER NEW ALTERNATING ::> SHOCKWAVE ADDITIONAL BUFFER
					ELSE
						RENDER NEW ALTERNATING ::> BACKBUFFER
				ELSE
					IF(SHOCKWAVE && SHOCKWAVE == ALL)
						RENDER (OF1 ? OFB1 : OFB2) TO SHOCKWAVE ADDITIONAL BUFFER
					ELSE 
						RENDER (OF1 ? OFB1 : OFB2) TO BACKBUFFER
		
	6.	IF (COMBINE || CRT) 
				IF (!CRT)
					IF (RENDER GUI OVER EFFECTS)
							IF(SHOCKWAVE && SHOCKWAVE == ALL)
								::> RENDER GUI TO NEW ALTERNATING
								::> RENDER NEW ALTERNATING with SHOCKWAVE to BACKBUFFER
							ELSE
								::> RENDER NEW ALTERNATING without SHOCKWAVE to BACKBUFFER
								::> RENDER GUI TO BACK BUFFER
								
					ELSE
						;;> RENDER NEW ALTERNATING to BACK BUFFER

				ELSE
					IF (RENDER GUI OVER EFFECTS)
							IF(SHOCKWAVE && SHOCKWAVE == ALL)
								::> RENDER GUI TO SHOCKWAVE ADDITIONAL BUFFER
								::> RENDER SHOCKWAVE ADDITIONAL BUFFER with SHOCKWAVE to BACKBUFFER
							ELSE
								::> RENDER GUI TO BACKBUFFER
					ELSE
							IF(SHOCKWAVE && SHOCKWAVE == ALL)
								::> RENDER SHOCKWAVE ADDITIONAL BUFFER with SHOCKWAVE to BACKBUFFER
							ELSE
								DO NOTHING

	7. SWAP BUFFERS IF (COMBINE)
	----------------------------------------------------------------------------------------------------------------------------
	*/



	//0. (IF SHOCKWAVE) Render ShockWave -> Gradient Map ::> ShockWave Buffer
	//----------------------------------------------------------------------------------------------------------------------------
	if(allowShockWave && this.sfx.swav_num_active > 0) {
		this.updateShockWaveBuffer(); //this actually double checks the above bools, but leave for now TO DO::
		//Bind Shock Wave Frame Buffer
		this.gl.bindFrameBuffer(this.gl.FRAMEBUFFER, this.shockWaveFrameBuffer);
		this.gl.viewport(0, 0, this.shockWaveWidth, this.shockWaveHeight); 
		this.gl.clearColor(this.shockWaveClearColour[0], this.shockWaveClearColour[1], this.shockWaveClearColour[2], this.shockWaveClearColour[3]);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); 
		this.gl.useProgram(this.shaderProgShockWave); //Attach vertex and pixel shaders
		//Update camera matrix
		this.gl.uniformMatrix4fv(this.shaderProgShockWave.uniform_CameraMatrix, false, this.cameraMatrixOrthoSprite); 
		//Bind Vertex Buffer
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_ShockWave); 
		//Set up shader attributes
		this.gl.vertexAttribPointer(this.shaderProgShockWave.attribute_Position, 2, this.gl.FLOAT, false, this.swVertexSizeInBytes, this.swav_offset_Pos * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgShockWave.attribute_TexCoord, 2, this.gl.FLOAT, false, this.swVertexSizeInBytes, this.swav_offset_Tex * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgShockWave.attribute_Intensity, 1, this.gl.FLOAT, false, this.swVertexSizeInBytes, this.swav_offset_Int * Float32Array.BYTES_PER_ELEMENT);
		//Enable attributes
		this.gl.enableVertexAttribArray(this.shaderProgShockWave.attribute_Position);
		this.gl.enableVertexAttribArray(this.shaderProgShockWave.attribute_TexCoord);
		this.gl.enableVertexAttribArray(this.shaderProgShockWave.attribute_Intensity);
		//Bind Index Buffer
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_ShockWave);

		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.shockWaveTexture);
		this.gl.uniform1i(this.shaderProgShockWave.uniform_Sampler, 0);
		this.gl.drawElements(this.gl.TRIANGLES, this.sfx.swav_num_active * 6, this.gl.UNSIGNED_SHORT, 0); 

		//Clean up
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
	}

	//1. Render Sprites -> :: OFFSCREEN BUFFER 1
	//----------------------------------------------------------------------------------------------------------------------------
	//Turn draw request queues into buffers and batches for the graphics card
	this.createDrawQueueBuffersAndBatches(); 
	//Bind offscreen buffer, set viewport, set and clear buffer with colour & depth. Then set shader program
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.offScreenFrameBuffer[0]);  
	this.gl.viewport(0, 0, this.c_width, this.c_height); 
	this.gl.clearColor(this.clearColour[0], this.clearColour[1], this.clearColour[2], this.clearColour[3]);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); 
	this.gl.useProgram(this.shaderProgSprite); //Attach appropriate vertex and pixel shaders
	//Update camera matrix in shader (Camera Matrix set in step -1 above as used in shockwave)
	this.gl.uniformMatrix4fv(this.shaderProgSprite.uniform_CameraMatrix, false, this.cameraMatrixOrthoSprite); 
	//Bind Vertex Buffer
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer); 
	//Set up shader attributes
	this.gl.vertexAttribPointer(this.shaderProgSprite.attribute_LocalPosition, 2, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_LocalPosition * Float32Array.BYTES_PER_ELEMENT);
	this.gl.vertexAttribPointer(this.shaderProgSprite.attribute_SpritePosition, 3, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_SpritePosition * Float32Array.BYTES_PER_ELEMENT);
	this.gl.vertexAttribPointer(this.shaderProgSprite.attribute_TexCoord, 2, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_TexCoord * Float32Array.BYTES_PER_ELEMENT);
	this.gl.vertexAttribPointer(this.shaderProgSprite.attribute_Rotation, 1, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_Rotation * Float32Array.BYTES_PER_ELEMENT);
	this.gl.vertexAttribPointer(this.shaderProgSprite.attribute_aColour, 4, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_Colour * Float32Array.BYTES_PER_ELEMENT);	
	//Enable attributes
	this.gl.enableVertexAttribArray(this.shaderProgSprite.attribute_LocalPosition);
	this.gl.enableVertexAttribArray(this.shaderProgSprite.attribute_SpritePosition);
	this.gl.enableVertexAttribArray(this.shaderProgSprite.attribute_TexCoord);
	this.gl.enableVertexAttribArray(this.shaderProgSprite.attribute_Rotation);
	this.gl.enableVertexAttribArray(this.shaderProgSprite.attribute_aColour);	
	//Bind Index Buffer
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	//Send each batch for rendering (drawElements - Vertex and Index Buffer)
	for(var batch = 0; batch < this.numDrawBatches_Render; batch++) { 
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[this.drawBatches[batch].tex]);
		this.gl.uniform1i(this.shaderProgSprite.uniform_Sampler, 0);
		this.gl.drawElements(this.gl.TRIANGLES, this.drawBatches[batch].num_indices, this.gl.UNSIGNED_SHORT, this.drawBatches[batch].start_index * 2); //Unsigned short :) .. its a memory pointer not array address so scale by size. 
	}
	//Clean up
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

	//Next few processes use standard quad vertex buffer
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_Quad);

	//2. Post Process -> IF!(BLUR || CRT) ::> BACKBUFFER
	//		ELSE :: OFFSCREEN BUFFER 2
	//		|
	//		*
	//		USE QUALITY LEVEL SHADER
	//----------------------------------------------------------------------------------------------------------------------------
	if(this.cmbActive || this.crtActive) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.offScreenFrameBuffer[1]);
	}
	else {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) //Null points to screen backbuffer
	}
	this.gl.clearColor(this.clearColour[0], this.clearColour[1], this.clearColour[2], this.clearColour[3]);	
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.viewport(0, 0, this.c_width, this.c_height);

	switch(this.sfx.quality) { 
		case "Max":
		 	this.gl.useProgram(this.shaderProgPostProcess_Max);
		 	//Attribute set
			this.gl.vertexAttribPointer(this.shaderProgPostProcess_Max.attribute_VertexPosition, 2, this.gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
			this.gl.vertexAttribPointer(this.shaderProgPostProcess_Max.attribute_TexCoord, 2, this.gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 8);
			//Attribute Enable
			this.gl.enableVertexAttribArray(this.shaderProgPostProcess_Max.attribute_VertexPosition);
			this.gl.enableVertexAttribArray(this.shaderProgPostProcess_Max.attribute_TexCoord);
			//Uniforms
			this.gl.uniform4f(this.shaderProgPostProcess_Max.uniform_baseColour, this.basePPColour[0], this.basePPColour[1], this.basePPColour[2], this.basePPColour[3]);
			this.gl.uniform4f(this.shaderProgPostProcess_Max.uniform_mixColour_Current, this.sfx.effectState_Init.mixColour[0], this.sfx.effectState_Init.mixColour[1], this.sfx.effectState_Init.mixColour[2], this.sfx.effectState_Init.mixColour[3]);
			this.gl.uniform4f(this.shaderProgPostProcess_Max.uniform_mixColour_Next, this.sfx.effectState_Target.mixColour[0], this.sfx.effectState_Target.mixColour[1], this.sfx.effectState_Target.mixColour[2], this.sfx.effectState_Target.mixColour[3]);
			this.gl.uniform4f(this.shaderProgPostProcess_Max.uniform_effects_Current, this.sfx.effectState_Init.effects[0], this.sfx.effectState_Init.effects[1], this.sfx.effectState_Init.effects[2], this.sfx.effectState_Init.effects[3]);
			this.gl.uniform4f(this.shaderProgPostProcess_Max.uniform_effects_Next, this.sfx.effectState_Target.effects[0], this.sfx.effectState_Target.effects[1], this.sfx.effectState_Target.effects[2], this.sfx.effectState_Target.effects[3]);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_effects_Blend, this.shaderEffectsBlend);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_pixellateDivX, this.pixellate_Divions_X);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_pixellateDivY, this.pixellate_Divions_Y);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_scratch, this.sfx.shader_movie_scratch);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_noise, this.sfx.shader_movie_noise);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_rndLine1, this.sfx.shader_movie_rndLine1);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_rndLine2, this.sfx.shader_movie_rndLine2);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_frame, this.sfx.shader_movie_frame);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_cpuShift, this.sfx.shader_movie_cpuShift);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_rndShiftCutOff, this.sfx.shader_movie_rndShiftCutOff);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_rndShiftCutOff, this.sfx.shader_movie_rndShiftCutOff);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_rndShiftScalar, this.sfx.shader_movie_rndShiftScalar);
			this.gl.uniform1f(this.shaderProgPostProcess_Max.uniform_dim, this.sfx.shader_movie_dim);
			if(this.sfx.effectState_Init.oldmovie) {
				this.gl.uniform1i(this.shaderProgPostProcess_Max.uniform_oldmovie_Current, 1);
			}
			else {
				this.gl.uniform1i(this.shaderProgPostProcess_Max.uniform_oldmovie_Current, 0);
			}
			if(this.sfx.effectState_Target.oldmovie) {
				this.gl.uniform1i(this.shaderProgPostProcess_Max.uniform_oldmovie_Next, 1);
			}
			else {
				this.gl.uniform1i(this.shaderProgPostProcess_Max.uniform_oldmovie_Next, 0);
			}
			//Texture, sampler, draw
			this.gl.activeTexture(this.gl.TEXTURE0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.offScreenTexture[0]);
			this.gl.uniform1i(this.shaderProgPostProcess_Max.uniform_TextureSampler, 0);
			this.gl.activeTexture(this.gl.TEXTURE1);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.noisetexture);
			this.gl.uniform1i(this.shaderProgPostProcess_Max.uniform_NoiseSampler, 1);
			this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
			break;

		case "Med":
		 	this.gl.useProgram(this.shaderProgPostProcess_Med);
		 	//Attribute set
			this.gl.vertexAttribPointer(this.shaderProgPostProcess_Med.attribute_VertexPosition, 2, this.gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
			this.gl.vertexAttribPointer(this.shaderProgPostProcess_Med.attribute_TexCoord, 2, this.gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 8);
			//Attribute Enable
			this.gl.enableVertexAttribArray(this.shaderProgPostProcess_Med.attribute_VertexPosition);
			this.gl.enableVertexAttribArray(this.shaderProgPostProcess_Med.attribute_TexCoord);
			//Uniforms
			this.gl.uniform4f(this.shaderProgPostProcess_Med.uniform_baseColour, this.basePPColour[0], this.basePPColour[1], this.basePPColour[2], this.basePPColour[3]);
			this.gl.uniform4f(this.shaderProgPostProcess_Med.uniform_mixColour_Current, this.sfx.effectState_Init.mixColour[0], this.sfx.effectState_Init.mixColour[1], this.sfx.effectState_Init.mixColour[2], this.sfx.effectState_Init.mixColour[3]);
			this.gl.uniform4f(this.shaderProgPostProcess_Med.uniform_mixColour_Next, this.sfx.effectState_Target.mixColour[0], this.sfx.effectState_Target.mixColour[1], this.sfx.effectState_Target.mixColour[2], this.sfx.effectState_Target.mixColour[3]);
			this.gl.uniform4f(this.shaderProgPostProcess_Med.uniform_effects_Current, this.sfx.effectState_Init.effects[0], this.sfx.effectState_Init.effects[1], this.sfx.effectState_Init.effects[2], this.sfx.effectState_Init.effects[3]);
			this.gl.uniform4f(this.shaderProgPostProcess_Med.uniform_effects_Next, this.sfx.effectState_Target.effects[0], this.sfx.effectState_Target.effects[1], this.sfx.effectState_Target.effects[2], this.sfx.effectState_Target.effects[3]);
			this.gl.uniform1f(this.shaderProgPostProcess_Med.uniform_effects_Blend, this.shaderEffectsBlend);
			this.gl.uniform1f(this.shaderProgPostProcess_Med.uniform_pixellateDivX, this.pixellate_Divions_X);
			this.gl.uniform1f(this.shaderProgPostProcess_Med.uniform_pixellateDivY, this.pixellate_Divions_Y);

			//Texture, sampler, draw
			this.gl.activeTexture(this.gl.TEXTURE0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.offScreenTexture[0]);
			this.gl.uniform1i(this.shaderProgPostProcess_Max.uniform_TextureSampler, 0);
			this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
			break;

		case "Min":
		 	this.gl.useProgram(this.shaderProgPostProcess_Min);
		 	//Attribute set
			this.gl.vertexAttribPointer(this.shaderProgPostProcess_Min.attribute_VertexPosition, 2, this.gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
			this.gl.vertexAttribPointer(this.shaderProgPostProcess_Min.attribute_TexCoord, 2, this.gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 8);
			//Attribute Enable
			this.gl.enableVertexAttribArray(this.shaderProgPostProcess_Min.attribute_VertexPosition);
			this.gl.enableVertexAttribArray(this.shaderProgPostProcess_Min.attribute_TexCoord);
			//Uniforms
			this.gl.uniform4f(this.shaderProgPostProcess_Min.uniform_baseColour, this.basePPColour[0], this.basePPColour[1], this.basePPColour[2], this.basePPColour[3]);
			this.gl.uniform4f(this.shaderProgPostProcess_Min.uniform_mixColour, this.sfx.effectState_Init.mixColour[0], this.sfx.effectState_Init.mixColour[1], this.sfx.effectState_Init.mixColour[2], this.sfx.effectState_Init.mixColour[3]);
			this.gl.uniform4f(this.shaderProgPostProcess_Min.uniform_effects, this.sfx.effectState_Init.effects[0], this.sfx.effectState_Init.effects[1], this.sfx.effectState_Init.effects[2], this.sfx.effectState_Init.effects[3]);
			
			//Texture, sampler, draw
			this.gl.activeTexture(this.gl.TEXTURE0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.offScreenTexture[0]);
			this.gl.uniform1i(this.shaderProgPostProcess_Max.uniform_TextureSampler, 0);
			this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
			break;
	}
	//Clean up
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);	

	//3. (IF !RENDER OVER EFFECTS) GUI -> ON SAME SURFACE AS ABOVE
	//----------------------------------------------------------------------------------------------------------------------------
	if(!this.sfx.renderGUIOverEffects) {

		this.gl.clear(this.gl.DEPTH_BUFFER_BIT); //Depth clear only (viewport also unchanged)
		this.gl.useProgram(this.shaderProgGUI);
		
		this.gl.uniformMatrix4fv(this.shaderProgGUI.uniform_CameraMatrix, false, this.cameraMatrixOrthoGUI); 
		this.gl.uniform4f(this.shaderProgGUI.uniform_baseGUIColour, this.baseGUIColour[0], this.baseGUIColour[1], this.baseGUIColour[2], this.baseGUIColour[3]);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		
		this.gl.vertexAttribPointer(this.shaderProgGUI.attribute_LocalPosition, 2, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_LocalPosition * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgGUI.attribute_SpritePosition, 3, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_SpritePosition * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgGUI.attribute_TexCoord, 2, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_TexCoord * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgGUI.attribute_Rotation, 1, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_Rotation * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgGUI.attribute_aColour, 4, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_Colour * Float32Array.BYTES_PER_ELEMENT);	
		
		this.gl.enableVertexAttribArray(this.shaderProgGUI.attribute_LocalPosition);
		this.gl.enableVertexAttribArray(this.shaderProgGUI.attribute_SpritePosition);
		this.gl.enableVertexAttribArray(this.shaderProgGUI.attribute_TexCoord);
		this.gl.enableVertexAttribArray(this.shaderProgGUI.attribute_Rotation);
		this.gl.enableVertexAttribArray(this.shaderProgGUI.attribute_aColour);	
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		
		for(var batch = this.numDrawBatches_Render; batch < this.numDrawBatches; batch++) { 
			this.gl.activeTexture(this.gl.TEXTURE0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[this.drawBatches[batch].tex]);
			this.gl.uniform1i(this.shaderProgGUI.uniform_Sampler, 0);
			this.gl.drawElements(this.gl.TRIANGLES, this.drawBatches[batch].num_indices, this.gl.UNSIGNED_SHORT, this.drawBatches[batch].start_index * 2); //Duh, unsigned short :) .. its a memory pointer not array address so scale by size
		}
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);	
	}

	//4. IF(COMBINE)
	//	COMBINE -> LAST ALTERNATING & OFF SCREEN 2 ::> NEW ALTERNATING
	//----------------------------------------------------------------------------------------------------------------------------
	if(allowCombineEffects && this.cmbActive) {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_Quad);

		//Limit input to blur 
		this.blurvalue = [this.bluramount];
		if(this.blurvalue[0] < 0.0)
			this.blurvalue[0] = 0.0;
		if(this.blurvalue[0] >= 1.0)
			this.blurvalue[0] = 0.99999; //1.0 makes no sense :)
		if(!this.waslastframealternating) {
			this.blurvalue[0] = 0.0;
		}
		
		//Bind frame buffer
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.alternatingFrameBuffer[this.alternating_buffer]);  
		this.gl.viewport(0, 0, this.c_width, this.c_height); 
		this.gl.clearColor(this.clearColour[0], this.clearColour[1], this.clearColour[2], this.clearColour[3]);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); 
		//Set shader program
		this.gl.useProgram(this.shaderProgCombine);
		//Attribute set
		this.gl.vertexAttribPointer(this.shaderProgCombine.attribute_VertexPosition, 2, this.gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
		this.gl.vertexAttribPointer(this.shaderProgCombine.attribute_TexCoord, 2, this.gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 8);
		//Attribute Enable
		this.gl.enableVertexAttribArray(this.shaderProgCombine.attribute_VertexPosition);
		this.gl.enableVertexAttribArray(this.shaderProgCombine.attribute_TexCoord);
		//Uniforms, including textures and samplers
		this.gl.uniform1fv(this.shaderProgCombine.uniform_Blur, this.blurvalue);
		this.blurtoggles = [0.0, 0.0];
		if(this.sfx.blur_isTwoStage) {
			this.blurtoggles[0] = 1.0;
		}
		if(this.sfx.blur_isTint) {
			this.blurtoggles[1] = 1.0;
		}
		this.gl.uniform2f(this.shaderProgCombine.uniform_BlurToggles, this.blurtoggles[0], this.blurtoggles[1]);
		this.gl.uniform1f(this.shaderProgCombine.uniform_TwoStageShare, this.sfx.blur_TwoStageShare);
		this.gl.uniform1fv(this.shaderProgCombine.uniform_Blur, this.blurvalue);
		//Textures depend on which alternating background has been used last
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.offScreenTexture[1]);
		this.gl.uniform1i(this.shaderProgCombine.uniform_SamplerNew, 0);
		this.gl.activeTexture(this.gl.TEXTURE1);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.alternatingTexture[1 - this.alternating_buffer]);
		this.gl.uniform1i(this.shaderProgCombine.uniform_SamplerOld, 1);
		//Draw it
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
	}

	//5. IF(CRT) -> 	IF(COMBINE) Take NEW ALTERNATING ::> BACKBUFFER
	//					or Take Take OFF SCREEN 2 ::> BACKBUFFER
	//----------------------------------------------------------------------------------------------------------------------------
	if(allowCRT && this.crtActive) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) //Null points to screen backbuffer
		this.gl.clearColor(this.clearColour_CRT[0], this.clearColour_CRT[1], this.clearColour_CRT[2], this.clearColour_CRT[3]);	
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.viewport(0, 0, this.c_width, this.c_height);

		this.gl.useProgram(this.shaderProgCRT); //Attach appropriate vertex and pixel shaders
		//Vertex and Index Buffers
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_CRT); 
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_CRT);
		//Uniforms
		this.gl.uniformMatrix4fv(this.shaderProgCRT.uniform_MVMatrix, false, this.CRT_Matrix_MV); 
		this.gl.uniformMatrix4fv(this.shaderProgCRT.uniform_PMatrix, false, this.CRT_Matrix_P); 
		this.gl.uniform1f(this.shaderProgCRT.uniform_ShadowMaskIntensity, this.sfx.crt_shadowMaskIntensity);
		
		this.crttoggles = [0.0, 0.0, 0.0];
		if(this.sfx.crt_isShadowMask) {
			this.crttoggles[0] = 1.0;
			if(this.sfx.crt_shadowMaskIntensity < 0.0001) {
				this.crt_shadowMaskIntensity = 0.0001;
			}
			this.gl.uniform1f(this.shaderProgCRT.uniform_ShadowMaskSizeScaler, 1.0 / this.sfx.crt_shadowMaskSizeScalar);
		}
		if(this.sfx.crt_isBrightnessMultiplier) {
			this.crttoggles[1] = 1.0;
			if(this.sfx.crt_brightnessScalar < 0.0) {
				this.crt_brightnessScalar = 0.0;
			}
			this.gl.uniform1f(this.shaderProgCRT.uniform_BrightnessMultiplier, this.sfx.crt_brightnessScalar);
		}

		if(this.sfx.crt_isLighting) {
			this.crttoggles[2] = 1.0;
			this.gl.uniformMatrix3fv(this.shaderProgCRT.uniform_NMatrix, false, this.CRT_Matrix_N); 
			this.gl.uniform3fv(this.shaderProgCRT.uniform_PointLightPosition, this.sfx.pointLightPosition);
			this.gl.uniform3fv(this.shaderProgCRT.uniform_PointLightColour, this.sfx.pointLightColour);
			this.gl.uniform3fv(this.shaderProgCRT.uniform_AmbientColour, this.sfx.ambientColour);
			this.gl.uniform3fv(this.shaderProgCRT.uniform_CameraPosition, this.CRT_camera_position);
			this.gl.uniform1f(this.shaderProgCRT.uniform_SpecularShininess, this.sfx.specularShininess);
		}

		this.gl.uniform3f(this.shaderProgCRT.uniform_CrtToggles, this.crttoggles[0], this.crttoggles[1], this.crttoggles[2]);
		//Set up attributes
		this.gl.vertexAttribPointer(this.shaderProgCRT.attribute_VertexPosition, 3, this.gl.FLOAT, false, this.crt_vertex_size_in_bytes, this.offset_CRT_Position * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgCRT.attribute_VertexNormal, 3, this.gl.FLOAT, false, this.crt_vertex_size_in_bytes, this.offset_CRT_Normal * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgCRT.attribute_TexCoord, 2, this.gl.FLOAT, false, this.crt_vertex_size_in_bytes, this.offset_CRT_TexCoord* Float32Array.BYTES_PER_ELEMENT);
		//Enable attributes
		this.gl.enableVertexAttribArray(this.shaderProgSprite.attribute_VertexPosition);
		this.gl.enableVertexAttribArray(this.shaderProgSprite.attribute_VertexNormal);
		this.gl.enableVertexAttribArray(this.shaderProgSprite.attribute_TexCoord);
		//Hook up the texture
		this.gl.activeTexture(this.gl.TEXTURE0);
		if(allowCombineEffects && this.cmbActive) {
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.alternatingTexture[this.alternating_buffer]);
		}
		else {
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.offScreenTexture[1]);
		}

		if(this.sfx.crt_isShadowMask) {
			//Shadow mask texture
			this.gl.activeTexture(this.gl.TEXTURE1);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures["shadowmask"]);
		}

		//Set the sampler
		this.gl.uniform1i(this.shaderProgCRT.uniform_SamplerMain, 0);
		this.gl.uniform1i(this.shaderProgCRT.uniform_SamplerShadowMask, 1);
		//Draw
		this.gl.drawElements(this.gl.TRIANGLES, this.num_indices_CRT, this.gl.UNSIGNED_SHORT,0); 
	}

	//6. (IF RENDER OVER EFFECTS) GUI -> ON SAME SURFACE AS ABOVE
	//----------------------------------------------------------------------------------------------------------------------------
	if(this.sfx.renderGUIOverEffects) {

		this.gl.clear(this.gl.DEPTH_BUFFER_BIT); //Depth clear only (viewport also unchanged)
		this.gl.useProgram(this.shaderProgGUI);
		
		this.gl.uniformMatrix4fv(this.shaderProgGUI.uniform_CameraMatrix, false, this.cameraMatrixOrthoGUI); 
		this.gl.uniform4f(this.shaderProgGUI.uniform_baseGUIColour, this.baseGUIColour[0], this.baseGUIColour[1], this.baseGUIColour[2], this.baseGUIColour[3]);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		
		this.gl.vertexAttribPointer(this.shaderProgGUI.attribute_LocalPosition, 2, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_LocalPosition * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgGUI.attribute_SpritePosition, 3, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_SpritePosition * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgGUI.attribute_TexCoord, 2, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_TexCoord * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgGUI.attribute_Rotation, 1, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_Rotation * Float32Array.BYTES_PER_ELEMENT);
		this.gl.vertexAttribPointer(this.shaderProgGUI.attribute_aColour, 4, this.gl.FLOAT, false, this.vertexSizeInBytes, this.offset_Colour * Float32Array.BYTES_PER_ELEMENT);	
		
		this.gl.enableVertexAttribArray(this.shaderProgGUI.attribute_LocalPosition);
		this.gl.enableVertexAttribArray(this.shaderProgGUI.attribute_SpritePosition);
		this.gl.enableVertexAttribArray(this.shaderProgGUI.attribute_TexCoord);
		this.gl.enableVertexAttribArray(this.shaderProgGUI.attribute_Rotation);
		this.gl.enableVertexAttribArray(this.shaderProgGUI.attribute_aColour);	
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		
		for(var batch = this.numDrawBatches_Render; batch < this.numDrawBatches; batch++) { 
			this.gl.activeTexture(this.gl.TEXTURE0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[this.drawBatches[batch].tex]);
			this.gl.uniform1i(this.shaderProgGUI.uniform_Sampler, 0);
			this.gl.drawElements(this.gl.TRIANGLES, this.drawBatches[batch].num_indices, this.gl.UNSIGNED_SHORT, this.drawBatches[batch].start_index * 2); //Duh, unsigned short :) .. its a memory pointer not array address so scale by size
		}
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);	
	}

	//7. SWAP BUFFERS IF (COMBINE)
	//----------------------------------------------------------------------------------------------------------------------------
	//Toggle again for CRT
	if(allowCombineEffects) {
		this.waslastframealternating = this.cmbActive;
		if(this.cmbActive) {
			if(this.alternating_buffer == 0)
				this.alternating_buffer = 1;
			else
				this.alternating_buffer = 0;
		}
	}
}

graphicsObject.prototype.createCRTMesh_Indices = function() {
	var indices = [];
	this.num_indices_CRT = 0;
	var one, two, three, this_base, next_base;
	for(var v = 0; v < this.crt_divs_per_axis - 1; v++) {
		for(h = 0 ; h < this.crt_divs_per_axis - 1; h++) {
			this_base = v * this.crt_divs_per_axis;
			next_base = (v + 1) * this.crt_divs_per_axis;
			//Tri - One
			indices[this.num_indices_CRT] = this_base + h;
			this.num_indices_CRT++;
			indices[this.num_indices_CRT] = this_base + h + 1;
			this.num_indices_CRT++;
			indices[this.num_indices_CRT] = next_base + h;
			this.num_indices_CRT++;
			//Tri - Two
			indices[this.num_indices_CRT] = next_base + h;
			this.num_indices_CRT++;
			indices[this.num_indices_CRT] = this_base + h + 1;
			this.num_indices_CRT++;
			indices[this.num_indices_CRT] = next_base + h + 1;
			this.num_indices_CRT++;
		}
	}
	return indices;
}

graphicsObject.prototype.calcOrthogonalCameraMatrix = function() {
	//-1. Create the Camera Matrices used in steps 0 and 1
	//----------------------------------------------------------------------------------------------------------------------------
	//Create sprite camera (ortho graphics), changes each frame hence update in this loop
	//CameraMatrix = Ortho * RotateZ * Translate 
	//The Matrix Multiplication is counter intuative order :)
	//Ortho Projection
	this.o_left = -this.c_halfwidth * this.camera_one_over_zoom;
	this.o_right = this.c_halfwidth * this.camera_one_over_zoom;
	this.o_top = this.c_halfheight * this.camera_one_over_zoom;
	this.o_bottom = -this.c_halfheight * this.camera_one_over_zoom;
	this.cameraMatrixOrthoSprite = mat4.ortho(this.o_left, this.o_right, this.o_bottom, this.o_top, 0.0, 1.0);
	//Rotation around Z
	this.o_rotation = this.deg2rads * this.camera_rotation;
	this.cameraMatrixOrthoSprite = mat4.rotateZ(this.cameraMatrixOrthoSprite, this.o_rotation);
	//Translation
	translate[0] = -this.camera_x;
	translate[1] = -this.camera_y;
	translate[2] = 0.0;
	this.cameraMatrixOrthoSprite = mat4.translate(this.cameraMatrixOrthoSprite, vec3.create(translate));
}

graphicsObject.prototype.renderShockWaveGradient = function() {
	this.updateShockWaveBuffer(); //this actually double checks the above bools, but leave for now TO DO::
	//Bind Shock Wave Frame Buffer
	this.gl.bindFrameBuffer(this.gl.FRAMEBUFFER, this.shockWaveFrameBuffer);
	this.gl.viewport(0, 0, this.shockWaveWidth, this.shockWaveHeight); 
	this.gl.clearColor(this.shockWaveClearColour[0], this.shockWaveClearColour[1], this.shockWaveClearColour[2], this.shockWaveClearColour[3]);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); 
	this.gl.useProgram(this.shaderProgShockWave); //Attach vertex and pixel shaders
	//Update camera matrix
	this.gl.uniformMatrix4fv(this.shaderProgShockWave.uniform_CameraMatrix, false, this.cameraMatrixOrthoSprite); 
	//Bind Vertex Buffer
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_ShockWave); 
	//Set up shader attributes
	this.gl.vertexAttribPointer(this.shaderProgShockWave.attribute_Position, 2, this.gl.FLOAT, false, this.swVertexSizeInBytes, this.swav_offset_Pos * Float32Array.BYTES_PER_ELEMENT);
	this.gl.vertexAttribPointer(this.shaderProgShockWave.attribute_TexCoord, 2, this.gl.FLOAT, false, this.swVertexSizeInBytes, this.swav_offset_Tex * Float32Array.BYTES_PER_ELEMENT);
	this.gl.vertexAttribPointer(this.shaderProgShockWave.attribute_Intensity, 1, this.gl.FLOAT, false, this.swVertexSizeInBytes, this.swav_offset_Int * Float32Array.BYTES_PER_ELEMENT);
	//Enable attributes
	this.gl.enableVertexAttribArray(this.shaderProgShockWave.attribute_Position);
	this.gl.enableVertexAttribArray(this.shaderProgShockWave.attribute_TexCoord);
	this.gl.enableVertexAttribArray(this.shaderProgShockWave.attribute_Intensity);
	//Bind Index Buffer
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_ShockWave);

	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.shockWaveTexture);
	this.gl.uniform1i(this.shaderProgShockWave.uniform_Sampler, 0);
	this.gl.drawElements(this.gl.TRIANGLES, this.sfx.swav_num_active * 6, this.gl.UNSIGNED_SHORT, 0); 

	//Clean up
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
}

graphicsObject.prototype.createCRTMesh_Vertices= function() {

	//Number of floats required per vertex (3 position, 3 normal, 2 tex coords)
	this.crt_vertex_size_in_floats = 8;
	this.crt_vertex_size_in_bytes = this.crt_vertex_size_in_floats * Float32Array.BYTES_PER_ELEMENT;

	this.offset_CRT_Position = 0;
	this.offset_CRT_Normal = 3;
	this.offset_CRT_TexCoord = 6;

	//CRT Mesh created by taking a patch of a sphere's surface area and modifying it a bit

	//Curvative of 0 does not work in these calcs so avoid
	if(this.sfx.crt_curvature < 0.1) {
		this.sfx.crt_curvature = 0.1;
	}
	if(this.sfx.crt_curvature > 1.0) {
		this.sfx.crt_curvature = 1.0;
	}

	this.crt_angular_range = Math.PI * this.sfx.crt_curvature;
	this.crt_half_angular_range = 0.5 * this.crt_angular_range;
	this.crt_divs_per_axis = this.sfx.crt_mesh_num_divs;

	//Array of floats is: posx, posy, posz, normx, normy, normz, texx, texy
	var verts = [];
	var numVerts = 0;

	/*
	SPHERICAL COORDINATES - CREATE SURFACE PATCH
	R is 1 (and so we ignore - as we create a mesh then scale it to a 1:1 box before scaling to final size for render)
	Coordinate System Here is RHS, Y Vertical.
	V = Vertical Angle (around horizontal X axis)
	H = Horizontal Angle (around vertical Y axis)

	z = R.Sin(V).Cos(H)
	x = R.Sin(V).Sin(H)
	y = R.Cos(V)
	*/

	//Some working variables
	var z_min, z_max, x_max, x_min, y_max, y_min;
	var  V, H;

	//Find the eventual extremities so can scale to 1.1.1 box

	//MIN ANGLE
	H = -this.crt_half_angular_range;
	V = (0.5 * Math.PI) - this.crt_half_angular_range;
	//z_min = Math.sin(V) * Math.cos(H);
	x_min = Math.sin(0.5 * Math.PI) * Math.sin(H);
	y_max = Math.cos(V);
	//MAX ANGLE
	H = this.crt_half_angular_range;
	V = (0.5 * Math.PI) + this.crt_half_angular_range;

	x_max = Math.sin(0.5 * Math.PI) * Math.sin(H);
	y_min = Math.cos(V);
	//NO ANGLE
	H = 0.0
	V = 0.5 * Math.PI;
	//z_max = Math.sin(V) * Math.cos(H);
	
	var x_scalar = 1.0 / (x_max - x_min);
	var y_scalar = 1.0 / (y_max - y_min);
	//var z_scalar = 1.0 / (z_max - z_min);

	//Curved corners
	var corner_radius = 0.5 * this.sfx.crt_edge_curvature; //The tweakable variable is 0 to 1. but the max corner circle radius of a 1x1 square is 0.5, hence the scale here

	//More working variables
	var x, y, z, nx, ny, nz, tx, ty;
	var frac_x, frac_y,sinH, sinV, cosH, cosV, length;
	for(var v = 0; v < this.crt_divs_per_axis; v++) {
		for(var h = 0; h < this.crt_divs_per_axis; h++) {

			frac_x = h / (this.crt_divs_per_axis - 1);
			frac_y = v / (this.crt_divs_per_axis - 1);

			//Modify the fraction if it is within the corner radius range
			//Top Corners
			if(frac_y <= corner_radius) {
				var adjacent = corner_radius - frac_y;
				var opposite = Math.sqrt((corner_radius * corner_radius) - (adjacent * adjacent));
				var delta = corner_radius - opposite;
				//We assume here that for small angles for sphere of radius one, that one unit of length = same change in angle (rads)
				//So we adjust the frac_x range
				frac_x = delta + (frac_x * (1.0 - (2.0 * delta)));
			}
			//Bottom Corners
			if(frac_y > 1.0 - corner_radius) {
				var adjacent = corner_radius - (1.0 - frac_y);
				var opposite = Math.sqrt((corner_radius * corner_radius) - (adjacent * adjacent));
				var delta = corner_radius - opposite;
				//We assume here that for small angles for sphere of radius one, that one unit of length = same change in angle (rads)
				//So we adjust the frac_x range
				frac_x = delta + (frac_x * (1.0 - (2.0 * delta)));
			}

			H = -this.crt_half_angular_range + (frac_x * this.crt_angular_range);
			V = (0.5 * Math.PI) - this.crt_half_angular_range + (frac_y * this.crt_angular_range);

			sinH = Math.sin(H);
			cosH = Math.cos(H);

			sinV = Math.sin(V);
			cosV = Math.cos(V);

			//Position
			z = sinV * cosH;
			x = sinV * sinH;
			y = cosV;

			z *= this.sfx.crt_depth;
			x *= x_scalar;
			y *= y_scalar;

			//Normals
			nz = z;
			nx = x;
			ny = y;

			//Normalise
			length = Math.sqrt((x * x) + (y * y) + (z * z));
			nz /= length;
			nx /= length;
			ny /= length;

			
			//The extra scaling above means the length is not 1, so this wasn't need to check in the end
			/*
			console.log("XYZ:" + x + "," + y + "," + z + 
						" | length: " + length 
						+ " | normalXYZ:" + nx + "," + ny + "," + nz);
			*/

			//Tex Coord (TEMP TO DO::)
			tx = frac_x;
			ty = (1.0 - frac_y); //Open GL Tex Coords are 0,0 at the bottom left(!)

			//Store in array
			verts[numVerts] = x;
			numVerts++;
			verts[numVerts] = y;
			numVerts++;
			verts[numVerts] = z;
			numVerts++;
			verts[numVerts] = nx;
			numVerts++;
			verts[numVerts] = ny;
			numVerts++;
			verts[numVerts] = nz;
			numVerts++;
			verts[numVerts] = tx;
			numVerts++;
			verts[numVerts] = ty;
			numVerts++;

			//console.log(z + "," + x + "," + y);
		}
	}
	return verts;
}

//Render Pipeline Helpers - Process draw requests queues, buffers and batches
//---------------------------------------------------------------------------------------------
//All of the required vertices and indices are loaded into their respective buffers in one shot
//The batches, which trigger seperately rendering passes are needed so that the active texture can be switched
//These batches tell the rendering which parts of the buffers to use for each draw 
graphicsObject.createShockWaveDrawBuffer = function() {
	if(!allowShockWave) {
		return;
	}

	this.swVertexSizeInFloats = 5; //x, y, tx, ty, i
	this.swVertexSizeInBytes = this.swVertexSizeInFloats * Float32Array.BYTES_PER_ELEMENT;
	this.swav_Vertices = new ArrayBuffer(this.sfx.swav_max_number * 4 * this.swVertexSizeInBytes); //4 vertices per shockwave
	//Create views into the buffer
	this.swav_ViewPosition = new Float32Array(this.swav_Vertices);
	this.swav_ViewTexCoord = new Float32Array(this.swav_Vertices);
	this.swav_ViewIntensity = new Float32Array(this.swav_Vertices);
	//Offset in floats
	this.swav_offset_Pos = 0;
	this.swav_offset_Tex = 2;
	this.swav_offset_Int = 4;
	//Index Buffer
	this.swav_Indices = new Uint16Array(6 * this.sfx.swav_max_number);
	//This never changes, so we can fill this array with data already (TO DO and set the buffer info here already?)
	var i_count;
	var v_count;
	for(var s = 0; s < this.sfx.swav_max_number) {
		i_count = s * 6;
		v_count = s * 4;
		//0,1,2,2,1,3
		this.swav_Indices[count + 0] = v_count + 0;
		this.swav_Indices[count + 1] = v_count + 1;
		this.swav_Indices[count + 2] = v_count + 2;
		this.swav_Indices[count + 3] = v_count + 2;
		this.swav_Indices[count + 4] = v_count + 1;
		this.swav_Indices[count + 5] = v_count + 3;
	}	
	//Fill up Index Buffer
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_ShockWave);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.swav_Indices, this.gl.STATIC_DRAW);
	//Clean up
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null); 
}

graphicsObject.prototype.updateShockWaveBuffer = function() {
	if(!allowShockWave || this.sfx.swav_num_active === 0) {
		return;
	}

	this.vCount = 0;
	for(var i = 0; i < this.sfx.swav_max_number; i++) { 
		if(this.sfx.swav_active[i] === 1) {	
			for(var idx = 0; idx < 4; idx++) { 					
				this.fOffset = this.swVertexSizeInFloats * this.vCount;								

				this.sx = this.sfx.swav_x[i];
				this.sy = this.sfx.swav_y[i];

				this.halfs = 0.5 * this.sfx.swav_s[i];

				if(this.sfx.swav_is_screen_space[i] === 1) { 
					var pos = new vec2(this.sx, this.sy);
					pos = this.returnWorldPoint(pos);
					this.sx = pos.x;
					this.sy = pos.y;
					this.halfs *= this.camera_one_over_zoom;
				}

				//Position
				switch(idx) { 
					case 0:
						this.swav_ViewPosition[this.fOffset + this.swav_offset_Pos + 0] = this.sx - this.halfs;
						this.swav_ViewPosition[this.fOffset + this.swav_offset_Pos + 1] = this.sy + this.halfs;
					break;
					case 1:
						this.swav_ViewPosition[this.fOffset + this.swav_offset_Pos + 0] = this.sx + this.halfs;
						this.swav_ViewPosition[this.fOffset + this.swav_offset_Pos + 1] = this.sy + this.halfs;
					break;
					case 2:
						this.swav_ViewPosition[this.fOffset + this.swav_offset_Pos + 0] = this.sx - this.halfs;
						this.swav_ViewPosition[this.fOffset + this.swav_offset_Pos + 1] = this.sy - this.halfs;
					break;
					case 3:
						this.swav_ViewPosition[this.fOffset + this.swav_offset_Pos + 0] = this.sx + this.halfs;
						this.swav_ViewPosition[this.fOffset + this.swav_offset_Pos + 1] = this.sy - this.halfs;
					break;			
				}
				
				//TexCoord
				switch(idx) { 
					case 0:
						this.swav_ViewTexCoord[this.fOffset + this.swav_offset_Tex + 0] =  0.0;
						this.swav_ViewTexCoord[this.fOffset + this.swav_offset_Tex + 1] =  0.0;
					break;
					case 1:
						this.swav_ViewTexCoord[this.fOffset + this.swav_offset_Tex + 0] =  1.0;
						this.swav_ViewTexCoord[this.fOffset + this.swav_offset_Tex + 1] =  0.0;
					break;
					case 2:
						this.swav_ViewTexCoord[this.fOffset + this.swav_offset_Tex + 0] =  0.0;
						this.swav_ViewTexCoord[this.fOffset + this.swav_offset_Tex + 1] =  1.0;
					break;
					case 3:
						this.swav_ViewTexCoord[this.fOffset + this.swav_offset_Tex + 0] =  1.0;
						this.swav_ViewTexCoord[this.fOffset + this.swav_offset_Tex + 1] =  1.0;
					break;			
				}
				
				//Rotation
				this.swav_ViewIntensity[this.fOffset + this.swav_offset_Int] =  this.sfx.swav_i[i];
				
				this.vCount++;
				if(this.vCount === this.sfx.swav_num_active) {
					i = this.sfx.swav_max_number;
				}
			}
		}
	}

	//Fill up Buffer
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_ShockWave);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, this.swav_Vertices, this.gl.DYNAMIC_DRAW);
	//Clean up
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
}


graphicsObject.prototype.createDrawQueueBuffersAndBatches = function() { 
	if(this.numDrawRequests == 0 && this.numDrawGUIRequests == 0) { 
		return;
	}

	if(this.numDrawRequests > 0) { 
		this.sortRequests();
	}
	
	if(this.numDrawGUIRequests > 0) { 
		this.sortGUIRequests();
	}
	//Vertex Buffer
	//12 Floats: LocalX, LocalY, SpriteX, SpriteY, SpriteD, TexX, TexY, Rotation, R, G, B, A
	//Size of one vertex
	//4 vertices per draw request
	this.vertexSizeInFloats = 12;
	this.vertexSizeInBytes = this.vertexSizeInFloats * Float32Array.BYTES_PER_ELEMENT;
	//Create buffer of correct size
	var vertices = new ArrayBuffer((this.numDrawRequests + this.numDrawGUIRequests) * 4 * this.vertexSizeInBytes);
	//Map buffer to different arrays to enable access to the data
	//TO DO :: Pull this array creation each frame out to just a max size (could also check device caps here). Then just use what need each frame
	var view_LocalPosition = new Float32Array(vertices);
	var view_SpritePosition = new Float32Array(vertices);
	var view_TexCoord = new Float32Array(vertices);
	var view_Rotation = new Float32Array(vertices);
	var view_Colour = new Float32Array(vertices);
	
	//Just for debug could just use any of the ones above, but to avoid confusion...
	var VIEW = new Float32Array(vertices);
	
	//Offset in floats
	this.offset_LocalPosition = 0;
	this.offset_SpritePosition = 2;
	this.offset_TexCoord = 5;
	this.offset_Rotation = 7;
	this.offset_Colour = 8;
	
	//Index Buffer
	var indices = new Uint16Array(6 * (this.numDrawRequests + this.numDrawGUIRequests));
	
	var vertexCount = 0;
	var offsetInFloats = 0;

	var current_texture = "";
	var last_batch_end_index = -1;

	//Fill buffers
	var vertexCount = 0;
	
	for(var i = 0; i < this.numDrawRequests; i++) { 
		//Index Data
		indices[(i * 6)] = vertexCount + 0;
		indices[(i * 6)+ 1] = vertexCount + 1;
		indices[(i * 6) + 2] = vertexCount + 2;
		indices[(i * 6) + 3] = vertexCount + 2;
		indices[(i * 6) + 4] = vertexCount + 1;
		indices[(i * 6) + 5] = vertexCount + 3;
		
		for(var idx = 0; idx < 4; idx++) { 	
						
			//Vertex Data
			offsetInFloats = this.vertexSizeInFloats * vertexCount;
						
			//Local Position
			//Game drawing coordinate system is positive y in vertical direction, positive x to the rightt (normal)
			//i.e. negative y is upwards
			switch(idx) { 
				case 0:
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 0] = -0.5 * this.drawRequests[i].w;
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 1] = +0.5 * this.drawRequests[i].h;
				break;
				case 1:
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 0] = +0.5 * this.drawRequests[i].w;
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 1] = +0.5 * this.drawRequests[i].h;
				break;
				case 2:
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 0] = -0.5 * this.drawRequests[i].w;
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 1] = -0.5 * this.drawRequests[i].h;
				break;
				case 3:
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 0] = +0.5 * this.drawRequests[i].w;
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 1] = -0.5 * this.drawRequests[i].h;
				break;			
			}
			
			//Sprite Position
			view_SpritePosition[offsetInFloats + this.offset_SpritePosition + 0] =  this.drawRequests[i].x;
			view_SpritePosition[offsetInFloats + this.offset_SpritePosition + 1] =  this.drawRequests[i].y;
			view_SpritePosition[offsetInFloats + this.offset_SpritePosition + 2] =  this.drawRequests[i].d;
			
			//TexCoord
			switch(idx) { 
				case 0:
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 0] =  this.drawRequests[i].x0;
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 1] =  this.drawRequests[i].y0;
				break;
				case 1:
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 0] =  this.drawRequests[i].x1;
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 1] =  this.drawRequests[i].y0;
				break;
				case 2:
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 0] =  this.drawRequests[i].x0;
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 1] =  this.drawRequests[i].y1;
				break;
				case 3:
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 0] =  this.drawRequests[i].x1;
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 1] =  this.drawRequests[i].y1;
				break;			
			}
			
			//Rotation
			view_Rotation[offsetInFloats + this.offset_Rotation] =  this.drawRequests[i].rot;
		
			//Colour
			view_Colour[offsetInFloats + this.offset_Colour + 0] = this.drawRequests[i].col_r;
			view_Colour[offsetInFloats + this.offset_Colour + 1] = this.drawRequests[i].col_g;
			view_Colour[offsetInFloats + this.offset_Colour + 2] = this.drawRequests[i].col_b;
			view_Colour[offsetInFloats + this.offset_Colour + 3] = this.drawRequests[i].col_a;
			
			vertexCount++;
		}
	}

	for(var i = 0; i < this.numDrawGUIRequests; i++) { 
		//Index Data
		var j = this.numDrawRequests + i;
		indices[(j * 6)] = vertexCount + 0;
		indices[(j * 6)+ 1] = vertexCount + 1;
		indices[(j * 6) + 2] = vertexCount + 2;
		indices[(j * 6) + 3] = vertexCount + 2;
		indices[(j * 6) + 4] = vertexCount + 1;
		indices[(j * 6) + 5] = vertexCount + 3;
		
		for(var idx = 0; idx < 4; idx++) { 	
						
			//Vertex Data
			offsetInFloats = this.vertexSizeInFloats * vertexCount;
						
			//Local Position
			//GUI drawing coordinate system is (0,0) in top left of screen to (c_width, c_height) at bottom right
			//i.e. negative y is upwards
			switch(idx) { 
				case 0:
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 0] = -0.5 * this.drawGUIRequests[i].w;
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 1] = -0.5 * this.drawGUIRequests[i].h;
				break;
				case 1:
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 0] = +0.5 * this.drawGUIRequests[i].w;
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 1] = -0.5 * this.drawGUIRequests[i].h;
				break;
				case 2:
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 0] = -0.5 * this.drawGUIRequests[i].w;
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 1] = +0.5 * this.drawGUIRequests[i].h;
				break;
				case 3:
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 0] = +0.5 * this.drawGUIRequests[i].w;
					view_LocalPosition[offsetInFloats + this.offset_LocalPosition + 1] = +0.5 * this.drawGUIRequests[i].h;
				break;			
			}
			
			//Sprite Position
			view_SpritePosition[offsetInFloats + this.offset_SpritePosition + 0] =  this.drawGUIRequests[i].x;
			view_SpritePosition[offsetInFloats + this.offset_SpritePosition + 1] =  this.drawGUIRequests[i].y;
			view_SpritePosition[offsetInFloats + this.offset_SpritePosition + 2] =  this.drawGUIRequests[i].d;
			
			//TexCoord
			switch(idx) { 
				case 0:
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 0] =  this.drawGUIRequests[i].x0;
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 1] =  this.drawGUIRequests[i].y0;
				break;
				case 1:
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 0] =  this.drawGUIRequests[i].x1;
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 1] =  this.drawGUIRequests[i].y0;
				break;
				case 2:
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 0] =  this.drawGUIRequests[i].x0;
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 1] =  this.drawGUIRequests[i].y1;
				break;
				case 3:
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 0] =  this.drawGUIRequests[i].x1;
					view_TexCoord[offsetInFloats + this.offset_TexCoord + 1] =  this.drawGUIRequests[i].y1;
				break;			
			}
			
			//Rotation
			view_Rotation[offsetInFloats + this.offset_Rotation] =  this.drawGUIRequests[i].rot;
		
			//Colour
			view_Colour[offsetInFloats + this.offset_Colour + 0] = this.drawGUIRequests[i].col_r;
			view_Colour[offsetInFloats + this.offset_Colour + 1] = this.drawGUIRequests[i].col_g;
			view_Colour[offsetInFloats + this.offset_Colour + 2] = this.drawGUIRequests[i].col_b;
			view_Colour[offsetInFloats + this.offset_Colour + 3] = this.drawGUIRequests[i].col_a;
			
			vertexCount++;
		}
	}

    var startIndex = 0;
	//Now organise batches
	if(this.numDrawRequests > 0) {
            var request = 0;
            var texture = this.drawRequests[0].tex;
            var countIndices= 0;

            while(request < this.numDrawRequests) {
                        if(texture != this.drawRequests[request].tex) {
                                    var numTriangles = countIndices / 3;
                                    this.drawBatches[this.numDrawBatches] = new drawBatch(texture, startIndex , countIndices, numTriangles);
                                    this.numDrawBatches++;
									this.numDrawBatches_Render++;
                                    texture = this.drawRequests[request].tex;
                                    startIndex += countIndices;
                                    countIndices = 0;
                        }
                        else {
                                    countIndices += 6;
	                            	request++;
                        }         
            	}
 
            if(countIndices > 0) {
                        var numTriangles = countIndices / 3;
                        this.drawBatches[this.numDrawBatches] = new drawBatch(texture, startIndex , countIndices, numTriangles);
                        this.numDrawBatches++;
						this.numDrawBatches_Render++;
						startIndex += countIndices;
            }
	}
	
	if(this.numDrawGUIRequests > 0) {
            var request = 0;
            var texture = this.drawGUIRequests[0].tex;
            var countIndices= 0;

            while(request < this.numDrawGUIRequests) {
                        if(texture != this.drawGUIRequests[request].tex) {
                                    var numTriangles = countIndices / 3;
                                    this.drawBatches[this.numDrawBatches] = new drawBatch(texture, startIndex , countIndices, numTriangles);
                                    this.numDrawBatches++;
									this.numDrawBatches_GUI++;

                                    texture = this.drawGUIRequests[request].tex;
                                    startIndex += countIndices;
                                    countIndices = 0;
                        }
                        else {
                                    countIndices += 6;
	                            	request++;
                        }         
            	}
 
            if(countIndices > 0) {
                        var numTriangles = countIndices / 3;
                        this.drawBatches[this.numDrawBatches] = new drawBatch(texture, startIndex , countIndices, numTriangles);
                        this.numDrawBatches++;
						this.numDrawBatches_GUI++;
						startIndex += countIndices;
            }
	}
	
	//Fill up Vertex Buffer
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.DYNAMIC_DRAW);
	//Fill up Index Buffer
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.DYNAMIC_DRAW);
	//Clean up
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null); 
}

graphicsObject.prototype.sortRequests = function() { 
	//Sort by texture name
	this.drawRequests.sort(function(a,b) { return a.tex < b.tex ? -1 : a.tex > b.tex ? 1 : 0; });
	//Sort by depth (TO DO :: need to check if orders correctly
	this.drawRequests.sort(function(a,b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
}

graphicsObject.prototype.sortGUIRequests = function() { 
	//Sort by texture name
	this.drawGUIRequests.sort(function(a,b) { return a.tex < b.tex ? -1 : a.tex > b.tex ? 1 : 0; });
	//Sort by depth (TO DO :: need to check if orders correctly
	this.drawGUIRequests.sort(function(a,b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
}

// Drawing Functions - Those used externally by engine and game to build draw queue
//---------------------------------------------------------------------------------------------

//Normal Draw : includes paramter validation and transformation from world coordinates if required
graphicsObject.prototype.requestDraw = function(validate_parameters, 
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
												src_y1) { 
	if(typeof validate_parameters != "boolean") { 
		alert("requestDraw..validate parameter is not a boolean or defined");
		return;
	}
	
	if(validate_parameters) {
		if(typeof convert_to_screen_space != "boolean") { 
			console.log("requestDraw.. convert_to_screen_space parameter not a boolean or defined");
			return;
		}
		if(typeof texture_name != "string") { 
			console.log("requestDraw.. texture name is not a string or defined");
			return;
		}
		if(typeof x != "number") { 
			console.log("requestDraw.. position x is not a number or defined");
			return;
		}
		if(typeof y != "number") { 
			console.log("requestDraw.. position y is not a number or defined");
			return;
		}
		if(typeof width != "number") { 
			console.log("requestDraw.. width is not a number or defined");
			return;
		}
		if(typeof height != "number") { 
			console.log("requestDraw.. height is not a number or defined");
			return;
		}
		if(typeof rotation != "number") { 
			console.log("requestDraw.. rotation is not a number or defined");
			return;
		}
		if(typeof depth != "number") { 
			console.log("requestDraw.. depth is not a number or defined");
			return;
		}
		if(typeof col_r != "number") { 
			console.log("requestDraw.. col_r is not a number or defined");
			return;
		}
		if(typeof col_b != "number") { 
			console.log("requestDraw.. col_b is not a number or defined");
			return;
		}
		if(typeof col_g != "number") { 
			console.log("requestDraw.. col_g is not a number or defined");
			return;
		}
		if(typeof col_a != "number") { 
			console.log("requestDraw.. col_a is not a number or defined");
			return;
		}
		if(typeof src_x0 != "number") { 
			console.log("requestDraw.. src_x0 is not a number or defined");
			return;
		}
		if(typeof src_y0 != "number") { 
			console.log("requestDraw.. src_y0 is not a number or defined");
			return;
		}
		if(typeof src_x1 != "number") { 
			console.log("requestDraw.. src_x1 is not a number or defined");
			return;
		}
		if(typeof src_y1 != "number") { 
			console.log("requestDraw.. src_y1 is not a number or defined");
			return;
		}
	}

if(convert_to_screen_space) { 
		var pos = new vec2(x, y);
		pos = this.returnWorldPoint(pos);
		x = pos.x;
		y = pos.y;
		rotation -= this.camera_rotation;
		width *= this.camera_one_over_zoom;
		height *= this.camera_one_over_zoom;
	}
	
	//OpenGL flip the y texCoords (as usage definition is like directx, 0,0 is top left)
	src_y0 = 1.0 - src_y0;
	src_y1 = 1.0 - src_y1;

	this.drawRequests[this.numDrawRequests] = new drawRequest(texture_name,
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
															  src_y1
															);
	this.numDrawRequests++;
}

//GUI Draw : No validation of paramters. Further, there is no transform from world space as GUI is absolute screen coords only
graphicsObject.prototype.requestDrawGUI = function(texture_name, x, y, width, height, rotation, depth, col_r, col_g, col_b, col_a, src_x0, src_y0, src_x1, src_y1) { 
	//OpenGL flip the y texCoords (as usage definition is like directx, 0,0 is top left)
	src_y0 = 1.0 - src_y0;
	src_y1 = 1.0 - src_y1;
	this.drawGUIRequests[this.numDrawGUIRequests] = new drawRequest(texture_name,
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
															  src_y1
															);
	this.numDrawGUIRequests++;
}

//Normal Sprite Font Drawing : No paramter validation, but keep option for world scaling 
//Convert to screen space needs work
graphicsObject.prototype.requestDrawString = function(convert_to_screen_space, string, font, size, x, y, d, justify, r, g, b, a) {
	if(this.fonts[font]) {
		//Measure string if needed
		var real_length = 0.0;
		if(justify == "right" || justify == "centre") { 
			for(var char = 0; char < string.length; char++) { 
				if(this.fonts[font].characters[string[char]]) { 
					real_length+=this.fonts[font].characters[string[char]].xadvance;
				}
				else 
					real_length+=this.fonts[font].size;
			}	
		}
		
		var x_curr = x;
		var y_curr = y;
		var scalar = size / this.fonts[font].size;
		
		var scaled_length = real_length * scalar;
		
		if(justify == "right" || justify == "centre") { 
			switch(justify) { 
				case "right":
					x_curr-=scaled_length;
				break;
				case "centre":
					x_curr-=0.5 * scaled_length;
				break;
			}
		}
		
		var nn;
		var xx;
		var yy;
		var ww;
		var hh;
		var xx0;
		var xx1;
		var yy0;
		var yy1;
		var fast = true;
		
		for(var char = 0; char < string.length; char++) { 
				if(this.fonts[font].characters[string[char]]) { 
					var page = this.fonts[font].characters[string[char]].page;
					
						if(!fast) { 
							nn = this.fonts[font].name + "_"+ page;
							ww =  this.fonts[font].characters[string[char]].width * scalar;
							hh = this.fonts[font].characters[string[char]].height * scalar;
							xx =  x_curr + (scalar * this.fonts[font].characters[string[char]].xoffset) + (0.5 * ww);
							yy =  y_curr - (scalar * this.fonts[font].characters[string[char]].yoffset) - (0.5 * hh); //note the -ve for game coords
							xx0 = this.fonts[font].characters[string[char]].x0;
							yy0 = this.fonts[font].characters[string[char]].y0;
							xx1 = this.fonts[font].characters[string[char]].x1;
							yy1 = this.fonts[font].characters[string[char]].y1
							this.requestDraw(true, convert_to_screen_space, nn, 
													  xx, 
													  yy, 
													  ww,
													  hh,
													  0, d, r, g, b, a, 
													  xx0,
													  yy0,
													  xx1,
													  yy1);
							x_curr += scalar * this.fonts[font].characters[string[char]].xadvance;
						} else 
						{

							this.requestDraw(false, convert_to_screen_space, this.fonts[font].name + "_"+ page, 
														  x_curr + (scalar * this.fonts[font].characters[string[char]].xoffset) + (0.5 * this.fonts[font].characters[string[char]].width * scalar), 
														  y_curr - (scalar * this.fonts[font].characters[string[char]].yoffset) - (0.5 * this.fonts[font].characters[string[char]].height * scalar), //note the -ve for game coords
														  this.fonts[font].characters[string[char]].width * scalar,
														  this.fonts[font].characters[string[char]].height * scalar,
														  0, d, r, g, b, a, 
														  this.fonts[font].characters[string[char]].x0,
														  this.fonts[font].characters[string[char]].y0,
														  this.fonts[font].characters[string[char]].x1,
														  this.fonts[font].characters[string[char]].y1);				  
							x_curr += scalar * this.fonts[font].characters[string[char]].xadvance;
						}

						  
						
				}
				else { 
						this.requestDraw(false, convert_to_screen_space, this.fonts[font].name + "_0", 
												  x_curr + (scalar * this.fonts[font].characters["#"].xoffset), 
												  y_curr - (scalar * this.fonts[font].characters["#"].yoffset),  //note the -ve for game coords
												  this.fonts[font].characters["#"].width * scalar,
												  this.fonts[font].characters["#"].height * scalar,
												  0, d, r, g, b, a, 
												  this.fonts[font].characters["#"].x0,
												  this.fonts[font].characters["#"].y0,
												  this.fonts[font].characters["#"].x1,
												  this.fonts[font].characters["#"].y1);
					x_curr += scalar * this.fonts[font].characters["#"].xadvance;
				}
		}	
	}
}

//GUI Sprite Font Drawing : No paramter validation, no world scaling 
graphicsObject.prototype.requestDrawGUIString = function(string, font, size, x, y, d, justify, r, g, b, a) { 
	if(this.fonts[font]) {
		//Measure string if needed
		var real_length = 0.0;
		if(justify == "right" || justify == "centre") { 
			for(var char = 0; char < string.length; char++) { 
				if(this.fonts[font].characters[string[char]]) { 
					real_length+=this.fonts[font].characters[string[char]].xadvance;
				}
				else 
					real_length+=this.fonts[font].size;
			}	
		}
		
		var x_curr = x;
		var y_curr = y;
		var scalar = size / this.fonts[font].size;
		
		var scaled_length = real_length * scalar;
		
		if(justify == "right" || justify == "centre") { 
			switch(justify) { 
				case "right":
					x_curr-=scaled_length;
				break;
				case "centre":
					x_curr-=0.5 * scaled_length;
				break;
			}
		}
		
		var nn;
		var xx;
		var yy;
		var ww;
		var hh;
		var xx0;
		var xx1;
		var yy0;
		var yy1;
		var fast = true;
		
		for(var char = 0; char < string.length; char++) { 
				if(this.fonts[font].characters[string[char]]) { 
					var page = this.fonts[font].characters[string[char]].page;
					
						if(!fast) { 
							nn = this.fonts[font].name + "_"+ page;
							//console.log(0.5 * scalar * fonts[font].characters[string[char]].xoffset + "," + 0.5 * scalar * fonts[font].characters[string[char]].yoffset);
							ww =  this.fonts[font].characters[string[char]].width * scalar;
							hh = this.fonts[font].characters[string[char]].height * scalar;
							xx =  x_curr + (scalar * this.fonts[font].characters[string[char]].xoffset) + (0.5 * ww);
							yy =  y_curr + (scalar * this.fonts[font].characters[string[char]].yoffset) + (0.5 * hh); //note the +ve for screen coords
							xx0 = this.fonts[font].characters[string[char]].x0;
							yy0 =  this.fonts[font].characters[string[char]].y0;
							xx1 = this.fonts[font].characters[string[char]].x1;
							yy1 = this.fonts[font].characters[string[char]].y1
							this.requestDrawGUI(	  nn, 
													  xx, 
													  yy, 
													  ww,
													  hh,
													  0, d, r, g, b, a, 
													  xx0,
													  yy0,
													  xx1,
													  yy1);
					
							x_curr += scalar * this.fonts[font].characters[string[char]].xadvance;
						} else 
						{
							this.requestDrawGUI(		  this.fonts[font].name + "_"+ page, 
														  x_curr + (scalar * this.fonts[font].characters[string[char]].xoffset) + (0.5 * this.fonts[font].characters[string[char]].width * scalar), 
														  y_curr + (scalar * this.fonts[font].characters[string[char]].yoffset) + (0.5 * this.fonts[font].characters[string[char]].height * scalar), //note the +ve for screen coords
														  this.fonts[font].characters[string[char]].width * scalar,
														  this.fonts[font].characters[string[char]].height * scalar,
														  0, d, r, g, b, a, 
														  this.fonts[font].characters[string[char]].x0,
														  this.fonts[font].characters[string[char]].y0,
														  this.fonts[font].characters[string[char]].x1,
														  this.fonts[font].characters[string[char]].y1);				  
							x_curr += scalar * this.fonts[font].characters[string[char]].xadvance;
						}

						  
						
				}
				else { 
					this.requestDrawGUI(          this.fonts[font].name + "_0", 
												  x_curr + (scalar * this.fonts[font].characters["#"].xoffset), 
												  y_curr + (scalar * this.fonts[font].characters["#"].yoffset), //note the +ve for screen coords
												  this.fonts[font].characters["#"].width * scalar,
												  this.fonts[font].characters["#"].height * scalar,
												  0, d, r, g, b, a, 
												  this.fonts[font].characters["#"].x0,
												  this.fonts[font].characters["#"].y0,
												  this.fonts[font].characters["#"].x1,
												  this.fonts[font].characters["#"].y1);
					x_curr += scalar * this.fonts[font].characters["#"].xadvance;
				}
				
		}	
	}
}
