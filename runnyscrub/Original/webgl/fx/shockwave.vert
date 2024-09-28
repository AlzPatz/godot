//shockwave.vert
//Vertex shader for 'shockwave' Rendering
uniform mat4 uCameraMatrix;

attribute vec2 aPosition; 
attribute vec2 aTexCoord;
attribute float aIntensity; //intensity of shockwave

varying vec2 vTexCoord;
varying float vIntensity;

void main(void) {
	vTexCoord = aTexCoord;
	vIntensity = aIntensity;
	vec4 pos = vec4(aPosition.x, aPosition.y, 0.0, 1.0);
	gl_Position = uCameraMatrix * pos;
}