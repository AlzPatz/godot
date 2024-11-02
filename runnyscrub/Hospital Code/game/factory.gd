extends Node

var initialised : bool = false

#var config_script : class_config = preload("res://game/config.gd")
var config_script = preload("res://game/config.gd")
var cameras_script = preload("res://game/cameras.gd")
var core_script = preload("res://game/core.gd")
var assets_script = preload("res://game/assets.gd")

var sky_shader = preload("res://shaders/backgroundlayer.gdshader")
var far_shader = preload("res://shaders/backgroundlayer.gdshader")
var near_shader = preload("res://shaders/backgroundlayer.gdshader")
var foreground_shader = preload("res://shaders/backgroundlayer.gdshader")

var game_shader = preload("res://shaders/game.gdshader")
var fullscreen_shader = preload("res://shaders/fullscreen.gdshader")

var level_scene = preload("res://game/level.tscn")

var player_scene = preload("res://game/player.tscn")
var background_sky_scene = preload("res://game/backgroundsky.tscn")
var background_far_scene = preload("res://game/backgroundfar.tscn")
var background_near_scene = preload("res://game/backgroundnear.tscn")
var foreground_scene = preload("res://game/foreground.tscn")

var background_offscreen_sky_scene = preload("res://game/offscreenbackgroundsky.tscn")
var background_offscreen_far_scene = preload("res://game/offscreenbackgroundfar.tscn")
var background_offscreen_near_scene = preload("res://game/offscreenbackgroundnear.tscn")
var foreground_offscreen_scene = preload("res://game/offscreenforeground.tscn")

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
	
	assets.name = "Assets"
	core.name = "Core"
	cameras.name = "Cameras"
	
	#Add the system components at end so that input and other events from game objects feed in (cameras..)
	add_child(assets)
	add_child(core)
	add_child(cameras)	
	
	var level = level_scene.instantiate()
	level.name = "Level"
	add_child(level)
	
	var player = player_scene.instantiate()
		
	#BUILD SCENE NODES#
	
	#OFFSCREEN RENDERING
	
	#Calculate the sizes required for the offscreen render textures
	var min_zoom_foreground = config.GAME_MIN_ZOOM
	var zoom_delta_from_unity = min_zoom_foreground - 1.0
	
	var one_over_min_zoom_sky = 1.0 / (1.0 + (zoom_delta_from_unity * config.BgScaling_Zoom_Sky))
	var one_over_min_zoom_far = 1.0 / (1.0 + (zoom_delta_from_unity * config.BgScaling_Zoom_Far))
	var one_over_min_zoom_near = 1.0 / (1.0 + (zoom_delta_from_unity * config.BgScaling_Zoom_Near))
	var one_over_min_zoom_foreground = 1.0 / min_zoom_foreground
	
	var offscreen_texture_width_sky : int = floor(config.GAME_RESOLUTION_WIDTH * one_over_min_zoom_sky) + (2 * config.TILE_DIMENSION_SKY)
	var offscreen_texture_width_far : int = floor(config.GAME_RESOLUTION_WIDTH * one_over_min_zoom_far) + (2 * config.TILE_DIMENSION_BG_FAR)
	var offscreen_texture_width_near : int = floor(config.GAME_RESOLUTION_WIDTH * one_over_min_zoom_near) + (2 * config.TILE_DIMENSION_BG_NEAR)
	var offscreen_texture_width_foreground : int = floor(config.GAME_RESOLUTION_WIDTH * one_over_min_zoom_foreground)
	
	var offscreen_texture_height_sky : int = floor(config.GAME_RESOLUTION_HEIGHT * one_over_min_zoom_sky) + (2 * config.TILE_DIMENSION_SKY)
	var offscreen_texture_height_far : int = floor(config.GAME_RESOLUTION_HEIGHT * one_over_min_zoom_far) + (2 * config.TILE_DIMENSION_BG_FAR)
	var offscreen_texture_height_near : int = floor(config.GAME_RESOLUTION_HEIGHT * one_over_min_zoom_near) + (2 * config.TILE_DIMENSION_BG_NEAR)
	var offscreen_texture_height_foreground : int = floor(config.GAME_RESOLUTION_HEIGHT * one_over_min_zoom_foreground)
	
	var offscreen_viewports = Node.new()
	offscreen_viewports.name = config.OffScreenViewportsParentNodeName
	add_child(offscreen_viewports) 
	
	#OFFSCREEN SKY
	
	var viewport_offscreen_sky = SubViewport.new()
	viewport_offscreen_sky.name = config.OffScreenViewportSkyName
	viewport_offscreen_sky.size = Vector2(offscreen_texture_width_sky, offscreen_texture_height_sky)
	viewport_offscreen_sky.transparent_bg = true
	viewport_offscreen_sky.own_world_3d = false
	offscreen_viewports.add_child(viewport_offscreen_sky)

	var offscreen_texture_sky : Texture2D
	offscreen_texture_sky = viewport_offscreen_sky.get_texture()

	var background_sky_offscreen = background_offscreen_sky_scene.instantiate()
	#Initialised later so it can be given camera
	viewport_offscreen_sky.add_child(background_sky_offscreen)
	
	var sky_shader_colourrect = ColorRect.new()
	sky_shader_colourrect.name = "SkyShaderColourRect"
	sky_shader_colourrect.set_anchors_preset(Control.PRESET_FULL_RECT)
	sky_shader_colourrect.material = ShaderMaterial.new()
	sky_shader_colourrect.material.shader = sky_shader
	viewport_offscreen_sky.add_child(sky_shader_colourrect)

	#OFFSCREEN CITY FAR
	
	var viewport_offscreen_far = SubViewport.new()
	viewport_offscreen_far.name = config.OffScreenViewportFarName
	viewport_offscreen_far.size = Vector2(offscreen_texture_width_far, offscreen_texture_height_far)
	viewport_offscreen_far.transparent_bg = true
	viewport_offscreen_far.own_world_3d = false
	viewport_offscreen_far.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	offscreen_viewports.add_child(viewport_offscreen_far)

	var offscreen_texture_far : Texture2D
	offscreen_texture_far = viewport_offscreen_far.get_texture()

	var background_far_offscreen = background_offscreen_far_scene.instantiate()
	#Initialised later so it can be given camera
	viewport_offscreen_far.add_child(background_far_offscreen)

	var far_shader_colourrect = ColorRect.new()
	far_shader_colourrect.name = "FarShaderColourRect"
	far_shader_colourrect.set_anchors_preset(Control.PRESET_FULL_RECT)
	far_shader_colourrect.material = ShaderMaterial.new()
	far_shader_colourrect.material.shader = far_shader
	viewport_offscreen_far.add_child(far_shader_colourrect)
	
	#OFFSCREEN CITY NEAR
	
	var viewport_offscreen_near = SubViewport.new()
	viewport_offscreen_near.name = config.OffScreenViewportNearName
	viewport_offscreen_near.size = Vector2(offscreen_texture_width_near, offscreen_texture_height_near)
	viewport_offscreen_near.transparent_bg = true
	viewport_offscreen_near.own_world_3d = false
	offscreen_viewports.add_child(viewport_offscreen_near)
	
	var offscreen_texture_near : Texture2D
	offscreen_texture_near = viewport_offscreen_near.get_texture()

	var background_near_offscreen = background_offscreen_near_scene.instantiate()
	#Initialised later so it can be given camera
	viewport_offscreen_near.add_child(background_near_offscreen)
	
	var near_shader_colourrect = ColorRect.new()
	near_shader_colourrect.name = "NearShaderColourRect"
	near_shader_colourrect.set_anchors_preset(Control.PRESET_FULL_RECT)
	near_shader_colourrect.material = ShaderMaterial.new()
	near_shader_colourrect.material.shader = far_shader
	viewport_offscreen_near.add_child(near_shader_colourrect)
	
	#OFFSCREEN LEVEL FOREGROUND
	
	var viewport_offscreen_foreground = SubViewport.new()
	viewport_offscreen_foreground.name = "OffScreenViewportForeground"
	viewport_offscreen_foreground.size = Vector2(offscreen_texture_width_foreground, offscreen_texture_height_foreground)
	viewport_offscreen_foreground.transparent_bg = true
	viewport_offscreen_foreground.own_world_3d = false
	offscreen_viewports.add_child(viewport_offscreen_foreground)
	
	var offscreen_texture_foreground : Texture2D
	offscreen_texture_foreground = viewport_offscreen_foreground.get_texture()

	var foreground_offscreen = foreground_offscreen_scene.instantiate()
	#Initialised later so it can be given camera
	viewport_offscreen_foreground.add_child(foreground_offscreen)
	
	var foreground_shader_colourrect = ColorRect.new()
	foreground_shader_colourrect.name = "ForegroundShaderColourRect"
	foreground_shader_colourrect.set_anchors_preset(Control.PRESET_FULL_RECT)
	foreground_shader_colourrect.material = ShaderMaterial.new()
	foreground_shader_colourrect.material.shader = foreground_shader
	viewport_offscreen_foreground.add_child(foreground_shader_colourrect)

	#GAME
	
	var viewport_container_game = SubViewportContainer.new()
	viewport_container_game.name = config.GameViewportContainerName
	add_child(viewport_container_game)
	
	var viewport_game = SubViewport.new()
	viewport_game.snap_2d_transforms_to_pixel = false
	viewport_game.snap_2d_vertices_to_pixel = false
	viewport_game.name = config.GameViewportName
	viewport_game.size = Vector2(config.GAME_RESOLUTION_WIDTH, config.GAME_RESOLUTION_HEIGHT)
	viewport_game.transparent_bg = true#false
	viewport_game.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport_container_game.add_child(viewport_game)
	
	var canvas_layer_background = CanvasLayer.new()
	canvas_layer_background.name = "CanvasLayerBackground"
	canvas_layer_background.follow_viewport_enabled = true
	viewport_game.add_child(canvas_layer_background)
	
	#Add backgrounds
	var background_sky = background_sky_scene.instantiate()
	background_sky.init(offscreen_texture_sky, background_sky_offscreen)
	#offscreen initalised here
	#--------------------------
	background_sky_offscreen.init(assets)
	#--------------------------
	canvas_layer_background.add_child(background_sky)
	
	var background_far = background_far_scene.instantiate()
	background_far.init(offscreen_texture_far, background_far_offscreen)
	#offscreen initalised here
	#--------------------------
	background_far_offscreen.init(assets)
	#--------------------------
	canvas_layer_background.add_child(background_far)
	
	var background_near = background_near_scene.instantiate()
	background_near.init(offscreen_texture_near, background_near_offscreen)
	#offscreen initalised here
	#--------------------------
	background_near_offscreen.init(assets)
	#--------------------------
	canvas_layer_background.add_child(background_near)
	
	var canvas_layer_game = CanvasLayer.new()
	canvas_layer_game.name = "CanvasLayerGame"
	canvas_layer_game.follow_viewport_enabled = true
	viewport_game.add_child(canvas_layer_game)
	
	var foreground = foreground_scene.instantiate()
	canvas_layer_game.add_child(foreground)
	
	player.init()
	player.scale.x = 0.25
	player.scale.y = 0.25
	canvas_layer_game.add_child(player)
	
	var camera_foreground = Camera2D.new()
	camera_foreground.name = config.ForegroundCameraName
	camera_foreground.enabled = true
	camera_foreground.anchor_mode = Camera2D.ANCHOR_MODE_DRAG_CENTER
	camera_foreground.ignore_rotation = true
	#canvas_layer_game.add_child(camera_foreground)	
	viewport_game.add_child(camera_foreground)
	#player.add_child(camera_foreground)
	
	#Game Shader
	
	var game_shader_colourrect = ColorRect.new()
	game_shader_colourrect.name = config.GameShaderColorRectName
	game_shader_colourrect.set_anchors_preset(Control.PRESET_FULL_RECT)
	game_shader_colourrect.material = ShaderMaterial.new()
	game_shader_colourrect.material.shader = game_shader
	viewport_game.add_child(game_shader_colourrect)
	
	#HUD
	
	var canvas_layer_hud = CanvasLayer.new()
	canvas_layer_hud.name = "CanvasLayerHUD"
	viewport_game.add_child(canvas_layer_hud)
	
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
	
	#LEVEL (SITS ABOVE OFF AND ONSCREEN RENDERING)	
	level.init(assets)
	
	#CONNECT CODE COMPONENETS (INJECTION)
	
	cameras.inject(config, player, camera_foreground)
	core.inject(config, cameras)
	background_sky.inject(config, cameras) #Already has an init. Need to sort / make each component have only one inject or config. harmonise
	background_sky_offscreen.inject(config, cameras) #Already has an init. Need to sort / make each component have only one inject or config. harmonise
	background_far.inject(config, cameras) #Already has an init. Need to sort / make each component have only one inject or config. harmonise
	background_far_offscreen.inject(config, cameras) #Already has an init. Need to sort / make each component have only one inject or config. harmonise
	background_near.inject(config, cameras) #Already has an init. Need to sort / make each component have only one inject or config. harmonise
	background_near_offscreen.inject(config, cameras) #Already has an init. Need to sort / make each component have only one inject or config. harmonise
	level.inject(config, cameras, foreground, foreground_offscreen)#Already has an init. Need to sort / make each component have only one inject or config. harmonise

