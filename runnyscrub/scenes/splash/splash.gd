extends Node2D

const SCENE_TIME_S = 3.0
const FRAC_FULL_OPACTIY = 0.1

var logo
var timer
var fracEndFadeIn
var fracEndFullyVisible

# Called when the node enters the scene tree for the first time.
func _ready():
	logo = get_node("SubViewport/PixelPeasantLogo")
	logo.modulate = Color(1.0,1.0,1.0,0.0)
	
	timer = 0.0
	
	var balance = 1.0 - FRAC_FULL_OPACTIY
	var halfBalance = 0.5 * balance
	
	fracEndFadeIn = halfBalance
	fracEndFullyVisible = 1.0 - halfBalance

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	
	var frac = timer / SCENE_TIME_S
	
	if frac > 1.0:
		frac = 1.0
	
	var opacity = 1.0
	
	if frac < fracEndFadeIn:
		opacity = frac / fracEndFadeIn
	
	if frac > fracEndFullyVisible:
		opacity = 1.0 - ((frac - fracEndFullyVisible) / (1.0 - fracEndFullyVisible))
		
	logo.modulate = Color(1.0,1.0,1.0,opacity)
		
	if timer >= SCENE_TIME_S:
		get_tree().change_scene_to_file("res://scenes/game/parent.tscn")	
	
	timer += delta
	
	queue_redraw()
	
func _draw():
	
	var tex = $SubViewport.get_texture()
	
	#Draw scaled to window
	
	var viewportSize = get_viewport().get_visible_rect().size
	draw_texture_rect(tex, Rect2(0,0, viewportSize.x, viewportSize.y), false)
