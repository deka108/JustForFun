/**
 * Created by dekauliya on 14/11/15.
 */
var mazeHeight = 22;
var mazeWidth = 17;
var tileSize = 30;
var startPosX = 2;
var startPosY =19;
var endPosX = 14;
var endPosY = 2;
var NORTH = 1;
var EAST = 2;
var SOUTH = 3;
var WEST = 4;
var NOTHING = 6;
var TURN_LEFT = 37;
var MOVE_FORWARD = 38;
var TURN_RIGHT = 39;
var TURN_BACK = 40;
var shortSensorRange = 2;
var longSensorRange = 5;

// Color Definition
var OBSTACLE = "#000000";
var TRAVERSED = "#d7d7d7";
var FASTEST_PATH = "#ff0000";
var GROUND = "#ffffff";
var ROBOT_BODY = "#00ff00";
var ROBOT_FACE = "#ffff00";
var END_ZONE = "#ff00ff";
var START_ZONE = "#00ffff";