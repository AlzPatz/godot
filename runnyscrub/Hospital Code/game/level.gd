extends Node2D

var config
var cameras

var foreground
var foreground_offscreen

var initialised : bool = false

var texture : Texture2D

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func init(assets : class_assets):
	texture = assets.tex_spritesheet_1
	initialised = true

#Do we really need a sep inject and init. Eventually harmonise for all factory set up
func inject(conf, cams, fg, fg_offscreen):
	config = conf
	cameras = cams
	foreground = fg
	foreground_offscreen = fg_offscreen
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
