extends Node2D

var initialised : bool = false

var config
var director

var texture : Texture2D

var levelFocus : Vector2
var levelZoom : float

var texCoordEdge : float = 0.0 #0.001 #Removes sampling that encroaches another sprite. Causes small aritfacts but better than lines..
#This remains pretty rigidly set up for the sprite tilesheet that I have been using
var delta_128 : float = 128.0 / 1024.0
var delta_256 : float = 256.0 / 1024.0

#Sky :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
var sky_numDark = 1
var sky_numLight = 6
var sky_horizontal_scalar = 0.1 #Must be 2.d.p only to ensure the wrap when starting game back at zero
var sky_vertical_256_equiv_tiles = sky_numDark + ((sky_numLight + 1) / 2)
var sky_total_height = sky_vertical_256_equiv_tiles * 256.0
var sky_vertical_ratio #init below

var sky_dark_x0 = 0.0 + texCoordEdge
var sky_dark_x1 = delta_256 - texCoordEdge
var sky_dark_y0 = (1.0 - delta_256) + texCoordEdge
var sky_dark_y1 = 1.0 - texCoordEdge
	
var sky_grad_x0 = (1.0 * delta_128) + texCoordEdge
var sky_grad_x1 = (2.0 * delta_128) - texCoordEdge
var sky_grad_y0 = (4.0 * delta_128) + texCoordEdge
var sky_grad_y1 = (5.0 * delta_128) - texCoordEdge

var sky_light_x0 = (1.0 * delta_128) + texCoordEdge
var sky_light_x1 = (2.0 * delta_128) - texCoordEdge
var sky_light_y0 = (5.0 * delta_128) + texCoordEdge
var sky_light_y1 = (6.0 * delta_128) - texCoordEdge

#Working Variables
var one_over_zoom : float
var mid_level_y : float #y position of middle of level, will match between layers
var absolute_vertical_distance_to_ceiling : float
var sky_vertical_distance_to_top : float
var sky_start_y : float
var sky_extra_top : int
var sky_start_x : float
var divisor_float : float 
var divisor_int : int
var skyMidOnScreen : bool
var bottomfound : bool
var current_x : float
var current_y : float
var row_middle : float
var row_bottom : float
var column_middle : float
var skyMidTopY : float
var skyMidBottomY : float

var cameraPosition : Vector2
var cameraZoom : float


var VIRTUAL_RENDER_WIDTH : int
var VIRTUAL_RENDER_HEIGHT : int

var viewport : SubViewport

# Called when the node enters the scene tree for the first time.
func _ready():
	texture = load("res://scenes/assets/textures/game/spritesheet_1.png")
	pass # Replace with function body.
	
func initialise(sub_viewport : SubViewport, conf, dir, virtual_render_width : int, virtual_render_height : int):
	viewport = sub_viewport
	
	VIRTUAL_RENDER_WIDTH = virtual_render_width
	VIRTUAL_RENDER_HEIGHT = virtual_render_height
	
	config = conf
	director = dir
	
	sky_vertical_ratio = sky_total_height / (config.ceiling_y - config.floor_y)
	
	texture = load("res://scenes/assets/textures/game/spritesheet_1.png")
	
	initialised = true

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if !initialised:
		return
	
	queue_redraw()

func UpdateCamera(camera2D : Camera2D, level_focus : Vector2, level_zoom : float):
	
	levelFocus = level_focus
	levelZoom = level_zoom
	
	#Add Scaling Later
	
	var level_total_height = config.floor_y - config.ceiling_y
	mid_level_y = config.ceiling_y + (0.5 * level_total_height)
	
	sky_vertical_ratio = sky_total_height / level_total_height
	
	camera2D.position.x = levelFocus.x #TO DO:: X is not yet scaled..
	camera2D.position.y = mid_level_y + (sky_vertical_ratio * (levelFocus.y - mid_level_y))
	camera2D.zoom = Vector2(levelZoom, levelZoom) #Zoom to be scaled vs the game zoom scale later

	one_over_zoom = 1.0 / camera2D.zoom.y
		
	#Calculate the current world bounds of this layers camera
	#To do
	#var cameraFocus : Vector2
	#var cameraWorldTop : float
	#var cameraWorldBottom : float
	#var cameraWorldLeft : float
	#var cameraWorldRight : float
	#var centreScreen : Vector2	
	
	cameraPosition - camera2D.position
	cameraZoom = camera2D.zoom.x

func _draw():
	if !initialised:
		return
	
	#Sky-World Y Coordinate of Top of Screen
	var top_of_screen_y = cameraPosition.y + (0.5 * viewport.size.y * one_over_zoom)
	
	#HERE .. need to rewrite this approach. Basically we are starting with an absolute position in
	#the layer of background. Need to work out if this is at the top of of we need to tile extra
	
	
	
	
		
	#absolute_vertical_distance_to_ceiling = director.cameraFocus.y - config.ceiling_y
	
	#Need to calculate the equivalent world coordinates at which to start drawing the sky from. Vertical first
	sky_vertical_distance_to_top = absolute_vertical_distance_to_ceiling * sky_vertical_ratio
	
	#Calculate the world coords that the top of sky falls on currently (moves due to ratio with absolute world)
	sky_start_y = director.cameraFocus.y - sky_vertical_distance_to_top 
	sky_start_y = snapped(sky_start_y, 1.0) #Let's see if later on we want this integer snapping
	
	#As the sky is the only layer that needs to reach all the way to the top of the screen, add additional top rows if needed
	sky_extra_top = 0
	
	while(sky_start_y < director.cameraWorldTop):
		sky_start_y += 256.0
		sky_extra_top+=1
	
	
	
			
	
	


	

	#Now for the horizontal Start Point
	sky_start_x = director.cameraWorldLeft * sky_horizontal_scalar
	divisor_float = sky_start_x / 256.0
	divisor_int = snapped(divisor_float, 1.0)
	sky_start_x = director.cameraWorldLeft -((divisor_float - divisor_int) * 256.0)
	sky_start_x = snapped(sky_start_x, 1.0)
	
	#draw_texture(texture, Vector2(0,0))
	
	skyMidOnScreen = false # Set to true if we draw sky mid
	bottomfound = false
	current_y = sky_start_y
	#Draw any additional rows need at the top to ensure there are no areas that the sky does not cover 
	if sky_extra_top > 0:  
		for row in range(0, sky_extra_top):
			row_bottom = current_y - 256.0
			if row_bottom < director.cameraWorldTop:
				current_x = sky_start_x
				row_middle = 0.5 * (current_y + row_bottom)
				while current_x <= director.cameraWorldRight: 
					column_middle = current_x + 128.0
					#draw_texture(texture, Vector2(0,0))
					#graphics.requestDraw(true, 
					#					 false, 
					#					 "spritesheet_1", 
					#					 column_middle, 
					#					 row_middle,
					#					 256.0, 
					#					 256.0, 
					#					 0, 
					#					 main.depth_sky, 
					#					 1.0, 1.0, 1.0, 1.0, 
					#					 sky_dark_x0, 
					#					 sky_dark_y0,
					#					 sky_dark_x1,
					#					 sky_dark_y1)
					current_x += 256.0
				
				if row_bottom < director.cameraWorldBottom:
					bottomfound = true
					row = sky_extra_top
				
			current_y -= 256.0
	
	if bottomfound: 
		return
	
	#Draw # of dark rows at the top
	for row in range(0, sky_numDark):
	#for var row = 0 row < sky_numDark && !bottomfound row++)
			row_bottom = current_y - 256.0
			row_middle = 0.5 * (current_y + row_bottom)
			current_x = sky_start_x
			while current_x <= director.cameraWorldRight: 
				column_middle = current_x + 128.0
				#graphics.requestDraw(true, 
				#					 false, 
				#					 "spritesheet_1", 
				#					 column_middle, 
				#					 row_middle,
				#					 256.0, 
				#					 256.0, 
				#					 0, 
				#					 main.depth_sky, 
				#					 1.0, 1.0, 1.0, 1.0, 
				#					 sky_dark_x0, 
				#					 sky_dark_y0,
				#					 sky_dark_x1,
				#					 sky_dark_y1)
				current_x += 256.0
			
			if row_bottom < director.cameraWorldBottom: 
				break;
					
			current_y -= 256.0	
	
	if bottomfound: 
		return
	
	#Draw the sky gradient
	row_bottom = current_y - 128.0
	#Lightening Helper
	skyMidOnScreen = true
	skyMidTopY = current_y
	skyMidBottomY = row_bottom

	if row_bottom < director.cameraWorldBottom: 
		bottomfound = true
	
	row_middle = 0.5 * (current_y + row_bottom)
	current_x = sky_start_x
	while current_x <= director.cameraWorldRight: 
		column_middle = current_x + 64.0
		#graphics.requestDraw(true, 
		#					 false, 
		#					 "spritesheet_1", 
		#					 column_middle, 
		#					 row_middle,
		#					 128.0, 
		#					 128.0, 
		#					 0, 
		#					 main.depth_sky, 
		#					 1.0, 1.0, 1.0, 1.0, 
		#					 sky_grad_x0, 
		#					 sky_grad_y0,
		#					 sky_grad_x1,
		#					 sky_grad_y1)	
		current_x += 128.0
	
	current_y -= 128.0	
	if bottomfound: 
		return
	
	#Draw light bottom part of the sky
	for row in range(0, sky_numLight):
	#for(var row = 0 row < sky_numLight && !bottomfound row++)
			row_bottom = current_y - 128.0
			row_middle = 0.5 * (row_bottom + current_y)
			current_x = sky_start_x
			while current_x <= director.cameraWorldRight:
				column_middle = current_x + 64.0
				#graphics.requestDraw(true, 
				#					 false, 
				#					 "spritesheet_1", 
				#					 column_middle, 
				#					 row_middle,
				#					 128.0, 
				#					 128.0, 
				#					 0, 
				#					 main.depth_sky, 
				#					 1.0, 1.0, 1.0, 1.0, 
				#					 sky_light_x0, 
				#					 sky_light_y0,
				#					 sky_light_x1,
				#					 sky_light_y1)
				current_x += 128.0
			
			if row_bottom < director.cameraWorldBottom: 
				break;
			
			current_y -= 128.0
	
	if bottomfound: 
		return
	
	#Ensure that we have drawn down to the bottom of the screen
	while !bottomfound: 
		row_bottom = current_y - 128.0
		row_middle = 0.5 * (current_y + row_bottom)
		current_x = sky_start_x
		while current_x <= director.cameraWorldRight:
			column_middle = current_x + 64.0
			#graphics.requestDraw(true, 
			#						 false, 
			#						 "spritesheet_1", 
			#						 column_middle, 
			#						 row_middle,
			#						 128.0, 
			#						 128.0, 
			#						 0, 
			#						 main.depth_sky, 
			#						 1.0, 1.0, 1.0, 1.0, 
			#						 sky_light_x0, 
			#						 sky_light_y0,
			#						 sky_light_x1,
			#						 sky_light_y1)
			current_x += 128.0
		
		if row_bottom < director.cameraWorldBottom:
			bottomfound = true
		
		current_y -= 128.0

	

