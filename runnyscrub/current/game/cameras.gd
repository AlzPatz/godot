extends Node

signal world_x_translation(pixel_shift_amount : int)

var cameraChaseHalfDeltaTime = 0.05

var initialised : bool = false
var trackPlayer : bool

var config 

var cameraForeground : Camera2D
var cameraForegroundLastPosition : Vector2
var cameraXShift : int = 0

var player : player_class

var camera_position_sky : Vector2
var camera_position_far : Vector2
var camera_position_near : Vector2

var zoom_target : float = 1.0
var zoom_speed : float = 1.0 #Likely temp whilst zoom controlled by input

var zoom_sky : float = 1.0
var zoom_far : float = 1.0
var zoom_near : float = 1.0

var zoom_one_over_sky: float = 1.0
var zoom_one_over_far : float = 1.0
var zoom_one_over_near : float = 1.0
var zoom_one_over_foreground : float = 1.0

func inject(conf, character : player_class, foreground : Camera2D):
	config = conf	
	player = character
	cameraForeground = foreground
	
	initialised = true

# Called when the node enters the scene tree for the first time.
func _ready():
	trackPlayer = true

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if !initialised:
		pass
	
	cameraForegroundLastPosition = cameraForeground.position

	if trackPlayer:
		UpdateForegroundCameraToTrackPlayer(delta)
		#Update zoom target here
		
	UpdateZoomTarget(delta)
		
	UpdateForegroundCameraZoom(delta)
		
	UpdateBackgroundLayerCameras()
	
	# Need to check that this executes before other relevent methods
	# Perhaps this needs to be run before end of last update frame
	# Futher, it's not even really a camera responsibilty! 
	CheckAndProcessAnyCoordinateTranslationsBeforeUpdate()
	
func CheckAndProcessAnyCoordinateTranslationsBeforeUpdate():
	# Although the camera my be detacted from the player
	# Best just to work out any coordinate rebasing from the point
	# of view of the player position
	
	# The thinking is to move the camera and foreground items in absolute terms
	# However, anything in the background should be done incrementally 
	# BUT should this also means that it is reset?
	
	CheckAndProcessCoordinateTranslation_BGSKY()
	CheckAndProcessCoordinateTranslation_BGFAR()
	CheckAndProcessCoordinateTranslation_BGNEAR()
	CheckAndProcessCoordinateTranslation_FG()

func CheckAndProcessCoordinateTranslation_BGSKY():
	# Make these whiles. ALSO add translation for any other items if not just tiles?
	if camera_position_sky.x > config.BG_SKY_HORIZONTAL_REBASE_DISTANCE:
		camera_position_sky.x -= config.BG_SKY_HORIZONTAL_REBASE_DISTANCE
	
	if camera_position_sky.x < -config.BG_SKY_HORIZONTAL_REBASE_DISTANCE:
		camera_position_sky.x += config.BG_SKY_HORIZONTAL_REBASE_DISTANCE
	
func CheckAndProcessCoordinateTranslation_BGFAR():
	if camera_position_far.x > config.BG_FAR_HORIZONTAL_REBASE_DISTANCE:
		camera_position_far.x -= config.BG_FAR_HORIZONTAL_REBASE_DISTANCE
	
	if camera_position_far.x < -config.BG_FAR_HORIZONTAL_REBASE_DISTANCE:
		camera_position_far.x += config.BG_FAR_HORIZONTAL_REBASE_DISTANCE
	
func CheckAndProcessCoordinateTranslation_BGNEAR():	
	if camera_position_near.x > config.BG_NEAR_HORIZONTAL_REBASE_DISTANCE:
		camera_position_near.x -= config.BG_NEAR_HORIZONTAL_REBASE_DISTANCE
	
	if camera_position_near.x < -config.BG_NEAR_HORIZONTAL_REBASE_DISTANCE:
		camera_position_near.x += config.BG_NEAR_HORIZONTAL_REBASE_DISTANCE
	
func CheckAndProcessCoordinateTranslation_FG():
	if cameraForeground.position.x > config.FG_HORIZONTAL_REBASE_DISTANCE:
		TriggerForegroundReBase(-config.FG_HORIZONTAL_REBASE_DISTANCE)
	elif cameraForeground.position.x < -config.FG_HORIZONTAL_REBASE_DISTANCE:
		TriggerForegroundReBase(config.FG_HORIZONTAL_REBASE_DISTANCE)

func TriggerForegroundReBase(shift_amount : int):
	cameraForeground.position.x += shift_amount
	cameraForegroundLastPosition.x += shift_amount
	cameraXShift += shift_amount
	#Hmm let's see what else breaks..
	world_x_translation.emit(shift_amount)
	player.process_world_x_translation(shift_amount) #Most recieve the event but camera has reference to player so calls it direct

func UpdateForegroundCameraToTrackPlayer(delta):
	#Add smoothing code to this later. For now just tracks position perfectly
	#Probably means we will see the one frame lag effect that the smoothing would #
	#cover. Can look later into forcing this update after the motion (will that change if motion is physics based?)
	#cameraForeground.position = player.position
	
	#Is this the flicker issue?
	#cameraForeground.position = Vector2(roundi(player.position.x), roundi(player.position.y))
	#return
	
	#A little smoothed follow
	var del : Vector2 = player.position - cameraForeground.position
	if del.length_squared() != 0.0:
		var length : float = del.length()
		var unit : Vector2 = del / length
		var speed = (0.5 * length) / cameraChaseHalfDeltaTime
		cameraForeground.position += unit * speed * delta
		
		#cameraForegroundPosition  += unit * speed * delta
		#cameraForeground.position.x = snapped(cameraForegroundPosition.x, 1)
		#cameraForeground.position.y = snapped(cameraForegroundPosition.y, 1)

func UpdateZoomTarget(delta):
	#Should be based on game factors but for now is controller
	if Input.is_action_pressed("zoom_in"):
		zoom_target += delta * zoom_speed
		if zoom_target > config.GAME_MAX_ZOOM:
			zoom_target = config.GAME_MAX_ZOOM
	if Input.is_action_pressed("zoom_out"):
		zoom_target -= zoom_target * delta * zoom_speed
		if zoom_target < config.GAME_MIN_ZOOM:
			zoom_target = config.GAME_MIN_ZOOM
	#Should look up proper linear zoom code, have it in runny scrub
	if zoom_target <= 0.0:
		zoom_target = 0.1

func UpdateForegroundCameraZoom(delta):
	var zoom = zoom_target
	#Currently snap to zoom but can add code here to tween :)
	cameraForeground.zoom = Vector2(zoom, zoom)
	zoom_one_over_foreground = 1.0 / zoom
	
func UpdateBackgroundLayerCameras():
	var fgZoom = cameraForeground.zoom.x #Zoom on x and y always the same
	var fgZoomDeltaFromUnity = fgZoom - 1.0
	
	zoom_sky = 1.0 + (fgZoomDeltaFromUnity * config.BgScaling_Zoom_Sky)
	zoom_far = 1.0 + (fgZoomDeltaFromUnity * config.BgScaling_Zoom_Far)
	zoom_near = 1.0 + (fgZoomDeltaFromUnity * config.BgScaling_Zoom_Near)
	
	zoom_one_over_sky = 1.0 / zoom_sky
	zoom_one_over_far = 1.0 / zoom_far
	zoom_one_over_near = 1.0 / zoom_near
	
	#First version is just to scale to position. Later, we will apply scaled deltas
	#So we can consider implementing wraps and smaller world spaces to perhaps 
	#guard agaisnt floating point lower accuracy at nigh nums for position
	#even tho game world without modification will get higher gaster
	var pos : Vector2 = cameraForeground.position
	var last_pos : Vector2 = cameraForegroundLastPosition
	var pos_delta = pos - last_pos
	
	camera_position_sky += pos_delta * config.BgScaling_Motion_Sky
	#camera_position_sky = pos * config.BgScaling_Motion_Sky
	
	camera_position_far += pos_delta * config.BgScaling_Motion_Far
	#camera_position_far = pos * config.BgScaling_Motion_Far
	
	camera_position_near += pos_delta * config.BgScaling_Motion_Near
	#camera_position_near = pos * config.BgScaling_Motion_Near

func ConvertToForegroundPosition(position : Vector2, backgroundLayer : int) -> Vector2:
	var position_foreground : Vector2 
	var bg_cam_to_point_delta : Vector2
	var scaled_bg_to_point_delta : Vector2
	match backgroundLayer:
		config.BackgroundType.E_SKY:
			bg_cam_to_point_delta = position - camera_position_sky
			scaled_bg_to_point_delta = bg_cam_to_point_delta * zoom_sky
		config.BackgroundType.E_FAR:
			bg_cam_to_point_delta = position - camera_position_far
			scaled_bg_to_point_delta = bg_cam_to_point_delta * zoom_far
		config.BackgroundType.E_NEAR:
			bg_cam_to_point_delta = position - camera_position_near
			scaled_bg_to_point_delta = bg_cam_to_point_delta * zoom_near
	scaled_bg_to_point_delta = scaled_bg_to_point_delta * zoom_one_over_foreground
	position_foreground = cameraForeground.position + scaled_bg_to_point_delta
	return position_foreground
	
func ConvertToForegroundSize(size : Vector2, backgroundLayer : int) -> Vector2:
	var neutral_size : Vector2
	var foreground_size : Vector2 
	match backgroundLayer:
		config.BackgroundType.E_SKY:
			neutral_size = size * zoom_sky
		config.BackgroundType.E_FAR:
			neutral_size = size * zoom_far	
		config.BackgroundType.E_NEAR:
			neutral_size = size * zoom_near
	foreground_size = neutral_size * zoom_one_over_foreground
	return foreground_size

func ReturnForegroundCameraBounds() -> Rect2:
	var pos : Vector2 = cameraForeground.get_screen_center_position()
	var size : Vector2 = Vector2(config.GAME_RESOLUTION_WIDTH * zoom_one_over_foreground, config.GAME_RESOLUTION_HEIGHT * zoom_one_over_foreground)
	var bounds : Rect2 = Rect2(pos -(0.5* size), size)
	return bounds
	
func ReturnForegroundCameraBoundsAtMinZoom() -> Rect2:
	var one_over_min_zoom = 1.0 / config.GAME_MIN_ZOOM
	var pos : Vector2 = cameraForeground.get_screen_center_position()
	var size : Vector2 = Vector2(config.GAME_RESOLUTION_WIDTH * one_over_min_zoom, config.GAME_RESOLUTION_HEIGHT * one_over_min_zoom)
	var bounds : Rect2 = Rect2(pos -(0.5* size), size)
	return bounds
