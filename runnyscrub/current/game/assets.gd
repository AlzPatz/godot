extends Node
class_name class_assets

var tex_spritesheet_1 : Texture2D

# Called when the node enters the scene tree for the first time.
func _ready():
	tex_spritesheet_1 = load("res://assets/game/textures/spritesheet_1.png")

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
