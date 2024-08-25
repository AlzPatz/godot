extends Node2D

var parallax_scene = preload("res://scenes/game/parallaxlayer.tscn")

var config_script = preload("res://scenes/game/config.gd")
var director_script = preload("res://scenes/game/director.gd")
var graphics_script = preload("res://scenes/game/graphics.gd")

var parallax_background

var config
var director
var graphics

# Called when the node enters the scene tree for the first time.
func _ready():	
	config = config_script.new()
	
	director = director_script.new()
	add_child(director)
	graphics = graphics_script.new()
	add_child(graphics)
	
	director.initialise(config, graphics)
	
	parallax_background = parallax_scene.instantiate()
	parallax_background.initialise(config, director)
	$ViewportGame/LayerBackground.add_child(parallax_background)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	
	if Input.is_key_pressed(KEY_ESCAPE):
		get_tree().quit()
	
	director.updateCameraBounds()
	
	#Update All Camera Positions from director.cameraFocus
	parallax_background.UpdateCamera(director.cameraFocus, 1.0)
	
	queue_redraw()
	
func _draw():
	var tex = $ViewportGame.get_texture()
	
	#Draw scaled to window
	
	var viewportSize = get_viewport().get_visible_rect().size
	draw_texture_rect(tex, Rect2(0,0, viewportSize.x, viewportSize.y), false)
