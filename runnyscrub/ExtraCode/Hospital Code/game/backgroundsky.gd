extends Node2D

var config
var cameras

var initialised : bool = false
var texture : Texture2D
var camera : Camera2D #Might not be needed

var offscreen_texture : Texture2D

#Do we really need a sep inject and init. Eventually harmonise for all factory set up
func inject(conf, cams):
	config = conf
	cameras = cams
	
func init(assets : class_assets, offscreen_tex : Texture2D, cam : Camera2D):
	texture = assets.tex_spritesheet_1
	camera = cam
	offscreen_texture = offscreen_tex
	initialised = true

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if !initialised:
		return
		
	queue_redraw()

func _draw():
		
	if !initialised: #Captures a potential first draw before init called. Although probably not possible as not yet added to tree
		return
	
	#Draw offscreen rendered texture
	draw_texture_rect(offscreen_texture, Rect2(0,0,config.GAME_RESOLUTION_WIDTH, config.GAME_RESOLUTION_HEIGHT), false)
	
	return
	
	#I know where the camera is pointing (and zoom) but I don't know
	#The world coordinate sbounds of the viewport transformed by camera
	#I may need to pass in viewport information each frame (as can change)
	#Scratch that for now, config has a const of the resolutiom. so it's fragile if something changes later but we use that for now
	
	var viewport_width_world : float = config.GAME_RESOLUTION_WIDTH * cameras.zoom_one_over_sky
	var viewport_height_world : float = config.GAME_RESOLUTION_HEIGHT * cameras.zoom_one_over_sky
	
	var viewport_halfsize : Vector2 = 0.5 * Vector2(viewport_width_world, viewport_height_world)
	var viewport_topleft_world : Vector2 = camera.position - viewport_halfsize
	var viewport_bottomright_world : Vector2 = camera.position +  viewport_halfsize
	
	#Add buffer
	viewport_topleft_world -= Vector2(config.BgOverScanSize, config.BgOverScanSize)
	viewport_bottomright_world += Vector2(config.BgOverScanSize, config.BgOverScanSize)
	
	#Find horizontal position to start drawing from
	var divisor_float : float = viewport_topleft_world.x / config.TILE_DIMENSION_SKY
	var divisor_int : int = snappedi(divisor_float, 1)
	
	#Check integer rounded position is more negative than the float position
	while divisor_int * config.TILE_DIMENSION_SKY > viewport_topleft_world.x:
		divisor_int -= 1
	
	var sky_start_x : int = divisor_int * config.TILE_DIMENSION_SKY
	
	#Find vertical position to start drawing from
	divisor_float = viewport_topleft_world.y / config.TILE_DIMENSION_SKY
	divisor_int = snappedi(divisor_float, 1)
	while divisor_int * config.TILE_DIMENSION_SKY > viewport_topleft_world.y:
		divisor_int -= 1
	
	var sky_start_y : int = divisor_int * config.TILE_DIMENSION_SKY
	
	var cell_topleft_x : int = sky_start_x
	var cell_topleft_y : int = sky_start_y
	var large_tile_dimension : bool
	var is_middle_sky_line : bool 
	
	#The only way to keep using cameras like this is to not zoom. solutioms could be removing cameras and moving to pixel snapped manual changes or perhaps fully rendering the layers 1:1 before scaling
	var texOverSize = 0
	var texUnderSize = 0
	
	while cell_topleft_y < viewport_bottomright_world.y:
		large_tile_dimension = cell_topleft_y < config.BACKGROUND_SKY_MIDLINE_TOPTILE_Y
		if large_tile_dimension:
			is_middle_sky_line = false
		else:
			is_middle_sky_line = cell_topleft_y == config.BACKGROUND_SKY_MIDLINE_TOPTILE_Y
		cell_topleft_x = sky_start_x
		while cell_topleft_x < viewport_bottomright_world.x:
			if large_tile_dimension:
				draw_texture_rect_region(texture, Rect2(cell_topleft_x - texUnderSize, cell_topleft_y - texUnderSize, config.TILE_DIMENSION_SKY + texUnderSize + texOverSize, config.TILE_DIMENSION_SKY + texUnderSize + texOverSize), Rect2(config.TEXCORD_SKY_DARK_X0, config.TEXCORD_SKY_DARK_Y0, config.TEXCORD_SKY_DARK_SIZE, config.TEXCORD_SKY_DARK_SIZE))
			else:
				if is_middle_sky_line:
					draw_texture_rect_region(texture, Rect2(cell_topleft_x - texUnderSize, cell_topleft_y - texUnderSize, config.TILE_DIMENSION_SKY_HALF_SIZE + texUnderSize + texOverSize, config.TILE_DIMENSION_SKY_HALF_SIZE + texUnderSize + texOverSize), Rect2(config.TEXCORD_SKY_MIDDLE_X0, config.TEXCORD_SKY_MIDDLE_Y0, config.TEXCORD_SKY_MIDDLE_SIZE, config.TEXCORD_SKY_MIDDLE_SIZE))
				else:
					draw_texture_rect_region(texture, Rect2(cell_topleft_x - texUnderSize, cell_topleft_y - texUnderSize, config.TILE_DIMENSION_SKY_HALF_SIZE + texUnderSize + texOverSize, config.TILE_DIMENSION_SKY_HALF_SIZE + texUnderSize + texOverSize), Rect2(config.TEXCORD_SKY_LIGHT_X0, config.TEXCORD_SKY_LIGHT_Y0, config.TEXCORD_SKY_LIGHT_SIZE, config.TEXCORD_SKY_LIGHT_SIZE))
			cell_topleft_x += config.TILE_DIMENSION_SKY if large_tile_dimension else config.TILE_DIMENSION_SKY_HALF_SIZE
		cell_topleft_y += config.TILE_DIMENSION_SKY if large_tile_dimension else config.TILE_DIMENSION_SKY_HALF_SIZE 
