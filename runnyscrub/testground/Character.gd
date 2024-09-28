extends Node2D

var texture : Texture2D

# Called when the node enters the scene tree for the first time.
func _ready():
	texture = load("res://spritesheet_1.png")
	pass # Replace with function body.

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	queue_redraw()
	pass
	
func _draw():
	draw_texture(texture, Vector2(0,0))
