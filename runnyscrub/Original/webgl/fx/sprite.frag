//sprite.frag
//Fragment Shader for 'sprite' rendering
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D uSampler;
//uniform vec4 uRenderColour; //for colourisation / blur
varying vec4 vColour;
varying vec2 vTexCoord;

void main(void) {
	//gl_FragColor = uRenderColour * vColour * texture2D(uSampler, vTexCoord);
	gl_FragColor = vColour * texture2D(uSampler, vTexCoord);
}