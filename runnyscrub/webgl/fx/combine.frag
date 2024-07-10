//combine.frag
//Fragment Shader for blur rending (full screen quad effect)
//Combines the output of two textures, the current frame and the old

#ifdef GL_ES
precision highp float;
#endif

const vec2 divx = vec2(1.0 / 800.0, 0.0);
const vec2 divy = vec2(0.0, 1.0 / 600.0);

const float multi_one = 1.0 / 8.0;
const float multi_two = 1.0 / 16.0;

const vec4 tint = vec4(1.05, 0.95, 0.85, 1.0);

uniform bvec2 uBlurToggles; //0 = Two Stage, 1 = Tint
uniform float uBlur;
uniform float uBlurStageShare;

uniform sampler2D uSamplerNew;
uniform sampler2D uSamplerOld;

varying vec2 vTexCoord;

void main(void) {
	float neg = 1.0 - uBlur;
	float multi = multi_one * uBlur;

	if(uBlurToggles[0]) {
		multi *= uBlurStageShare;
	}

	vec4 col = vec4(0.0, 0.0, 0.0, 0.0);

	//Stage One Blur	
	col += texture2D(uSamplerOld, vTexCoord + divx);
	col += texture2D(uSamplerOld, vTexCoord - divx);
	col += texture2D(uSamplerOld, vTexCoord + divy);
	col += texture2D(uSamplerOld, vTexCoord - divy);
	col += texture2D(uSamplerOld, vTexCoord + divx + divy);
	col += texture2D(uSamplerOld, vTexCoord + divx - divy);
	col += texture2D(uSamplerOld, vTexCoord - divx + divy);
	col += texture2D(uSamplerOld, vTexCoord - divx - divy);
	col *= multi;

	//Optional Stage Two Blur
	if(uBlurToggles[0]) {
		vec4 col2;
		multi = (1.0 - uBlurStageShare) * multi_two * uBlur;
		col2 += texture2D(uSamplerOld, vTexCoord + (2.0 * divx));
		col2 += texture2D(uSamplerOld, vTexCoord + (2.0 * divx) - divy);
		col2 += texture2D(uSamplerOld, vTexCoord + (2.0 * divx) - (2.0 * divy));
		col2 += texture2D(uSamplerOld, vTexCoord + divx - (2.0 * divy));
		col2 += texture2D(uSamplerOld, vTexCoord - (2.0 * divy));
		col2 += texture2D(uSamplerOld, vTexCoord - divx - (2.0 * divy));
		col2 += texture2D(uSamplerOld, vTexCoord - (2.0 * divx) - (2.0 * divy));
		col2 += texture2D(uSamplerOld, vTexCoord - (2.0 * divx) - divy);
		col2 += texture2D(uSamplerOld, vTexCoord - (2.0 * divx));
		col2 += texture2D(uSamplerOld, vTexCoord - (2.0 * divx) + divy);
		col2 += texture2D(uSamplerOld, vTexCoord - (2.0 * divx) + (2.0 * divy));
		col2 += texture2D(uSamplerOld, vTexCoord - divx + (2.0 * divy));
		col2 += texture2D(uSamplerOld, vTexCoord + (2.0 * divy));
		col2 += texture2D(uSamplerOld, vTexCoord + divx + (2.0 * divy));
		col2 += texture2D(uSamplerOld, vTexCoord + (2.0 * divx) + (2.0 * divy));
		col2 += texture2D(uSamplerOld, vTexCoord + (2.0 * divx) + divy);
		col += multi * col2;
	}

	//Optional Tint
	if(uBlurToggles[1]) {
		col *= tint;
	}

	//Final Output
	gl_FragColor = col +  (neg * texture2D(uSamplerNew, vTexCoord));
}