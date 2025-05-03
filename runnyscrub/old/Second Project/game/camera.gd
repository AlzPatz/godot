extends Node

var initialised : bool = false

var config 

var cameraSky : Camera2D
var cameraFar : Camera2D
var cameraNear : Camera2D
var cameraForeground : Camera2D

func inject(conf, sky : Camera2D, far : Camera2D, near : Camera2D, foreground : Camera2D):
	config = conf	
	cameraSky = sky
	cameraFar = far
	cameraNear = near
	cameraForeground = foreground

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if !initialised:
		pass
