extends Node2D

var initialised : bool = false

var offscreen_texture_overlay : Texture2D
var offscreen_foreground_overlay : class_offscreen_foreground_overlay

var config
var cameras

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func inject(conf, cams):
	config = conf
	cameras = cams

func init(offscreen_tex : Texture2D, offscreen_fg : class_offscreen_foreground_overlay ):
	offscreen_texture_overlay = offscreen_tex
	offscreen_foreground_overlay = offscreen_fg
	initialised = true

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if !initialised:
		pass
		
	queue_redraw()

func _draw():
	if !initialised: #Captures a potential first draw before init called. Although probably not possible as not yet added to tree
		return
		
	var topleft = offscreen_foreground_overlay.Render_World_TopLeft_Position
	var rectSize = offscreen_foreground_overlay.Render_Size_Of_Drawn_Rect
	
	#Draw offscreen rendered texture
	draw_texture_rect_region(offscreen_texture_overlay, Rect2(topleft.x, \
											topleft.y, \
											rectSize.x, \
											rectSize.y), \
											Rect2(0, 0, \
											rectSize.x, \
											rectSize.y))

	#draw_rect(cameras.ReturnForegroundCameraBounds(), Color.AQUA, true)
	return
	
