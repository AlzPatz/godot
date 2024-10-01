extends Node2D
class_name player_class

var speed : float = 200.0

var should_draw : bool = false
var process_input : bool = false

func init():
	should_draw = true
	process_input = true

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if process_input:
		if Input.is_action_just_pressed("up"):
			#position.y -= delta * speed
			position.y -= 1
		#if Input.is_action_just_released("down"):
		if Input.is_action_just_pressed("down"):
			#position.y += delta * speed
			position.y += 1
		#if Input.is_action_just_released("left"):
			#position.x -= delta * speed
			#position.x -= 1
		#if Input.is_action_just_released("right"):
			#position.x += delta * speed
			#position.x += 1


		if Input.is_action_pressed("left"):
			#position.y -= delta * speed
			position.y -= 1
		#if Input.is_action_just_released("down"):
		if Input.is_action_pressed("right"):
			#position.y += delta * speed
			position.y += 1
