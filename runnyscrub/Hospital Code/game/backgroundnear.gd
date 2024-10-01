extends Node2D

var config

var initialised : bool = false

var offscreen_texture : Texture2D
var offscreen_background_near : class_offscreen_background_near

#Do we really need a sep inject and init. Eventually harmonise for all factory set up
func inject(conf):
	config = conf
	
func init(offscreen_tex : Texture2D, offscreen_near : class_offscreen_background_near):
	offscreen_texture = offscreen_tex
	offscreen_background_near = offscreen_near
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
	
	#Draw offscreen rendered texture
	draw_texture_rect_region(offscreen_texture, Rect2(offscreen_background_near.Render_World_TopLeft_Position.x, \
											offscreen_background_near.Render_World_TopLeft_Position.y, \
											offscreen_background_near.Render_Size_Of_Drawn_Rect.x, \
											offscreen_background_near.Render_Size_Of_Drawn_Rect.y), \
											Rect2(0, 0, \
											offscreen_background_near.Render_Size_Of_Drawn_Rect.x, \
											offscreen_background_near.Render_Size_Of_Drawn_Rect.y))
	
	#draw_texture_rect(offscreen_texture, Rect2i(offscreen_background_far.Render_World_TopLeft_Position + Vector2i(200,300),Vector2i(500,300)),false)
	
	return
