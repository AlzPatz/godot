extends Node

const GAME_RESOLUTION_WIDTH = 800
const GAME_RESOLUTION_HEIGHT = 600

var GameBackgroundClearColour : Color = Color(0.0, 0.0, 0.0, 1.0)

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
