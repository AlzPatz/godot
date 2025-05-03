shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture, repeat_disable, filter_nearest;
uniform bool weighted = true;

void fragment(){
	vec4 blendColor = texture(screen_texture,SCREEN_UV);
	if (blendColor.r == 0.0 && blendColor.g == 0.0 && blendColor.b == 0.0)
	{
		discard;
	}
	COLOR = blendColor.rgba;
}