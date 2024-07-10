//ppMed.frag
//Fragment shader for post process rendering
/*
* Med Graphics Shader Runs basic effects and can blend (loses Old Movie):
* Basic Effect: Negative (0)
* Basic Effect: Grayscale (1)
* Basic Effect: Colourise (2)
* Basic Effect: Pixelate (3)
* Advanced Effect: ShockWave
*/

//Set floating point precision
#ifdef GL_ES
		precision highp float;
#endif

//Texture Sampler Uniforms
uniform sampler2D uTextureSampler;
uniform sampler2D uShockWaveSampler;

//Basic Effect Uniforms
struct effectBasic { 
	vec4 uBaseColour; //Must be a pre-multiplied Alpha Colour
	vec4 uMixColourCurrent; //Must be a pre-multiplied Alpha Colour
	vec4 uMixColourNext; //Must be a pre-multiplied Alpha Colour
	bvec4 uEffectsCurrent; //0 = Negative, 1 = GrayScale, 2 = Colourise, 3 = Pixelatte
	bvec4 uEffectsNext; //0 = Negative, 1 = GrayScale, 2 = Colourise, 3 = Pixelatte
	float uEffectsBlend;
	float uPixellateDivisionsX;
	float uPixellateDivisionsY;
};
uniform effectBasic basic;

uniform bool uShockWave;

//Input Varying
varying vec2 vTexCoord;

//Pixel / Fragment Shader
void main(void) {
	//Working Variables
	vec2 tex = vTexCoord;
	float oneminusblend;
	float oneminusalpha;
	float gray;
	float dx;
	float dy;
	int sx;
	int sy;

	vec4 col_Current;

	//ShochWave Warp
	if(uShockWave) {
		vec2 displace = texture2D(uShockWaveSampler, tex).bg;
		tex.x += ((displace.x * 2.0) - 1.0) * 0.01;
		tex.y += ((displace.y * 2.0) - 1.0) * 0.01;
	}

	//Pixellate
	if(basic.uEffectsCurrent[3]) {  
		dx = 1.0 / basic.uPixellateDivisionsX;
		dy = 1.0 / basic.uPixellateDivisionsY;
		sx = int(tex.x / dx);
		sy = int(tex.y / dy);
		tex.x = float(sx) *dx;
		tex.y = float(sy) * dy;
	}
	col_Current = texture2D(uTextureSampler, tex);

	//Colourise
	if(basic.uEffectsCurrent[2]) { 
		col_Current *= basic.uMixColourCurrent;
	}

	//Negative
	if(basic.uEffectsCurrent[0]) { 
		col_Current = vec4(1.0 - col_Current.r, 1.0 - col_Current.g, 1.0- col_Current.b, col_Current.a);
	}

	//Grayscale
	if(basic.uEffectsCurrent[1]) { 
		gray = (0.3 * col_Current.r) + (0.59 * col_Current.g) + (0.11 * col_Current.b);
		col_Current = vec4(gray, gray, gray, col_Current.a);
	}

	if(basic.uEffectsBlend == 0.0) {
		//No effect blending so good to go
		gl_FragColor = col_Current * basic.uBaseColour;
	} 
	else {
		//As we are transfering between effects we need to work out the final colour and then blend them together
		tex = vTexCoord;
		vec4 col_Next;

		//Pixellate
		if(basic.uEffectsNext[3]) {  
			dx = 1.0 / basic.uPixellateDivisionsX;
			dy = 1.0 / basic.uPixellateDivisionsY;
			sx = int(tex.x / dx);
			sy = int(tex.y / dy);
			tex.x = float(sx) *dx;
			tex.y = float(sy) * dy;
		}

		col_Next = texture2D(uTextureSampler, tex);
		//Colourise
		if(basic.uEffectsNext[2]) { 
			col_Next *= basic.uMixColourNext;
		}

		//Negative
		if(basic.uEffectsNext[0]) { 
			col_Next = vec4(1.0 - col_Next.r, 1.0 - col_Next.g, 1.0- col_Next.b, col_Next.a);
		}

		//Grayscale
		if(basic.uEffectsNext[1]) { 
			gray = (0.3 * col_Next.r) + (0.59 * col_Next.g) + (0.11 * col_Next.b);
			col_Next = vec4(gray, gray, gray, col_Next.a);
		}

		//Now we need to blend them together. They are pre-multiplied alpha'd colours. Use http://en.wikipedia.org/wiki/Alpha_compositing
		col_Next *= basic.uEffectsBlend;
		oneminusblend = 1.0 - basic.uEffectsBlend;
		col_Current *= oneminusblend;
		//Use alpha composting..
		oneminusalpha = 1.0 - col_Current.a;
		gl_FragColor = vec4(col_Current.r + (col_Next.r * oneminusalpha),
							col_Current.g + (col_Next.g * oneminusalpha),
							col_Current.b + (col_Next.b * oneminusalpha),
							col_Current.a + (col_Next.a * oneminusalpha)
							) * basic.uBaseColour;
	}
}
