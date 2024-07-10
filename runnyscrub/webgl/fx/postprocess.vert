//postProcess.vert
//Vertex Shader for post process rending (full screen quad effect), also used for blur and standalone shockwave and render pass
attribute vec2 aVertexPosition; //already in homogenous NDC space or whatever it is called
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
void main(void) {
	vTexCoord = aTexCoord;
	gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}