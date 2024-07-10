//shockwave.frag
//Fragment Shader for 'shockwave' rendering
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;

//uniform vec4 uRenderColour; //for colourisation / blur
varying vec2 vTexCoord;
varying float vIntensity;

void main(void) {
	gl_FragColor = vIntensity * texture2D(uSampler, vTexCoord);
}