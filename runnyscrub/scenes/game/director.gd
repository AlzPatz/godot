extends Node2D

var cameraFocus : Vector2
var cameraWorldTop : float
var cameraWorldBottom : float
var cameraWorldLeft : float
var cameraWorldRight : float
var centreScreen : Vector2

var graphics : Graphics
var config : Config

# Called when the node enters the scene tree for the first time.
func _ready():
	cameraFocus = Vector2(0.0, 0.0)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	#Temp
	cameraFocus.x += delta * 100.0
	pass
	
func initialise(config_pass, graphics_pass):
	config = config_pass
	graphics = graphics_pass
		
func updateCameraBounds(): 
	graphics.camera_x = cameraFocus.x 
	graphics.camera_y = cameraFocus.y
	#Update bounds, used by game to try and cut down on off screen rendering
	#This is not safe for non AABB viewport. That would require a larger 'safe' rectangle area to be used
	cameraWorldLeft = cameraFocus.x - (graphics.c_halfwidth * graphics.camera_one_over_zoom)
	cameraWorldRight = cameraFocus.x + (graphics.c_halfwidth * graphics.camera_one_over_zoom)
	cameraWorldTop = cameraFocus.y + (graphics.c_halfheight * graphics.camera_one_over_zoom)
	cameraWorldBottom = cameraFocus.y - (graphics.c_halfheight * graphics.camera_one_over_zoom)
	centreScreen = Vector2(graphics.c_halfwidth, graphics.c_halfheight)
