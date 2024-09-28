extends Node
#class_name class_config

const GAME_RESOLUTION_WIDTH = 800
const GAME_RESOLUTION_HEIGHT = 600

const GAME_MIN_ZOOM = 0.25
const GAME_MAX_ZOOM = 10.0 #Not sure need to limit this. But could imagine some strange BG offscreen rendering if too close

const TILE_DIMENSION_SKY = 256
const BACKGROUND_SKY_MIDLINE_TOPTILE_Y = -1 * TILE_DIMENSION_SKY
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

var GameBackgroundClearColour : Color = Color(0.0, 0.0, 0.0, 1.0)

var OffScreenViewportsParentNodeName : String = "OffScreenViewports"
var OffScreenViewportSkyName : String = "OffScreenViewportSky"

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
var BgScaling_Motion_Sky : Vector2 = Vector2(0.1, 0.1)

var BgScaling_Zoom_Far : float = 0.5
var BgScaling_Motion_Far : Vector2 = Vector2(0.3, 0.3)

var BgScaling_Zoom_Near : float = 0.7
var BgScaling_Motion_Near : Vector2 = Vector2(0.5, 0.5)

var BgOverScanSize : float = 20.0 #To avoid ay scenario the background tile picked is on screen due to any single frame syncro and fast speed (not sure happens)
