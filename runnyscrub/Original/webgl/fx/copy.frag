//copy.frag
//Fragment Shader for simple backbuffer transfer
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSamplerTexture;

varying vec2 vTexCoord;

void main(void) {
	gl_FragColor = texture2D(uSamplerTexture, vTexCoord);
}