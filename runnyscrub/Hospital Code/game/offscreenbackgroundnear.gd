extends Node2D
class_name class_offscreen_background_near

var config
var cameras

var initialised : bool = false

var texture : Texture2D
var camera : Camera2D

var Render_World_TopLeft_Position : Vector2i
var Render_Size_Of_Drawn_Rect : Vector2i

var length_of_psuedo_random_array : int = 100
var psuedoRandomBinaryResult : Array[bool]

#Do we really need a sep inject and init. Eventually harmonise for all factory set up
func inject(conf, cams):
	config = conf
	cameras = cams
	
func init(assets : class_assets, cam : Camera2D):
	camera = cam
	texture = assets.tex_spritesheet_1
	initialised = true

func ReturnRandomTop (x : int) -> bool:
	if x < 0:
		x = 0
	while x >= length_of_psuedo_random_array:
		x -= length_of_psuedo_random_array
	return psuedoRandomBinaryResult[x]

func _ready():
	var one_hundred_digits_pi : Array[int] = [3,1,4,1,5,9,2,6,5,3,5,8,9,7,9,3,2,3,8,4,6,2,6,4,3, \
											  3,8,3,2,7,9,5,0,2,8,8,4,1,9,7,1,6,9,3,9,9,3,7,5,1, \
											  0,5,8,2,0,9,7,4,9,4,4,5,9,2,3,0,7,8,1,6,4,0,6,2,8, \
											  6,2,0,8,9,9,8,6,2,8,0,3,4,8,2,5,3,4,2,1,1,7,0,6,7]
	
	psuedoRandomBinaryResult.resize(100)
	for n in 100:
		psuedoRandomBinaryResult[n] = true if one_hundred_digits_pi[n] % 2 == 0 else false 

func _process(delta):
	if !initialised:
		return
		
	queue_redraw()

func _draw():
	if !initialised: #Captures a potential first draw before init called. Although probably not possible as not yet added to tree
		return
	return
	
	#Background layers are drawn at 1:1 pixel scaling on a background surface
	#Depending on the level of zoom, and what is therefore visible in the final viewport
	#only a portion of this background surface may be rendered to
	#it is the responsibility of this code to render the portion of the sky visible
	#(overdrawing to the edge of whole texture pieces) and to record where in the world
	#the location of the top left of this texture should be drawn, and how much of it (sample rectangle)
	#All this to stop those pesky lines showing in between tiles when rendered instead at various zoom scaling
	
	#How big is the visible amount of the far background?
	var viewport_width_world : float = config.GAME_RESOLUTION_WIDTH * cameras.zoom_one_over_near
	var viewport_height_world : float = config.GAME_RESOLUTION_HEIGHT * cameras.zoom_one_over_near
	
	var viewport_halfsize : Vector2 = 0.5 * Vector2(viewport_width_world, viewport_height_world)
	var viewport_topleft_world : Vector2 = camera.position - viewport_halfsize
	var viewport_bottomright_world : Vector2 = camera.position +  viewport_halfsize
	
	#Now we want to find the position (integer snapped) of the top left position of the top left potential tile
	
	#Calculate X 
	#Round down to integer position
	var topleft_world_snapped_x = floor(viewport_topleft_world.x)
	#Round down to the nearest tile left edge integer position
	var divisor_float_x : float = topleft_world_snapped_x / config.TILE_DIMENSION_BG_NEAR
	var divisor_int_x : int = floori(divisor_float_x)
	var far_start_x : int = divisor_int_x * config.TILE_DIMENSION_BG_NEAR
	
	#Calculate Y
	#Round down to integer position
	var topleft_world_snapped_y = floor(viewport_topleft_world.y)
	#Round down to the nearest tile left edge integer position
	var divisor_float_y = topleft_world_snapped_y / config.TILE_DIMENSION_BG_NEAR
	var divisor_int_y = floori(divisor_float_y)
	var far_start_y : int = divisor_int_y * config.TILE_DIMENSION_BG_NEAR
	
	var cell_world_topleft_x : int = far_start_x #Is actually set at the top of the inner loop below
	var cell_world_topleft_y : int = far_start_y
	var cell_local_topleft_x : int = 0
	var cell_local_topleft_y : int = 0
	
	var bottomright_world_snapped_x : int = ceili(viewport_bottomright_world.x)
	var bottomright_world_snapped_y : int = ceili(viewport_bottomright_world.y)
	
	var above_buildings : bool
	var is_building_tops_line : bool 
	
	var width_of_rendered_rect : int = 0
	var height_of_rendered_rect : int = 0
	
	var is_first_row : bool = true
	
	var draw_first_top : bool
	var building_tops_count : int
	
	while cell_world_topleft_y < bottomright_world_snapped_y:
		above_buildings = cell_world_topleft_y < config.BACKGROUND_NEAR_BUILDING_TOPTILE_Y
		if not above_buildings:
			is_building_tops_line = cell_world_topleft_y == config.BACKGROUND_NEAR_BUILDING_TOPTILE_Y
			cell_world_topleft_x = far_start_x
			cell_local_topleft_x = 0
			building_tops_count = 0
			while cell_world_topleft_x < bottomright_world_snapped_x:
				if is_building_tops_line:
					draw_first_top = ReturnRandomTop(divisor_int_x + building_tops_count + config.RANDOM_BUILDING_TOP_SHIFT_NEAR)
					
					draw_texture_rect_region(texture, \
							Rect2(cell_local_topleft_x, cell_local_topleft_y, config.TILE_DIMENSION_BG_NEAR, config.TILE_DIMENSION_BG_NEAR), \
							Rect2(config.TEXCORD_BGNEAR_TOPS1_X0 if draw_first_top else config.TEXCORD_BGNEAR_TOPS2_X0, \
									config.TEXCORD_BGNEAR_TOPS1_Y0 if draw_first_top else config.TEXCORD_BGNEAR_TOPS2_Y0, \
									config.TEXCORD_BGNEAR_TOPS1_SIZE if draw_first_top else config.TEXCORD_BGNEAR_TOPS2_SIZE, \
									config.TEXCORD_BGNEAR_TOPS1_SIZE if draw_first_top else config.TEXCORD_BGNEAR_TOPS2_SIZE))
				else:
					draw_texture_rect_region(texture, Rect2(cell_local_topleft_x, cell_local_topleft_y, config.TILE_DIMENSION_BG_NEAR, config.TILE_DIMENSION_BG_NEAR), \
											 Rect2(config.TEXCORD_BGNEAR_MIDDLE_X0, config.TEXCORD_BGNEAR_MIDDLE_Y0, config.TEXCORD_BGNEAR_MIDDLE_SIZE, config.TEXCORD_BGNEAR_MIDDLE_SIZE))
				if is_first_row:
					width_of_rendered_rect += config.TILE_DIMENSION_BG_NEAR
				
				cell_world_topleft_x += config.TILE_DIMENSION_BG_NEAR
				cell_local_topleft_x += config.TILE_DIMENSION_BG_NEAR
				building_tops_count += 1 #Only used for top building row... perhaps hide increments in a conditional
			is_first_row = false
		cell_world_topleft_y += config.TILE_DIMENSION_BG_NEAR 
		cell_local_topleft_y += config.TILE_DIMENSION_BG_NEAR
		height_of_rendered_rect += config.TILE_DIMENSION_BG_NEAR
	#Set public variables to be used later when rendering this texture to the world
	Render_World_TopLeft_Position = Vector2i(far_start_x, far_start_y)
	Render_Size_Of_Drawn_Rect = Vector2i(width_of_rendered_rect, height_of_rendered_rect)
