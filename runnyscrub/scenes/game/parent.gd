extends Node2D

var parallax_scene = preload("res://scenes/game/parallaxlayer.tscn")

var parallax_stars
var parallax_city_far
var parallax_city_near

# Called when the node enters the scene tree for the first time.
func _ready():	
	parallax_stars = parallax_scene.instantiate()
	add_child(parallax_stars)
	
	parallax_city_far = parallax_scene.instantiate()
	add_child(parallax_city_far)
	
	parallax_city_near = parallax_scene.instantiate()
	add_child(parallax_city_near)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
