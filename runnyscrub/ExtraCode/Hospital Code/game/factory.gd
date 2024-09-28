extends Node

var initialised : bool = false

#var config_script : class_config = preload("res://game/config.gd")
var config_script = preload("res://game/config.gd")
var cameras_script = preload("res://game/cameras.gd")
var core_script = preload("res://game/core.gd")
var assets_script = preload("res://game/assets.gd")

var gamme_shader = preload("res://shaders/game.gdshader")
var fullscreen_shader = preload("res://shaders/fullscreen.gdshader")

var player_scene = preload("res://game/player.tscn")
var background_sky_scene = preload("res://game/backgroundsky.tscn")

var background_offscreen_sky_scene = preload("res://game/offscreenbackgroundsky.tscn")



func _ready():
	build()
	initialised = true

func _process(delta):
	pass

func build():
	
	#CREATE CODE COMPONENTS		
	
	var config = config_script.new()
	
	var assets = assets_script.new()
	var core = core_script.new()
	var cameras = cameras_script.new()
	
	var player = player_scene.instantiate()
	
	assets.name = "assets"
	add_child(assets)
	core.name = "core"
	add_child(core)
	cameras.name = "cameras"
	add_child(cameras)	
	
	#BUILD SCENE NODES
	
	#OFFSCREEN RENDERING
	
	#Calculate the sizes required for the offscreen render textures
	var min_zoom_foreground = config.GAME_MIN_ZOOM
	var zoom_delta_from_unity = min_zoom_foreground - 1.0
	
	var one_over_min_zoom_sky = 1.0 / (1.0 + (zoom_delta_from_unity * config.BgScaling_Zoom_Sky))
	var one_over_min_zoom_far = 1.0 / (1.0 + (zoom_delta_from_unity * config.BgScaling_Zoom_Far))
	var one_over_min_zoom_near = 1.0 / (1.0 + (zoom_delta_from_unity * config.BgScaling_Zoom_Near))
	var one_over_min_zoom_foreground = 1.0 / min_zoom_foreground
	
	var offscreen_texture_width_sky : int = floor(config.GAME_RESOLUTION_WIDTH * one_over_min_zoom_sky)
	var offscreen_texture_width_far : int = floor(config.GAME_RESOLUTION_WIDTH * one_over_min_zoom_far)
	var offscreen_texture_width_near : int = floor(config.GAME_RESOLUTION_WIDTH * one_over_min_zoom_near)
	var offscreen_texture_width_foreground : int = floor(config.GAME_RESOLUTION_WIDTH * one_over_min_zoom_foreground)
	
	var offscreen_texture_height_sky : int = floor(config.GAME_RESOLUTION_HEIGHT * one_over_min_zoom_sky)
	var offscreen_texture_height_far : int = floor(config.GAME_RESOLUTION_HEIGHT * one_over_min_zoom_far)
	var offscreen_texture_height_near : int = floor(config.GAME_RESOLUTION_HEIGHT * one_over_min_zoom_near)
	var offscreen_texture_height_foreground : int = floor(config.GAME_RESOLUTION_HEIGHT * one_over_min_zoom_foreground)
	
	var offscreen_viewports = Node.new()
	offscreen_viewports.name = config.OffScreenViewportsParentNodeName
	add_child(offscreen_viewports) 
	
	var viewport_offscreen_sky = SubViewport.new()
	viewport_offscreen_sky.name = config.OffScreenViewportSkyName
	viewport_offscreen_sky.size = Vector2(offscreen_texture_width_sky, offscreen_texture_height_sky)
	viewport_offscreen_sky.transparent_bg = true
	viewport_offscreen_sky.own_world_3d = false
	offscreen_viewports.add_child(viewport_offscreen_sky)
	
	var offscreen_texture_sky : Texture2D
	offscreen_texture_sky = viewport_offscreen_sky.get_texture()

	var background_offscreen = background_offscreen_sky_scene.instantiate()
	background_offscreen.init(assets)
	viewport_offscreen_sky.add_child(background_offscreen)
	
	#GAME
	
	var viewport_container_game = SubViewportContainer.new()
	viewport_container_game.name = config.GameViewportContainerName
	add_child(viewport_container_game)
	
	var viewport_game = SubViewport.new()
	viewport_game.snap_2d_transforms_to_pixel = true
	viewport_game.snap_2d_vertices_to_pixel = true
	viewport_game.name = config.GameViewportName
	viewport_game.size = Vector2(config.GAME_RESOLUTION_WIDTH, config.GAME_RESOLUTION_HEIGHT)
	viewport_game.transparent_bg = true#false
	viewport_container_game.add_child(viewport_game)
	
	var game_background_colourrect = ColorRect.new()
	game_background_colourrect.name = config.GameBackgroundColourRectName
	game_background_colourrect.color = config.GameBackgroundClearColour
	game_background_colourrect.set_anchors_preset(Control.PRESET_FULL_RECT)
	#viewport_game.add_child(game_background_colourrect)
	
	var viewport_container_layers = SubViewportContainer.new()
	viewport_container_layers.name = config.LayersViewportContainerName
	viewport_game.add_child(viewport_container_layers)
		
	var viewport_background_sky = SubViewport.new()
	#viewport_background_sky.snap_2d_transforms_to_pixel = true
	#viewport_background_sky.snap_2d_vertices_to_pixel = true
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
		
	var background_sky = background_sky_scene.instantiate()
	background_sky.init(assets, offscreen_texture_sky, camera_background_sky)
	viewport_background_sky.add_child(background_sky)
	
	var viewport_background_far = SubViewport.new()
	viewport_background_far.snap_2d_transforms_to_pixel = true
	viewport_background_far.snap_2d_vertices_to_pixel = true
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
	viewport_background_near.snap_2d_transforms_to_pixel = true
	viewport_background_near.snap_2d_vertices_to_pixel = true
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
	viewport_foreground.snap_2d_transforms_to_pixel = true
	viewport_foreground.snap_2d_vertices_to_pixel = true
	viewport_foreground.name = config.ForegroundViewportName
	viewport_foreground.size = Vector2(config.GAME_RESOLUTION_WIDTH, config.GAME_RESOLUTION_HEIGHT)
	viewport_foreground.transparent_bg = true
	viewport_container_layers.add_child(viewport_foreground)
	
	player.init()
	player.scale.x = 0.25
	player.scale.y = 0.25
	viewport_foreground.add_child(player)
	
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
	
	cameras.inject(config, player, camera_background_sky, camera_background_far, camera_background_near, camera_foreground)
	core.inject(config, cameras)
	background_sky.inject(config, cameras) #Already has an init. Need to sort / make each component have only one inject or config. harmonise
	background_offscreen.inject(config, cameras) #Already has an init. Need to sort / make each component have only one inject or config. harmonise
