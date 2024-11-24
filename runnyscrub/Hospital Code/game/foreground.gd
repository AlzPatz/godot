extends Node2D

var initialised : bool = false

var config
var cameras

var level : class_level

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func inject(conf, cams, lvl: class_level):
	config = conf
	cameras = cams
	level = lvl
	
	initialised = true

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if !initialised:
		pass
		
	queue_redraw()

func _draw():
	if !initialised:
		pass
	
	#Draw the level (start with platforms)
	
	#draw_rect(cameras.ReturnForegroundCameraBounds(), Color.AQUA, true)
