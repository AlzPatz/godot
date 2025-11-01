extends Node

var levelconfig = preload("res://game/levelconfig.gd")

var level : class_level

func _ready() -> void:
	pass

func inject(lvl : class_level):
	level = lvl

#There is no _init as these are called from Director
func init():
	#Given the level is likely to evolve from menu to game it maybe that the initial configuring and generation]
	#is not done here, done higher up, especially given the game _> back to menu implications (one direction would be fine from here)
	var lconfig : class_level_config = levelconfig.new()
	
	lconfig.random = false

	level.configure(lconfig)
	level.generate() #Although fires each _process() within level, fire here to get level set up asap (not likely needed)

#There is no _process as these are called from Director
func process(delta):
	pass
	
