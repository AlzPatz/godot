//crt.vert
//Vertex Shader for post process rending (full screen CRT effect)

attribute vec3 aVertexPosition; 
attribute vec3 aVertexNormal;
attribute vec2 aTexCoord;

uniform mat4 uMV_Matrix;
uniform mat4 uP_Matrix;
uniform mat3 uN_Matrix;

varying vec2 vTexCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;

void main(void) {
	vTexCoord = aTexCoord;
	vTransformedNormal = uN_Matrix * aVertexNormal;
	vPosition = uMV_Matrix * vec4(aVertexPosition, 1.0);
	gl_Position = uP_Matrix * vPosition;
}