/*
Core.js :: Pixel Peasant, Alex Paterson, 2014
* Includes important global definitions, as well as the entry point function from body onLoad 
* Sets up the application loop using request animation frame and serves as an interface for the 
* broader engine with the web page and other web services
* Initialises the loading rotating graphic, clears, creates and manages the load queue
* Triggers initalisation of other subsystems including graphics and input
*/

//Global variables definitions
//---------------------------------------------------------------------------------------------

//Core System Objects (Engine and Game)
var graphics = new graphicsObject();
var sound = new soundObject();
var input = new inputObject();
var frameTimer = new frameTimerObject();

var game = new gameObject();

//Important
var loaded;
var allowCombineEffects = true; //Hard Code Switch to set per game. If false, skips set up of two extra offscreen render targets and 
//Blur (and other) combine effects becomes unusable. If left true, but graphics set to a quality that does not allow blur, the render targets will be 
//set up but not used. In theory then, you can leave this to true and the only downside of using the quality settings to avoid blur 
//is increased GFX memory use for the two extra buffers.
var allowCRT = true; //Hard Code Switch to set per game. If false, skips creation of curved vertices that mimic a screen
var allowShockWave = true; //Hard Code Switch to set per game. If false skips creation of additional buffer used to render shockwave gradients

//Minor (generally only used for code in this source file)
var loadAnimationSpinner; //Super cool load animation that requires no additional assets (http://fgnass.github.io/spin.js/#!)
var iNumLoadRequests; //Number of assets requested to be loaded (multi-type)
var bLoadRequestComplete; //Keeps track of assets that are loaded
var numloadedImages; //Textures are processed from loaded images
var loadedImages;
var loadedImagesTextureNames;
var numLoadedFontTextFiles; //Fonts
var loadedFontTextFiles;
var numLoadedFragmentShaderFiles;
var loadedFragmentShaderFiles;
var numLoadedVertexShaderFiles;
var loadedVertexShaderFiles;
var numLoadedSounds;
var loadedSoundFiles;
//Entry point, load and initialisation
//---------------------------------------------------------------------------------------------

//Program entry point
function runGame(canvas_id_name) {
	input.initialise();
	graphics.initCanvas(canvas_id_name);
	initLoadAnimation(); //Loading spinning graphic
	//The programme async loads all assets before entry into it's main loop. First we build a request queue
	resetAssetLoadRequests();
	loadSystemAssets();
	graphics.loadShaders();
	game.loadAssets();
	//Then we wait...
	completeLoad();
}

//Start load animation, so cool, needs no assets...http://fgnass.github.io/spin.js/#!
function initLoadAnimation() {
	var opts = {
	  lines: 16, // The number of lines to draw
	  length: 45, // The length of each line
	  width: 12, // The line thickness
	  radius: 45, // The radius of the inner circle
	  corners: 2, // Corner roundness (0..1)
	  rotate: 0, // The rotation offset
	  direction: 1, // 1: clockwise, -1: counterclockwise
	  color: '#555555', // #rgb or #rrggbb or array of colors
	  speed: 3, // Rounds per second
	  trail: 30, // Afterglow percentage
	  shadow: false, // Whether to render a shadow
	  hwaccel: false, // Whether to use hardware acceleration
	  className: 'spinner', // The CSS class to assign to the spinner
	  zIndex: 0,//2e9, // The z-index (defaults to 2000000000)
	  top: '35%', // Top position relative to parent
	  left: '50%' // Left position relative to parent
	};
	var target = document.getElementById('idMainDiv');
	loadAnimationSpinner = new Spinner(opts).spin(target);
}

//Asset loading: reset request list
function resetAssetLoadRequests(){
	loaded = false;
	iNumLoadRequests = 0;
	bLoadRequestComplete = []; 
 
 	numloadedImages = 0;
 	loadedImages = [];
 	loadedImagesTextureNames = [];
 
 	numLoadedFontTextFiles = 0;
 	loadedFontTextFiles = []

	numLoadedFragmentShaderFiles = 0;
	loadedFragmentShaderFiles = [];

 	numLoadedVertexShaderFiles = 0;
	loadedVertexShaderFiles = [];

	numLoadedSounds = 0;
	loadedSoundFiles = [];
}

function loadSystemAssets() { 
	//Noise Image
	var local_index_1 = iNumLoadRequests;
	bLoadRequestComplete[local_index_1] = false;
	iNumLoadRequests++;
	graphics.noiseImage = new Image();
	graphics.noiseImage.src = "assets/textures/system/noise.png";
	graphics.noiseImage.onload = function() { 
		markRequestAsLoaded(local_index_1);
	}
	//Catch the onload fail
	graphics.noiseImage.onerror = function() { 
		markRequestAsLoaded(local_index_1); 
	}

	//Black Pixel Image
	var local_index_2 = iNumLoadRequests;
	bLoadRequestComplete[local_index_2] = false;
	iNumLoadRequests++;
	graphics.blackPixelImage = new Image();
	graphics.blackPixelImage.src = "assets/textures/system/black_1x1.png";
	graphics.blackPixelImage.onload = function() { 
		markRequestAsLoaded(local_index_2);
	}
	//Catch the onload fail
	graphics.blackPixelImage.onerror = function() { 
		markRequestAsLoaded(local_index_2); 
	}

	//White Pixel Image
	var local_index_3 = iNumLoadRequests;
	bLoadRequestComplete[local_index_3] = false;
	iNumLoadRequests++;
	graphics.whitePixelImage = new Image();
	graphics.whitePixelImage.src = "assets/textures/system/white_1x1.png";
	graphics.whitePixelImage.onload = function() { 
		markRequestAsLoaded(local_index_3);
	}
	//Catch the onload fail
	graphics.whitePixelImage.onerror = function() { 
		markRequestAsLoaded(local_index_3); 
	}

	//Shock Wave Image
	var local_index_4 = iNumLoadRequests;
	bLoadRequestComplete[local_index_4] = false;
	iNumLoadRequests++;
	graphics.shockWaveDistortImage = new Image();
	graphics.shockWaveDistortImage.src = "assets/textures/system/explode_displace.png";
	graphics.shockWaveDistortImage.onload = function() { 
		markRequestAsLoaded(local_index_4);
	}
	//Catch the onload fail
	graphics.shockWaveDistortImage.onerror = function() { 
		markRequestAsLoaded(local_index_4); 
	}
}

//Asset load functions
//---------------------------------------------------------------------------------------------

function loadTexture(name, path) { 
	for(var t = 0; t < numloadedImages; t++) { 
		if(name == loadedImagesTextureNames[t]) { 
			console.log("trying to load " + path + " under name which already exists @ " + name);
			return;
		}
	}
	var local_index = iNumLoadRequests;
	bLoadRequestComplete[local_index] = false;
	iNumLoadRequests++;
	//Create a new image.. load from source. on load. add to texture array
	loadedImages[numloadedImages] = new Image();
	loadedImages[numloadedImages].src = path;
	loadedImagesTextureNames[numloadedImages] = name;
	//Now use the onload trigger to make the actual texture, store in the array and fire the 'load complete check'
	loadedImages[numloadedImages].onload = function() { 
		markRequestAsLoaded(local_index);
	}
	
	//Catch the onload fail
	loadedImages[numloadedImages].onerror = function() { 
		console.log("Image load for texture: " + name + " at " + path + " has failed to load");
		markRequestAsLoaded(local_index); //just to keep program running
	}
	numloadedImages++;
}

function loadFont(name, filepath, size, page_width, num_images) { 
	for(var f = 0; f < numLoadedFontTextFiles; f++){ 
		if(name == loadedFontTextFiles[f].str_name_pass) { 
			console.log("trying to load " + directory + " under font name which already exists @ " + name);
			return;
		}
	}
	
	var local_index_txt = iNumLoadRequests;
	bLoadRequestComplete[local_index_txt] = false;
	iNumLoadRequests++;
	var numFontLoad = numLoadedFontTextFiles;
	loadedFontTextFiles[numFontLoad] = new XMLHttpRequest();
	loadedFontTextFiles[numFontLoad].str_name_pass = name;
	loadedFontTextFiles[numFontLoad].font_size_pass = size;
	loadedFontTextFiles[numFontLoad].font_pwidth_pass = page_width;
	loadedFontTextFiles[numFontLoad].open("GET", filepath + ".fnt", true);
	loadedFontTextFiles[numFontLoad].onreadystatechange = function()
	{
	  if (loadedFontTextFiles[numFontLoad].readyState === 4) {  // document is ready to parse.
		if (loadedFontTextFiles[numFontLoad].status === 200) {  // file is found
			markRequestAsLoaded(local_index_txt);
		}
	  }
	}
	loadedFontTextFiles[numFontLoad].send(null);
	numLoadedFontTextFiles++;
	
	for(var i = 0; i < num_images; i++) {
		loadTexture(name + "_" + i, filepath + "_" + i + ".png");
	}
}

function loadShader(name, filepath, type) {
	switch(type) {
		case "fragment":
			for(var s = 0; s < numLoadedFragmentShaderFiles; s++){
				if(name == loadedFragmentShaderFiles[s].str_name_pass) {
					console.log("trying to load " + name + " fragment shader but shader with name already exists");
					return;
				}
			}
			var local_index_txt = iNumLoadRequests;
			bLoadRequestComplete[local_index_txt] = false;
			iNumLoadRequests++;
			var numFragmentLoad = numLoadedFragmentShaderFiles;
			loadedFragmentShaderFiles[numFragmentLoad] = new XMLHttpRequest();
			loadedFragmentShaderFiles[numFragmentLoad].str_name_pass = name;
			loadedFragmentShaderFiles[numFragmentLoad].open("GET", filepath, true);
			loadedFragmentShaderFiles[numFragmentLoad].onreadystatechange = function() {
				if(loadedFragmentShaderFiles[numFragmentLoad].readyState === 4) {
					if(loadedFragmentShaderFiles[numFragmentLoad].status === 200) {
						markRequestAsLoaded(local_index_txt);
					}
				}				
			}
			loadedFragmentShaderFiles[numFragmentLoad].send(null);
			numLoadedFragmentShaderFiles++;
		break;
		case "vertex":
		for(var s = 0; s < numLoadedVertexShaderFiles; s++){
				if(name == loadedVertexShaderFiles[s].str_name_pass) {
					console.log("trying to load " + name + " fragment shader but shader with name already exists");
					return;
				}
			}
			var local_index_txt = iNumLoadRequests;
			bLoadRequestComplete[local_index_txt] = false;
			iNumLoadRequests++;
			var numVertexLoad = numLoadedVertexShaderFiles;
			loadedVertexShaderFiles[numVertexLoad] = new XMLHttpRequest();
			loadedVertexShaderFiles[numVertexLoad].str_name_pass = name;
			loadedVertexShaderFiles[numVertexLoad].open("GET", filepath, true);
			loadedVertexShaderFiles[numVertexLoad].onreadystatechange = function() {
				if(loadedVertexShaderFiles[numVertexLoad].readyState === 4) {
					if(loadedVertexShaderFiles[numVertexLoad].status === 200) {
						markRequestAsLoaded(local_index_txt);
					}
				}				
			}
			loadedVertexShaderFiles[numVertexLoad].send(null);
			numLoadedVertexShaderFiles++;
		break;	
	}
}

function loadSound(name, urls, loop, volume, autoplay, onplay, onend) {
	//To help managing the loading (this game engine takes the approach of load all then play - small games)
	//I am not going to allow sounds to be buffered (ie can be played before fully downloaded and decoded)
	//However howler.js does allow this

	//Check if sound exists
	for(var s = 0; s < numLoadedSounds; s++) {
			if(loadedSoundFiles[s] == name) {
				console.log("trying to load " + name + " sound but item with same name already exists");
		return;
		}
	}
	if(urls === undefined) {
		console.log("Sound " + name + " has not been given any urls, error");
		return;		
	}
	var _loop = false;
	if(loop != undefined) { _loop = loop; }
	var _volume = 1.0;
	if(volume != undefined) { _volume = volume;}
	var _autoplay = false;
	if(autoplay != undefined) { _autoplay = autoplay; }
	var _onplay = function() {}
	if(onplay != undefined) { _onplay = onplay; }
	var _onend = function() {}
	if(onend != undefined) { _onend = onend; }

	loadedSoundFiles[numLoadedSounds] = name;
	var local_index = iNumLoadRequests;
	bLoadRequestComplete[local_index] = false;
	iNumLoadRequests++;
	sound.samples[name] = new Howl({
		urls: urls,
		loop: _loop,
		volume: _volume,
		autoplay: _autoplay,
		onplay: _onplay,
		onend: _onend,
		onload: function() {
			markRequestAsLoaded(local_index);			
			sound.num_samples++; //not sure really needed but nice to keep track
			//console.log("Sample: " + name + " has loaded");
		},
		onloaderror: function() {
			markRequestAsLoaded(local_index);			
			sound.num_samples++; //not sure really needed but nice to keep track
			console.log("Sample: " + name + " has not been able to load");
		}
	});
	numLoadedSounds++;
}

//Load helper functions - fired at end of async loads
//---------------------------------------------------------------------------------------------

function markRequestAsLoaded(index){
 if(iNumLoadRequests != bLoadRequestComplete.length ){
    alert("load request length mismatch with count variable");
    return;
    }
 if(index > iNumLoadRequests - 1 || index < 0) {
    alert("load request index for mark complete out of range");
    return;
    }
 if(bLoadRequestComplete[index]){
    alert("Load request already complete");
    return;
    }
 bLoadRequestComplete[index] = true;
 checkForAllLoadComplete();
}

function checkForAllLoadComplete() {
 for(var i = 0; i < iNumLoadRequests; i++) {
  if(!bLoadRequestComplete[i])
   return;
 }
 //can only get here if all requests are complete
 loaded = true;
}

//Loop functions
//---------------------------------------------------------------------------------------------

//LOAD CYCLE: Check if load complete, if not recheck on next anim Frame
function completeLoad() {
	if(loaded){
		loadAnimationSpinner.stop();
		graphics.initGLContextAndRendering(); //Hand off to graphics initialisation. Return at programLoop
	}
	else
		requestAnimFrame(completeLoad);
}

//GAME CYCLE
function programLoop(){
	graphics.animRequestID = requestAnimFrame(programLoop);
	graphics.prepareRenderPipelineForFrame();
	frameTimer.update();
	game.update();
	graphics.update();
	graphics.render();
	input.inputClearBuffers();
}

//Cross platform | browser animation frame request (drives loops)
//---------------------------------------------------------------------------------------------
requestAnimFrame = (function() {
return window.requestAnimationFrame ||
	 window.webkitRequestAnimationFrame ||
	 window.mozRequestAnimationFrame ||
	 window.oRequestAnimationFrame ||
	 window.msRequestAnimationFrame ||
	 function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
	   window.setTimeout(callback, 1000/60);
	 };
})();
