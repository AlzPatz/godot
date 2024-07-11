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
var sky_vertical_ratio = sky_total_height / (main.ceiling_y - main.floor_y)

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
var bgFar_vertical_ratio = bgFar_total_height / (main.ceiling_y - main.floor_y)

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
var bgNear_vertical_ratio = bgNear_total_height / (main.ceiling_y - main.floor_y)

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

var bgFar_Shift = 4
var bgNear_Shift = 37
var lengthOfPsuedoSequence = 100

var pseudoRandomBinaryResult

var transfer_world_y_of_top_bgfar_row
var transfer_world_y_of_top_bgnear_row

# Called when the node enters the scene tree for the first time.
func _ready():
	pass 

func initialise():
	create_pseudo_random()
	pass
	
func create_pseudo_random():
	pseudoRandomBinaryResult = [3,1,4,1,5,9,2,6,5,3,5,8,9,7,9,3,2,3,8,4,6,2,6,4,3,3,8,3,2,7,9,5,0,2,8,8,4,1,9,7,1,6,9,3,9,9,3,7,5,1,0,5,8,2,0,9,7,4,9,4,4,5,9,2,3,0,7,8,1,6,4,0,6,2,8,6,2,0,8,9,9,8,6,2,8,0,3,4,8,2,5,3,4,2,1,1,7,0,6,7]
	#Note. As it turns out, although the Fibonnaci sequence is psuedo random, in fact it goes 1 even, 2 odd, on repeat
	#So now I am using the first 100 digits of PI to make my psuedo random binary pattern...
	#Now turn it into 0 and 1s based on odd or even digits
	for i in pseudoRandomBinaryResult.size():
		pseudoRandomBinaryResult[i] = pseudoRandomBinaryResult[i] % 2

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
