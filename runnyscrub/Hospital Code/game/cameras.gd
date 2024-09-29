extends Node

var cameraChaseHalfDeltaTime = 0.1

var initialised : bool = false
var trackPlayer : bool

var config 

var cameraSky : Camera2D
var cameraFar : Camera2D
var cameraNear : Camera2D
var cameraForeground : Camera2D
var player : player_class

var zoom_target : float = 1.0
var zoom_speed : float = 1.0 #Likely temp whilst zoom controlled by input

var zoom_one_over_sky: float = 1.0
var zoom_one_over_far : float = 1.0
var zoom_one_over_near : float = 1.0
var zoom_one_over_foreground : float = 1.0

var cameraForegroundPosition : Vector2

func inject(conf, character : player_class, sky : Camera2D, far : Camera2D, near : Camera2D, foreground : Camera2D):
	config = conf	
	player = character
	cameraSky = sky
	cameraFar = far
	cameraNear = near
	cameraForeground = foreground
	
	cameraForegroundPosition = cameraForeground.position
	
	initialised = true

# Called when the node enters the scene tree for the first time.
func _ready():
	trackPlayer = true

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if !initialised:
		pass
		
	if trackPlayer:
		UpdateForegroundCameraToTrackPlayer(delta)
		#Update zoom target here
		
	UpdateZoomTarget(delta)
		
	UpdateForegroundCameraZoom(delta)
		
	UpdateBackgroundLayerCameras()
		
func UpdateForegroundCameraToTrackPlayer(delta):
	#Add smoothing code to this later. For now just tracks position perfectly
	#Probably means we will see the one frame lag effect that the smoothing would #
	#cover. Can look later into forcing this update after the motion (will that change if motion is physics based?)
	#cameraForeground.position = player.position
	
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
	if Input.is_action_pressed("zoom_out"):
		zoom_target -= zoom_target * delta * zoom_speed
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
	
	var skyZoom = 1.0 + (fgZoomDeltaFromUnity * config.BgScaling_Zoom_Sky)
	var farZoom = 1.0 + (fgZoomDeltaFromUnity * config.BgScaling_Zoom_Far)
	var nearZoom = 1.0 + (fgZoomDeltaFromUnity * config.BgScaling_Zoom_Near)
	
	cameraSky.zoom = Vector2(skyZoom, skyZoom)
	cameraFar.zoom = Vector2(farZoom, farZoom)
	cameraNear.zoom = Vector2(nearZoom, nearZoom)
	
	zoom_one_over_sky = 1.0 / skyZoom
	zoom_one_over_far = 1.0 / farZoom
	zoom_one_over_near = 1.0 / nearZoom
	
	#First version is just to scale to position. Later, we will apply scaled deltas
	#So we can consider implementing wraps and smaller world spaces to perhaps 
	#guard agaisnt floating point lower accuracy at nigh nums for position
	#even tho game world without modification will get higher gaster
	var pos : Vector2 = cameraForeground.position
	
	cameraSky.position = pos * config.BgScaling_Motion_Sky
	cameraSky.position.x = snappedi(cameraSky.position.x,1)
	cameraSky.position.y = snappedi(cameraSky.position.y,1)
	
	cameraFar.position = pos * config.BgScaling_Motion_Far
	cameraFar.position.x = snappedi(cameraFar.position.x,1)
	cameraFar.position.y = snappedi(cameraFar.position.y,1)
	
	cameraNear.position = pos * config.BgScaling_Motion_Near
	cameraNear.position.x = snappedi(cameraNear.position.x,1)
	cameraNear.position.y = snappedi(cameraNear.position.y,1)
