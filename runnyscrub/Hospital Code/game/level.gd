extends Node2D
class_name class_level

var config
var cameras

var builder;

var initialised : bool = false

var texture : Texture2D

var populated_level_min_x : int = 0 #This might need to be modified when starting app and initial player track. tbc
var populated_level_max_x : int = 0

var platforms: Array[class_platform] = []
var platform_array_size : int

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func init(assets : class_assets, level_builder):
	texture = assets.tex_spritesheet_1
	initialised = true
	builder = level_builder

#Do we really need a sep inject and init. Eventually harmonise for all factory set up
func inject(conf, cams):
	config = conf
	cameras = cams
	platforms.resize(config.PLATFORM_ARRAY_MIN_SIZE)
	platform_array_size = config.PLATFORM_ARRAY_MIN_SIZE
	AddPlatform(builder.GenerateInitialPlatform())
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if !initialised:
		pass
	
func AddPlatform(platform : class_platform):
	var index : int = FindEmptyPlatformIndex()
	platforms[index] = platform
	#Check / updates extremities of new platform?
	#To Do

func FindEmptyPlatformIndex() -> int:
	for n in platform_array_size:
		if platforms[n] != null and !platforms[n].active:
			return n
	#Resize array as unable to find an empty slot
	var first_new_slot = platform_array_size
	var new_size = 2 * platform_array_size
	platforms.resize(new_size)
	platform_array_size = new_size
	return first_new_slot
