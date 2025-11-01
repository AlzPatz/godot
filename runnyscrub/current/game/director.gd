extends Node

var config
var core
var cameras

var menu
var game

var TopState : class_config.GAMESTATE_TOPLEVEL

var QueuedTopState : class_config.GAMESTATE_TOPLEVEL

func _ready():
	QueuedTopState = class_config.GAMESTATE_TOPLEVEL.E_MENU

func inject(conf, cor, cams, men, gam):
	config = conf
	core = cor
	cameras = cams
	menu = men
	game = gam

func _process(delta):
	if QueuedTopState != class_config.GAMESTATE_TOPLEVEL.E_NONE:
		ChangeTopState()
	RunTopStateLogic(delta)

func ChangeTopState():
	match QueuedTopState:
		class_config.GAMESTATE_TOPLEVEL.E_MENU:
			TriggerMenu()
		class_config.GAMESTATE_TOPLEVEL.E_GAME:
			TriggerGame()
	QueuedTopState = class_config.GAMESTATE_TOPLEVEL.E_NONE

func TriggerMenu():
	menu.init()

func TriggerGame():
	game.init()

func RunTopStateLogic(delta):
	match TopState:
		class_config.GAMESTATE_TOPLEVEL.E_MENU:
			menu.process(delta)
		class_config.GAMESTATE_TOPLEVEL.E_GAME:
			game.process(delta)
