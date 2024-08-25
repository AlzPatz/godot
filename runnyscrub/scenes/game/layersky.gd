extends Node2D

var texture : Texture2D

var levelFocus : Vector2
var levelZoom : float

# Called when the node enters the scene tree for the first time.
func _ready():
	texture = load("res://scenes/assets/textures/game/spritesheet_1.png")
	pass # Replace with function body.

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	queue_redraw()

func _draw():
	draw_texture(texture, Vector2(0,0))
	pass
	
func UpdateCamera(camera2D : Camera2D, level_focus : Vector2, level_zoom : float):
	
	levelFocus = level_focus
	levelZoom = level_zoom
	
	camera2D.position = levelFocus
	camera2D.zoom = Vector2(levelZoom, levelZoom)
