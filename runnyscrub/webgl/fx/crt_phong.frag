//crt.frag
//Fragment Shader for CRT effect rendering

#ifdef GL_ES
precision highp float;
#endif

const float tcSmScalar_x = 800.0 / 64.0;
const float tcSmScalar_y = 600.0 / 16.0;

uniform bvec3 uCrtToggles; //0 = RGB Shadow Mask, 1 == Pre Multiplier for back buffer sample (make brighter), 2 == Lighting

uniform float uShadowMaskIntensity;
uniform float uShadowMaskSizeScalar;

uniform float uSampleBrightnessMultiplier;

uniform sampler2D uSamplerMain;
uniform sampler2D uSamplerShadowMask;

uniform float uSpecularShininess;

uniform vec3 uAmbientColour;
uniform vec3 uPointLightPosition;
uniform vec3 uPointLightColour;
uniform vec3 uCameraPosition;

varying vec2 vTexCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;

void main(void) {
	vec4 col = texture2D(uSamplerMain, vTexCoord);

	//Brighten Image
	if(uCrtToggles[1]) {
		col *= uSampleBrightnessMultiplier;
	}

	//Apply Shadow Mask
	if(uCrtToggles[0]) {
		float neg = 1.0 - uShadowMaskIntensity;
		col *= neg;
		col += uShadowMaskIntensity * texture2D(uSamplerShadowMask, uShadowMaskSizeScalar * vec2(vTexCoord.x * tcSmScalar_x, vTexCoord.y * tcSmScalar_y));
	}

	//col = vec4(1.0, 1.0, 1.0, 1.0);

	//Apply per pixel lighting
	if (uCrtToggles[2]) {

		//Phong Model: Ambient + Diffuse + Specular
		//I = Ambient + (L.N)*Diffuse + ((R.V)^Shininess)*Specular

		vec3 L = normalize(uPointLightPosition - vPosition.xyz);
		vec3 N = normalize(vTransformedNormal);

		float LdotN = max(dot(L, N), 0.0);

		vec3 R = normalize((2.0 * LdotN * N) - L);
		vec3 V = normalize(uCameraPosition - vPosition.xyz);

		float RdotV = max(dot(R, V), 0.0);

		vec3 I = uAmbientColour + 
				(uPointLightColour * LdotN) + 
				(pow(RdotV, uSpecularShininess) * uPointLightColour);

		gl_FragColor = vec4(col.rgb * I, col.a);
	}
	else {
		gl_FragColor = col;
	}
}