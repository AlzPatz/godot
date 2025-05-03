/*
Input.js :: Pixel Peasant, Alex Paterson, 2014
*/

function inputObject() {
	this.inputListOfKeysDown = new Object(); //Persists between Frames
	this.inputListOfKeysPressed = new Object(); //Press lasts until one frame ends
	this.inputListOfKeysReleasedThisFrame = new Object(); //Wipes after one frame

	this.inputListOfMouseButtonsDown = new Object(); //Persists between frames
	this.inputListOfMouseButtonsPressed = new Object(); //Persists for one frame only
	this.inputListOfMouseButtonsReleased = new Object(); //Persists for one frame only

	//Position worrking variables
	this.inputMouseX_Document = 0;
	this.inputMouseY_Document = 0;
	this.inputMouseX_Canvas = undefined;
	this.inputMouseY_Canvas = undefined;
	this.inputMouse_isOverCanvas = false;
	this.inputTouch_press = false;
	this.inputTouch_x;
	this.inputTouch_y;

	//Reference arrays
	this.inputKeyCodes;
	this.inputMouseButtons;
	this.letterArrray;
}

inputObject.prototype.initialise = function() {
	//Use DOM level 2 input for propogation (sufficient? needs testing)
	
	//Keyboard input
	document.addEventListener('keydown', this.handleKeyDown, false);
	document.addEventListener('keyup', this.handleKeyUp, false);
	document.addEventListener('keypress', this.handleKeyPress, false);
	
	//Mouse input
	document.addEventListener('mousemove', this.handleMouseMove, false);
	document.addEventListener('mousedown', this.handleMouseDown, false);
	document.addEventListener('mouseup', this.handleMouseUp, false);
	
	//Touch input
	document.addEventListener('touchstart', this.handleTouchStart, false);
	document.addEventListener('touchmove', this.handleTouchMove, false);
	document.addEventListener('touchend', this.handleTouchEnd, false);

	//Initialise the reference arrays

	this.inputKeyCodes = new Object();
	this.inputKeyCodes["space"] = 32;
	this.inputKeyCodes["escape"] = 27;
	this.inputKeyCodes["enter"] = 13;
	
	this.inputKeyCodes["a"] = 97;
	this.inputKeyCodes["b"] = 98;
	this.inputKeyCodes["c"] = 99;
	this.inputKeyCodes["d"] = 100;
	this.inputKeyCodes["e"] = 101;
	this.inputKeyCodes["f"] = 102;
	this.inputKeyCodes["g"] = 103;
	this.inputKeyCodes["h"] = 104;
	this.inputKeyCodes["i"] = 105;
	this.inputKeyCodes["j"] = 106;
	this.inputKeyCodes["k"] = 107;
	this.inputKeyCodes["l"] = 108;
	this.inputKeyCodes["m"] = 109;
	this.inputKeyCodes["n"] = 110;
	this.inputKeyCodes["o"] = 111;
	this.inputKeyCodes["p"] = 112;
	this.inputKeyCodes["q"] = 113;
	this.inputKeyCodes["r"] = 114;
	this.inputKeyCodes["s"] = 115;
	this.inputKeyCodes["t"] = 116;
	this.inputKeyCodes["u"] = 117;
	this.inputKeyCodes["v"] = 118;
	this.inputKeyCodes["w"] = 119;
	this.inputKeyCodes["x"] = 120;
	this.inputKeyCodes["y"] = 121;
	this.inputKeyCodes["z"] = 122;
	this.inputKeyCodes["0"] = 48;
	this.inputKeyCodes["1"] = 49;
	this.inputKeyCodes["2"] = 50;
	this.inputKeyCodes["3"] = 51;
	this.inputKeyCodes["4"] = 52;
	this.inputKeyCodes["5"] = 53;
	this.inputKeyCodes["6"] = 54;
	this.inputKeyCodes["7"] = 55;
	this.inputKeyCodes["8"] = 56;
	this.inputKeyCodes["9"] = 57;

	this.letterArray = new Object();
	this.letterArray[97] = "A";
	this.letterArray[98] = "B";
	this.letterArray[99] = "C";
	this.letterArray[100] = "D";
	this.letterArray[101] = "E";
	this.letterArray[102] = "F";
	this.letterArray[103] = "G";
	this.letterArray[104] = "H";
	this.letterArray[105] = "I";
	this.letterArray[106] = "J";
	this.letterArray[107] = "K";
	this.letterArray[108] = "L";
	this.letterArray[109] = "M";
	this.letterArray[110] = "N";
	this.letterArray[111] = "O";
	this.letterArray[112] = "P";
	this.letterArray[113] = "Q";
	this.letterArray[114] = "R";
	this.letterArray[115] = "S";
	this.letterArray[116] = "T";
	this.letterArray[117] = "U";
	this.letterArray[118] = "V";
	this.letterArray[119] = "W"; 
	this.letterArray[120] = "X";
	this.letterArray[121] = "Y";
	this.letterArray[122] = "Z";
	this.letterArray[48] = "0";
	this.letterArray[49] = "1";
	this.letterArray[50] = "2";
	this.letterArray[51] = "3";
	this.letterArray[52] = "4";
	this.letterArray[53] = "5";
	this.letterArray[54] = "6";
	this.letterArray[55] = "7";
	this.letterArray[56] = "8";
	this.letterArray[57] = "9";

	//Create object to make reference to mouse easier
	this.inputMouseButtons = new Object();
	this.inputMouseButtons["left"] = 0;
	this.inputMouseButtons["right"] = 2;
	this.inputMouseButtons["middle"] = 1;
}

//Buffer Reset function
//---------------------------------------------------------------------------------------------
inputObject.prototype.inputClearBuffers = function() {
	for(x in this.inputListOfKeysPressed) { 
		if(this.inputListOfKeysPressed[x] == true) {
			this.inputListOfKeysPressed[x] = false;
		}
	}
	for(x in this.inputListOfKeysReleasedThisFrame) { 
		if(this.inputListOfKeysReleasedThisFrame[x] == true)	{
			this.inputListOfKeysReleasedThisFrame[x] = false;
		}
	}
	for(x in this.inputListOfMouseButtonsReleased) { 
		if(this.inputListOfMouseButtonsReleased[x] == true)	{
			this.inputListOfMouseButtonsReleased[x] = false;
		}
	}
	for(x in this.inputListOfMouseButtonsPressed) { 
		if(this.inputListOfMouseButtonsPressed[x] == true)	{
			this.inputListOfMouseButtonsPressed[x] = false;
		}
	}
}

//Handler functions
//---------------------------------------------------------------------------------------------

//Will keep a list of which keys + mouse buttons are down using Down and Up.. for normal game function.
//Key/Mouse up and this frame press records persist until the end of one frame. also track mouse position, and relate to both document and canvas
inputObject.prototype.handleKeyDown = function(ev) {
	if(	input.inputListOfKeysDown[ev.keyCode] == false | input.inputListOfKeysDown[ev.keyCode] == undefined) {
		input.inputListOfKeysDown[ev.keyCode] = true;
		//console.log("keydown - keyCode=%d, charCode=%d", ev.keyCode, ev.charCode);
	}
}

inputObject.prototype.handleKeyUp = function(ev) {
	input.inputListOfKeysReleasedThisFrame[ev.keyCode] = true;
	input.inputListOfKeysDown[ev.keyCode] = false;
	//console.log("keyup - keyCode=%d, charCode=%d", ev.keyCode, ev.charCode);
}

inputObject.prototype.handleKeyPress = function(ev) {
	input.inputListOfKeysPressed[ev.keyCode] = true;
	//console.log("keypress - keyCode=%d, charCode=%d", ev.keyCode, ev.charCode);
}

inputObject.prototype.handleMouseMove = function(ev) {
	input.inputMouseX_Document = ev.clientX;
	input.inputMouseY_Document = ev.clientY;
	if(graphics.canvas) { 
		var rect = graphics.canvas.getBoundingClientRect();
		input.inputMouseX_Canvas = ev.clientX - rect.left;
		input.inputMouseY_Canvas = ev.clientY - rect.top;
		if(input.inputMouseX_Canvas < 0.0 | input.inputMouseX_Canvas >= graphics.c_width | input.inputMouseY_Canvas < 0.0 | input.inputMouseY_Canvas >= graphics.c_height) { 
			input.inputMouseX_Canvas = undefined; 
			input.inputMouseY_Canvas = undefined;
			input.inputMouse_isOverCanvas = false;
		} else { 
			input.inputMouse_isOverCanvas = true;
		}
	}
	//console.log("Mouse, OnCanvas?: " +inputMouse_isOverCanvas + ", Doc(x,y): " + inputMouseX_Document + "," + inputMouseY_Document + " | Canvas(x,y): " + inputMouseX_Canvas + "," + inputMouseY_Canvas);
}

inputObject.prototype.handleMouseDown = function(ev) {
	input.inputListOfMouseButtonsDown[ev.button] = true;
	input.inputListOfMouseButtonsPressed[ev.button] = true;
	input.handleMouseMove(ev);
	//console.log("mousedown - clientX=%d, clientY=%d, button=%d", ev.clientX, ev.clientY, ev.button);
}

inputObject.prototype.handleMouseUp = function(ev) {
	input.inputListOfMouseButtonsDown[ev.button] = false;
	input.inputListOfMouseButtonsReleased[ev.button] = true;
	input.handleMouseMove(ev);
	//console.log("mouseup - clientX=%d, clientY=%d, button=%d", ev.clientX, ev.clientY, ev.button);
}

//just handle the one touch for now
inputObject.prototype.handleTouchStart = function(ev) {
	if(ev.changedTouches.length > 0) { 
		input.inputTouch_press = true;
		input.inputTouch_x = parseFloat(ev.changedTouches[0].clientX) - rect.left;
		input.inputTouch_y = parseFloat(ev.changedTouches[0].clientY) - rect.top;
	}
	ev.preventDefault();
}

inputObject.prototype.handleTouchMove = function(ev) {
		if(ev.changedTouches.length > 0) { 
		input.inputTouch_x = parseFloat(ev.changedTouches[0].clientX)- rect.left;
		input.inputTouch_y = parseFloat(ev.changedTouches[0].clientY) - rect.top;
	}
	ev.preventDefault();
}

inputObject.prototype.handleTouchEnd = function(ev) {
	if(ev.changedTouches.length > 0) { 
		input.inputTouch_press = false;
		input.inputTouch_x = parseFloat(ev.changedTouches[0].clientX)- rect.left;
		input.inputTouch_y = parseFloat(ev.changedTouches[0].clientY) - rect.top;
	}
	ev.preventDefault();
}
