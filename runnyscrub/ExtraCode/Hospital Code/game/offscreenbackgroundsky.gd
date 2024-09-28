extends Node2D

var config
var cameras

var initialised : bool = false
var texture : Texture2D

#Do we really need a sep inject and init. Eventually harmonise for all factory set up
func inject(conf, cams):
	config = conf
	cameras = cams
	
func init(assets : class_assets):
	texture = assets.tex_spritesheet_1
	initialised = true

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if !initialised:
		return
		
	queue_redraw()

func _draw():
	draw_texture(texture, Vector2(0,0))
	return
	
	if !initialised: #Captures a potential first draw before init called. Although probably not possible as not yet added to tree
		return
	
