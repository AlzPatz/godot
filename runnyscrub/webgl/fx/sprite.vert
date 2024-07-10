//sprite.vert
//Vertex shader for 'sprite' Rendering
uniform mat4 uCameraMatrix;
		
attribute vec2 aLocalPosition; //position of vertex
attribute vec3 aSpritePosition; //x,y,depth of 'sprite' position
attribute vec2 aTexCoord; //TexCord
attribute float aRotation; //rotation (degrees!)
attribute vec4 aColour; //r,g,b,a

varying vec4 vColour; //Colour to send through. Shame to use varying as all corners the same colour (wasted interpolation, but guess is provided by hardware path anyway so hopefully t=0 or close)
varying vec2 vTexCoord;

void main(void) {
	vTexCoord = aTexCoord;
	vColour = aColour;
	vec4 pos = vec4(aLocalPosition.x, aLocalPosition.y, 0.0, 1.0);
	
	float ang = radians(aRotation);
	mat4 mRotation = mat4( cos(ang) , -sin(ang) , 0.0 , 0.0 ,
						   sin(ang) , cos(ang) , 0.0 , 0.0 ,
						   0.0 , 0.0 , 1.0 , 0.0 , 
						   0.0 , 0.0 , 0.0 , 1.0 );
	pos = pos * mRotation;
	pos.x += aSpritePosition.x;
	pos.y += aSpritePosition.y;
	pos.z = -aSpritePosition.z; //Not sure why this needs to be negative. for the GUI ortho i thought i knew (see that file) but guess both need swtiching...
	pos.w = 1.0;
	gl_Position = uCameraMatrix * pos;
}