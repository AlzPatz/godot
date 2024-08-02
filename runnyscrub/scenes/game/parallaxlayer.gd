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

var bgFar_Shift = 4
var bgNear_Shift = 37
var lengthOfPsuedoSequence = 100

var pseudoRandomBinaryResult

var transfer_world_y_of_top_bgfar_row
var transfer_world_y_of_top_bgnear_row

var config
var director

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
	absolute_vertical_distance_to_ceiling = config.ceiling_y - director.cameraFocus.y
	updateSky()
	updateBGFar()
	updateBGNear()
	updateFloor()
	
func updateSky():
	#Need to calculate the equivalent world coordinates at which to start drawing the sky from. Vertical first
	sky_vertical_distance_to_top = absolute_vertical_distance_to_ceiling * sky_vertical_ratio;
	#Calculate the world coords that the top of sky falls on currently (moves due to ratio with absolute world)
	sky_start_y = director.cameraFocus.y + sky_vertical_distance_to_top; 
	sky_start_y = Math.floor(sky_start_y);
	#As the sky is the only layer that needs to reach all the way to the top of the screen, add additional top rows if needed
	sky_extra_top = 0;
	while(sky_start_y < director.cameraWorldTop):
		sky_start_y += 256.0;
		sky_extra_top+=1;
	#Now for the horizontal Start Point
	sky_start_x = director.cameraWorldLeft * sky_horizontal_scalar;
	divisor_float = sky_start_x / 256.0;
	divisor_int = Math.floor(divisor_float);
	sky_start_x = director.cameraWorldLeft -((divisor_float - divisor_int) * 256.0);
	sky_start_x = Math.floor(sky_start_x);
	
func updateBGFar():
	//Vertical start point
	this.bgFar_vertical_distance_to_ceiling = this.absolute_vertical_distance_to_ceiling * this.bgFar_vertical_ratio;
	this.bgFar_start_y = this.main.director.cameraFocus.y + this.bgFar_vertical_distance_to_ceiling;
	this.bgFar_start_y = Math.floor(this.bgFar_start_y);
	//Horizontal
	this.bgFar_start_x = this.main.director.cameraWorldLeft * this.bgFar_horizontal_scalar;
	this.divisor_float = this.bgFar_start_x / 256.0;
	this.divisor_int = Math.floor(this.divisor_float);
	this.bgFar_start_int = this.divisor_int;
	this.bgFar_start_x =  this.main.director.cameraWorldLeft - ((this.divisor_float - this.divisor_int) * 256.0);
	this.bgFar_start_x = Math.floor(this.bgFar_start_x);
	
func updateBGNear():
		//Vertical start point
	this.bgNear_vertical_distance_to_ceiling = this.absolute_vertical_distance_to_ceiling * this.bgFar_vertical_ratio;
	this.bgNear_start_y = this.main.director.cameraFocus.y + this.bgNear_vertical_distance_to_ceiling;
	this.bgNear_start_y = Math.floor(this.bgNear_start_y);
	//Horizontal
	this.bgNear_start_x = this.main.director.cameraWorldLeft * this.bgNear_horizontal_scalar;
	this.divisor_float = this.bgNear_start_x / 256.0;
	this.divisor_int = Math.floor(this.divisor_float);
	this.bgNear_start_int = this.divisor_int;
	this.bgNear_start_x = this.main.director.cameraWorldLeft - ((this.divisor_float - this.divisor_int) * 256.0);
	this.bgNear_start_x = Math.floor(this.bgNear_start_x);

func updateFloor():
	this.isFloorVisible = false;
	if(this.main.director.cameraWorldBottom < this.main.floor_y + 256.0) {
		this.isFloorVisible = true;
		//Vertical Start Point
		this.floor_start_y = this.main.floor_y + 256.0;
		//Horizontal Start Point
		this.origin_finder = this.main.director.cameraWorldLeft;
		this.divisor_float = this.origin_finder / 128.0;
		this.divisor_int = Math.floor(this.divisor_float);
		this.floor_start_x = this.main.director.cameraWorldLeft- ( (this.divisor_float - this.divisor_int) * 128.0);
		this.floor_start_x = Math.floor(this.floor_start_x);
	}

func _draw():
	pass
