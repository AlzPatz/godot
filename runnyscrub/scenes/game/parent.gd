extends Node2D

var parallax_scene = preload("res://scenes/game/parallaxlayer.tscn")

var parallax_background

# Called when the node enters the scene tree for the first time.
func _ready():	
	parallax_background = parallax_scene.instantiate()
	parallax_background.initialise()
	add_child(parallax_background)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	
	if Input.is_key_pressed(KEY_ESCAPE):
		get_tree().quit()
	
	pass
