extends Node2D

#This is just a direct port of jscript code. Not sure if structure is going to suit this engine

#Helper information for the lightening / weather effects later
var skyMidOnScreen
var skyMidTopY
var skyMidBottomY

var texCoordEdge = 0.001 #Removes sampling that encroaches another sprite. Causes small aritfacts but better than lines..

#This remains pretty rigidly set up for the sprite tilesheet that I have been using
var delta_128 = 128.0 / 1024.0
var delta_256 = 256.0 / 1024.0

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

var floor_x0 = (0.0 * delta_128) + texCoordEdge
var floor_x1 = (1.0 * delta_128) - texCoordEdge
var floor_y0 = (4.0 * delta_128) + texCoordEdge
var floor_y1 = (6.0 * delta_128) - texCoordEdge

var first = true
	
#Far background :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
var bgFar_numBlank = 3
var bgFar_numMiddle = 3 
var bgFar_horizontal_scalar = 0.15 #Must be 2.d.p only to ensure the wrap when starting game back at zero
var bgFar_vertical_256_equiv_tiles = 1 + bgFar_numBlank + bgFar_numMiddle
var bgFar_total_height = bgFar_vertical_256_equiv_tiles * 256.0
var bgFar_vertical_ratio #init below

var bgFar_buildingTops1_x0 = (1.0 * delta_256) + texCoordEdge
var bgFar_buildingTops1_x1 = (2.0 * delta_256) - texCoordEdge
var bgFar_buildingTops1_y0 = (3.0 * delta_256) + texCoordEdge
var bgFar_buildingTops1_y1 = (4.0 * delta_256) - texCoordEdge

var bgFar_buildingTops2_x0 = (2.0 * delta_256) + texCoordEdge
var bgFar_buildingTops2_x1 = (3.0 * delta_256) - texCoordEdge
var bgFar_buildingTops2_y0 = (3.0 * delta_256) + texCoordEdge
var bgFar_buildingTops2_y1 = (4.0 * delta_256) - texCoordEdge	

var bgFar_buildingMiddle_x0 = (3.0 * delta_256) + texCoordEdge
var bgFar_buildingMiddle_x1 = (4.0 * delta_256) - texCoordEdge
var bgFar_buildingMiddle_y0 = (3.0 * delta_256) + texCoordEdge
var bgFar_buildingMiddle_y1 = (4.0 * delta_256) - texCoordEdge

#Near background :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
var bgNear_numBlank = 4
var bgNear_numMiddle = 7
var bgNear_horizontal_scalar = 0.2 #Must be 2.d.p only to ensure the wrap when starting game back at zero
var bgNear_vertical_256_equiv_tiles = 1 + bgNear_numBlank + bgNear_numMiddle
var bgNear_total_height = bgNear_vertical_256_equiv_tiles * 256.0
var bgNear_vertical_ratio #init below

var bgNear_buildingTops1_x0 = (1.0 * delta_256) + texCoordEdge
var bgNear_buildingTops1_x1 = (2.0 * delta_256) - texCoordEdge
var bgNear_buildingTops1_y0 = (2.0 * delta_256) + texCoordEdge
var bgNear_buildingTops1_y1 = (3.0 * delta_256) - texCoordEdge

var bgNear_buildingTops2_x0 = (2.0 * delta_256) + texCoordEdge
var bgNear_buildingTops2_x1 = (3.0 * delta_256) - texCoordEdge
var bgNear_buildingTops2_y0 = (2.0 * delta_256) + texCoordEdge
var bgNear_buildingTops2_y1 = (3.0 * delta_256) - texCoordEdge	

var bgNear_buildingMiddle_x0 = (3.0 * delta_256) + texCoordEdge
var bgNear_buildingMiddle_x1 = (4.0 * delta_256) - texCoordEdge
var bgNear_buildingMiddle_y0 = (2.0 * delta_256) + texCoordEdge
var bgNear_buildingMiddle_y1 = (3.0 * delta_256) - texCoordEdge

#Working Variables :::::::::::::::::::::::::::::::::::::::::::
var bottomfound
var current_x
var current_y
var row_bottom
var isFloorVisible
var sky_start_x
var sky_start_y
var sky_extra_top
var absolute_vertical_distance_to_ceiling
var sky_vertical_distance_to_top
var left_edge_horizontal_sky
var divisor_float
var divisor_int
var bgFar_vertical_distance_to_ceiling
var bgFar_start_x
var bgFar_start_y
var bgFar_start_int
var bgNear_vertical_distance_to_ceiling
var bgNear_start_x
var bgNear_start_y
var bgNear_start_int
var floor_start_x
var floor_start_y
var origin_finder
var row_middle
var column_middle

var bgFar_Shift = 4
var bgNear_Shift = 37
var lengthOfPsuedoSequence = 100

var pseudoRandomBinaryResult

var transfer_world_y_of_top_bgfar_row
var transfer_world_y_of_top_bgnear_row

var config
var director

var texture : Texture2D

# Called when the node enters the scene tree for the first time.
func _ready():
	pass 

func initialise(conf, dir):
	config = conf
	director = dir
	
	sky_vertical_ratio = sky_total_height / (config.ceiling_y - config.floor_y)
	bgFar_vertical_ratio = bgFar_total_height / (config.ceiling_y - config.floor_y)
	bgNear_vertical_ratio = bgNear_total_height / (config.ceiling_y - config.floor_y)
	
	create_pseudo_random()
	
	texture = load("res://scenes/assets/textures/game/spritesheet_1.png")
	
func create_pseudo_random():
	pseudoRandomBinaryResult = [3,1,4,1,5,9,2,6,5,3,5,8,9,7,9,3,2,3,8,4,6,2,6,4,3,3,8,3,2,7,9,5,0,2,8,8,4,1,9,7,1,6,9,3,9,9,3,7,5,1,0,5,8,2,0,9,7,4,9,4,4,5,9,2,3,0,7,8,1,6,4,0,6,2,8,6,2,0,8,9,9,8,6,2,8,0,3,4,8,2,5,3,4,2,1,1,7,0,6,7]
	#Note. As it turns out, although the Fibonnaci sequence is psuedo random, in fact it goes 1 even, 2 odd, on repeat
	#So now I am using the first 100 digits of PI to make my psuedo random binary pattern...
	#Now turn it into 0 and 1s based on odd or even digits
	for i in pseudoRandomBinaryResult.size():
		pseudoRandomBinaryResult[i] = pseudoRandomBinaryResult[i] % 2

func returnBGTopPartFromTileCount(x):
	x = floor(x);
	if x < 0:
		x = 0
	while x >= lengthOfPsuedoSequence: 
		x-= lengthOfPsuedoSequence
	return pseudoRandomBinaryResult[x];

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	#Moved stuff that was in update to draw
	queue_redraw() 
	
func updateSky():
	#Need to calculate the equivalent world coordinates at which to start drawing the sky from. Vertical first
	sky_vertical_distance_to_top = absolute_vertical_distance_to_ceiling * sky_vertical_ratio
	#Calculate the world coords that the top of sky falls on currently (moves due to ratio with absolute world)
	sky_start_y = director.cameraFocus.y + sky_vertical_distance_to_top 
	sky_start_y = snapped(sky_start_y, 1.0)
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
	
func updateBGFar():
	#Vertical start point
	bgFar_vertical_distance_to_ceiling = absolute_vertical_distance_to_ceiling * bgFar_vertical_ratio
	bgFar_start_y = director.cameraFocus.y + bgFar_vertical_distance_to_ceiling
	bgFar_start_y = snapped(bgFar_start_y, 1.0)
	#Horizontal
	bgFar_start_x = director.cameraWorldLeft * bgFar_horizontal_scalar
	divisor_float = bgFar_start_x / 256.0
	divisor_int = snapped(divisor_float, 1.0)
	bgFar_start_int = divisor_int
	bgFar_start_x =  director.cameraWorldLeft - ((divisor_float - divisor_int) * 256.0)
	bgFar_start_x = snapped(bgFar_start_x, 1.0)
	
func updateBGNear():
	#Vertical start point
	bgNear_vertical_distance_to_ceiling = absolute_vertical_distance_to_ceiling * bgFar_vertical_ratio
	bgNear_start_y = director.cameraFocus.y + bgNear_vertical_distance_to_ceiling
	bgNear_start_y = snapped(bgNear_start_y, 1.0)
	#Horizontal
	bgNear_start_x = director.cameraWorldLeft * bgNear_horizontal_scalar
	divisor_float = bgNear_start_x / 256.0
	divisor_int = snapped(divisor_float, 1.0)
	bgNear_start_int = divisor_int
	bgNear_start_x = director.cameraWorldLeft - ((divisor_float - divisor_int) * 256.0)
	bgNear_start_x = snapped(bgNear_start_x, 1.0)

func updateFloor():
	isFloorVisible = false
	if director.cameraWorldBottom < config.floor_y + 256.0:
		isFloorVisible = true
		#Vertical Start Point
		floor_start_y = config.floor_y + 256.0
		#Horizontal Start Point
		origin_finder = director.cameraWorldLeft
		divisor_float = origin_finder / 128.0
		divisor_int = snapped(divisor_float, 1.0)
		floor_start_x = director.cameraWorldLeft- ( (divisor_float - divisor_int) * 128.0)
		floor_start_x = snapped(floor_start_x, 1.0)

func _draw():
	#Moved from update
	absolute_vertical_distance_to_ceiling = config.ceiling_y - director.cameraFocus.y
	updateSky()
	updateBGFar()
	updateBGNear()
	updateFloor()
	#Origin Draw Code
	drawSky()
	drawBGFar()
	drawBGNear()
	drawFloor()
	
	draw_texture(texture, Vector2(0,0))

func drawSky(): 
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
					draw_texture(texture, Vector2(0,0))
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

func drawBGFar(): 
	bottomfound  = false
	current_y = bgFar_start_y
	#Skip blank rows at the top
	for row in range(0, bgFar_numBlank):
	#for(var row = 0 row < bgFar_numBlank row++)
		current_y -= 256.0
	
	row_bottom = current_y - 256.0

	row_middle = 0.5 * (row_bottom + current_y)
	transfer_world_y_of_top_bgfar_row = row_middle
	#Draw the building tops
	var FARccount = 0
	current_x = bgFar_start_x
	while current_x <= director.cameraWorldRight: 
		var top_to_draw = returnBGTopPartFromTileCount(bgFar_start_int + FARccount + bgFar_Shift) ## at end randoms between near and far :)
		column_middle = current_x + 128.0
		match top_to_draw:
			0:
				var b = 0 #Placeholder
				#graphics.requestDraw(true, 
				#					 false, 
				#					 "spritesheet_1", 
				#					 column_middle, 
				#					 row_middle,
				#					 256.0, 
				#					 256.0, 
				#					 0, 
				#					 main.depth_background_far, 
				#					 1.0, 1.0, 1.0, 1.0, 
				#					 bgFar_buildingTops1_x0, 
				#					 bgFar_buildingTops1_y0,
				#					 bgFar_buildingTops1_x1,
				#					 bgFar_buildingTops1_y1)
			1:
				var j = 0 #Placeholder
				#graphics.requestDraw(true, 
				#					 false, 
				#					 "spritesheet_1", 
				#					 column_middle, 
				#					 row_middle,
				#					 256.0, 
				#					 256.0, 
				#					 0, 
				#					 main.depth_background_far, 
				#					 1.0, 1.0, 1.0, 1.0, 
				#					 bgFar_buildingTops2_x0, 
				#					 bgFar_buildingTops2_y0,
				#					 bgFar_buildingTops2_x1,
				#					 bgFar_buildingTops2_y1)
		
		current_x += 256.0
		FARccount = FARccount+1
	
	if row_bottom < director.cameraWorldBottom:
		bottomfound = true
	
	if bottomfound:
		return
	
	current_y -= 256.0
	#Draw middle parts of the buildings all the way down to the bottom of the screen (why split them up into middle and excess??)
	while !bottomfound: 
		current_x = bgFar_start_x
		row_bottom = current_y - 256.0
		row_middle = 0.5 * (current_y + row_bottom)
		while current_x <= director.cameraWorldRight:
			column_middle = current_x + 128.0
			#graphics.requestDraw(true, 
			#						 false, 
			#						 "spritesheet_1", 
			#						 column_middle, 
			#						 row_middle,
			#						 256.0, 
			#						 256.0, 
			#						 0, 
			#						 main.depth_background_far, 
			#						 1.0, 1.0, 1.0, 1.0, 
			#						 bgFar_buildingMiddle_x0, 
			#						 bgFar_buildingMiddle_y0,
			#						 bgFar_buildingMiddle_x1,
			#						 bgFar_buildingMiddle_y1)
			current_x += 256.0
		
		if row_bottom < director.cameraWorldBottom: 
			bottomfound = true
		
		if bottomfound: 
			return
		
		current_y -= 256.0

func drawBGNear(): 
	bottomfound  = false
	current_y = bgNear_start_y
	#Skip blank rows at the top
	for row in range(0, bgNear_numBlank):
	#for(var row = 0 row < bgNear_numBlank row++)
		current_y -= 256.0
	
	row_bottom = current_y - 256.0
	row_middle = 0.5 * (row_bottom + current_y)
	transfer_world_y_of_top_bgnear_row = row_middle
	#Draw the building tops
	var NEARccount = 0
	current_x = bgNear_start_x
	while current_x <= director.cameraWorldRight: 
		var top_to_draw = returnBGTopPartFromTileCount(bgNear_start_int + NEARccount + bgNear_Shift) ## at end randoms between near and far :)
		column_middle = current_x + 128.0
		match top_to_draw:
			0:
				var u = 0
				#graphics.requestDraw(true, 
				#					 false, 
				#					 "spritesheet_1", 
				#					 column_middle, 
				#					 row_middle,
				#					 256.0, 
				#					 256.0, 
				#					 0, 
				#					 main.depth_background_near, 
				#					 1.0, 1.0, 1.0, 1.0, 
				#					 bgNear_buildingTops1_x0, 
				#					 bgNear_buildingTops1_y0,
				#					 bgNear_buildingTops1_x1,
				#					 bgNear_buildingTops1_y1)
			1:
				var v = 0
				#graphics.requestDraw(true, 
				#					 false, 
				#					 "spritesheet_1", 
				#					 column_middle, 
				#					 row_middle,
				#					 256.0, 
				#					 256.0, 
				#					 0, 
				#					 main.depth_background_near, 
				#					 1.0, 1.0, 1.0, 1.0, 
				#					 bgNear_buildingTops2_x0, 
				#					 bgNear_buildingTops2_y0,
				#					 bgNear_buildingTops2_x1,
				#					 bgNear_buildingTops2_y1)
			
		current_x += 256.0
		NEARccount += 1
	
	if row_bottom < director.cameraWorldBottom:
		bottomfound = true
	
	if bottomfound: 
		return
	
	current_y -= 256.0
	#Draw middle parts of the buildings all the way down to the bottom of the screen (why split them up into middle and excess??)
	while !bottomfound: 
		current_x = bgNear_start_x
		row_bottom = current_y - 256.0
		row_middle = 0.5 * (current_y + row_bottom)
		while current_x <= director.cameraWorldRight:
			column_middle = current_x + 128.0
			#graphics.requestDraw(true, 
			#						 false, 
			#						 "spritesheet_1", 
			#						 column_middle, 
			#						 row_middle,
			#						 256.0, 
			#						 256.0, 
			#						 0, 
			#						 main.depth_background_near, 
			#						 1.0, 1.0, 1.0, 1.0, 
			#						 bgNear_buildingMiddle_x0, 
			#						 bgNear_buildingMiddle_y0,
			#						 bgNear_buildingMiddle_x1,
			#						 bgNear_buildingMiddle_y1)
			current_x += 256.0
		
		if row_bottom < director.cameraWorldBottom:
			bottomfound = true
		
		if bottomfound: 
			return
		
		current_y -= 256.0

func drawFloor():  
	#Now draw the floor if visible
	if isFloorVisible:  
		current_y = floor_start_y
		while current_y > director.cameraWorldBottom:
			current_x = floor_start_x
			row_middle = current_y - 128.0
			while current_x<= director.cameraWorldRight:
				column_middle = current_x + 64.0
				#graphics.requestDraw(true, 
				#					 false, 
				#					 "spritesheet_1", 
				#					 column_middle, 
				#					 row_middle,
				#					 128.0, 
				#					 256.0, 
				#					 0, 
				#					 main.depth_floor, 
				#					 1.0, 1.0, 1.0, 1.0, 
				#					 floor_x0, 
				#					 floor_y0,
				#					 floor_x1,
				#					 floor_y1)
				current_x += 128.0
			
			current_y -= 256.0
