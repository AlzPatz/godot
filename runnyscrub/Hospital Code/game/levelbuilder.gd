extends Node

var config

var platform_script = preload("res://game/platform.gd")

func init(conf):
	config = conf

func _ready():
	pass 
	
func GenerateInitialPlatform() -> class_platform:
	var platform : class_platform = platform_script.new()
	
	return platform
	
	#AddPlatform()
	#config.LEVEL_SEGMENT_MIN_WIDTH
	
	#var max_area_rect : Rect2 = cameras.ReturnForegroundCameraBoundsAtMinZoom()
	#var floor_y = config.PLAYER_START_Y + (0.5 * config.PLAYER_HEIGHT)	
	
	#level builder creates platforms! not here.
	#builder.create() or something..
	#var platform : class_platform = platform_script.new()
	#platform.init()
	
