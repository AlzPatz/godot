class_name Config
extends RefCounted

#Game Properties -> They be for a tweakin' :)
#---------------------------------------------------------------------
#RENDERING
var depth_sky = 0.9
var depth_background_far = 0.8
var depth_spotlights_far = 0.82
var depth_background_near = 0.7
var depth_spotlights_near = 0.72
var depth_character = 0.65
var depth_platform = 0.6
var depth_floor = 0.55
var depth_rain = 0.4
var depth_lightning_close_min = 0.68
var depth_lightning_close_max = 0.69

#PHYSICS
var gravity = 1400.0
#CHARACTER
var character_width = 64.0
var character_height = 128.0
var character_longJumpGravFactor = 0.3
var character_jumpSpeed = 400.0
var character_speedBase = 475.0
var character_collision_sidewaysbounce = 0.2
var character_collision_base_ext = 1.0
var character_longjumpgravfactor = 0.3
var character_acc = 1200.0
#WORLD
var world_menuScrollSpeed = 2000.0
var world_menuTargetYAttractionScalar = 0.1 #How much of the delta is coverd per frame
#PLATFORMS & LEVEL
var floor_y = 5000.0
var ceiling_y = -5000.0
var platform_maxNumber = 25
var platform_createDestroyDistance = 3000.0
var platform_trendChangeScalar = 0.03
var platform_textureSize = 256.0
var platform_lowestHeight = 800.0
var platform_decreasingJumpHeightMin = 50.0
var platform_decreasingJumpHeightMax = 150.0
var platform_skipIslandGapPercentage = 0.25
var probability_scalarForSkipJumpGap = 0.1
var probability_scalarForShortJumpGap = 0.2
var difficulty_shortJumpMaxPercentage = 0.4
var difficulty_maxJumpHeightPercentage = 0.9
var difficulty_baseJumpHeightPercentage = 0.25
var difficulty_additionalJumpHeightPercentage = 0.25
var difficulty_platformMinSize = 80.0
var difficulty_platformMaxSize = 700.0
var difficulty_endJumpBuffer = 10.0
#CONSTANTS (DO NOT CHANGE!)
var difficulty_exponentialMin = -2.30259
var difficulty_exponentialMax = 0.0
#---------------------------------------------------------------------
#Game Objects and Flow Variables
#---------------------------------------------------------------------
var state
#var director = new directorObject(this)
#var platformBuilder = new platformBuilderObject(this)
#var scenaryBuilder = new scenaryBuilderObject(this)
#var additionalScenary = new additionalScenaryObject(this)
#var character = new characterObject(this)
#var environment = new environmentObject(this)
#game.sfxControl.assignEnvironment(var environment)
#---------------------------------------------------------------------
#Game Variables
#---------------------------------------------------------------------
var difficulty_currentScalar #0 to 1
var character_SpeedTarget
var justmissedplatform = false #TO DO:: what is this for?	
#---------------------------------------------------------------------
#Menu Properties -> They be for a tweakin' :)
#---------------------------------------------------------------------
var bg_whitebar_thickness = 5.0
#bg_grayborder and white piping
var bg_grayborder_timebeforeentrance = 2.0
var bg_grayborder_timetoenter = 0.5
var bg_grayborder_percentscreentocover = 0.5
var bg_grayborder_depth = 0.9
var bg_grayborder_opacity = 0.7
var bg_whitebar_opacity = 0.75
var bg_whitebar_depth = 0.89
#menu bg frame entrance
var bg_frame_borderoffset = 20.0
var bg_frame_stage1time = 0.2
var bg_frame_stage2time = 0.7
var bg_frame_background_opacity = 0.8
var bg_frame_background_depth = 0.88
var bg_frame_border_depth = 0.5
var bg_frame_border_opacity = 0.95
var bg_cornersquare_edgesizemultiplewhitebar = 2.0
var bg_cornersquare_numberRotationsOnEntrance = 2
#main
var bg_mainIntroTime = 0.5
var bg_logodepth = 0.8
var bg_logoOpacity = 0.9
#button
var bg_buttondepth = 0.79
var textbox_bg_depth = 0.7
var textbox_txt_depth = 0.6
var togglebox_pic_depth = 0.65
var togglebox_tex_depth = 0.64
var button_warp_size = 400.0
var button_warp_time = 0.5
var key_warp_size = 200.0
var key_warp_time = 0.3

#New User Menu
var nu_stage
var nu_s1_time = 0.75
var nu_s2_time = 0.75
var nu_s3_time = 0.75
var trans_t_unpass = 0.8
var trans_t_webconnect = 0.5
var trans_t_webdisplayresults = 0.5
var trans_t_webdisplayresults2 = 1.2
#Title on text input screens
var title_text_depth = 0.8
#Keyboard
var keyboard_depth = 0.7
#web
var web_msg_depth = 0.6
var web_msg_textdepth = 0.55
var web_msg_persist_time = 1.0
var web_msg_backtotextentry_time = 1.4
var web_msg_backtomainmenu_time = 1.2
#End Game Variables
var end_game_min_wait_score_submit = 2.0
var dead_msg_flash_amp = 0.1
var dead_msg_results_submitted_display_time = 1.0
var dead_msg_server_msg_out = 1.0
var end_game_hstable_button_intro_time = 1.0
var end_game_hstable_oscillation_time = 1.0
var end_game_setup_for_restart_time = 1.5
var end_game_setup_for_mainmenuintro_time = 0.75

#---------------------------------------------------------------------
#Game Properties -> They be for a tweakin' :)
#---------------------------------------------------------------------
var g_introTime = 5.0
var g_introfrac_stage1 = 0.5
var g_introfrac_stage2 = 0.2
var g_intro_max_speed_scalar = 2.0
var g_intro_speed_end = 0.0 #when games starts and pan to player, this is how fast the camera is travelling
var g_introAvDisBetweenPlats = 512.0
