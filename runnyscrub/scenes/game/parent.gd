extends Node2D

var parallax_scene = preload("res://scenes/game/parallaxlayer.tscn")

var config_script = preload("res://scenes/game/config.gd")
var director_script = preload("res://scenes/game/director.gd")
var graphics_script = preload("res://scenes/game/graphics.gd")

var parallax_background

var config
var director

# Called when the node enters the scene tree for the first time.
func _ready():	
	config = config_script.new()
	director = director_script.new()
	graphics = graphics_script.new()
	
	parallax_background = parallax_scene.instantiate()
	parallax_background.initialise(config, director)
	add_child(parallax_background)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	
	if Input.is_key_pressed(KEY_ESCAPE):
		get_tree().quit()
		
	director.updateCameraBounds()
	
	pass
