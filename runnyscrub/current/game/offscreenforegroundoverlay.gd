extends Node2D
class_name class_offscreen_foreground_overlay

var config
var cameras

var initialised : bool = false

var Render_World_TopLeft_Position : Vector2i
var Render_Size_Of_Drawn_Rect : Vector2i

var level : class_level

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func inject(conf, cams, lvl: class_level):
	config = conf
	cameras = cams
	level = lvl

	initialised = true

func _process(delta):
	if !initialised:
		return

	queue_redraw()

func _draw():
	#Draws the Level
	if !initialised: #Captures a potential first draw before init called. Although probably not possible as not yet added to tree
		return
	
	#Calculate integer position and size of draw rectangle
	var frect = cameras.ReturnForegroundCameraBounds()

	var fTopLeft = frect.position
	var fBottomRight = frect.end

	var iLeft : int = fTopLeft.x
	var fLeft : float = fTopLeft.x - (1.0 * iLeft)

	if fLeft != 0.0:
		if fLeft > 0.0:
			iLeft += 1
		else:
			iLeft -= 1

	var iRight : int = fBottomRight.x
	var fRight : float = fBottomRight.x - (1.0 * iRight)

	if fRight != 0.0:
		if fRight > 0.0:
			iRight += 1
		else:
			iRight -= 1	

	var iTop : int = fTopLeft.y
	var fTop : float = fTopLeft.y - (1.0 * iTop)	

	if fTop != 0.0:
		if fTop > 0.0:
			iTop += 1
		else:
			iTop -= 1

	var iBottom : int = fBottomRight.y
	var fBottom : float = fBottomRight.y - (1.0 * iBottom)

	if fBottom != 0.0:
		if fBottom > 0.0:
			iBottom += 1
		else:
			iBottom -= 1	
	
	var iWidth : int = iRight - iLeft
	var iHeight : int = iBottom - iTop 
	
	#Draw Level Here
	#draw_rect(Rect2(0,0, iWidth, iHeight), Color.GREEN, true)
	#draw_rect(Rect2(0.25 * iWidth,0.25 * iHeight, 0.5 * iWidth, 0.5 * iHeight), Color.GREEN, true)
	#=====TODO======
	#ADD IN LEVEL LAYER AND HAVE FOREGROUND IN FRONT
	#TO DO
	#CHECK COLOURED SQUARE WORKS FIRST!

	#Set public variables to be used later when rendering this texture to the world
	Render_World_TopLeft_Position = Vector2i(iLeft, iTop)
	Render_Size_Of_Drawn_Rect = Vector2i(iWidth, iHeight)