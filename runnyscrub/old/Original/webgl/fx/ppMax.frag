//ppMax.frag
//Fragment shader for post process rendering
/*
* Max Graphics Shader Runs all effects and allows blending of any two effects:
* Basic Effect: Negative (0)
* Basic Effect: Grayscale (1)
* Basic Effect: Colourise (2)
* Basic Effect: Pixelate (3)
* Advanced Effect: OldMovie
* Advanced Effect: ShockWave
*/

//Set floating point precision
#ifdef GL_ES
		precision highp float;
#endif

//Texture Sampler Uniforms
uniform sampler2D uTextureSampler;
uniform sampler2D uNoiseSampler;
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

//Old Movie Effect Uniforms
struct effectOldMovie { 
	int active_Current;
	int active_Next;
	float scratch;
	float noise;
	float rndLine1;
	float rndLine2;
	float frame;
	float cpuShift;
	float rndShiftCutOff;
	float rndShiftScalar;
	float dim;
};
uniform effectOldMovie movie;

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
	vec2 rnd;
	float shft;
	vec2 rndx;
	float dim;
	vec2 sc;
	float scr;
	vec2 rLine;
	vec3 rand;
	vec2 dist;
	float flux;
	float mty_shift;

	vec4 col_Current;

	//ShochWave Warp
	if(uShockWave) {
		vec2 displace = texture2D(uShockWaveSampler, tex).bg;
		tex.x += ((displace.x * 2.0) - 1.0) * 0.01;
		tex.y += ((displace.y * 2.0) - 1.0) * 0.01;
	}

	//Old Movie - Stage 1
	if(movie.active_Current == 1) {
		mty_shift = movie.cpuShift;
		if(mty_shift < 0.0) { 
			mty_shift += 1.0;
		}
		rnd = movie.frame * vec2(0.003, 0.06);
		shft = texture2D(uNoiseSampler, rnd).r;
		if(shft > movie.rndShiftCutOff) { 
			mty_shift -= shft * movie.rndShiftScalar;
		}
		tex.y += mty_shift;
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

	//Old Movie - Stage 2
	if(movie.active_Current == 1) {
		rndx = movie.frame * vec2(0.007, 0.01);
		dim = texture2D(uNoiseSampler, rndx).r;
		dim *= movie.dim;
		if(dim > 1.0) { 
			dim = 1.0;
		}
		dim = 1.0 - dim;
		sc  = movie.frame * vec2(0.01, 0.04);
		sc.x = fract(tex.x + sc.x);
		scr = texture2D(uNoiseSampler, sc).r;
		scr = 2.0 * scr * (1.0 / movie.scratch);
		scr = 1.0 - abs(1.0 - scr);
		scr = max(0.0, scr);
		col_Current.rgb += scr;
		rLine = (tex + movie.rndLine1 + movie.rndLine1) * 0.33;
		rand = texture2D(uNoiseSampler, rLine).rgb;
		if(movie.noise > rand.r) { 
			col_Current.rgb = vec3(0.1 + rand.b * 0.4);
		}
	}

	//Grayscale
	if(basic.uEffectsCurrent[1]) { 
		gray = (0.3 * col_Current.r) + (0.59 * col_Current.g) + (0.11 * col_Current.b);
		col_Current = vec4(gray, gray, gray, col_Current.a);
	}

	//Old Movie - Stage 3
	if(movie.active_Current == 1) {
		col_Current = vec4(0.9 * col_Current.r, 0.8 * col_Current.g, 0.6 * col_Current.b,  col_Current.a);
		vec2 dist = 0.5 - tex;
		flux = movie.rndLine2 * 0.04 - 0.02;
		col_Current.rgb *= (0.4 + flux - dot(dist, dist)) * 2.8;
	}

	if(basic.uEffectsBlend == 0.0) {
		//No effect blending so good to go
		gl_FragColor = col_Current * basic.uBaseColour;
	} 
	else {
		//As we are transfering between effects we need to work out the final colour and then blend them together
		tex = vTexCoord;
		vec4 col_Next;

		//Old Movie - Stage 1
		if(movie.active_Next == 1) {
			tex.y += mty_shift;
		}

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

		//Old Movie - Stage 2
		if(movie.active_Next == 1) {
			rndx = movie.frame * vec2(0.007, 0.01);
			dim = texture2D(uNoiseSampler, rndx).r;
			dim *= movie.dim;
			if(dim > 1.0) { 
				dim = 1.0;
			}
			dim = 1.0 - dim;
			sc  = movie.frame * vec2(0.01, 0.04);
			sc.x = fract(tex.x + sc.x);
			scr = texture2D(uNoiseSampler, sc).r;
			scr = 2.0 * scr * (1.0 / movie.scratch);
			scr = 1.0 - abs(1.0 - scr);
			scr = max(0.0, scr);
			col_Current.rgb += scr;
			rLine = (tex + movie.rndLine1 + movie.rndLine1) * 0.33;
			rand = texture2D(uNoiseSampler, rLine).rgb;
			if(movie.noise > rand.r) { 
				col_Current.rgb = vec3(0.1 + rand.b * 0.4);
			}
		}

		//Grayscale
		if(basic.uEffectsNext[1]) { 
			gray = (0.3 * col_Next.r) + (0.59 * col_Next.g) + (0.11 * col_Next.b);
			col_Next = vec4(gray, gray, gray, col_Next.a);
		}

		//Old Movie - Stage 3
		if(movie.active_Current == 1) {
			col_Next = vec4(0.9 * col_Current.r, 0.8 * col_Current.g, 0.6 * col_Current.b,  col_Next.a);
			col_Next.rgb *= (0.4 + flux - dot(dist, dist)) * 2.8;
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
