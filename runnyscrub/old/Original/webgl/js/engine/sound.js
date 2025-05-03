/*
sound.js :: Pixel Peasant, Alex Paterson, 2014
* Smaller wrapper to help using howler.js with the engine. Little bit of input checking etc
* best practice for iOS, is to have a click to play screen straight after load, this ensures that iOS click event can be captured and used
* by howler.js
* In the future should add in capabilty to deal with sound instances
* http://goldfirestudios.com/blog/104/howler.js-Modern-Web-Audio-Javascript-Library
*/

function soundObject() {
	this.num_samples = 0;
	this.samples = [];

	this.volume = 1.0;
}

//Global Method Wrappers
//----------------------------------------------------------
soundObject.prototype.mute = function() {
	Howler.mute();
}

soundObject.prototype.unmute = function() {
	Howler.unmute();
}

soundObject.prototype.setVolume = function(volume) {
	if(volume) {
		if(volume < 0.0) { volume = 0.0; }
		if(volume > 1.0) { volume = 1.0; }
		Howler.volume(volume);
		return;
	}	
	console.log("Trying to change the volume with something that isn't a number or defined!");
}	
//----------------------------------------------------------

//Per Sample Methods
//----------------------------------------------------------
soundObject.prototype.play = function(name) {
	//Begins playback of sound. Will continue from previous point if sound has been previously paused.
	if(this.samples[name]) {
		this.samples[name].play();
	}
}

soundObject.prototype.stop = function(name) {
	///Stops playback of sound, resetting pos to 0
	if(this.samples[name]) {
		this.samples[name].stop();
	}
}

soundObject.prototype.pause = function(name) {
	//Pauses playback of sound
	if(this.samples[name]) {
		this.samples[name].pause();
	}
}

soundObject.prototype.fadeIn = function(name, t, vmax, oncomplete) {
	/*
	Fade in the current sound.
	vmax, to: Number Volume to fade to (0.0 to 1.0).
	t, duration: Number Time in milliseconds to fade.
	oncomplete, callback: Function (optional) Fires when fade is complete.
	*/
	if(this.samples[name] && t) {
		var _vmax = 1.0;
		if(vmax != undefined) { _vmax = vmax; }
		var _oncomplete = function() {}
		if(oncomplete != undefined) { _oncomplete = oncomplete; }
		this.samples[name].fadeIn(_vmax, t, _oncomplete);
	}
}

soundObject.prototype.fadeOut = function(name, t, vmax, oncomplete) {
	/*
	 Fade out the current sound and pause when finished.
	vmin, to: Number Volume to fade to (0.0 to 1.0).
	t, duration: Number Time in milliseconds to fade.
	oncomplete, callback: Function (optional) Fires when fade is complete.
	*/
	if(this.samples[name] && t) {
		var _vmax = 1.0;
		if(vmax != undefined) { _vmax = vmax; }
		var _oncomplete = function() {}
		if(oncomplete != undefined) { _oncomplete = oncomplete; }
		this.samples[name].fadeIn(_vmax, t, _oncomplete);
	}
}

soundObject.prototype.setvolume = function(name, volume) {
	//Pauses playback of sound
	if(this.samples[name] && volume) {
		this.samples[name].volume(volume);
	}
}

soundObject.prototype.setloop = function(name, loop) {
	//Pauses playback of sound
	if(this.samples[name] && volume) {
		this.samples[name].loop(loop);
	}
}




