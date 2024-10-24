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
	//COLOR.rgb = mix(vec3((COLOR.r + COLOR.g + COLOR.b) / 3.0), vec3(0.299 * COLOR.r + 0.587 * COLOR.g + 0.114 * COLOR.b), float(weighted));
}