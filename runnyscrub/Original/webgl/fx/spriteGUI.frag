//spriteGUI.frag
//Fragment Shader for 'sprite' rendering
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D uSampler;
uniform vec4 uBaseGUIColour;
varying vec4 vColour;
varying vec2 vTexCoord;
		
void main(void) {
	gl_FragColor = vColour * uBaseGUIColour * texture2D(uSampler, vTexCoord);
}