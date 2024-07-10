//ppMin.frag
//Fragment shader for post process rendering
/*
* Min Graphics Shader Runs basic effects (minus pixellation) and cannot blend two effects (also loses Old Movie):
* Basic Effect: Negative (0)
* Basic Effect: Grayscale (1)
* Basic Effect: Colourise (2)
*/

//Set floating point precision
#ifdef GL_ES
		precision highp float;
#endif

//Texture Sampler Uniforms
uniform sampler2D uTextureSampler;

//Basic Effect Uniforms
struct effectBasic { 
	vec4 uBaseColour; //Must be a pre-multiplied Alpha Colour
	vec4 uMixColour; //Must be a pre-multiplied Alpha Colour
	bvec4 uEffects; //0 = Negative, 1 = GrayScale, 2 = Colourise, 3 = UNUSED
};
uniform effectBasic basic;

//Input Varying
varying vec2 vTexCoord;

//Pixel / Fragment Shader
void main(void) {
	//Working Variables
	float gray;

	vec4 col_Current;

	col_Current = texture2D(uTextureSampler, vTexCoord);

	//Colourise
	if(basic.uEffects[2]) { 
		col_Current *= basic.uMixColour;
	}

	//Negative
	if(basic.uEffects[0]) { 
		col_Current = vec4(1.0 - col_Current.r, 1.0 - col_Current.g, 1.0- col_Current.b, col_Current.a);
	}

	//Grayscale
	if(basic.uEffects[1]) { 
		gray = (0.3 * col_Current.r) + (0.59 * col_Current.g) + (0.11 * col_Current.b);
		col_Current = vec4(gray, gray, gray, col_Current.a);
	}

	//No effect blending so good to go
	gl_FragColor = col_Current * basic.uBaseColour;
}
