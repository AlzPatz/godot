extends Node

var initialised : bool = false

var config_script = preload("res://game/config.gd")
var camera_script = preload("res://game/camera.gd")
var core_script = preload("res://game/core.gd")

var gamme_shader = preload("res://shaders/game.gdshader")
var fullscreen_shader = preload("res://shaders/fullscreen.gdshader")

func _ready():
	build()
	initialised = true

func _process(delta):
	pass

func build():
	
	#CREATE CODE COMPONENTS		
	
	var config = config_script.new()
	
	var camera = camera_script.new()
	var core = core_script.new()
	
	core.name = "core"
	add_child(core)
	camera.name = "camera"
	add_child(camera)	
	
	#BUILD SCENE NODES
	
	#GAME
	
	var viewport_container_game = SubViewportContainer.new()
	viewport_container_game.name = config.GameViewportContainerName
	add_child(viewport_container_game)
	
	var viewport_game = SubViewport.new()
	viewport_game.name = config.GameViewportName
	viewport_game.size = Vector2(config.GAME_RESOLUTION_WIDTH, config.GAME_RESOLUTION_HEIGHT)
	viewport_game.transparent_bg = false
	viewport_container_game.add_child(viewport_game)
	
	var game_background_colourrect = ColorRect.new()
	game_background_colourrect.name = config.GameBackgroundColourRectName
	game_background_colourrect.color = config.GameBackgroundClearColour
	game_background_colourrect.set_anchors_preset(Control.PRESET_FULL_RECT)
	viewport_game.add_child(game_background_colourrect)
	
	var viewport_container_layers = SubViewportContainer.new()
	viewport_container_layers.name = config.LayersViewportContainerName
	viewport_game.add_child(viewport_container_layers)
		
	var viewport_background_sky = SubViewport.new()
	viewport_background_sky.name = config.BackgroundSkyViewportName
	viewport_background_sky.size = Vector2(config.GAME_RESOLUTION_WIDTH, config.GAME_RESOLUTION_HEIGHT)
	viewport_background_sky.transparent_bg = true
	viewport_container_layers.add_child(viewport_background_sky)
	
	var camera_background_sky = Camera2D.new()
	camera_background_sky.name = config.BackgroundSkyCameraName
	camera_background_sky.enabled = true
	camera_background_sky.anchor_mode = Camera2D.ANCHOR_MODE_DRAG_CENTER
	camera_background_sky.ignore_rotation = true
	viewport_background_sky.add_child(camera_background_sky)
	
	var viewport_background_far = SubViewport.new()
	viewport_background_far.name = config.BackgroundFarViewportName
	viewport_background_far.size = Vector2(config.GAME_RESOLUTION_WIDTH, config.GAME_RESOLUTION_HEIGHT)
	viewport_background_far.transparent_bg = true
	viewport_container_layers.add_child(viewport_background_far)
	
	var camera_background_far = Camera2D.new()
	camera_background_far.name = config.BackgroundFarCameraName
	camera_background_far.enabled = true
	camera_background_far.anchor_mode = Camera2D.ANCHOR_MODE_DRAG_CENTER
	camera_background_far.ignore_rotation = true
	viewport_background_far.add_child(camera_background_far)
	
	var viewport_background_near = SubViewport.new()
	viewport_background_near.name = config.BackgroundNearViewportName
	viewport_background_near.size = Vector2(config.GAME_RESOLUTION_WIDTH, config.GAME_RESOLUTION_HEIGHT)
	viewport_background_near.transparent_bg = true
	viewport_container_layers.add_child(viewport_background_near)
	
	var camera_background_near = Camera2D.new()
	camera_background_near.name = config.BackgroundFarCameraName
	camera_background_near.enabled = true
	camera_background_near.anchor_mode = Camera2D.ANCHOR_MODE_DRAG_CENTER
	camera_background_near.ignore_rotation = true
	viewport_background_near.add_child(camera_background_near)	
	
	var viewport_foreground = SubViewport.new()
	viewport_foreground.name = config.ForegroundViewportName
	viewport_foreground.size = Vector2(config.GAME_RESOLUTION_WIDTH, config.GAME_RESOLUTION_HEIGHT)
	viewport_foreground.transparent_bg = true
	viewport_container_layers.add_child(viewport_foreground)
	
	var camera_foreground = Camera2D.new()
	camera_foreground.name = config.ForegroundCameraName
	camera_foreground.enabled = true
	camera_foreground.anchor_mode = Camera2D.ANCHOR_MODE_DRAG_CENTER
	camera_foreground.ignore_rotation = true
	viewport_foreground.add_child(camera_foreground)	
	
	var game_shader_canvaslayer = CanvasLayer.new()
	game_shader_canvaslayer.name =config.GameScreenShaderCanvasLayerName
	
	var game_shader_colourrect = ColorRect.new()
	game_shader_colourrect.name = config.GameShaderColorRectName
	game_shader_colourrect.set_anchors_preset(Control.PRESET_FULL_RECT)
	game_shader_colourrect.material = ShaderMaterial.new()
	game_shader_colourrect.material.shader = gamme_shader
	game_shader_canvaslayer.add_child(game_shader_colourrect)
	
	viewport_game.add_child(game_shader_canvaslayer)
	
	#HUD
	
	var viewport_container_hud = SubViewportContainer.new()
	viewport_container_hud.name = config.HudViewportContainerName
	add_child(viewport_container_hud)
	
	var viewport_hud = SubViewport.new()
	viewport_hud.name = config.HudViewportName
	viewport_hud.size = Vector2(config.GAME_RESOLUTION_WIDTH, config.GAME_RESOLUTION_HEIGHT)
	viewport_hud.transparent_bg = true
	viewport_container_hud.add_child(viewport_hud)
	
	#FULLSCREEN SHADER
	
	var fullscreen_shader_canvaslayer = CanvasLayer.new()
	fullscreen_shader_canvaslayer.name = config.FullScreenShaderCanvasLayerName
	
	var fullscreen_shader_colourrect = ColorRect.new()
	fullscreen_shader_colourrect.name = config.FullScreenShaderColorRectName
	fullscreen_shader_colourrect.set_anchors_preset(Control.PRESET_FULL_RECT)
	fullscreen_shader_colourrect.material = ShaderMaterial.new()
	fullscreen_shader_colourrect.material.shader = fullscreen_shader
	fullscreen_shader_canvaslayer.add_child(fullscreen_shader_colourrect)
	
	add_child(fullscreen_shader_canvaslayer)
	
	#CONNECT CODE COMPONENETS (INJECTION)
	
	camera.inject(config, camera_background_sky, camera_background_far, camera_background_near, camera_foreground)
	core.inject(config, camera)
