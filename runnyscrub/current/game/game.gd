extends Node

var level : class_level

var has_ready_fired : bool = false

func _ready() -> void:
	has_ready_fired = true

func inject(lvl : class_level):
	level = lvl

#There is no _init as these are called from Director
func init():
	#Probably a useless guard
	if !has_ready_fired: 
		pass

#There is no _process as these are called from Director
func process(delta):
	#Probably a useless guard
	if !has_ready_fired: 
		pass