extends Node2D

# Need to work out how to link this to window size and the stretching stuff, but use this
# as a jumping off point for the rest of the game to scale

const VIRTUAL_RENDER_WIDTH : int = 800
const VIRTUAL_RENDER_HEIGHT : int = 600

var parallax_scene = preload("res://scenes/game/parallaxlayer.tscn")
var character_scene = preload("res://scenes/game/character.tscn")

var config_script = preload("res://scenes/game/config.gd")
var director_script = preload("res://scenes/game/director.gd")
var graphics_script = preload("res://scenes/game/graphics.gd")

var parallax_background
var character

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
	parallax_background.initialise($ViewportBackground, config, director, VIRTUAL_RENDER_WIDTH, VIRTUAL_RENDER_HEIGHT)
	$ViewportBackground/LayerBackground.add_child(parallax_background)
	
	character = character_scene.instantiate()
	$ViewportGame/LayerGame.add_child(character)
	

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	
	if Input.is_key_pressed(KEY_ESCAPE):
		get_tree().quit()
		
	director.setCameraFocus(character.position)
	
	director.updateCameraBounds()
	
	#Update All Camera Positions from director.cameraFocus
	$ViewportGame/LayerGame/Camera2DGame.position = character.position
	$ViewportGame/LayerGame/Camera2DGame.zoom = Vector2(1.0,1.0) 
	
	parallax_background.UpdateCamera(director.cameraFocus, 1.0)
	
	queue_redraw()
	
func _draw():
	var tex = $ViewportGame.get_texture()
	
	#Draw scaled to window
	
	var viewportSize = get_viewport().get_visible_rect().size
	draw_texture_rect(tex, Rect2(0,0, viewportSize.x, viewportSize.y), false)
