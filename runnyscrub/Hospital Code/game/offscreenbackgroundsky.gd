extends Node2D
class_name class_offscreen_background_sky

var config
var cameras

var initialised : bool = false

var texture : Texture2D

var Render_World_TopLeft_Position : Vector2i
var Render_Size_Of_Drawn_Rect : Vector2i

var last_process_camera_position : Vector2i

#Do we really need a sep inject and init. Eventually harmonise for all factory set up
func inject(conf, cams):
	config = conf
	cameras = cams
	
func init(assets : class_assets):
	texture = assets.tex_spritesheet_1
	initialised = true

func _ready():
	pass 

func _process(delta):
	if !initialised:
		return
	
	last_process_camera_position = Vector2i(floori(cameras.camera_position_sky.x), floori(cameras.camera_position_sky.y))
	
	queue_redraw()

func _draw():
	if !initialised: #Captures a potential first draw before init called. Although probably not possible as not yet added to tree
		return
	#Background layers are drawn at 1:1 pixel scaling on a background surface
	#Depending on the level of zoom, and what is therefore visible in the final viewport
	#only a portion of this background surface may be rendered to
	#it is the responsibility of this code to render the portion of the sky visible
	#(overdrawing to the edge of whole texture pieces) and to record where in the world
	#the location of the top left of this texture should be drawn, and how much of it (sample rectangle)
	#All this to stop those pesky lines showing in between tiles when rendered instead at various zoom scaling
	
	#How big is the visible amount of the sky?
	var viewport_width_world : int = floori(config.GAME_RESOLUTION_WIDTH * cameras.zoom_one_over_sky)
	var viewport_height_world : int = floori(config.GAME_RESOLUTION_HEIGHT * cameras.zoom_one_over_sky)
	
	#Make an even number
	if viewport_width_world % 2 == 1:
		viewport_width_world += 1
	
	if viewport_height_world % 2 == 1:
		viewport_height_world += 1
	
	var viewport_halfsize : Vector2i = Vector2i(viewport_width_world / 2, viewport_height_world / 2)
	
	var cameraPosition : Vector2i = last_process_camera_position
	
	var viewport_topleft_world : Vector2i = cameraPosition - viewport_halfsize
	var viewport_bottomright_world : Vector2i = cameraPosition +  viewport_halfsize
	
	#Calculate X 
	var partial_x : int
	var modulo_x : int = viewport_topleft_world.x % config.TILE_DIMENSION_SKY
	if viewport_topleft_world.x >= 0:
		partial_x = modulo_x
	else:
		partial_x = config.TILE_DIMENSION_SKY + modulo_x
	var sky_start_x : int = viewport_topleft_world.x - partial_x
	var divisor_int_x : int = viewport_topleft_world.x / config.TILE_DIMENSION_SKY
	
	#Calculate Y
	var partial_y : int
	var modulo_y : int = viewport_topleft_world.y % config.TILE_DIMENSION_SKY
	if viewport_topleft_world.y >= 0:
		partial_y = modulo_y
	else:
		partial_y = 0 if modulo_y == 0 else config.TILE_DIMENSION_SKY + modulo_y
	var sky_start_y : int = viewport_topleft_world.y - partial_y
	
	var cell_world_topleft_x : int = sky_start_x #Is actually set at the top of the inner loop below
	var cell_world_topleft_y : int = sky_start_y
	var cell_local_topleft_x : int = 0
	var cell_local_topleft_y : int = 0
	
	var bottomright_world_snapped_x : int = viewport_bottomright_world.x
	var bottomright_world_snapped_y : int = viewport_bottomright_world.y
	
	#Round down to integer position
	var large_tile_dimension : bool
	var is_middle_sky_line : bool 
	
	var width_of_rendered_rect : int = 0
	var height_of_rendered_rect : int = 0
	
	var is_first_column : bool = true	
	
	while cell_world_topleft_y < bottomright_world_snapped_y:
		large_tile_dimension = cell_world_topleft_y < config.BACKGROUND_SKY_MIDLINE_TOPTILE_Y
		if large_tile_dimension:
			is_middle_sky_line = false
		else:
			is_middle_sky_line = cell_world_topleft_y == config.BACKGROUND_SKY_MIDLINE_TOPTILE_Y
		cell_world_topleft_x = sky_start_x
		cell_local_topleft_x = 0
		while cell_world_topleft_x < bottomright_world_snapped_x:
			if large_tile_dimension:
				draw_texture_rect_region(texture, Rect2(cell_local_topleft_x, cell_local_topleft_y, config.TILE_DIMENSION_SKY, config.TILE_DIMENSION_SKY), \
										 Rect2(config.TEXCORD_SKY_DARK_X0, config.TEXCORD_SKY_DARK_Y0, config.TEXCORD_SKY_DARK_SIZE, config.TEXCORD_SKY_DARK_SIZE))
				if is_first_column:
					width_of_rendered_rect += config.TILE_DIMENSION_SKY
			else:
				if is_middle_sky_line:
					draw_texture_rect_region(texture, Rect2(cell_local_topleft_x, cell_local_topleft_y, config.TILE_DIMENSION_SKY_HALF_SIZE, config.TILE_DIMENSION_SKY_HALF_SIZE), \
											Rect2(config.TEXCORD_SKY_MIDDLE_X0, config.TEXCORD_SKY_MIDDLE_Y0, config.TEXCORD_SKY_MIDDLE_SIZE, config.TEXCORD_SKY_MIDDLE_SIZE))
				else:
					draw_texture_rect_region(texture, Rect2(cell_local_topleft_x, cell_local_topleft_y, config.TILE_DIMENSION_SKY_HALF_SIZE, config.TILE_DIMENSION_SKY_HALF_SIZE), \
											 Rect2(config.TEXCORD_SKY_LIGHT_X0, config.TEXCORD_SKY_LIGHT_Y0, config.TEXCORD_SKY_LIGHT_SIZE, config.TEXCORD_SKY_LIGHT_SIZE))
				if is_first_column:
					width_of_rendered_rect += config.TILE_DIMENSION_SKY_HALF_SIZE
			cell_world_topleft_x += config.TILE_DIMENSION_SKY if large_tile_dimension else config.TILE_DIMENSION_SKY_HALF_SIZE
			cell_local_topleft_x += config.TILE_DIMENSION_SKY if large_tile_dimension else config.TILE_DIMENSION_SKY_HALF_SIZE
		is_first_column = false
		cell_world_topleft_y += config.TILE_DIMENSION_SKY if large_tile_dimension else config.TILE_DIMENSION_SKY_HALF_SIZE 
		cell_local_topleft_y += config.TILE_DIMENSION_SKY if large_tile_dimension else config.TILE_DIMENSION_SKY_HALF_SIZE 
		if large_tile_dimension:
			height_of_rendered_rect += config.TILE_DIMENSION_SKY
		else:
			height_of_rendered_rect += config.TILE_DIMENSION_SKY_HALF_SIZE
		
	#Set public variables to be used later when rendering this texture to the world
	Render_World_TopLeft_Position = Vector2i(sky_start_x, sky_start_y)
	Render_Size_Of_Drawn_Rect = Vector2i(width_of_rendered_rect, height_of_rendered_rect)
