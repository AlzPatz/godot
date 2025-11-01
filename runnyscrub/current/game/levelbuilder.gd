extends Node

var config

var level_data : class_level_data

func init(conf):
	config = conf

func _ready():
	pass 

func pass_level_data(data :class_level_data):
	level_data = data

func instantiate(): #TO rename and change, is to instantiate ELEMENTS
	pass

#func GenerateInitialPlatform() -> class_platform:
	#var platform : class_platform = platform_script.new()
	
	#return platform
	
	#AddPlatform()
	#config.LEVEL_SEGMENT_MIN_WIDTH
	
	#var max_area_rect : Rect2 = cameras.ReturnForegroundCameraBoundsAtMinZoom()
	#var floor_y = config.PLAYER_START_Y + (0.5 * config.PLAYER_HEIGHT)	
	
	#level builder creates platforms! not here.
	#builder.create() or something..
	#var platform : class_platform = platform_script.new()
	#platform.init()
	
