/*
effectsController.js :: Pixel Peasant, Alex Paterson 2015
* This object is used to trigger engine effects changes for the game. This allows easy modification of effect transisitions
* for different game stages all in one place
*/

function effectsController(sfx) {
	this.sfx = sfx;
	this.environment; //Cannot just assign here as isn't created at this point.
}

effectsController.prototype.assignEnvironment = function(environment) {
	this.environment = environment;
}

effectsController.prototype.trigger = function(label) {
	switch(label) {
		case "SplashScreen_Start":
			graphics.sfx.setCurrentEffectsState([0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0], 0.0, 0.0, 0.0, false);
			graphics.sfx.setShockWaveActive(true);			
			graphics.sfx.setShockWaveTargetGameOnly(false);
			graphics.sfx.setCrtActive(false);
			graphics.sfx.setRenderGuiOverEffects(true);
			graphics.sfx.setBlur(0.7);
		break;
		case "MainScreen_Start":
			//Rendering Effects
			graphics.sfx.setCurrentEffectsState([1.0, 0.0, 1.0, 1.0], [0.5, 0.9, 0.7, 1.0], 4, 3, 0.9, false);
			graphics.sfx.setAndTriggerEffectsTarget(true, 1.5, [0.0, 1.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0], 400, 300, 0.5, false);
			graphics.sfx.setShockWaveActive(true);			
			graphics.sfx.setShockWaveTargetGameOnly(false);
			graphics.sfx.setCrtActive(true);
			graphics.sfx.setRenderGuiOverEffects(true);
			//Environment Effects
			this.environment.dropletsGenerateWarp = false;

		break;
		case "Game_Start":
			graphics.sfx.setShockWaveTargetGameOnly(true);
			this.environment.dropletsGenerateWarp = true;
		break;
		default: 
			console.log("SFX label: " + label + " : not found");
		break;
	}
}
