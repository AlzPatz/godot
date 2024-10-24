extends Node2D

var config
var cameras

var initialised : bool = false

var offscreen_texture : Texture2D
var offscreen_background_sky : class_offscreen_background_sky

#Do we really need a sep inject and init. Eventually harmonise for all factory set up
func inject(conf, cams):
	config = conf
	cameras = cams
	
func init(offscreen_tex : Texture2D, offscreen_sky : class_offscreen_background_sky):
	offscreen_texture = offscreen_tex
	offscreen_background_sky = offscreen_sky
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
	if !initialised: #Captures a potential first draw before init called. Although probably not possible as not yet added to tree
		return
		
	var topleft = cameras.ConvertToForegroundPosition(offscreen_background_sky.Render_World_TopLeft_Position, config.BackgroundType.E_SKY)
	var rectSize = cameras.ConvertToForegroundSize(offscreen_background_sky.Render_Size_Of_Drawn_Rect, config.BackgroundType.E_SKY)
	
	#Draw offscreen rendered texture
	draw_texture_rect_region(offscreen_texture, Rect2(topleft.x, \
											topleft.y, \
											rectSize.x, \
											rectSize.y), \
											Rect2(0, 0, \
											offscreen_background_sky.Render_Size_Of_Drawn_Rect.x, \
											offscreen_background_sky.Render_Size_Of_Drawn_Rect.y))

	return
