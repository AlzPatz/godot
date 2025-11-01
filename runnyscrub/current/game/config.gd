extends Node
class_name class_config

enum GAMESTATE_TOPLEVEL { E_NONE, E_MENU, E_GAME } #NONE is for empty queue

enum BackgroundType { E_SKY, E_FAR, E_NEAR } #Is this even used?

var GameBackgroundClearColour : Color = Color(0.0, 0.0, 0.0, 1.0)

#Used but not yet defined really#
const PLAYER_HEIGHT = 128.0

const GAME_RESOLUTION_WIDTH = 1920
const GAME_RESOLUTION_HEIGHT = 1080

const GAME_MIN_ZOOM = 0.25
const GAME_MAX_ZOOM = 10.0 #Not sure need to limit this. But could imagine some strange BG offscreen rendering if too close

const TILE_DIMENSION_SKY = 256
const BACKGROUND_SKY_MIDLINE_TOPTILE_Y = -2 * TILE_DIMENSION_SKY
const TILE_DIMENSION_SKY_HALF_SIZE = TILE_DIMENSION_SKY / 2

const TEXCORD_SKY_DARK_X0 = 0
const TEXCORD_SKY_DARK_Y0 = 768 #0.75
const TEXCORD_SKY_DARK_SIZE = 256 #0.25 

const TEXCORD_SKY_MIDDLE_X0 = 128 #0.125
const TEXCORD_SKY_MIDDLE_Y0 = 512 #0.5
const TEXCORD_SKY_MIDDLE_SIZE = 128 #0.125

const TEXCORD_SKY_LIGHT_X0 = 128 #0.125
const TEXCORD_SKY_LIGHT_Y0 = 640 #0.625
const TEXCORD_SKY_LIGHT_SIZE = 128 #0.125

const RANDOM_BUILDING_TOP_SHIFT_FAR = 32
const RANDOM_BUILDING_TOP_SHIFT_NEAR = 69

const TILE_DIMENSION_BG_FAR = 256
const BACKGROUND_FAR_BUILDING_TOPTILE_Y = -1 * TILE_DIMENSION_BG_FAR

const TEXCORD_BGFAR_TOPS1_X0 = 256 #0.25
const TEXCORD_BGFAR_TOPS1_Y0 = 768 #0.75
const TEXCORD_BGFAR_TOPS1_SIZE = 256 #0.25 

const TEXCORD_BGFAR_TOPS2_X0 = 512 #0.5
const TEXCORD_BGFAR_TOPS2_Y0 = 768 #0.75
const TEXCORD_BGFAR_TOPS2_SIZE = 256 #0.25

const TEXCORD_BGFAR_MIDDLE_X0 = 768 #0.75
const TEXCORD_BGFAR_MIDDLE_Y0 = 768 #0.75
const TEXCORD_BGFAR_MIDDLE_SIZE =  256 #0.2

const TILE_DIMENSION_BG_NEAR = 256
const BACKGROUND_NEAR_BUILDING_TOPTILE_Y = 0 * TILE_DIMENSION_BG_FAR

const TEXCORD_BGNEAR_TOPS1_X0 = 256 #0.25
const TEXCORD_BGNEAR_TOPS1_Y0 = 512 #0.5
const TEXCORD_BGNEAR_TOPS1_SIZE = 256 #0.25 

const TEXCORD_BGNEAR_TOPS2_X0 = 512 #0.5
const TEXCORD_BGNEAR_TOPS2_Y0 = 512 #0.5
const TEXCORD_BGNEAR_TOPS2_SIZE = 256 #0.25

const TEXCORD_BGNEAR_MIDDLE_X0 = 768 #0.75
const TEXCORD_BGNEAR_MIDDLE_Y0 = 512 #0.5
const TEXCORD_BGNEAR_MIDDLE_SIZE =  256 #0.2

const LEN_PI_RANDOM_ARRAY = 100 # Must manually match the size of the digit arrays

const BG_SKY_HORIZONTAL_REBASE_MULTIPLIER = 64 
const BG_FAR_HORIZONTAL_REBASE_MULTIPLIER = 32 
const BG_NEAR_HORIZONTAL_REBASE_MULTIPLIER = 32 

const BG_SKY_HORIZONTAL_REBASE_DISTANCE = BG_SKY_HORIZONTAL_REBASE_MULTIPLIER * TILE_DIMENSION_SKY
const BG_FAR_HORIZONTAL_REBASE_DISTANCE = BG_FAR_HORIZONTAL_REBASE_MULTIPLIER * LEN_PI_RANDOM_ARRAY * TILE_DIMENSION_BG_FAR
const BG_NEAR_HORIZONTAL_REBASE_DISTANCE = BG_NEAR_HORIZONTAL_REBASE_MULTIPLIER * LEN_PI_RANDOM_ARRAY * TILE_DIMENSION_BG_NEAR

const FG_HORIZONTAL_REBASE_DISTANCE = 4096

#LEVEL BUILDING
const BACKFILL_LEVEL_OUT_OF_BOUNDS = true #If False, empty level created if viewport ever skips on
const FALSE = 0
const TRUE = 1
const MIN_64_BIT_INT = -9223372036854775808
const MAX_64_BIT_INT = 9223372036854775807
const PLATFORM_DATA_LEADING_HEADER_SIZE = 5
const PLATFORM_DATA_ARRAY_ELEMENT_SIZE = 16 #x 64 bits
const NUM_ELEMENTS_IN_PLATFORM_DATA_ARRAY = 2 ^ 16

const MIN_DISTANCE_OF_GENERATED_LEVEL_FROM_CAMERA_BOUNDS = GAME_RESOLUTION_WIDTH * (1.0 / GAME_MIN_ZOOM)
const MIN_SIZE_OF_NEWLY_GENERATED_LEVEL = MIN_DISTANCE_OF_GENERATED_LEVEL_FROM_CAMERA_BOUNDS * 2 

const MIN_X_OF_PLATFORM_WORLD = -GAME_RESOLUTION_WIDTH #Tweak later. Didn't want to just default 0 to check algos working in negatives

#PLAYER

const PLAYER_START_X = 0.0
const PLAYER_START_Y = 0.0


var OffScreenViewportsParentNodeName : String = "OffScreenViewports"
var OffScreenViewportSkyName : String = "OffScreenViewportSky"
var OffScreenViewportFarName : String = "OffScreenViewportFar"
var OffScreenViewportNearName : String = "OffScreenViewportNear"

var GameViewportContainerName : String = "GameViewportContainer"
var GameViewportName : String = "GameViewport"

var GameBackgroundColourRectName : String = "GameBackgroundColourRect"

var LayersViewportContainerName : String = "LayersViewportContainer"

var BackgroundSkyViewportName : String = "BackgroundSkyViewport"
var BackgroundSkyCameraName : String = "Camera2D"
var BackgroundFarViewportName : String = "BackgroundFarViewport"
var BackgroundFarCameraName : String = "Camera2D"
var BackgroundNearViewportName : String = "BackgroundNearViewport"
var BackgroundNearCameraName : String = "Camera2D"
var ForegroundViewportName : String = "ForegroundViewport"
var ForegroundCameraName : String = "Camera2D"

var GameScreenShaderCanvasLayerName : String = "GameScreenShaderCanvasLayer"
var GameShaderColorRectName : String = "GameShaderColorRect"
var FullScreenShaderCanvasLayerName : String = "FullScreenShaderCanvasLayer"
var FullScreenShaderColorRectName : String = "FullScreenShaderColorRect"

var HudViewportContainerName : String = "HudViewportContainer"
var HudViewportName : String = "HudViewport"

#Background Layers
var BgScaling_Zoom_Sky : float = 0.1
var BgScaling_Motion_Sky : Vector2 = Vector2(0.05, 0.02)

var BgScaling_Zoom_Far : float = 0.3
var BgScaling_Motion_Far : Vector2 = Vector2(0.2, 0.04)

var BgScaling_Zoom_Near : float = 0.7
var BgScaling_Motion_Near : Vector2 = Vector2(0.45, 0.07)
