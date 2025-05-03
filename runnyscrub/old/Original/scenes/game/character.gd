extends Node2D

var speed : float = 400.0

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if Input.is_action_pressed("right"):
		position.x = position.x + (delta * speed)
		
	if Input.is_action_pressed("left"):
		position.x = position.x - (delta * speed)
		
	if Input.is_action_pressed("up"):
		position.y = position.y - (delta * speed)
		
	if Input.is_action_pressed("down"):
		position.y = position.y + (delta * speed)
