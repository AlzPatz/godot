//shockwaveonly.frag
//Fragment Shader for 'shockwave' application to renderbuffer
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSamplerTexture;
uniform sampler2D uSamplerShockWave;

varying vec2 vTexCoord;

void main(void) {
	vec2 tex = vTexCoord;
	vec2 displace = texture2D(uSamplerShockWave, tex).bg;
	tex.x += ((displace.x * 2.0) - 1.0) * 0.01;
	tex.y += ((displace.y * 2.0) - 1.0) * 0.01;
	gl_FragColor = texture2D(uSamplerTexture, tex);
}